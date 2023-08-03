import { ArnHttpClientFactory, ArnConnectionStatus } from '@arianee/arn-client';
import '@arianee/arn-components';
import {ArnLogLevel} from '@arianee/arn-types';

export default async ({ $config, app: { store, $aio }, query, $axios, localePath, i18n }) => {
  if (!process.client) {
    return;
  }

  // const logger = $aio.$logger;
  const logger = console;

  const arianeeUrl = $config.ARIANEE_URL;
  const collectionContractAddress = $config.ARIANEE_COLLECTION_CONTRACT_ADDRESS;

  if (!isString(arianeeUrl)) {
    logger.error('[Arianee] ARIANEE_URL is not defined on .env file');
  }

  if (!isString(collectionContractAddress)) {
    logger.error('[Arianee] ARIANEE_COLLECTION_CONTRACT_ADDRESS is not defined on .env file');
  }

  /**
   * 1. Check if has 1 NFT of the required collection
   * 2. Check if is whitelisted
   * Documnentation
   * https://arianee.notion.site/ARN-Client-ERC-721-Condition-API-e442507d854242609d7c1f51be20db74#d6dab89b7f2d4c279cd9d57ffaf261cd
   * @param client
   * @returns {Promise<boolean>}
   */
  async function hasAccess(client) {
    const minBalance = 1;  // At least one NFT

    logger.info(`[Arianee] Checking if the user owns at least ${minBalance} NFT of the required collection of address ${collectionContractAddress}`);

    const ownsNFT = await client.condition.erc721.isOwnedFrom(collectionContractAddress, minBalance);
    const success = ownsNFT || await client.condition.user.isListedIn('isLacosteWhitelisted');

    if (success) {
      logger.info(`[Arianee] The user owns at least ${minBalance} NFT of the required collection - OK`);
    } else {
      logger.error(`[Arianee] The user doesn't own at least ${minBalance} NFT of the required collection - KO`);
    }

    return success;
  }

  try {
    // Reset error state
    store.commit('auth/SET_ERROR_STATE', false);

    const clientFactory = new ArnHttpClientFactory();
    const config = await clientFactory.createConfigFromUrl(arianeeUrl);

    if ($aio.$utils.isDev) {
      // Add debug logs in dev mode
      Object.assign(config.log, {
        logLevels: [ArnLogLevel.warn, ArnLogLevel.error, ArnLogLevel.info, ArnLogLevel.debug],
      });
    }

    // config.auth.autoConnect = false;
    config.auth.signCallback = async () => {
      logger.info('[Arianee] signCallback() called');

      return window.confirm(i18n.messages[i18n.locale]['sign_callback']);
    };

    const client = clientFactory.create(config);

    const login = ({ hash = '' }) => {
      logger.info('[Arianee] login()');

      store.commit('auth/SET_AUTH_STATE', true);
      store.commit('auth/SET_USER', {
        address: hash || '',
      });
    };

    const logout = () => {
      logger.info('[Arianee] logout()');

      store.commit('auth/SET_AUTH_STATE', false);
      store.commit('auth/RESET_USER');

      redirectToHomepage();
    };

    const redirectToHomepage = () => {
      // This should be done using router.push(), but apparently this doesn't work in some contexts
      if(process.client && window.location.pathname !== localePath('/')) {
        logger.info('[Arianee] redirect to home page');

        window.location.href = localePath('/');
      }
    };

    const getHash = async ({ address }) => {
      if(!isString(address)) {
        return null;
      }

      logger.info('[Arianee] getHash()');

      try {
        return await $axios.$post('/wallet/hash', {
          publicKey: address
        });
      } catch (e) {
        logger.error('[Arianee] fail to get user hash', {
          error: e.message
        });
        return null;
      }
    };

    // user status
    client.auth.currentContext$.subscribe(async (authContext) => {
      authContext?.status$.subscribe(async (status) => {
        logger.info('[Arianee] status changed', status);

        const { connectionStatus, address } = status || {};

        logger.info('[Arianee] connexion status changed', connectionStatus);

        const hash = await getHash({
          address
        });

        logger.info('[Arianee] status changed - hash', hash);

        if (!isString(hash)) {
          logout();
          return;
        }

        switch (connectionStatus) {
          case ArnConnectionStatus.authenticated:
            logger.info('[Arianee] status authenticated');

            const hasAccessCheck = await hasAccess(client);
            if (hasAccessCheck) {
              store.commit('auth/SET_HAS_ACCESS', hasAccessCheck);
            }

            logger.info(`[Arianee] hasAccess: ${hasAccessCheck ? 'OK' : 'KO'}`);

            login({
              hash: hash
            });

            break;
          case ArnConnectionStatus.disconnected:
            logger.info('[Arianee] status disconnected');

            logout();
            break;
          case ArnConnectionStatus.connecting:
          // actions to execute when clicking on the "login" button
          case ArnConnectionStatus.signing:
          // actions to execute when clicking on the "login" button a second time to sign the connection
          default:
            logger.info('[Arianee] other status (connecting, signing, default)');
            break;
        }
      });
    });

    // User session management
    try {
      const { arianeeAccessToken } = query;

      if (arianeeAccessToken) {
        logger.info('[Arianee] AccessToken Connexion');

        // Connect the user FROM the access token
        client.auth.connectFromToken(arianeeAccessToken);
      } else {
        logger.info('[Arianee] Connect from cache');

        await client.auth.connectFromCache().then(()=> {
          logger.info('[Arianee] connectFromCache result', client.auth?.currentContext);

          if(!client.auth.currentContext) {
            logger.info('[Arianee] User not authenticated');
            logout();
          }
        });
      }
    } catch (error) {
      logger.warn('[Arianee] absorb « already connected » error !', error);
      logout();
    }

    window.arnClient = client;
  } catch (error) {
    store.commit('auth/SET_ERROR_STATE', true);
    store.commit('auth/SET_AUTH_STATE', false);
    store.commit('auth/RESET_USER', null);

    logger.error('[Arianee] client has been not injected correctly', error);

    window.arnClient = null;
  }
};

import { ArnHttpClientFactory, ArnConnectionStatus } from '@arianee/arn-client';
import { HasERC721Condition } from '@arianee/arn-types';
import '@arianee/arn-components';

export default async ({ $config, app: { store, $aio }, query, $axios }) => {
  if (!process.client) {
    return;
  }

  const arianeeUrl = $config.ARIANEE_URL;

  if (!isString(arianeeUrl)) {
    $aio.$logger.error('[Arianee] ARIANEE_URL is not defined on .env file');
  }

  async function hasToken(client) {
    const minBalance = 1;  // At least one NFT
    const nftOwnershipCondition = new HasERC721Condition({
      name: 'ownsAtLeastOneOfMyNFTs',
      chainId: 1, // Ethereum
      contractAddress: '0x776d77485578e703131b66ef50b1d77f225cc478',
      minBalance
    });
    const result = await client.condition.execute({ and: [nftOwnershipCondition] });
    if (result.success) {
      console.log(`The user owns at least ${minBalance} NFT of the required collection`);
      return true;
    } else {
      if ((await client.condition.user.isListedIn('isLacosteWhitelisted')) ||
          (await client.condition.arianee.execute(nftOwnershipCondition))
      );
      console.log(`The user doesn't own enough NFT of the required collection`);
      return false;
    }
  }

  try {
    // Reset error state
    store.commit('auth/SET_ERROR_STATE', false);
    const clientFactory = new ArnHttpClientFactory();
    const config = await clientFactory.createConfigFromUrl(arianeeUrl);
    const client = clientFactory.create(config);

    // User session management
    try {
      const { arianeeAccessToken } = query;

      if (arianeeAccessToken) {
        $aio.$logger.info('[Arianee] AccessToken Connexion');
        // Clear the cache
        client.auth.cleanLegacyAuthCache();
        // Connect the user FROM the access token
        client.auth.connectFromToken(arianeeAccessToken);
      } else {
        $aio.$logger.info('[Arianee] Connect from cache');
        await client.auth.connectFromCache();
      }
    } catch (error) {
      $aio.$logger.warn('[Arianee] absorb « already connected » error !', error);
    }

    const login = ({ hash = '' }) => {
      store.commit('auth/SET_AUTH_STATE', true);
      store.commit('auth/SET_USER', {
        address: hash || '',
      });
    }

    const logout = () => {
      store.commit('auth/SET_AUTH_STATE', false);
      store.commit('auth/RESET_USER');
    }

    const getHash = async ({ address }) => {
      if(!isString(address)) {
        return null;
      }

      try {
        return await $axios.$post('/wallet/hash', {
          publicKey: address
        });
      } catch (e) {
        $aio.$logger.error('[Arianee] fail to get user hash', {
          error: e.message
        });
        return null;
      }
    }

    // user status
    client.auth.currentContext$.subscribe(async (authContext) => {
      authContext?.status$.subscribe(async (status) => {
        const { connectionStatus, address } = status || {};
        const hash = await getHash({
          address
        });

        if (!isString(hash)) {
          logout();
          return;
        }

        switch (connectionStatus) {
          case ArnConnectionStatus.authenticated:
            // This line doesn't work because it always return a Promise
            // A promise is always true
            if (hasToken(client)) {
              login({
                hash: hash
              });
            } else {
              logout();
            }
            break;
          case ArnConnectionStatus.disconnected:
          default:
            logout();
            break;
        }
      });
    });

    window.arnClient = client;
  } catch (error) {
    store.commit('auth/SET_ERROR_STATE', true);
    store.commit('auth/SET_AUTH_STATE', false);
    store.commit('auth/RESET_USER', null);
    $aio.$logger.error('[Arianee] client has been not injected correctly', error);
    window.arnClient = null;
  }
};

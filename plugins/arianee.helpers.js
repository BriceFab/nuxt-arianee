// Arianee Service
const useArianee = ({ store }) => {
  const isClient = () => process.client;

  const isAuthorized = () => {
    if (!isClient()) {
      return false;
    }
    // Implement nft token logic to calculate points
    return false;
  };

  return {
    get isLoggedIn() {
      return isClient() && store.getters['auth/IS_LOGGED_IN'];
    },
    get isReady() {
      return isClient() && store.getters['auth/IS_READY'];
    },
    get hasError() {
      return isClient() && store.getters['auth/HAS_ERROR'];
    },
    get user() {
      return isClient() && store.getters['auth/GET_USER'];
    },
    get tokens() {
      return isClient() && store.getters['auth/GET_TOKENS'];
    },
    isAuthorized,
  };
};

export default async ({ app: { store } }, inject) => {
  inject(
    'arianee',
    useArianee({
      store,
    }),
  );
};

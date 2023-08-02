import { resolve } from 'path';

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'lacoste-empty-front',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/arianee.helpers.js',
    { src: '~/plugins/arianee.client.js', ssr: false },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  alias: {
    '@arianee/arn-client': resolve(__dirname, './node_modules/@arianee/arn-client/src/index.js'),
    '@arianee/arn-types': resolve(__dirname, './node_modules/@arianee/arn-types/src/index.js'),
    '@arianee/arn-components': resolve(__dirname, './node_modules/@arianee/arn-components/src/index.js'),
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [
      "@wagmi/core",
      "@wagmi/connectors",
      "@web3modal/ethereum",
      "@web3modal/ui",
      "@walletconnect/ethereum-provider",
      "@walletconnect/universal-provider",
      "@walletconnect/utils",
      "@walletconnect/core",
      "@web3modal/core",
      "@web3modal/html",
      "@arianee/arn-types",
      "@arianee/arn-client",
      "@walletconnect/sign-client",
      "viem",
      "ethers",
    ],
  },
}

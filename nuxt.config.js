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
    '@arianee/arn-client': resolve(__dirname, './node_modules/@arianee/arn-client/dist/index.modern.js'),
    '@arianee/arn-types': resolve(__dirname, './node_modules/@arianee/arn-types/dist/index.modern.js'),
    '@arianee/arn-components': resolve(__dirname, './node_modules/@arianee/arn-components/dist/index.modern.js'),
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel: {
      babelrc: false,
      cacheDirectory: undefined,
      presets({ envName, isServer, isClient, isModern, isLegacy }) {
        const targets = {
          client: { browsers: [
              "defaults",
              "not dead",
              "not op_mini all",
            ],
            // ie: 11
          },
          server: { node: 'current' },
        };
        const polyfills = {
          legacy: [
            'es.array.iterator',
            'es.array.includes',
            'es.array.for-each',
            'es.array.find',
            'es.array.find-index',
            'es.array.from',
            'es.array.some',
            'es.array.some',
            'es.typed-array.iterator',
            'es.promise',
            'es.promise.finally',
            'es.object.assign',
            'es.object.keys',
            'es.object.values',
            'es.object.entries',
            'es.object.has-own',
            'es.string.starts-with',
            'es.string.ends-with',
            'es.string.pad-start',
            'es.string.pad-end',
            'es.string.includes',
            'es.string.repeat',
            'es.symbol',
            'es.symbol.iterator',
            'es.symbol.async-iterator',
            'es.symbol.search',
            'es.symbol.has-instance',
            'es.symbol.is-concat-spreadable',
            'es.symbol.search',
            'es.symbol.match',
            'es.symbol.replace',
            'es.symbol.species',
            'es.symbol.to-primitive',
            'es.symbol.split',
            'es.symbol.description',
            'es.symbol.to-string-tag',
            'es.symbol.unscopables',
            'es.math.to-string-tag',
            'es.map',
            'es.set',
            'es.weak-map',
            'es.weak-set',
            'es.weak-set',
            'es.number.is-integer',
            'web.dom-collections.iterator',
            'web.dom-collections.for-each',
            'web.url',
            'web.url-search-params',
          ],
          modern: [
          ]
        };
        return [
          [
            require.resolve('@nuxt/babel-preset-app'),
            // '@nuxt/babel-preset-app-edge' // For nuxt-edge users
            {
              buildTarget: isServer ? 'server' : 'client',
              polyfills: isClient && isLegacy && !isModern ? polyfills.legacy : polyfills.modern,
              useBuiltIns: 'usage',
              targets: isServer ? targets.server : targets.client,
              corejs: {
                version: '3.18',
                proposals : true
              },
              shippedProposals: true
            }
          ]
        ];
      },
    },
    transpile: ['@arianee/arn-client', '@arianee/arn-types', '@arianee/arn-components', '@walletconnect', '@web3modal'],
    postcss: {
      plugins: {
        autoprefixer: {},
        tailwindcss: {},
        // Désactiver `postcss-url`
        'postcss-url': false,
      },
    },
    plugins: [],
  },
}

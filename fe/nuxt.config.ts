// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  //devServer: {
  //  https: {
  //    key: "./key.pem",
  //    cert: "./cert.pem",
  //  },
  //},
    css: [
    'bootstrap/dist/css/bootstrap.css', // This loads the CSS
  ],

  // ----------------------------------------------------------------------------------------------
  //                           (FIX IN PROD, JUST FOR GETTING IT WORKING)
  // ----------------------------------------------------------------------------------------------

  runtimeConfig: {
    backend_url: "http://localhost:3002",
  },

  // Modules
  modules: [
    "@pinia/nuxt"
  ],

  compatibilityDate: "2025-04-29",
});


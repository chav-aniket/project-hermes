module.exports = {
  siteMetadata: {
    title: `Chav Dev`,
    description: `My personal folio site`,
    author: `@chav-aniket`,
    siteUrl: `https://chavaniket.dev/`,
    heroTitle: `Hi 👋🏽, my name is `,
    heroName: `Aniket Chavan`,
    heroSubtitle: `Comp Sci Student @UNSW`
  },
  flags: {
    FAST_DEV: true,
    PARALLEL_SOURCING: true,
    PRESERVE_FILE_DOWNLOAD_CACHE: true
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Chav Dev`,
        short_name: `@chav-aniket`,
        start_url: `/`,
        background_color: `#042009`,
        theme_color: `#eba76c`,
        display: `minimal-ui`,
        icon: `src/images/favicon.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-typescript`,
      options: {
        isTSX: true, // defaults to false
        jsxPragma: `jsx`, // defaults to "React"
        allExtensions: true, // defaults to false
      },
    },
    `gatsby-plugin-sass`,
  ],
}

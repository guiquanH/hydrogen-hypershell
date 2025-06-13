// Virtual entry point for the app
// import {storefrontRedirect} from '@shopify/hydrogen';
// import {createRequestHandler} from '@remix-run/express';
// import {createAppLoadContext} from '~/lib/context';

// /**
//  * Export a fetch handler in module format.
//  */
// export default {
//   /**
//    * @param {Request} request
//    * @param {Env} env
//    * @param {ExecutionContext} executionContext
//    * @return {Promise<Response>}
//    */
//   async fetch(request, env, executionContext) {
//     try {
//       const appLoadContext = await createAppLoadContext(
//         request,
//         env,
//         executionContext,
//       );

//       /**
//        * Create a Remix request handler and pass
//        * Hydrogen's Storefront client to the loader context.
//        */
//       const handleRequest = createRequestHandler({
//         // eslint-disable-next-line import/no-unresolved
//         build: await import('virtual:react-router/server-build'),
//         mode: process.env.NODE_ENV,
//         getLoadContext: () => appLoadContext,
//       });

//       const response = await handleRequest(request);

//       if (appLoadContext.session.isPending) {
//         response.headers.set(
//           'Set-Cookie',
//           await appLoadContext.session.commit(),
//         );
//       }

//       if (response.status === 404) {
//         /**
//          * Check for redirects only when there's a 404 from the app.
//          * If the redirect doesn't exist, then `storefrontRedirect`
//          * will pass through the 404 response.
//          */
//         return storefrontRedirect({
//           request,
//           response,
//           storefront: appLoadContext.storefront,
//         });
//       }

//       return response;
//     } catch (error) {
//       console.error(error);
//       return new Response('An unexpected error occurred', {status: 500});
//     }
//   },
// };


import {createStorefrontClient} from '@shopify/hydrogen';
import {createRequestHandler} from '@remix/ADAPTER_NAME';

export default {
  async fetch(request, env, executionContext) {
    const {storefront} = createStorefrontClient({
      // Required: Storefront API credentials
      privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
      publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      storefrontApiVersion: env.PUBLIC_STOREFRONT_API_VERSION,
      storeDomain: `https://${env.PUBLIC_STORE_DOMAIN}`,
      storefrontHeaders: {
        // Pass a buyerIp to prevent being flagged as a bot
        buyerIp: 'customer_IP_address', // Platform-specific method to get request IP
        cookie: request.headers.get('cookie'),  // Required for Shopify Analytics
        purpose: request.headers.get('purpose'), // Used for debugging purposes
      },
      i18n: {
        country: 'country_code',
        language: 'language_code',
      },
      cache: () => {},
      waitUntil: () => {},
      // Additional platform-specific configuration...
    });
    const handleRequest = createRequestHandler({
      // Inject the Storefront API client into the Remix context
      getLoadContext: () => ({storefront}),
      // Additional platform-specific configuration...
    });
    return handleRequest(request);
  },
};
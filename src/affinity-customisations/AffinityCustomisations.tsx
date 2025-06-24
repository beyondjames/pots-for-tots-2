import { initRecharge, loginShopifyAppProxy } from '@rechargeapps/storefront-client';
import { DeliveryWidget } from './DeliveryWidget';

initRecharge({
  storeIdentifier: 'pots-for-tots-food.myshopify.com', // On Shopify this should be your myshopify.com domain
  // required for Storefront API access
  storefrontAccessToken: 'strfnt_c37d4459c60023c6fa298076cebb74e202536004d8118c7da0009160085645d4',
  appName: 'Pots for Tots Theme',
  appVersion: '1.0.0',
  loginRetryFn: async () => {
    const session = await loginShopifyAppProxy();
    // do anything you want with the session here
    console.log('Session:', session);
    // return session
    return session;
  },
});

export function AffinityCustomisations() {
  return (
    <>
      <DeliveryWidget />
    </>
  );
}

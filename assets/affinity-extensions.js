recharge.init({
  storeIdentifier: 'pots-for-tots-food.myshopify.com', // On Shopify this should be your myshopify.com domain
  storefrontAccessToken: 'strfnt_c37d4459c60023c6fa298076cebb74e202536004d8118c7da0009160085645d4',
  appName: 'Pots for Tots Theme',
  appVersion: '1.0.0',
  loginRetryFn: () => {
    return recharge.auth.loginShopifyAppProxy().then((session) => {
      return session;
    });
  },
});

// Set the global variable RechargeExtensions to an object with the following properties
window.RechargeExtensions = {
  orderNow: {
    disabledForNextOrder: true,
  },
  reschedule: {
    calendar: {
      enableDaysOfWeek: ['mon', 'thu'],
    },
  },
  dates: {
    short: {
      weekday: undefined,
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    },
    long: {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  },
};

// Recharge API
const rechargeAPI = {
  session: null,

  async authenticate() {
    if (!this.session) {
      this.session = await recharge.auth.loginCustomerPortal().catch((error) => {
        console.error('Authentication failed:', error);
        throw error;
      });
    }
    return this.session;
  },

  // async fetchSubscriptions() {
  //   const response = await recharge.subscription
  //     .listSubscriptions(this.session, {
  //       sort_by: 'id-asc',
  //       status: 'Active',
  //     })
  //     .catch((error) => {
  //       console.error('Fetching subscriptions failed:', error);
  //       throw error;
  //     });
  //   return response.subscriptions;
  // },

  // async fetchOrders() {
  //   const response = await recharge.order
  //     .listOrders(this.session, {
  //       limit: 10,
  //       sort_by: 'id-asc',
  //     })
  //     .catch((error) => {
  //       console.error('Fetching orders failed:', error);
  //       throw error;
  //     });
  //   return response.orders;
  // },

  async fetchCharges() {
    const response = await recharge.charge
      .listCharges(this.session, {
        limit: 25,
        sort_by: 'id-asc',
      })
      .catch((error) => {
        console.error('Fetching charges failed:', error);
        throw error;
      });
    return response.charges;
  },

  async updateNextCharge(subscriptionId, nextChargeDate) {
    const response = await recharge.subscription
      .updateSubscriptionChargeDate(this.session, subscriptionId, nextChargeDate)
      .catch((error) => {
        console.error('Updating next charge date failed:', error);
        throw error;
      });
    return response;
  },
};

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
      console.log('Authenticated with Recharge:', this.session);
    }
    return this.session;
  },

  async fetchCharges() {
    const response = await recharge.charge
      .listCharges(this.session, {
        limit: 25,
        sort_by: 'scheduled_at-asc',
      })
      .catch((error) => {
        console.error('Fetching charges failed:', error);
        throw error;
      });
    return response.charges;
  },

  // Function to get next charge date from a subscription id
  async getNextChargeDate(subscriptionId) {
    const subscription = await recharge.subscription.getSubscription(this.session, subscriptionId).catch((error) => {
      console.error('Fetching subscription failed:', error);
      throw error;
    });
    return subscription.next_charge_scheduled_at;
  },

  async updateNextCharge(subscriptionId, nextChargeDate) {
    console.log('Updating next charge date to:', nextChargeDate);
    console.log('For subscription ID:', subscriptionId);
    console.log('Using session:', this.session);
    const response = await recharge.subscription
      .updateSubscriptionChargeDate(this.session, subscriptionId, nextChargeDate)
      .catch((error) => {
        console.error('Updating next charge date failed:', error);
        throw error;
      });
    return response;
  },
};

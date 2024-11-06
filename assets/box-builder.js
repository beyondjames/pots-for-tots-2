let subscription = {
  state: {
    // Minimum and maximum allowed items in the box
    minItems: 8,
    maxItems: 24,

    // Counts of selected items and extras
    selectedItemCount: 0,

    // Totals products, and price
    totalProducts: 0,
    totalPrice: 0,

    // Subscription frequency (e.g., every 4 weeks)
    subscriptionFrequency: 4,

    // Subscription type (one-time or recurring)
    subscriptionType: 'subscription',
  },

  selector: {
    // CSS selectors for interacting with DOM elements
    productsGrid: '#product-grid', // Grid containing product cards
    variants: '#card__variants', // Elements for product variant selection
    minimumProducts: '#productCount', // Element displaying minimum product count warning
    checkoutButton: '.checkout-button', // Checkout button
    modalCheckoutButton: '#modal-checkout-button', // modal trigger Checkout button
    modalSkipButton: '#modal-skip-button', // modal trigger Checkout button
    cardModal: '#cardModal', // Modal for displaying product details
    frequencySection: '.frequency__selector', // Section for selecting subscription frequency
    progressBar: '#progress-bar-indicator', // Progress bar element
    reviewBoxButton: '#reviewBoxButton', // Button to open the review box
    productModalList: '[data-modal-product-list]', // Element for displaying product list in the review box
    reviewBoxClose: '#reviewBoxClose', // Button to close the review box
    reviewBoxModal: '#reviewBox', // Review box modal
    reviewBoxModalQuantity: '[data-modal-product-quantity]', // Element displaying product quantity in the review box
    totalPrice: '[data-modal-total-price]', // Element displaying total price in the review box
    spaceRemaining: '[data-remaining]',
    upsellsGrid: '#upsells-grid', // Grid containing upsell cards
    datePicker: '#delivery',
  },

  // Function to initialize product state and UI elements
  initialise: function () {
    // Get references to product-related elements
    const productWrapper = document.querySelector(this.selector.productsGrid);
    const variants = productWrapper.querySelectorAll(this.selector.variants);

    const upsellWrapper = document.querySelector(this.selector.upsellsGrid);
    let upsellVariants = null;
    if (upsellWrapper != null) {
      upsellVariants = upsellWrapper.querySelectorAll(this.selector.variants);
    }

    let productList = [];
    let upsellList = [];

    // Handle subscription frequency settings
    if (getCookie('potsFreq') !== '') {
      // Use frequency from cookie if available
      this.state.subscriptionFrequency = getCookie('potsFreq');
      sessionStorage.setItem('potsFreq', subscription.state.subscriptionFrequency);
    } else {
      // Set default frequency in cookie
      setCookie('potsFreq', this.state.subscriptionFrequency, 1);
      sessionStorage.setItem('potsFreq', this.state.subscriptionFrequency);
    }

    // Handle subscription type settings
    if (getCookie('potsType') !== '') {
      // Use frequency from cookie if available
      this.state.subscriptionType = getCookie('potsType');
      sessionStorage.setItem('potsType', this.state.subscriptionType);
    } else {
      // Set default frequency in cookie
      setCookie('potsType', this.state.subscriptionType, 1);
      sessionStorage.setItem('potsType', this.state.subscriptionType);
    }

    // Check for saved product list in session storage
    if (getCookie('potsProducts') == 'true' && sessionStorage.getItem('potsProductList') !== null) {
      // Set session storage item for subscription type
      sessionStorage.setItem('potsType', this.state.subscriptionType);

      this.handleUIElements();
    } else {
      // Build product list from initial product variants
      variants.forEach(function (item) {
        let quantity = item.querySelectorAll('[data-product-quantity]');
        if (quantity) {
          quantity.forEach(function (element) {
            // Get selling plans list
            let sellingPlans = item.querySelectorAll('.card__variant-selling-plans li');

            // Define selling plans array
            let plans = [];

            if (sellingPlans) {
              sellingPlans.forEach(function (sellingPlan) {
                plans.push({
                  id: sellingPlan.dataset.sellingPlanId,
                  frequency: sellingPlan.value,
                  price: sellingPlan.dataset.sellingPlanPrice,
                });
              });
            }

            if (element.dataset.imageUrl) {
              // Add products to array
              productList.push({
                id: element.dataset.index,
                productId: element.dataset.productId,
                quantity: element.value,
                price: element.dataset.price,
                title: element.dataset.title,
                variantTitle: element.dataset.variantTitle,
                sellingPlans: plans,
                imageURL: element.dataset.imageUrl,
              });
            } else {
              // Add products to array
              productList.push({
                id: element.dataset.index,
                productId: element.dataset.productId,
                quantity: element.value,
                price: element.dataset.price,
                title: element.dataset.title,
                variantTitle: element.dataset.variantTitle,
                sellingPlans: plans,
              });
            }
          });
        }
      });

      // Save product list and settings
      setCookie('potsProducts', true, 1);
      sessionStorage.setItem('potsProductList', JSON.stringify(productList));
      sessionStorage.setItem('potsType', this.state.subscriptionType);
      sessionStorage.setItem('potsFreq', this.state.subscriptionFrequency);

      // Perform calculations and updates
      this.calculateTotals();
      this.updateProgressBar();
    }

    // Check for saved upsell list in session storage
    if (getCookie('potsUpsells') == 'true' && sessionStorage.getItem('potsUpsellsList') !== null) {
      this.handleUIElements();
    } else if (upsellWrapper != null) {
      // Build product list from initial product variants
      upsellVariants.forEach(function (item) {
        let quantity = item.querySelectorAll('[data-product-quantity]');
        if (quantity) {
          quantity.forEach(function (element) {
            // Get selling plans list
            let sellingPlans = item.querySelectorAll('.card__variant-selling-plans li');

            // Define selling plans array
            let plans = [];

            if (sellingPlans) {
              sellingPlans.forEach(function (sellingPlan) {
                plans.push({
                  id: sellingPlan.dataset.sellingPlanId,
                  frequency: sellingPlan.value,
                  price: sellingPlan.dataset.sellingPlanPrice,
                });
              });
            }

            // Add products to array
            upsellList.push({
              id: element.dataset.index,
              productId: element.dataset.productId,
              quantity: element.value,
              price: element.dataset.price,
              title: element.dataset.title,
              variantTitle: element.dataset.variantTitle,
              sellingPlans: plans,
              imageURL: element.dataset.imageUrl,
            });
          });
        }
      });

      // Save product list and settings
      setCookie('potsUpsells', true, 1);
      sessionStorage.setItem('potsUpsellList', JSON.stringify(upsellList));

      sessionStorage.setItem('potsType', this.state.subscriptionType);
      sessionStorage.setItem('potsFreq', this.state.subscriptionFrequency);

      // Perform calculations and updates
      this.calculateTotals();
      this.updateProgressBar();
    }
  },
  handleUIElements: function () {
    // Retrieve saved product list from session storage
    let productList = JSON.parse(sessionStorage.getItem('potsProductList'));

    // Update UI elements based on saved product list
    productList.forEach((item) => {
      // Code to update UI elements for each saved product
      const btnId = 'Button-' + item.id;
      const qtyId = 'Quantity-' + item.id;
      const qtyBtnWrap = document.getElementById(btnId);
      const qtySelector = document.getElementById(qtyId);

      if (qtySelector && item.quantity > 0) {
        const qtyBtn = qtyBtnWrap.querySelector('button');
        qtyBtn.classList.add('hidden');
        qtySelector.parentElement.parentElement.classList.remove('hidden');
        qtySelector.value = item.quantity;
      }
    });

    // Retrieve saved product list from session storage
    let upsellList = JSON.parse(sessionStorage.getItem('potsUpsellList'));

    // Update UI elements based on saved product list
    if (upsellList != null) {
      upsellList.forEach((item) => {
        // Code to update UI elements for each saved product
        const btnId = 'Button-' + item.id;
        const qtyId = 'Quantity-' + item.id;
        const qtyBtnWrap = document.getElementById(btnId);
        const qtySelector = document.getElementById(qtyId);

        if (qtySelector && item.quantity > 0) {
          const qtyBtn = qtyBtnWrap.querySelector('button');
          qtyBtn.classList.add('hidden');
          qtySelector.parentElement.parentElement.classList.remove('hidden');
          qtySelector.value = item.quantity;
        }
      });
    }
  },

  handleProductQuantityChange: function () {
    // Get a reference to the product wrapper element
    const productWrapper = document.querySelector(this.selector.productsGrid);

    // Add an event listener to the wrapper
    productWrapper.addEventListener('change', (event) => {
      // Check if the changed element is an input
      const isInput = event.target.nodeName === 'INPUT';

      if (!isInput) {
        return;
      }

      // Get product variant ID and quantity from the input
      const productVariant = event.target.getAttribute('data-index');
      const quantity = event.target.value;

      // Handle quantity zero: hide quantity selector, show add button
      const parent = event.target.parentNode;
      const qtySelector = parent.parentNode;
      const wrapper = qtySelector.parentNode;
      const button = wrapper.querySelector('.card__variants-button');

      if (quantity == 0) {
        qtySelector.classList.add('hidden');
        button.classList.remove('hidden');
      }

      // Retrieve product list from session storage
      let productList = sessionStorage.getItem('potsProductList');
      let productJson = JSON.parse(productList);

      // Find and update the quantity in the product list
      let found = false;

      productJson.forEach(function (product) {
        if (product.id == productVariant) {
          product.quantity = quantity;
          found = true;
        }
      });

      // If product not found, add it to the list
      if (found == false) {
        productJson.push({
          id: element.dataset.index,
          quantity: element.value,
          price: element.dataset.price,
          title: element.dataset.title,
          variantTitle: element.dataset.variantTitle,
          imageURL: element.dataset.imageUrl,
        });
      }

      // Update session storage and trigger related actions
      setCookie('potsProducts', true, 1); // Set a cookie indicating product selection
      sessionStorage.setItem('potsProductList', JSON.stringify(productJson));
      this.calculateTotals(); // Recalculate totals
      this.updateReviewBoxModal(); // Update the review box modal
      this.updateProgressBar(); // Update any progress bars
    });
  },

  handleUpsellProductQuantityChange: function () {
    // Get a reference to the product wrapper element
    const upsellsWrapper = document.querySelector(this.selector.upsellsGrid);

    // Add an event listener to the wrapper
    upsellsWrapper.addEventListener('change', (event) => {
      // Check if the changed element is an input
      const isInput = event.target.nodeName === 'INPUT';

      if (!isInput) {
        return;
      }

      // Get product variant ID and quantity from the input
      const productVariant = event.target.getAttribute('data-index');
      const quantity = event.target.value;

      // Handle quantity zero: hide quantity selector, show add button
      const parent = event.target.parentNode;
      const qtySelector = parent.parentNode;
      const wrapper = qtySelector.parentNode;
      const button = wrapper.querySelector('.card__variants-button');

      if (quantity == 0) {
        qtySelector.classList.add('hidden');
        button.classList.remove('hidden');
      }

      // Retrieve product list from session storage
      let upsellList = sessionStorage.getItem('potsUpsellList');
      let upsellJson = JSON.parse(upsellList);

      // Find and update the quantity in the product list
      let found = false;

      upsellJson.forEach(function (product) {
        if (product.id == productVariant) {
          product.quantity = quantity;
          found = true;
        }
      });

      // If product not found, add it to the list
      if (found == false) {
        upsellJson.push({
          id: element.dataset.index,
          quantity: element.value,
          price: element.dataset.price,
          title: element.dataset.title,
          variantTitle: element.dataset.variantTitle,
          imageURL: element.dataset.imageUrl,
        });
      }

      // Update session storage and trigger related actions
      setCookie('potsUpsells', true, 1); // Set a cookie indicating product selection
      sessionStorage.setItem('potsUpsellList', JSON.stringify(upsellJson));
      //this.calculateTotals(); // Recalculate totals
      //this.updateReviewBoxModal(); // Update the review box modal
      //this.updateProgressBar(); // Update any progress bars
    });
  },

  handleReviewBox: function () {
    // Get a reference to the check cart button
    const checkButton = document.querySelector(this.selector.reviewBoxButton);

    // Add an event listener to the button
    checkButton.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default button behavior
      e.stopPropagation(); // Stop event propagation to avoid conflicts

      // Get a reference to the review box modal
      const modal = document.querySelector(this.selector.reviewBoxModal);

      // If the modal exists, show it
      if (modal) modal.show(checkButton); // Show the modal, likely using a custom show() method
    });
  },
  updateReviewBoxModal: function () {
    // Get references to elements within the review box modal
    const modalList = document.querySelector(this.selector.productModalList);
    const button = document.querySelector(this.selector.checkoutButton);
    const modalButton = document.querySelector(this.selector.modalCheckoutButton);
    const modalSkipButton = document.querySelector(this.selector.modalSkipButton);
    const countWarning = document.querySelector(this.selector.minimumProducts);

    // Retrieve product data from session storage
    let productList = sessionStorage.getItem('potsProductList');
    let productJson = JSON.parse(productList);

    // Calculate total product count
    let productCount = 0;
    productJson.forEach(function (product) {
      productCount += parseInt(product.quantity);
    });

    // Get the subscription type
    let type = sessionStorage.getItem('potsType');

    // Manage minimum product count requirements
    const minimum = this.state.minItems; // Minimum required products
    const count = Math.abs(minimum - productCount); // Number of products needed to reach minimum

    if (productCount >= minimum) {
      // Hide the minimum product count warning if visible
      if (!countWarning.classList.contains('hidden')) {
        countWarning.classList.add('hidden');
      }
      // Enable the checkout button
      console.log(button);
      button.disabled = false;
      // Enable the modal checkout button if it exists
      if (modalButton) {
        modalButton.disabled = false;
      }
      // Enable the modal skip button if it exists
      if (modalSkipButton) {
        modalSkipButton.disabled = false;
      }
    } else {
      // Display the warning message with the required count
      countWarning.textContent = `Must add a minimum of 8 meals, please add ${count} more`;
      countWarning.classList.remove('hidden');
      // Disable the checkout button
      button.disabled = true;
      // Disable the modal checkout button if it exists
      if (modalButton) {
        modalButton.disabled = true;
      }
      // Disable the modal skip button if it exists
      if (modalSkipButton) {
        modalSkipButton.disabled = true;
      }
    }

    // Build the product list HTML
    let productListContents = '<table class="box-drawer__table"><tbody>';

    productJson.forEach(function (product) {
      if (product.quantity > 0) {
        let amount;
        if (type == 'subscription') {
          // Calculate price for subscription products
          if (product.sellingPlans.length > 0) {
            amount = ((product.sellingPlans[0].price * product.quantity) / 100).toFixed(2);
          } else {
            amount = ((product.price * product.quantity) / 100).toFixed(2);
          }
        } else {
          // Calculate price for one-time products
          amount = ((product.price * product.quantity) / 100).toFixed(2);
        }

        let currency = '£' + amount;
        let item = '<tr class="box-drawer__table-row">';

        if (product.imageURL) {
          item +=
            '<td class="box-drawer__table-data box-drawer__product-image summary-image"><img src="' +
            product.imageURL +
            '" alt="' +
            product.title +
            ' : ' +
            product.variantTitle +
            '"></td>';
        }

        item +=
          '<td class="box-drawer__table-data box-drawer__product-title summary-title"><div class="summary-product">' +
          product.title +
          '</div><div class="box-drawer__product-variant summary-variant">' +
          product.variantTitle +
          '</div></td>';
        item +=
          '<td class="box-drawer__table-data box-drawer__product-quantity summary-quantity">' +
          product.quantity +
          '</td>';
        item += '<td class="box-drawer__table-data box-drawer__product-price summary-price">' + currency + '</td>';
        item += '</tr>';

        productListContents += item;
      }
    });

    productListContents += '</tbody></table>';

    // Update the modal list content with the generated HTML
    modalList.innerHTML = productListContents;
  },
  calculateTotals: function () {
    let productCount = 0;
    let productTotalCost = 0;
    let productSubscriptionTotalCost = 0;
    let productJson;

    // Get the product array
    let productList = sessionStorage.getItem('potsProductList');
    productJson = JSON.parse(productList);

    productJson.forEach(function (product) {
      let lineTotal = product.price * parseInt(product.quantity);
      let productSubScriptionLineTotal = 0;

      if (product.sellingPlans.length > 0) {
        productSubScriptionLineTotal = product.sellingPlans[0].price * parseInt(product.quantity);
      } else {
        productSubScriptionLineTotal = product.price * parseInt(product.quantity);
      }

      productTotalCost += lineTotal;
      productSubscriptionTotalCost += productSubScriptionLineTotal;
      productCount += parseInt(product.quantity);
    });

    this.state.selectedItemCount = productCount;

    let type = sessionStorage.getItem('potsType');

    if (type == 'subscription') {
      this.updateTotalPrice(productSubscriptionTotalCost);
    } else {
      this.updateTotalPrice(productTotalCost);
    }
    this.updateProgressBar();
    this.updateReviewButton(productCount);
  },

  updateTotalPrice: function (val) {
    // Update price on modal cart
    const modalTotalPrice = document.querySelector(this.selector.totalPrice);
    modalTotalPrice.innerHTML = this.toCurrency(val);
  },

  updateReviewButton: function (val) {
    let buttonText = 'Review Box';
    // Update price on modal cart
    const checkButton = document.querySelector(this.selector.reviewBoxButton);
    if (val == 0) {
      checkButton.innerHTML = buttonText;
    } else {
      checkButton.innerHTML = `${buttonText} <span>(${val})</span>`;
    }
  },

  updateProgressBar: function () {
    // Get references to relevant DOM elements
    const bar = document.querySelector(this.selector.progressBar);
    const modalQuantity = document.querySelector(this.selector.reviewBoxModalQuantity);
    const label = document.querySelector(this.selector.spaceRemaining);

    // Retrieve data from state
    const minimum = this.state.minItems;
    const maximum = this.state.maxItems;
    const currentItemCount = this.state.selectedItemCount;
    const combinedTotal = currentItemCount;

    // Calculate progress bar data
    let width = 0;

    // Define progress bar goals
    const goal1 = 8;
    const goal2 = 12;
    const goal3 = 16;
    const goal4 = 24;

    // Get references to goal indicators
    const goal1indicator = document.querySelector('#progress-bar-goal-1');
    const goal2indicator = document.querySelector('#progress-bar-goal-2');
    const goal3indicator = document.querySelector('#progress-bar-goal-3');

    // Determine progress and goal completion based on item counts
    if (currentItemCount === 0) {
      labelText = 'Add 8 meals to get started';
    } else if (currentItemCount < goal1) {
      // Reset goal indicators
      goal1indicator.classList.remove('progress-bar__goal-reached');
      goal2indicator.classList.remove('progress-bar__goal-reached');
      goal3indicator.classList.remove('progress-bar__goal-reached');
      space = goal1 - currentItemCount;

      if (space == 1) {
        labelText = 'Add ' + space + ' more meal and delivery is £5.99';
      } else {
        labelText = 'Add ' + space + ' more meals and delivery is £5.99';
      }

      // Calculate progress based on main items
      width = (currentItemCount / maximum) * 100;
    } else if (combinedTotal < goal2) {
      space = goal2 - combinedTotal;
      if (space == 1) {
        labelText = 'Checkout or add ' + space + ' more meal and delivery is';
      } else {
        labelText = 'Checkout or add ' + space + ' more meals and delivery is';
      }

      labelText += ' £3.99';
      // Mark goal 1 as reached
      goal1indicator.classList.add('progress-bar__goal-reached');
      // if user goes back remove goal 2 as marked
      goal2indicator.classList.remove('progress-bar__goal-reached');
      // Calculate progress based on combined items
      width = (combinedTotal / maximum) * 100;
    } else if (combinedTotal < goal3) {
      // Goal 3 messaging
      space = goal3 - combinedTotal;

      if (space == 1) {
        labelText = 'Checkout or add ' + space + ' more meal and delivery is';
      } else {
        labelText = 'Checkout or add ' + space + ' more meals and delivery is';
      }

      labelText += ' £1.99';
      // Mark goals 1 and 2 as reached
      goal1indicator.classList.add('progress-bar__goal-reached');
      goal2indicator.classList.add('progress-bar__goal-reached');

      // if user goes back remove goal 3 as marked
      goal3indicator.classList.remove('progress-bar__goal-reached');
      width = (combinedTotal / maximum) * 100;
    } else if (combinedTotal < goal4) {
      // Goal 4 messaging
      space = goal4 - combinedTotal;

      if (space == 1) {
        labelText = 'Checkout or add ' + space + ' more meal and delivery is';
      } else {
        labelText = 'Checkout or add ' + space + ' more meals and delivery is';
      }

      labelText += ' FREE';
      // Mark all goals as reached
      goal1indicator.classList.add('progress-bar__goal-reached');
      goal2indicator.classList.add('progress-bar__goal-reached');
      goal3indicator.classList.add('progress-bar__goal-reached');
      width = (combinedTotal / maximum) * 100;
    } else {
      // Box is full
      labelText = "You've got free delivery!";
      goal1indicator.classList.add('progress-bar__goal-reached');
      goal2indicator.classList.add('progress-bar__goal-reached');
      goal3indicator.classList.add('progress-bar__goal-reached');
      width = 100;
    }

    // Ensure progress bar stays within bounds
    if (width > 100) {
      width = 100;
      space = 0; // Box is full
    } else if (width < 1) {
      width = 0;
    }

    label.innerHTML = labelText;
    // Update progress bar width and modal quantity
    let style = 'width:' + width + '%';
    bar.style.cssText = style;
    modalQuantity.innerHTML = currentItemCount;
  },

  // Generate the products to send to cart
  generateProductArray: function () {
    // Create an empty array to hold the formatted product items
    let items = [];

    // Retrieve the product list from session storage
    let productList = sessionStorage.getItem('potsProductList');
    let productJson = JSON.parse(productList);

    // Retrieve the upsell list from session storage
    let upsellList = sessionStorage.getItem('potsUpsellList');
    let upsellJson = null;
    if (upsellList != null) {
      upsellJson = JSON.parse(upsellList);
    }

    // Get the subscription frequency and type from session storage
    let freq = sessionStorage.getItem('potsFreq');
    let type = sessionStorage.getItem('potsType');

    // Process each product in the list
    productJson.forEach(function (product) {
      // Initialize a variable to hold the selling plan ID (if applicable)
      let planId = null;

      // If the product has selling plans and it's a subscription type
      if (product.sellingPlans && type == 'subscription') {
        // Find the selling plan with the matching frequency
        product.sellingPlans.forEach(function (plan) {
          if (String(plan.frequency) == freq) {
            planId = plan.id;
          }
        });
      }

      // Add the product to the formatted array based on conditions
      if (product.quantity > 0 && planId != null && type == 'subscription') {
        // Add the product with its selling plan ID
        items.push({
          collectionId: '268279972006',
          externalProductId: product.productId,
          externalVariantId: product.id,
          quantity: parseInt(product.quantity),
          sellingPlan: planId,
        });
      } else if (product.quantity > 0) {
        // Add the product without a selling plan
        items.push({
          collectionId: '268279972006',
          externalProductId: product.productId,
          externalVariantId: product.id,
          quantity: parseInt(product.quantity),
        });
      }
    });

    // Process upsell subscriptions
    if (upsellList != null) {
      upsellJson.forEach(function (product) {
        // Initialize a variable to hold the selling plan ID (if applicable)
        let planId = null;

        // If the product has selling plans and it's a subscription type
        if (product.sellingPlans && type == 'subscription') {
          // Find the selling plan with the matching frequency
          product.sellingPlans.forEach(function (plan) {
            if (String(plan.frequency) == freq) {
              planId = plan.id;
            }
          });
        }

        const upsellSubscription = document.querySelector('#upsell-subscription').value;

        // Add the product to the formatted array based on conditions
        if (product.quantity > 0 && planId != null && upsellSubscription == 'true') {
          // Add the product with its selling plan ID
          items.push({
            collectionId: '268279972006',
            externalProductId: product.productId,
            externalVariantId: product.id,
            quantity: parseInt(product.quantity),
            sellingPlan: planId,
          });
        }
      });
    }

    const bundle = {
      externalProductId: '8797895819522',
      externalVariantId: '45485919338754',
      selections: items,
    };

    // Check to see if the bundle is valid
    const isValid = recharge.bundle.validateDynamicBundle(bundle);

    if (isValid === true) {
      // Do on valid
      const bundleItems = recharge.bundle.getDynamicBundleItems(bundle, 'build-a-box-bundle');

      // Process one time upsells
      if (upsellList != null) {
        upsellJson.forEach(function (product) {
          const upsellSubscription = document.querySelector('#upsell-subscription').value;

          // Add the product to the formatted array based on conditions
          if (product.quantity > 0 && upsellSubscription == 'false') {
            // Add the product without a selling plan
            bundleItems.push({
              id: product.id,
              quantity: parseInt(product.quantity),
            });
          }
        });
      }

      // Handle delivery date logic
      const datePicker = document.getElementById(this.selector.datePicker);
      let DeliveryDate = null;

      if (datePicker) {
        DeliveryDate = this.handleDeliveryDate();
      } else {
        DeliveryDate = this.generateDeliveryDate();
      }

      // Construct the final object to be returned
      if (DeliveryDate) {
        return {
          items: bundleItems,
          attributes: {
            'Delivery Date': DeliveryDate,
          },
        };
      } else {
        return {
          items: bundleItems,
        };
      }
    } else {
      console.log('Bundle is invalid:', isValid);
      // Do something with the error
    }
  },

  // Function to format a price with currency symbol and two decimal places
  toCurrency: function (val) {
    let amount = (val / 100).toFixed(2); // Divide by 100 and format to 2 decimals
    let currency = '£' + amount; // Append currency symbol
    return currency;
  },

  // Function to clear the cart
  clearCart: async function () {
    fetch('/cart/clear.js', {
      // Empty body for a POST request
      body: '',
      // Set credentials and headers
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'xmlhttprequest',
      },
      method: 'POST',
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return 'Cart Cleared';
      })
      .catch((err) => {
        console.error(err); // Log any errors
      });
  },

  // Function to handle adding products to the cart
  handleAddToCart: async function (data) {
    // Send a POST request to the cart endpoint to add products
    fetch('/cart/add.js', {
      body: JSON.stringify(data), // Pass the product data as JSON
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'xmlhttprequest',
      },
      method: 'POST',
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        // Redirect to the checkout page after successful addition
        window.location.href = '/checkout';
      })
      .catch((err) => {
        console.error(err); // Log any errors
      });
  },

  generateDeliveryDate: function () {
    // Get the current date
    var today = new Date();

    // Helper function to get the next upcoming Thursday from a given date
    function getThursday(orderDate) {
      orderDate = orderDate || new Date(); // Use current date if not provided
      if (!(orderDate instanceof Date)) {
        throw 'Invalid date';
      }

      // Calculate the date of the previous Thursday
      let lastThursday = new Date(orderDate);
      lastThursday.setDate(lastThursday.getDate() - lastThursday.getDay() + 4);

      // Adjust for delivery rules:
      // - If order date is before Monday noon, deliver this week's Thursday.
      // - Otherwise, deliver next Thursday.
      if (orderDate.getDay() < 1 || (orderDate.getDay() === 1 && orderDate.getHours() < 24)) {
        lastThursday.setDate(lastThursday.getDate());
      } else {
        lastThursday.setDate(lastThursday.getDate() + 7);
      }

      return lastThursday;
    }

    // Get the Thursday for delivery based on the current order date
    const deliveryDate = getThursday(today);

    // Helper function to format a date component to two digits
    function date2digits(date) {
      return (date < 10 ? '0' : '') + date; // Add leading zero if needed
    }

    // Format and return the delivery date as DD/MM/YYYY
    return (
      date2digits(deliveryDate.getDate()) +
      '/' +
      date2digits(deliveryDate.getMonth() + 1) +
      '/' +
      deliveryDate.getFullYear()
    );
  },

  handleDeliveryDate: function () {
    const date = document.getElementById('delivery');
    if (!date || date.value == '') {
      return null;
    } else {
      return date.value;
    }
  },

  // Function to reset the product selection state
  reset: function () {
    // Clear session storage items related to product selection
    sessionStorage.removeItem('potsProductList');
    sessionStorage.removeItem('potsUpsellList');
    sessionStorage.removeItem('potsType');
    sessionStorage.removeItem('potsFreq');

    // Reset quantity inputs to 0
    const quanityInput = document.querySelectorAll('.quantity__input');
    quanityInput.forEach(function (input) {
      input.value = 0;
    });

    // Reload Page
    location.reload();
  },

  // Function to initialize various functions
  init: function () {
    this.initialise(); // Initialize product state and UI elements
    this.updateReviewBoxModal(); // Update review box modal
    this.handleProductQuantityChange(); // Set up quantity change handling
    this.handleReviewBox(); // Handle review box functionality
    this.calculateTotals(); // Perform initial calculations
  },
};

subscription.init();

// Define a custom element for a quantity input with +/- buttons
class BoxQuantityInput extends HTMLElement {
  constructor() {
    super();

    // Get references to the input and buttons
    this.input = this.querySelector('input');

    // Create a custom change event for notifying quantity changes
    this.changeEvent = new Event('change', { bubbles: true });

    // Add event listeners to the +/- buttons
    this.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', this.onButtonClick.bind(this));
    });

    // Add an event listener to the input for change events
    this.input.addEventListener('change', () => {
      // Call an external function to handle product quantity changes
      if (this.dataset.upsell) {
        subscription.handleUpsellProductQuantityChange();
      } else {
        subscription.handleProductQuantityChange();
        subscription.updateReviewBoxModal();
      }
    });
  }

  onButtonClick(event) {
    event.preventDefault();

    // Increment or decrement the input value based on the clicked button
    const previousValue = this.input.value;
    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();

    // If the value has changed, dispatch a custom change event
    if (previousValue !== this.input.value) {
      this.input.dispatchEvent(this.changeEvent);
    }
  }
}
customElements.define('box-quantity-input', BoxQuantityInput);

// Define a custom element for a product button
class ProductButton extends HTMLElement {
  constructor() {
    super();

    // Get references to the button and related elements
    const button = this.querySelector('button');
    const buttonId = this.id; // Get the button's ID for product identification
    const parent = this.parentNode;
    const selector = parent.querySelector('.cart-item__quantity-wrapper'); // Selector for the quantity input wrapper

    // Add an event listener to the button
    if (button) {
      button.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default button behavior

        // Hide the button after it's clicked
        e.target.classList.add('hidden');

        // Show the quantity input wrapper if it's hidden
        if (selector.classList.contains('hidden')) {
          selector.classList.remove('hidden');
        }

        // Update the quantity input value to 1
        const input = selector.querySelector('[data-product-quantity]');
        input.value = 1;

        if (this.dataset.upsell) {
          // Manage product list in session storage
          let upsellList = sessionStorage.getItem('potsUpsellList');
          let upsellJson = JSON.parse(upsellList);

          // Find the product in the list and update its quantity
          let found = false;
          const id = buttonId.substring(7); // Extract product ID from button ID

          upsellJson.forEach(function (product) {
            if (product.id == id) {
              product.quantity = 1;
              found = true;
            }
          });

          // If the product is not in the list, add it
          if (!found) {
            let img = input.dataset.imageUrl;

            productJson.push({
              id: input.dataset.index,
              quantity: input.value,
              price: input.dataset.price,
              title: input.dataset.title,
              variantTitle: input.dataset.variantTitle,
              imageURL: img,
            });
          }

          // Update the product list in session storage
          sessionStorage.setItem('potsUpsellList', JSON.stringify(upsellJson));
        } else {
          // Manage product list in session storage
          let productList = sessionStorage.getItem('potsProductList');
          let productJson = JSON.parse(productList);

          // Find the product in the list and update its quantity
          let found = false;
          const id = buttonId.substring(7); // Extract product ID from button ID

          productJson.forEach(function (product) {
            if (product.id == id) {
              product.quantity = 1;
              found = true;
            }
          });

          // If the product is not in the list, add it
          if (!found) {
            let img = input.dataset.imageUrl;

            productJson.push({
              id: input.dataset.index,
              quantity: input.value,
              price: input.dataset.price,
              title: input.dataset.title,
              variantTitle: input.dataset.variantTitle,
              imageURL: img,
            });
          }

          // Update the product list in session storage
          sessionStorage.setItem('potsProductList', JSON.stringify(productJson));

          // Trigger external functions for calculations and updates
          subscription.calculateTotals();
          subscription.updateProgressBar();
          subscription.updateReviewBoxModal();
        }
      });
    }
  }
}
customElements.define('product-button', ProductButton);

// Define Modal Card Opener
class ModalCardOpener extends HTMLElement {
  constructor() {
    super();

    // Standard event listener for product button
    const button = this.querySelector('button');
    const selector = this.querySelector('modal-card');

    if (!button) return;

    button.addEventListener('click', (e) => {
      e.preventDefault();

      // Hide button
      e.target.classList.add('hidden');

      // Remove hidden class from selector
      if (selector.classList.contains('hidden')) {
        selector.classList.remove('hidden');
      }

      const buttonParent = e.target.parentNode;
      buttonParent.classList.add('active');

      const close = selector.querySelector('#close');
      close.addEventListener('click', (e) => {
        e.preventDefault();
        selector.classList.add('hidden');
        button.classList.remove('hidden');
        buttonParent.classList.remove('active');
      });
    });
  }
}
customElements.define('modal-card-opener', ModalCardOpener);

// Define Frequency Selector
class FrequencySelector extends HTMLElement {
  constructor() {
    super();

    // Standard event listener for product button
    const select = this.querySelector('select');
    if (!select) return;

    select.addEventListener('change', (event) => {
      subscription.state.subscriptionFrequency = select.value;
      setCookie('potsFreq', select.value, 1);
      sessionStorage.setItem('potsFreq', select.value);
    });
  }
}
customElements.define('frequency-selector', FrequencySelector);

// Define a custom element for handling "Add to Cart" functionality
class handleCheckoutButton extends HTMLElement {
  constructor() {
    super();

    // Get a reference to the button within the element
    const buttons = this.querySelectorAll('button');

    // If no button is found, exit early
    if (!buttons) return;

    // Add an event listener to the button
    buttons.forEach((button) => {
      button.addEventListener('click', async () => {
        const date = document.getElementById('delivery');

        // Check for the date picker
        if (date && date.value == '') {
          const message = document.getElementById('date_picker__message');
          message.innerHTML = 'Please enter date to proceed';
          message.classList.remove('hidden');
        } else {
          let products = subscription.generateProductArray();
          const addNewProducts = await subscription.handleAddToCart(products);
        }
      });
    });
  }
}

// Register the custom element
customElements.define('checkout-button', handleCheckoutButton);

// Define a custom element for handling subscription type selection
class subscriptionType extends HTMLElement {
  constructor() {
    super();

    // Get references to buttons and the order type element
    const buttons = this.querySelectorAll('button');
    const orderType = document.getElementById('orderType');
    const oneTimeContent = orderType.querySelector('#oneTimeContent');
    const subscriptionContent = orderType.querySelector('#subscriptionContent');

    // Add event listeners to each button
    buttons.forEach((button) => {
      button.addEventListener('click', (e) => {
        if (!button.classList.contains('active')) {
          // Check if the button is not already active
          button.classList.add('active'); // Make the clicked button active
          buttons.forEach((otherButton) => {
            // Deactivate other buttons
            if (otherButton !== button) {
              otherButton.classList.remove('active');
            }
          });

          // Update subscription type based on the clicked button's ID
          if (button.id === 'onetime') {
            setCookie('potsType', 'onetime', 1); // Set cookie and session storage
            sessionStorage.setItem('potsType', 'onetime');
            oneTimeContent.classList.remove('hidden');
            subscriptionContent.classList.add('hidden');
          } else {
            setCookie('potsType', 'subscription', 1); // Set cookie and session storage
            sessionStorage.setItem('potsType', 'subscription');
            subscriptionContent.classList.remove('hidden');
            oneTimeContent.classList.add('hidden');
          }

          // Trigger updates for calculations and review box
          subscription.calculateTotals();
          subscription.updateReviewBoxModal();
        }
      });
    });
  }
}

// Register the custom element
customElements.define('subscription-type', subscriptionType);

// Define a custom element for footer buttons
class footerButtons extends HTMLElement {
  constructor() {
    super();

    // Get references to all buttons within the element
    const buttons = this.querySelectorAll('button');

    // Add event listeners to each button
    buttons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default button behavior

        // If the clicked button has the ID "cart-reset"
        if (e.target.id == 'cart-reset') {
          // Call the subscription.reset() function to reset product selection
          subscription.reset();
        }
      });
    });
  }
}

// Register the custom element
customElements.define('footer-buttons', footerButtons);

class ProductInfoModalOpener extends HTMLElement {
  constructor() {
    super();

    // Custom event listener for the product card
    const badge = this.querySelector('.info__badge');
    if (!badge) return;
    badge.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(badge);
    });
  }
}
customElements.define('product--info-modal-opener', ProductInfoModalOpener);

// Cookie helper functions
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + 1 * 3600 * 1000);
  let expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
  let name = cname + '=';
  let ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];

    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }

    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }

  return '';
}

async function updateCart(data) {
  fetch('/cart/clear.js', {
    // Empty body for a POST request
    body: '',
    // Set credentials and headers
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'xmlhttprequest',
    },
    method: 'POST',
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      // Call the function to handle adding box to the cart
      subscription.handleAddToCart(data);
    })
    .catch((err) => {
      console.error(err); // Log any errors
    });
}

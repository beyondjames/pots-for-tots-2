class DatePicker extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Read attributes and parse as needed
    this.offset = Number(this.getAttribute('offset')) || 0;
    this.page = this.getAttribute('page');
    this.debugMode = this.getAttribute('debug') === 'true';

    const disabledWeekdaysArray = this.parseJsonAttribute('disabled-weekdays', []);
    this.disabledWeekdays = disabledWeekdaysArray.map(Number);
    this.cutoffHours = Number(this.getAttribute('cutoff-hours'));
    this.cutoffMinutes = Number(this.getAttribute('cutoff-minutes'));
    this.disabledDates = this.parseJsonAttribute('disabled-dates', []);
    this.enabledDates = this.parseJsonAttribute('enabled-dates', []);

    this.innerHTML = '<div class="calendar-container"></div>';
    this.initialiseCalendar();

    if (this.debugMode) {
      // Create debug buttons
      const debugButton = document.createElement('button');
      debugButton.textContent = 'Log Cart';
      debugButton.className = 'btn debug get_cart';
      debugButton.type = 'button';

      // Append to the calendar container or this element
      this.appendChild(debugButton);
      debugButton.addEventListener('click', this.getCart.bind(this));

      // Create a clear cart button
      const clearCartButton = document.createElement('button');
      clearCartButton.textContent = 'Clear Cart Attributes';
      clearCartButton.className = 'btn debug clear_cart';
      clearCartButton.type = 'button';

      // Append to the calendar container or this element
      this.appendChild(clearCartButton);
      clearCartButton.addEventListener('click', this.clearCartAttributes.bind(this));
    }
  }

  // Helper to safely parse JSON attributes
  parseJsonAttribute(attrName, defaultValue) {
    const attr = this.getAttribute(attrName);
    if (attr && attr.trim() !== '') {
      try {
        return JSON.parse(attr);
      } catch (e) {
        console.error(`Error parsing ${attrName}:`, e, attr);
      }
    }
    return defaultValue;
  }

  initialiseCalendar() {
    console.log('Initialising calendar');
    const { Calendar } = window.VanillaCalendarPro;

    const container = this.querySelector('.calendar-container');
    if (!container) {
      console.warn('Calendar container not found!');
      return;
    }

    // Get today's date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // dateMin should be offset X days from today
    let dateMin = new Date();

    // get the current time
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();

    dateMin.setDate(dateMin.getDate() + this.offset);

    // Apply an extra day to logic if it's a Friday
    if (today.getDay() == 5) {
      console.log('It is a friday');
      dateMin.setDate(dateMin.getDate() + 1);
    }

    if (currentHour > this.cutoffHours || (currentHour === this.cutoffHours && currentMinutes >= this.cutoffMinutes)) {
      dateMin.setDate(dateMin.getDate() + 1);
    }

    // Ensure dateMin is at midnight
    dateMin.setHours(0, 0, 0, 0);

    // convert dateMin and dateMax into YYYY-MM-DD format
    const dateMinFormatted = this.formatDateLocal(dateMin);
    const dateMax = new Date(new Date().setMonth(new Date().getMonth() + 3));
    const dateMaxFormatted = this.formatDateLocal(dateMax);

    // Create options for calendar with timezone-aware dates
    const options = {
      selectedTheme: 'light',
      firstWeekday: 0,
      dateMin: dateMinFormatted,
      dateMax: dateMaxFormatted,
      disableDates: this.disabledDates,
      enableDates: this.enabledDates,
      disableWeekdays: this.disabledWeekdays,
      onInit: (self) => {
        if (this.page == 'cart') {
          const attributes = {
            _preferred_day: '',
            _first_delivery_date: '',
          };
          updateCart({ attributes: attributes });
        }
      },
      onClickDate: (self, event) => {
        // Use 'this' from the outer scope
        const datePicker = event.target.closest('date-picker');
        const page = datePicker ? datePicker.getAttribute('page') : 'cart';

        const parentElement = event.target.closest('[data-vc-date]');
        if (!parentElement) return;

        const date = parentElement.dataset.vcDate;
        const dayNumber = parentElement.dataset.vcDateWeekDay;
        const dayText = '';
        var dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        console.log('Date selected', date, page);

        if (page == 'account') {
          console.log('Account page - setting reschedule date');
          const rescheduleButton = document.querySelector('.affinity-reschedule');
          if (rescheduleButton) {
            rescheduleButton.disabled = false;
            const selectedDate = new Date(self.context.selectedDates[0]);
            selectedDate.setDate(selectedDate.getDate() - this.offset);
            rescheduleButton.setAttribute('data-date', this.formatDateLocal(selectedDate));
          }
        } else if (page == 'cart') {
          console.log('Cart page - setting delivery date');
          // Update the cart with the selected date using timezone-aware formatting
          const attributes = {
            _first_delivery_date: date,
          };
          attributes._preferred_day = dayOfWeek[new Date(date).getDay()];
          updateCart({ attributes: attributes });

          // Enable the cart checkout button
          document.querySelector('.cart__checkout-button').removeAttribute('disabled');
        }
      },
    };

    // Create a calendar instance and initialize it.
    const calendar = new Calendar(container, options);
    calendar.init();
  }

  formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getCart() {
    try {
      const response = await fetch('/cart.js');
      const data = await response.json();
      console.log('Cart:', data);
      return data.items;
    } catch (e) {
      console.error('Error fetching cart:', e);
      return [];
    }
  }

  // Function to clear cart attributes
  async clearCartAttributes() {
    const attributes = {
      _preferred_day: '',
      _first_delivery_date: '',
    };
    await updateCart({ attributes: attributes });
  }
}

customElements.define('date-picker', DatePicker);

// Function to the cart delivery properties
async function updateCart(updates) {
  const response = await fetch(`/cart/update.js`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  return data;
}

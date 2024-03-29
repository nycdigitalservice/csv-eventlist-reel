import NYCEventCard from './NYCEventCard.js';

/**
 * Declare an AgencyEvent type for reuse
 * @typedef {Object} AgencyEvent - The event to display in the card
 * @property {string} title - The title of the event
 * @property {string} department - The agency running the event
 * @property {string} date - The date of the event formatted 00/00/00
 * @property {string} time - The time of the event
 * @property {string} location - The location of the event
 * @property {string} link - A URL the card will link to
 */

class NYCEventCardList extends HTMLElement {
  connectedCallback() {
    if (this.isConnected) {
      this.setAttribute('role', 'list');
    }
  }

  /**
   * Handle incoming js events
   * @param {Object} evt - an Event or CustomEvent object
   */
  handleEvent(evt) {
    if (evt.type === 'nyc-csv-complete') {
      try {
        const { data } = evt.detail;
        const dataLowerized = data.map(this.lowerize) // make keys lowercase
        const upcomingEvents = this.filterPastEvents(dataLowerized);

        if (upcomingEvents.length > 0){
          const eventsEls = upcomingEvents.map(this.buildCardEl)

          this.innerHTML = '';
          this.append(...eventsEls);
        } else {
          this.innerHTML = '<p>There are no recruitment events scheduled at this time.</p>'
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  /**
   * Create an nyc-event-card element from an AgencyEvent
   * @param {AgencyEvent} event - An AgencyEvent object
   * @returns {HTMLElement} - The nyc-event-card element
   */
  buildCardEl(event) {
    const cardTemplate = NYCEventCard.getTemplate();
    const cardEl = new NYCEventCard().buildEl(event, cardTemplate);
    cardEl.setAttribute('role', 'listitem');
    return cardEl;
  }


  /**
   * Filter out events that have passed
   * @param {...AgencyEvent} events - An array of AgencyEvent objects
   * @returns {...AgencyEvent} An array of AgencyEvent objects
   */
  filterPastEvents(events) {
    return events.map(event => {
      const dateObj = this.strToDate(event.date);
      return {
        event,
        dateObj,
      }
    }) // create a Date object to filter against
      .filter(({ dateObj }) => this.isDatePast(dateObj)) // filter out past dates
      .map(({ event }) => event); // return only the event
  }

  /**
   * Set Object keys lower cased
   * @param {Object}
   * @returns {Object} - object with keys lower cased
   */
  lowerize(obj) {
    return Object.keys(obj).reduce((acc, k) => {
      acc[k.toLowerCase()] = obj[k];
      return acc;
    }, {});
  }

  /**
   * Check if date has past
   * @param {Object} - A date object to check
   * @returns {boolean} - True if date has past
   */
  isDatePast(date) {
    const today = new Date();
    return today < date;
  }

  /**
   * Get a Date object from a string
   * @param {string} dateStr - A date as a string, ideally formatted as 00/00/00
   * @returns {Object} - a Date object
   */
  strToDate(dateStr) {
    const dateStrClean = dateStr.includes('-') ? dateStr.replace(/-/g, '/') : dateStr;
    return new Date(dateStrClean);
  }
}

if ('customElements' in window) {
  customElements.define("nyc-event-card-list", NYCEventCardList);
}

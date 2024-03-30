import NYCEventCard from './NYCEventCard.js';

class NYCCardList extends HTMLElement {
  connectedCallback() {
    if (this.isConnected) {
      this.setAttribute('role', 'list');
      const templateId = this.getAttribute('card-template') || 'card-template';
      this.cardTemplate = document.getElementById(templateId);
    }
  }

  /**
   * Handle incoming js events
   * @param {Object} evt - an Event or CustomEvent object
   */
  handleEvent(evt) {
    try {
      if (this.hasAttribute('nyc-csv-subscribe') && evt.type === this.getAttribute('nyc-csv-subscribe')) {
        const { data } = evt.detail;
        // We want to normalize keys coming from CSV
        const dataLowerized = data.map(this.lowerize);
        this.buildCards(dataLowerized);
      }
    } catch (err) {
      console.error(err);
    }
  }

  buildCards(data) {
    const processedData = this.processData(data);

    if (processedData.length <= 0) {
      this.innerHTML = '<p>There are no recruitment events scheduled at this time.</p>'
      return;
    }
    
    if (!this.cardTemplate) throw new Error('NYCCardList: No card template found');
      
    const cardEls = processedData.map(
      c => this.buildCardEl(c, this.cardTemplate)
    )

    this.innerHTML = '';
    this.append(...cardEls);
  }

  processData(data) {
    const variant = this.getAttribute('variant');
    let result;
    switch (variant) {
    case 'event':
      result = this.filterPastEvents(data);
      break;
    }
    return result;
  }
  
  buildCardEl(cardData, template) {
    const variant = this.getAttribute('variant');
    let cardEl;
    switch (variant) {
    case 'event':
      cardEl = new NYCEventCard().buildEl(cardData, template);
      break;
    }
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
}

if ('customElements' in window) {
  customElements.define("nyc-card-list", NYCCardList);
}

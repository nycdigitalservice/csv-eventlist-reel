export default class NYCEventCard extends HTMLElement {
  /**
   * Return a template element containing an nyc-event-card to be cloned and populated
   * @returns {HTMLElement} - A template element
   */
  static getTemplate() {
    const templateStr = `
    <nyc-event-card class="flow" data-flow-space="s">
    <header class="c-card__header flex flex-col">
    <h3>
    <a href="#" class="no-underline c-card__primary-action" target="_blank">
    <span>
    <slot name="title"></slot>
    </span>
    <span class="c-card__primary-action__icon-wrapper">
    <i class="i-ri:arrow-right-line"></i>
    </span>
    </a></h3>
    <time datetime="" class="order-first text-xs"></time>
    </header>
    <div class="c-card__body flow" data-flow-space="s">
    <p><slot name="department"></slot></p>
    <p><span><slot name="location"></slot></span><br><span><slot name="time"></slot></span></p>
    </div>
    </nyc-event-card>
    `;

    const template = document.createElement('template');
    template.innerHTML = templateStr;
    return template;
  }

  /**
   * Create an nyc-event-card element from an event object and template
   * @param {Object} event - The event to display in the card
   * @param {string} event.title - The title of the event
   * @param {string} event.department - The agency running the event
   * @param {string} event.date - The date of the event formatted 00/00/00
   * @param {string} event.time - The time of the event
   * @param {string} event.location - The location of the event
   * @param {string} event.link - A URL the card will link to
   * @param {string} template - A template string for the nyc-event-card element
   * @returns {HTMLElement} - The nyc-event-card element
   */
  buildEl(event, template) {
    // Clone the template and populate the slots
    const clone = template.content.firstElementChild.cloneNode(true);

    // Set any primary action hrefs to the link
    clone.querySelectorAll('.c-card__primary-action').forEach(el => {
      if (el.tagName.toLowerCase() === 'a') {
        el.href = event.link
      }
    });

    const dateObj = this.strToDate(event.date);
    const dateFormatted = this.formatDate(dateObj);

    const timeEl = clone.querySelector('time');
    timeEl.innerText = dateFormatted;
    timeEl.setAttribute('datetime', event.date);

    clone.querySelectorAll('slot').forEach(slot => {
      if (slot.parentNode && event[slot.name]) {
        slot.parentNode.innerText = event[slot.name];
      }
    });
    return clone;
  }

  /**
   * Get a Date object from a string
   * @param {string} dateStr - A date as a string, ideally formatted as 00/00/00
   * @returns {Object} - a Date object
   */
  strToDate(dateStr) {
    // Safari doesn't like dashes in date strings
    const dateStrClean = dateStr.includes('-') ? dateStr.replace(/-/g, '/') : dateStr;
    return new Date(dateStrClean);
  }

  /**
   * Format a Date object to Weekday Month Day
   * @param {Object} - a Date object
   * @returns {string} - a string of the date formatted to Weekday Month Day
   */
  formatDate(date) {
    // Change dashes to slashes in date string to accommodate Safari
    const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    // const dateStr = date.includes('-') ? date.replace(/-/g, '/') : date;
    const dateLong = date.toLocaleDateString('en-US', dateOptions);
    const [weekday, month, day] = dateLong.replace(/,/,'').split(' ');
    const formattedDate = `${weekday} ${month} ${day}`;
    return formattedDate;
  }
}

if ('customElements' in window) {
  customElements.define("nyc-event-card", NYCEventCard);
}

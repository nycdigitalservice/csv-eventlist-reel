class NYCCsv extends HTMLElement {
  constructor() {
    super();
    this.subscriberAttr = 'nyc-csv-subscribe';
  }

  async connectedCallback() {
    if (this.isConnected){
      try {
        const src = this.getAttribute('src');
        if(!src) throw new Error('NYCCsv: No src attribute provided, quitting');

        this.onCompleteEventName = this.id || 'nyc-csv-complete';
        const onCompleteSubscribers = Array.from(
          document.querySelectorAll(`[${this.subscriberAttr}=${this.id}]`)
        );

        if (onCompleteSubscribers.length > 0) {
          const csvData = await this.getCsvData(src);
          if (csvData.length > 0){
            this.onComplete(csvData, onCompleteSubscribers);
          } else {
            console.info('NYCCsv: No rows returned')
          }
        } else {
          console.info('NYCCsv: No subscribers found')
        }
      } catch (e) {
        console.error(e);
      }
    }
  }


  /**
   * Add event listeners for each subscriber and dispatch complete event
   * @param {Array} data - rows of the CSV file
   * @param {Array} subscribers - elements that have subscribed to complete event
   */
  onComplete(data, subscribers) {
    subscribers.forEach(subscriber => window.addEventListener(this.onCompleteEventName, subscriber));

    return window.dispatchEvent(
      new CustomEvent(this.onCompleteEventName, {
        detail: { data }
      })
    );
  }

  /**
   * Get CSV data from URL using the Papa Parse library
   * @param {string} url - The CSV url
   * @return {Array} Array of CSV rows
   */
  async getCsvData(url) {
    const papaPromise = url => {
      return new Promise((resolve, reject) => {
        if (!window.Papa) reject();
        window.Papa.parse(url, {
          header: true,
          download: true,
          complete: resolve,
          error: reject
        })
      })
    };

    try {
      const { data } = await papaPromise(url);
      return data;
    } catch (e) {
      console.error(e);
    }
  }
}


if ('customElements' in window) {
  customElements.define("nyc-csv", NYCCsv);
}

class NYCCsv extends HTMLElement {
  constructor() {
    super();
    this.onCompleteEventName = 'nyc-csv-complete';
  }

  async connectedCallback() {
    if (this.isConnected){
      try {
        const { src } = this.dataset;
        if(!src) throw new Error('NYCCsv: No data-src provided, quitting');

        const onCompleteSubscribers = Array.from(
          this.querySelectorAll(`[data-subscribe=${this.onCompleteEventName}]`)
        );

        // If we have subscribers, fetch the data
        if (onCompleteSubscribers.length > 0) {
          const csvData = await this.getCsvData(src);

          // If we have data, dispatch complete event
          if (csvData.length > 0){
            this.onComplete(csvData, onCompleteSubscribers);
          } else {
            console.info('NYCCsv: no rows returned')
          }
        } else {
          console.info('NYCCsv: no subscribers found')
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
    subscribers.forEach(subscriber => this.addEventListener(this.onCompleteEventName, subscriber));

    return this.dispatchEvent(
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
      const res = await papaPromise(url);
      return res.data;
    } catch (e) {
      console.error(e);
    }
  }
}

if ('customElements' in window) {
  customElements.define("nyc-csv", NYCCsv);
}

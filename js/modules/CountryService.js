export class CountryService {
    constructor() {
        this.essentialFields = 'name,flags,capital,region,population,cca3';
        this.detailedFields = 'name,flags,capital,region,population,area,languages,currencies,tld,borders,latlng';
        this.MIN_LOADING_TIME = 800; 
    }

    async fetchAllCountries() {
        return this._fetch(`https://restcountries.com/v3.1/all?fields=${this.essentialFields}`);
    }

    async searchCountry(name) {
        return this._fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=${this.essentialFields}`);
    }

    async filterByContinent(continent) {
        if (!continent) return this.fetchAllCountries();
        return this._fetch(`https://restcountries.com/v3.1/region/${continent}?fields=${this.essentialFields}`);
    }

    async getCountryDetails(code) {
        return this._fetch(`https://restcountries.com/v3.1/alpha/${code}?fields=${this.detailedFields}`);
    }

    async _fetch(url) {
        const fetchPromise = fetch(url);
        const delayPromise = new Promise(resolve => setTimeout(resolve, this.MIN_LOADING_TIME)); 

        try {
            const [response] = await Promise.all([fetchPromise, delayPromise]); 
            if (!response.ok) throw new Error(`Erro na API. Status: ${response.status}`);
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }
}
import { UIManager } from './UIManager.js';

class CountryService {
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

class FavoritesManager {
    constructor() {
        this.favoriteCountries = JSON.parse(localStorage.getItem("favorites")) || [];
    }

    toggleFavorite(code) {
        if (!code) return;
        if (this.favoriteCountries.includes(code)) {
            this.favoriteCountries = this.favoriteCountries.filter(c => c !== code);
        } else {
            this.favoriteCountries.push(code);
        }
        this._save();
    }

    isFavorite(code) {
        return this.favoriteCountries.includes(code);
    }

    filterFavorites(list) {
        return list.filter(c => this.favoriteCountries.includes(c.cca3));
    }

    _save() {
        localStorage.setItem("favorites", JSON.stringify(this.favoriteCountries));
    }
}

export class CountryExplorerApp {
    constructor() {
        this.service = new CountryService();
        this.favoritesManager = new FavoritesManager();
        this.ui = new UIManager(this);

        this.globalCountriesList = [];
        this.previousCountriesList = [];
        this.isFavoritesFilterActive = false;
    }

    async init() {
        this._setupEventListeners();
        await this.fetchAllCountries();
    }

    _setupEventListeners() {
        // A lógica do menu sanduíche foi removida daqui e deve estar no seu arquivo menu.js.
        
        const countryModal = document.getElementById("countryModal");
        const closeBtn = countryModal.querySelector(".close-btn");
        const favoritesBtn = document.getElementById("favoritesBtn");

        document.getElementById("searchBtn").addEventListener("click", async () => {
            const name = document.getElementById("searchInput").value.trim();
            this.deactivateFavoritesFilter();
            if (!name) {
                await this.fetchAllCountries();
            } else {
                await this.searchCountry(name);
            }
        });

        document.getElementById("searchInput").addEventListener("keypress", e => {
            if (e.key === "Enter") document.getElementById("searchBtn").click();
        });

        document.getElementById("continentFilter").addEventListener("change", async e => {
            this.deactivateFavoritesFilter();
            await this.filterByContinent(e.target.value);
        });

        closeBtn.addEventListener("click", () => countryModal.classList.add("hidden"));
        countryModal.addEventListener("click", e => { if (e.target === countryModal) countryModal.classList.add("hidden"); });

        favoritesBtn.addEventListener("click", async () => {
            if (this.isFavoritesFilterActive) {
                this.deactivateFavoritesFilter();
                this.restorePreviousList();
            } else {
                await this.activateFavoritesFilter();
            }
        });
    }

    async _loadAndRender(loadDataFn) {
        this.ui.showLoading();
        try {
            const data = await loadDataFn(); 
            this.globalCountriesList = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
            this.previousCountriesList = [...this.globalCountriesList];
            await this.ui.displayCountriesPage(this.globalCountriesList, 1);
        } catch (err) {
            alert("Erro: " + err.message);
        } finally {
            this.ui.hideLoading(); 
        }
    }

    async fetchAllCountries() {
        await this._loadAndRender(() => this.service.fetchAllCountries());
    }

    async searchCountry(name) {
        await this._loadAndRender(() => this.service.searchCountry(name));
    }

    async filterByContinent(continent) {
        await this._loadAndRender(() => this.service.filterByContinent(continent));
    }

    async showCountryDetails(code) {
        const modal = document.getElementById("countryModal");
        modal.classList.remove("hidden");
        this.ui.showLoading("modalLoading");
        try {
            const data = await this.service.getCountryDetails(code);
            this.ui.renderModalDetails(data[0] || data);
        } catch (err) {
            alert("Erro ao carregar detalhes: " + err.message);
            modal.classList.add("hidden");
        } finally {
            this.ui.hideLoading("modalLoading");
        }
    }

    async activateFavoritesFilter(shouldSavePrevious = true) {
        if (!this.previousCountriesList || this.previousCountriesList.length === 0) {
            await this.fetchAllCountries(); 
            return;
        }
        
        if (shouldSavePrevious) this.previousCountriesList = [...this.globalCountriesList];

        const favList = this.favoritesManager.filterFavorites(this.previousCountriesList);
        
        if (favList.length === 0) {
            alert("Nenhum país favoritado ainda!");
            this.isFavoritesFilterActive = false;
            return;
        }

        this.isFavoritesFilterActive = true;
        this.globalCountriesList = favList;
        
        await this.ui.displayCountriesPage(this.globalCountriesList, 1);
    }

    deactivateFavoritesFilter() {
        this.isFavoritesFilterActive = false;
    }

    restorePreviousList() {
        if (!this.previousCountriesList || this.previousCountriesList.length === 0) {
            this.fetchAllCountries();
            return;
        }
        this.globalCountriesList = [...this.previousCountriesList];
        this.ui.displayCountriesPage(this.globalCountriesList, 1);
    }

    goToPage(page) {
        this.ui.displayCountriesPage(this.globalCountriesList, page);
    }
}
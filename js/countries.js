// ================== CountryService ==================
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

// ================== FavoritesManager ==================
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

// ================== UIManager ==================
class UIManager {
    constructor(app) {
        this.app = app;
        this.COUNTRIES_PER_PAGE = 8;
        this.currentPage = 1;
    }

    showLoading(containerId = "loading") {
        const el = document.getElementById(containerId);
        if (el) el.classList.remove("hidden");
        if (containerId === "loading") {
            const countriesListEl = document.getElementById("countriesList");
            if (countriesListEl) countriesListEl.innerHTML = "";
            const paginationContainer = document.getElementById("pagination");
            if (paginationContainer) paginationContainer.innerHTML = "";
        }
    }

    hideLoading(containerId = "loading") {
        const el = document.getElementById(containerId);
        if (el) el.classList.add("hidden");
    }

    async displayCountriesPage(list, page = 1) {
        if (!list || list.length === 0) {
            this.renderCountries([]);
            return;
        }

        this.showLoading();
        this.currentPage = page;

        const startIndex = (page - 1) * this.COUNTRIES_PER_PAGE;
        const endIndex = startIndex + this.COUNTRIES_PER_PAGE;

        const countriesToRender = list.slice(startIndex, endIndex);

        this.renderCountries(countriesToRender);
        this.renderPaginationControls(list);
        this.hideLoading();
    }

    renderCountries(list) {
        const container = document.getElementById("countriesList");
        container.innerHTML = "";

        if (!Array.isArray(list) || list.length === 0) {
            container.innerHTML = "<p>Nenhum país encontrado.</p>";
            document.getElementById("pagination").innerHTML = "";
            return;
        }

        list.forEach(country => {
            const flagSrc = country.flags.svg || country.flags.png;
            const isFav = this.app.favoritesManager.isFavorite(country.cca3);

            const card = document.createElement("div");
            card.className = "country-card";
            card.setAttribute("data-country-code", country.cca3);
            card.innerHTML = `
                <img src="${flagSrc}" alt="Bandeira de ${country.name.common}">
                <h3>${country.name.common}</h3>
                <p><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
                <p><strong>Região:</strong> ${country.region || "N/A"}</p>
                <p><strong>População:</strong> ${country.population?.toLocaleString() || "N/A"}</p>
                <button class="fav-btn ${isFav ? 'saved' : ''}" data-code="${country.cca3}">
                    <span class="fav-icon-in-card" aria-hidden="true">★</span> ${isFav ? "Favoritado" : "Favoritar"}
                </button>
            `;

            card.addEventListener("click", (e) => {
                if (e.target.closest(".fav-btn")) return;
                const code = country.cca3;
                this.app.showCountryDetails(code);
            });

            card.querySelectorAll(".fav-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const code = btn.getAttribute("data-code");
                    this.app.favoritesManager.toggleFavorite(code);
                    const nowFav = this.app.favoritesManager.isFavorite(code);
                    btn.classList.toggle("saved", nowFav);
                    btn.lastChild.textContent = nowFav ? " Favoritado" : " Favoritar";
                    if (!nowFav && this.app.isFavoritesFilterActive) {
                        this.app.activateFavoritesFilter(false);
                    }
                });
            });

            container.appendChild(card);
        });
    }

    renderPaginationControls(list) {
        const totalCountries = list.length;
        const totalPages = Math.ceil(totalCountries / this.COUNTRIES_PER_PAGE);
        const paginationContainer = document.getElementById("pagination");

        if (!paginationContainer) return;
        paginationContainer.innerHTML = "";

        if (totalPages <= 1) return;

        let buttonsHTML = `<button ${this.currentPage === 1 ? 'disabled' : ''} onclick="app.goToPage(${this.currentPage - 1})">Anterior</button>`;

        const maxButtons = 5;
        let start = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        let end = Math.min(totalPages, start + maxButtons - 1);
        if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);

        for (let i = start; i <= end; i++) {
            buttonsHTML += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="app.goToPage(${i})">${i}</button>`;
        }

        buttonsHTML += `<button ${this.currentPage === totalPages ? 'disabled' : ''} onclick="app.goToPage(${this.currentPage + 1})">Próxima</button>`;

        paginationContainer.innerHTML = buttonsHTML;
    }

    renderModalDetails(country) {
        const formatValue = (value, unit = "") => {
            if (value === undefined || value === null) return "N/A";
            if (typeof value === "number") return `${value.toLocaleString()} ${unit}`.trim();
            return `${value} ${unit}`.trim();
        };

        document.getElementById("modalName").textContent = country.name.common;
        document.getElementById("modalFlag").src = country.flags.svg || country.flags.png;
        document.getElementById("modalFlag").alt = `Bandeira de ${country.name.common}`;
        document.getElementById("modalOfficialName").textContent = formatValue(country.name.official);
        document.getElementById("modalArea").textContent = formatValue(country.area, "km²");
        document.getElementById("modalPopulation").textContent = formatValue(country.population);
        document.getElementById("modalCapital").textContent = country.capital?.[0] || "N/A";
        document.getElementById("modalRegion").textContent = country.region || "N/A";

        const languages = country.languages ? Object.values(country.languages).join(", ") : "N/A";
        document.getElementById("modalLanguages").textContent = languages;

        const currencies = country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol || 'N/A'})`).join(", ") : "N/A";
        document.getElementById("modalCurrencies").textContent = currencies;

        document.getElementById("modalTld").textContent = country.tld?.[0] || "N/A";

        const bordersContainer = document.getElementById("modalBordersContainer");
        const bordersElement = document.getElementById("modalBorders");
        if (country.borders && country.borders.length > 0) {
            bordersContainer.classList.remove("hidden");
            bordersElement.textContent = country.borders.join(", ");
        } else {
            bordersContainer.classList.add("hidden");
        }

        const mapContainer = document.getElementById("modalMapEmbed");
        mapContainer.innerHTML = "";
        const lat = country.latlng?.[0];
        const lon = country.latlng?.[1];

        if (lat !== undefined && lon !== undefined) {
            const mapUrl = `https://maps.google.com/maps?q=${lat},${lon}&hl=pt&z=6&output=embed`;
            const iframe = document.createElement("iframe");
            iframe.src = mapUrl;
            iframe.setAttribute("loading", "lazy");
            iframe.setAttribute("allowfullscreen", "");
            mapContainer.appendChild(iframe);
        } else {
            mapContainer.innerHTML = "<p>Coordenadas do mapa não disponíveis.</p>";
        }
    }
}

// ================== CountryExplorerApp ==================
class CountryExplorerApp {
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
        const menuToggle = document.getElementById("menuToggle");
        const mainNav = document.getElementById("mainNav");
        const countryModal = document.getElementById("countryModal");
        const closeBtn = countryModal.querySelector(".close-btn");
        const favoritesBtn = document.getElementById("favoritesBtn");

        menuToggle.addEventListener("click", () => {
            mainNav.classList.toggle("menu-open");
            menuToggle.classList.toggle("open");
        });

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

    async fetchAllCountries() {
        try {
            const data = await this.service.fetchAllCountries();
            this.globalCountriesList = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
            this.previousCountriesList = [...this.globalCountriesList];
            await this.ui.displayCountriesPage(this.globalCountriesList, 1);
        } catch (err) {
            alert("Erro ao carregar países: " + err.message);
        }
    }

    async searchCountry(name) {
        try {
            const data = await this.service.searchCountry(name);
            this.globalCountriesList = data;
            this.previousCountriesList = [...data];
            await this.ui.displayCountriesPage(this.globalCountriesList, 1);
        } catch (err) {
            alert("Erro: " + err.message);
        }
    }

    async filterByContinent(continent) {
        try {
            const data = await this.service.filterByContinent(continent);
            this.globalCountriesList = data;
            this.previousCountriesList = [...data];
            await this.ui.displayCountriesPage(this.globalCountriesList, 1);
        } catch (err) {
            alert("Erro: " + err.message);
        }
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

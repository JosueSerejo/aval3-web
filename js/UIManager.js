export class UIManager {
    constructor(app) {
        this.app = app;
        this.COUNTRIES_PER_PAGE = 8;
        this.currentPage = 1;
        this.MIN_LOADING_TIME = 800;
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

        const delayPromise = new Promise(resolve => setTimeout(resolve, this.MIN_LOADING_TIME));

        const startIndex = (page - 1) * this.COUNTRIES_PER_PAGE;
        const endIndex = startIndex + this.COUNTRIES_PER_PAGE;

        const countriesToRender = list.slice(startIndex, endIndex);

        await delayPromise;

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
            const isActive = i === this.currentPage;

            let pageButtonHTML = `<button class="page-btn ${isActive ? 'active' : ''}"`;

            if (!isActive) {
                pageButtonHTML += ` onclick="app.goToPage(${i})"`;
            } else {
                pageButtonHTML += ` disabled`;
            }

            pageButtonHTML += `>${i}</button>`;
            buttonsHTML += pageButtonHTML;
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
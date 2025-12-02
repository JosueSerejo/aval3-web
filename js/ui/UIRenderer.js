export class UIRenderer {
    constructor(app, COUNTRIES_PER_PAGE = 8) {
        this.app = app;
        this.COUNTRIES_PER_PAGE = COUNTRIES_PER_PAGE;
        this.currentPage = 1;
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

            const displayCountryName = country.name.common;

            const card = document.createElement("div");
            card.className = "country-card";
            card.setAttribute("data-country-code", country.cca3);
            card.innerHTML = `
                <img src="${flagSrc}" alt="Bandeira de ${country.name.common}">
                <h3>${displayCountryName}</h3>
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
}
const essentialFields = 'name,flags,capital,region,population';
const COUNTRIES_PER_PAGE = 8;
let globalCountriesList = [];
let currentPage = 1;

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    menuToggle.addEventListener("click", () => {
        mainNav.classList.toggle("menu-open");
        menuToggle.classList.toggle("open");
    });

    document.getElementById("searchBtn").addEventListener("click", () => {
        const name = document.getElementById("searchInput").value.trim();

        if (name === "") {
            fetchAllCountries();
        } else {
            searchCountry(name);
        }
    });

    document.getElementById("searchInput").addEventListener("keypress", e => {
        if (e.key === "Enter") {
            document.getElementById("searchBtn").click();
        }
    });

    document.getElementById("continentFilter").addEventListener("change", e => {
        filterByContinent(e.target.value);
    });

    fetchAllCountries();
});

function showLoading() {
    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("countriesList").innerHTML = "";
    const paginationContainer = document.getElementById("pagination");
    if (paginationContainer) {
        paginationContainer.innerHTML = "";
    }
}

function hideLoading() {
    document.getElementById("loading").classList.add("hidden");
}

async function fetchAllCountries() {
    try {
        showLoading();

        const response = await fetch(`https://restcountries.com/v3.1/all?fields=${essentialFields}`);

        if (!response.ok) {
            throw new Error(`Não foi possível carregar todos os países. Status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            globalCountriesList = data;
            displayCountriesPage(1);
        } else {
            throw new Error("A API retornou um formato inesperado ou lista vazia.");
        }

    } catch (error) {
        alert("Erro ao carregar países: " + error.message);
        document.getElementById("countriesList").innerHTML = "<p>Não foi possível carregar os dados dos países.</p>";
    } finally {
        hideLoading();
    }
}

async function searchCountry(name) {
    try {
        showLoading();

        const response = await fetch(`https://restcountries.com/v3.1/name/${name}?fields=${essentialFields}`);

        if (!response.ok) {
            if (response.status === 404) {
                document.getElementById("countriesList").innerHTML = `
                    <p class="not-found-message">Nenhum país encontrado com o nome: <strong>${name}</strong>.</p>
                 `;
                const paginationContainer = document.getElementById("pagination");
                if (paginationContainer) paginationContainer.innerHTML = "";
                return;
            }
            throw new Error(`Erro na busca. Status: ${response.status}`);
        }

        const data = await response.json();
        globalCountriesList = data;
        displayCountriesPage(1);

    } catch (error) {
        alert("Erro: " + error.message);
    } finally {
        hideLoading();
    }
}

async function filterByContinent(continent) {
    try {
        showLoading();

        if (continent === "") {
            fetchAllCountries();
            return;
        }

        const response = await fetch(
            `https://restcountries.com/v3.1/region/${continent}?fields=${essentialFields}`
        );

        if (!response.ok) {
            throw new Error("Erro ao filtrar continente");
        }

        const data = await response.json();
        globalCountriesList = data;
        displayCountriesPage(1);

    } catch (error) {
        alert("Erro: " + error.message);
    } finally {
        hideLoading();
    }
}

function displayCountriesPage(page) {
    if (!globalCountriesList || globalCountriesList.length === 0) {
        renderCountries([]);
        return;
    }

    currentPage = page;
    const startIndex = (currentPage - 1) * COUNTRIES_PER_PAGE;
    const endIndex = startIndex + COUNTRIES_PER_PAGE;

    const countriesToRender = globalCountriesList.slice(startIndex, endIndex);

    renderCountries(countriesToRender);
    renderPaginationControls();
}

function renderCountries(list) {
    const container = document.getElementById("countriesList");
    container.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
        container.innerHTML = "<p>Nenhum país encontrado para o filtro selecionado.</p>";
        return;
    }

    list.forEach(country => {
        const flagSrc = country.flags.svg || country.flags.png;

        const card = `
            <div class="country-card">
                <img src="${flagSrc}" alt="Bandeira de ${country.name.common}">
                <h3>${country.name.common}</h3>
                <p><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
                <p><strong>Região:</strong> ${country.region || "N/A"}</p>
                <p><strong>População:</strong> ${country.population?.toLocaleString() || "N/A"}</p>
            </div>
        `;
        container.innerHTML += card;
    });
}

function renderPaginationControls() {
    const totalCountries = globalCountriesList.length;
    const totalPages = Math.ceil(totalCountries / COUNTRIES_PER_PAGE);
    const paginationContainer = document.getElementById("pagination");

    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    let buttonsHTML = '';

    buttonsHTML += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="displayCountriesPage(${currentPage - 1})">Anterior</button>`;

    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
        start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
        buttonsHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="displayCountriesPage(${i})">
                ${i}
            </button>
        `;
    }

    buttonsHTML += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="displayCountriesPage(${currentPage + 1})">Próxima</button>`;

    paginationContainer.innerHTML = buttonsHTML;
}
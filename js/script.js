const essentialFields = 'name,flags,capital,region,population';

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    menuToggle.addEventListener("click", () => {
        mainNav.classList.toggle("menu-open");
        menuToggle.classList.toggle("open");
    });
});

function showLoading() {
    document.getElementById("loading").classList.remove("hidden");
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
            renderCountries(data);
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
                 return; 
            }
            throw new Error(`Erro na busca. Status: ${response.status}`);
        }

        const data = await response.json();
        renderCountries(data);

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
        renderCountries(data);

    } catch (error) {
        alert("Erro: " + error.message);
    } finally {
        hideLoading();
    }
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
                <img src="${flagSrc}" alt="Flag of ${country.name.common}">
                <h3>${country.name.common}</h3>
                <p><strong>Capital:</strong> ${country.capital?.[0] || "N/A"}</p>
                <p><strong>Region:</strong> ${country.region || "N/A"}</p>
                <p><strong>Population:</strong> ${country.population?.toLocaleString() || "N/A"}</p>
            </div>
        `;
        container.innerHTML += card;
    });
}

document.addEventListener("DOMContentLoaded", () => {

    fetchAllCountries();

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
});
import { fetchDistance, searchAddresses } from "./api.js";
import { getCurrentLocation, getAddressFromCoords } from "./geo.js";
import {
  switchTab,
  showError,
  clearError,
  showResult,
  clearResult,
  setCurrentResult,
  renderHistory,
  setupHistoryClearHandler,
  tabsElements,
} from "./ui.js";
import { addHistoryItem } from "./history.js";

const form = document.getElementById("calc-form");
const btnGetLocation = document.getElementById("btn-get-location");

// Hulpfunctie debounce
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Vul suggesties in het dropdown lijstje
function fillSuggestions(listElem, suggestions, inputElem) {
  listElem.innerHTML = "";
  if (suggestions.length === 0) {
    listElem.classList.add("hidden");
    return;
  }
  suggestions.forEach((item) => {
    const li = document.createElement("li");
    li.className = "cursor-pointer px-3 py-2 hover:bg-blue-100";
    li.textContent = item.display_name;
    li.addEventListener("click", () => {
      inputElem.value = item.display_name;
      listElem.classList.add("hidden");
    });
    listElem.appendChild(li);
  });
  listElem.classList.remove("hidden");
}

// Zet autocomplete handlers op beide velden
function setupAutocomplete(inputId, suggestionsId) {
  const inputElem = document.getElementById(inputId);
  const suggestionsElem = document.getElementById(suggestionsId);

  inputElem.addEventListener(
    "input",
    debounce(async (e) => {
      const query = e.target.value.trim();
      if (query.length < 3) {
        suggestionsElem.classList.add("hidden");
        return;
      }
      const results = await searchAddresses(query);
      fillSuggestions(suggestionsElem, results, inputElem);
    }, 300)
  );

  document.addEventListener("click", (e) => {
    if (!suggestionsElem.contains(e.target) && e.target !== inputElem) {
      suggestionsElem.classList.add("hidden");
    }
  });
}

async function handleGetLocationClick() {
  clearError();
  btnGetLocation.disabled = true;
  btnGetLocation.textContent = "Laden...";
  try {
    const coords = await getCurrentLocation();
    const address = await getAddressFromCoords(
      coords.latitude,
      coords.longitude
    );
    if (address) {
      form.elements["start-location"].value = address;
    } else {
      showError("Adres terugvinden mislukt.");
    }
  } catch (err) {
    showError("Locatie ophalen mislukt: " + err.message);
  } finally {
    btnGetLocation.disabled = false;
    btnGetLocation.textContent = "Locatie";
  }
}

function calculate(distance, consumption, price) {
  const litersUsed = (distance * consumption) / 100;
  const cost = litersUsed * price;
  return { litersUsed, cost };
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();
  clearResult();

  const from = form.elements["start-location"].value.trim();
  const to = form.elements["end-location"].value.trim();
  const consumptionStr = form.elements["consumption"].value.trim();
  const priceStr = form.elements["fuel-price"].value.trim();

  if (!from || !to || !consumptionStr) {
    showError("Vul alle verplichte velden in.");
    return;
  }

  const consumption = parseFloat(consumptionStr);
  if (isNaN(consumption) || consumption <= 0) {
    showError("Voer een geldig verbruik in.");
    return;
  }

  let price = parseFloat(priceStr);
  if (isNaN(price) || price <= 0) {
    price = 1.75; // default brandstofprijs
  }

  try {
    const distance = await fetchDistance(from, to);
    const { litersUsed, cost } = calculate(distance, consumption, price);
    showResult(distance, litersUsed, cost);
    setCurrentResult({ from, to, consumption, price, distance, cost });
    addHistoryItem({ from, to, consumption, price, distance, cost });
  } catch (err) {
    showError("Fout bij berekenen: " + err.message);
  }
});

btnGetLocation.addEventListener("click", handleGetLocationClick);

tabsElements.calc.addEventListener("click", () => switchTab("calc"));
tabsElements.history.addEventListener("click", () => switchTab("history"));

setupHistoryClearHandler();

// Nieuwe toevoeging: setup autocomplete op invoervelden
setupAutocomplete("start-location", "start-suggestions");
setupAutocomplete("end-location", "end-suggestions");

switchTab("calc");
renderHistory();

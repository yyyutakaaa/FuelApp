import { getHistory, clearHistory } from "./history.js";

const tabs = {
  calc: document.getElementById("tab-calc"),
  history: document.getElementById("tab-history"),
};
const sections = {
  calc: document.getElementById("section-calc"),
  history: document.getElementById("section-history"),
};

const errorMsg = document.getElementById("error-msg");
const resultCard = document.getElementById("result-card");
const distanceKmEl = document.getElementById("distance-km");
const fuelUsedEl = document.getElementById("fuel-used");
const costPriceEl = document.getElementById("cost-price");

const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const btnClearHistory = document.getElementById("btn-clear-history");

let currentResult = null;

export function switchTab(tab) {
  if (tab === "calc") {
    tabs.calc.classList.add(
      "border-b-2",
      "border-blue-600",
      "bg-white",
      "font-semibold"
    );
    tabs.history.classList.remove(
      "border-b-2",
      "border-blue-600",
      "bg-white",
      "font-semibold"
    );
    tabs.history.classList.add("bg-gray-100");
    sections.calc.classList.remove("hidden");
    sections.history.classList.add("hidden");
    errorMsg.classList.add("hidden");
  } else {
    tabs.history.classList.add(
      "border-b-2",
      "border-blue-600",
      "bg-white",
      "font-semibold"
    );
    tabs.calc.classList.remove(
      "border-b-2",
      "border-blue-600",
      "bg-white",
      "font-semibold"
    );
    tabs.calc.classList.add("bg-gray-100");
    sections.history.classList.remove("hidden");
    sections.calc.classList.add("hidden");
    renderHistory();
  }
}

export function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
}

export function clearError() {
  errorMsg.classList.add("hidden");
}

export function showResult(distance, litersUsed, cost) {
  distanceKmEl.textContent = distance.toFixed(1);
  fuelUsedEl.textContent = litersUsed.toFixed(2);
  costPriceEl.textContent = cost.toFixed(2);
  resultCard.classList.remove("hidden");
}

export function clearResult() {
  resultCard.classList.add("hidden");
  distanceKmEl.textContent = "--";
  fuelUsedEl.textContent = "--";
  costPriceEl.textContent = "--";
}

export function setCurrentResult(result) {
  currentResult = result;
}

export function renderHistory() {
  const history = getHistory();
  if (history.length === 0) {
    historyEmpty.classList.remove("hidden");
    historyList.innerHTML = "";
    btnClearHistory.disabled = true;
  } else {
    historyEmpty.classList.add("hidden");
    btnClearHistory.disabled = false;
    historyList.innerHTML = "";
    history.forEach((item) => {
      const li = document.createElement("li");
      li.className =
        "border rounded p-3 bg-white shadow-sm flex flex-col space-y-1 text-sm";
      li.innerHTML = `
        <div><strong>Van:</strong> ${item.from}</div>
        <div><strong>Naar:</strong> ${item.to}</div>
        <div><strong>Afstand:</strong> ${item.distance.toFixed(1)} km</div>
        <div><strong>Verbruik:</strong> ${item.consumption} L/100km</div>
        <div><strong>Brandstofprijs:</strong> €${item.price.toFixed(2)} /L</div>
        <div><strong>Kostprijs:</strong> €${item.cost.toFixed(2)}</div>
      `;
      historyList.appendChild(li);
    });
  }
}

export function setupHistoryClearHandler(callback) {
  btnClearHistory.addEventListener("click", () => {
    if (confirm("Weet je zeker dat je de geschiedenis wilt wissen?")) {
      clearHistory();
      renderHistory();
      if (callback) callback();
    }
  });
}

export const tabsElements = tabs;

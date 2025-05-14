const localStorageKey = "fuelAppHistory";
const maxHistoryItems = 5;

export function getHistory() {
  try {
    const data = localStorage.getItem(localStorageKey);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history) {
  localStorage.setItem(localStorageKey, JSON.stringify(history));
}

export function addHistoryItem(item) {
  const history = getHistory();
  history.unshift(item);
  if (history.length > maxHistoryItems) {
    history.length = maxHistoryItems; // keep max 5
  }
  saveHistory(history);
}

export function clearHistory() {
  localStorage.removeItem(localStorageKey);
}

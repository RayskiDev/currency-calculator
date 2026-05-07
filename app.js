/*
    setup
*/
const API_URL = "https://api.nbp.pl/api/exchangerates/tables/A/?format=json";

const fromCurrencySelect = document.getElementById("fromCurrency");
const toCurrencySelect = document.getElementById("toCurrency");
const amountInput = document.getElementById("amount");

const selectEl = [fromCurrencySelect, toCurrencySelect];

const swapBtn = document.getElementById("swapBtn");

const resultValue = document.getElementById("resultValue");
const resultCurrency = document.getElementById("resultCurrency");

const lastUpdateInfo = document.getElementById("updateDate");

/*
    Logika pobierania danych i wypełniania selectów
*/

let exchangeRates = { PLN: 1 };
async function loadCurrencies() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Błąd pobierania danych");

    const data = await response.json();
    const rates = data[0].rates;
    if (lastUpdateInfo) lastUpdateInfo.textContent = data[0].effectiveDate;

    addOption(fromCurrencySelect, "PLN", "Polski Złoty");
    addOption(toCurrencySelect, "PLN", "Polski Złoty");

    // Wypełnij selecty walutami
    rates.forEach((rate) => {
      exchangeRates[rate.code] = rate.mid;
      addOption(fromCurrencySelect, rate.code, rate.currency);
      addOption(toCurrencySelect, rate.code, rate.currency);
    });

    fromCurrencySelect.value = "PLN";
    toCurrencySelect.value = "EUR";

    updateVisibility();
    convertCurrency();
  } catch (error) {
    console.error("Błąd ładowania walut:", error);
    if (lastUpdateInfo) lastUpdateInfo.textContent = "Błąd pobierania danych";
    lastUpdateInfo.style.color = "#ef4444";
    resultValue.textContent = "0.00";
    resultCurrency.textContent = "";
    amountInput.disabled = true;
    amountInput.value = "";
    selectEl.forEach(select => select.disabled = true);
    swapBtn.disabled = true;
  }
}


/*
    Główna logika konwersji walut 
*/

function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrencySelect.value;
  const to = toCurrencySelect.value;

  if (isNaN(amount) || amount < 0) {
    resultValue.textContent = "0.00";
    return;
  }

  const rateFrom = exchangeRates[from];
  const rateTo = exchangeRates[to];

  if (rateFrom && rateTo) {
    const result = (amount * rateFrom) / rateTo;

    resultValue.textContent = new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(result);
    resultCurrency.textContent = to;
  }
}


/* 
    Funkcje pomocnicze 
*/

// Funkcja pomocnicza do dodawania opcji do selecta
function addOption(selectElement, code, name) {
  const option = document.createElement("option");
  option.value = code;
  option.textContent = `${code} - ${name}`;
  selectElement.appendChild(option);
}

// Aktualizuj widoczność opcji, aby zapobiec wyborowi tej samej waluty
function updateVisibility() {
    const fromValue = fromCurrencySelect.value;
    const toValue = toCurrencySelect.value;

    Array.from(toCurrencySelect.options).forEach(option => {
        option.hidden = (option.value === fromValue);
    });

    Array.from(fromCurrencySelect.options).forEach(option => {
        option.hidden = (option.value === toValue);
    });
}

/* 
    Listenery zdarzeń 
*/

// Obsługa przycisku swap
swapBtn.addEventListener("click", () => {
  const temp = fromCurrencySelect.value;
  fromCurrencySelect.value = toCurrencySelect.value;
  toCurrencySelect.value = temp;
  updateVisibility();
  convertCurrency();
});

// Obsługa zmiany waluty
[fromCurrencySelect, toCurrencySelect].forEach((select) =>
  select.addEventListener("change", () => {
    updateVisibility();
    convertCurrency();
  }),
);

// Obsługa zmiany kwoty
amountInput.addEventListener("input", convertCurrency);

// Ładowanie walut po załadowaniu DOM
window.addEventListener("DOMContentLoaded", loadCurrencies);

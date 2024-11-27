const currencyListA = document.querySelectorAll('.from .currency-selector .currency-item');
const currencyListB = document.querySelectorAll('.to .currency-selector .currency-item');
const menuItems = document.querySelectorAll('.menu .menu-item');

const amountInputA = document.querySelector("#amount-from");
const amountInputB = document.querySelector("#amount-to");

let currencyA = '';
let currencyB = '';

const rateDisplayA = document.querySelector(".from .input-group .rate-info");
const rateDisplayB = document.querySelector(".to .input-group .rate-info");

const offlineIndicator = document.querySelector('.connection-status');
const defaultConversionRate = 1;
let lastUpdatedInput = "from";

const toggleMenuIcon = document.querySelector(".burger-icon");
let mobileMenu;

function handleCurrencySelection(itemList) {
    itemList.forEach(item => {
        item.addEventListener('click', async () => {
            itemList.forEach(element => element.classList.remove('selected'));
            item.classList.add('selected');

            syncCurrencySelection();

            if (lastUpdatedInput === "from") {
                const conversion = await fetchConversionRate(currencyA, currencyB, amountInputA.value);
                amountInputB.value = conversion !== null ? conversion.toFixed(3) : amountInputA.value;
            } else if (lastUpdatedInput === "to") {
                const conversion = await fetchConversionRate(currencyB, currencyA, amountInputB.value);
                amountInputA.value = conversion !== null ? conversion.toFixed(3) : amountInputB.value;
            }

            const rateAB = await fetchExchangeRate(currencyA, currencyB);
            rateDisplayA.textContent = `1 ${currencyA} = ${rateAB || defaultConversionRate} ${currencyB}`;

            const rateBA = await fetchExchangeRate(currencyB, currencyA);
            rateDisplayB.textContent = `1 ${currencyB} = ${rateBA || defaultConversionRate} ${currencyA}`;
        });
    });
}

amountInputA.addEventListener("input", async () => {
    amountInputA.value = amountInputA.value.replace(',', '.').replace(/[^0-9.]/g, '');

    if ((amountInputA.value.match(/\./g) || []).length > 1) {
        amountInputA.value = amountInputA.value.replace(/\.(?=.*\.)/, '');
    }

    lastUpdatedInput = "from";
    const value = amountInputA.value;

    if (currencyA && currencyB && value) {
        const conversion = await fetchConversionRate(currencyA, currencyB, value);
        amountInputB.value = conversion !== null ? conversion.toFixed(3) : value;
    }

    if (value === '') {
        amountInputA.value = '';
        amountInputB.value = '';
    }
});
handleCurrencySelection(currencyListA);

amountInputB.addEventListener("input", async () => {
    amountInputB.value = amountInputB.value.replace(',', '.').replace(/[^0-9.]/g, '');

    if ((amountInputB.value.match(/\./g) || []).length > 1) {
        amountInputB.value = amountInputB.value.replace(/\.(?=.*\.)/, '');
    }

    lastUpdatedInput = "to";
    const value = amountInputB.value;

    if (currencyA && currencyB && value) {
        const conversion = await fetchConversionRate(currencyB, currencyA, value);
        amountInputA.value = conversion !== null ? conversion.toFixed(3) : value;
    }

    if (value === '') {
        amountInputA.value = '';
        amountInputB.value = '';
    }
});

async function fetchConversionRate(currencyFrom, currencyTo, amount) {
    try {
        if (amount) {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/dd5b0c6a97dd24dc2cd52d10/pair/${currencyFrom}/${currencyTo}/${amount}`);
            const data = await response.json();
            return data["conversion_result"] !== undefined ? data["conversion_result"] : null;
        }
    } catch (error) {
        console.error("Error fetching conversion data:", error);
        return null;
    }
}
handleCurrencySelection(currencyListB);

async function fetchExchangeRate(currencyFrom, currencyTo) {
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/dd5b0c6a97dd24dc2cd52d10/latest/${currencyFrom}`);
        const data = await response.json();
        return data["conversion_rates"] ? data["conversion_rates"][currencyTo] : defaultConversionRate;
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        return defaultConversionRate;
    }
}

function syncCurrencySelection() {
    currencyListA.forEach(item => {
        if (item.classList.contains("selected")) {
            currencyA = item.textContent;
        }
    });

    currencyListB.forEach(item => {
        if (item.classList.contains("selected")) {
            currencyB = item.textContent;
        }
    });
}
handleCurrencySelection(menuItems);


function showOfflineMessage() {
    offlineIndicator.classList.add('visible');
}

function hideOfflineMessage() {
    offlineIndicator.classList.remove('visible');
}

window.addEventListener('offline', () => {
    showOfflineMessage();

});

window.addEventListener('online', () => {
    hideOfflineMessage();

});


window.addEventListener('DOMContentLoaded', async () => {
    if (!navigator.onLine) {
        showOfflineMessage();
    }
    syncCurrencySelection();

    if (currencyA && currencyB) {
        try {
            const conversion = await fetchConversionRate(currencyA, currencyB, amountInputA.value);
            amountInputB.value = conversion !== null ? conversion.toFixed(3) : amountInputA.value;

            const rateAB = await fetchExchangeRate(currencyA, currencyB);
            rateDisplayA.textContent = `1 ${currencyA} = ${rateAB || defaultConversionRate} ${currencyB}`;

            const rateBA = await fetchExchangeRate(currencyB, currencyA);
            rateDisplayB.textContent = `1 ${currencyB} = ${rateBA || defaultConversionRate} ${currencyA}`;
        } catch (error) {
            console.error('Error during initial data fetch:', error);
        }
    }
});

toggleMenuIcon.addEventListener("click", () => {
    if (!mobileMenu) {
        mobileMenu = document.createElement("div");
        mobileMenu.className = "mobile-menu";

        const menuList = document.createElement("ul");
        menuList.className = "mobile-list";

        const options = ["BANKING", "BUSINESS", "INVESTMENTS", "INSURANCE", "MOBILE", "TRAVEL", "ENTERTAINMENT"];
        options.forEach(option => {
            const menuItem = document.createElement("li");
            menuItem.className = "menu-item";
            menuItem.textContent = option;
            menuList.appendChild(menuItem);
        });

        mobileMenu.appendChild(menuList);
        document.body.appendChild(mobileMenu);
    }

    mobileMenu.classList.toggle("active");
});

document.addEventListener("click", (event) => {
    if (mobileMenu && !mobileMenu.contains(event.target) && !toggleMenuIcon.contains(event.target)) {
        mobileMenu.classList.remove("active");
    }
});

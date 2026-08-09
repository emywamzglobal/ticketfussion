// ==========================================
// CURRENCY SELECTOR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const currencySelector =
            document.getElementById(
                "currency-selector"
            );

        if (!currencySelector) {
            return;
        }

        const savedCurrency =
            localStorage.getItem(
                "currency"
            ) || "USD";

        currencySelector.value =
            savedCurrency;

        currencySelector.addEventListener(
            "change",
            () => {

                localStorage.setItem(
                    "currency",
                    currencySelector.value
                );

            }
        );

    }
);
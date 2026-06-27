console.log("TicketFussion JS Loaded");

document.addEventListener("DOMContentLoaded", () => {

    // ==================================
    // HOMEPAGE HERO SLIDER
    // ==================================

    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");
    const nextArrow = document.querySelector(".next");
    const prevArrow = document.querySelector(".prev");

    if (slides.length) {

        let currentSlide = 0;

        function showSlide(index) {

            slides.forEach(slide =>
                slide.classList.remove("active")
            );

            dots.forEach(dot =>
                dot.classList.remove("active-dot")
            );

            slides[index].classList.add("active");

            if (dots[index]) {
                dots[index].classList.add("active-dot");
            }
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide =
                (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        nextArrow?.addEventListener("click", nextSlide);
        prevArrow?.addEventListener("click", prevSlide);

        setInterval(nextSlide, 5000);
    }

    // ==================================
    // RECOMMENDED MATCHES SLIDER
    // ==================================

    const cardsContainer =
        document.getElementById("cardsContainer");

    const nextCard =
        document.getElementById("nextCard");

    const prevCard =
        document.getElementById("prevCard");

    if (cardsContainer && nextCard && prevCard) {

        nextCard.addEventListener("click", () => {
            cardsContainer.scrollBy({
                left: 350,
                behavior: "smooth"
            });
        });

        prevCard.addEventListener("click", () => {
            cardsContainer.scrollBy({
                left: -350,
                behavior: "smooth"
            });
        });
    }

    // ==================================
    // MATCHES PAGE SLIDERS
    // ==================================

    document
        .querySelectorAll(".match-slider-container")
        .forEach(container => {

            const slider =
                container.querySelector(".matches-slider");

            const nextBtn =
                container.querySelector(".next-btn");

            const prevBtn =
                container.querySelector(".prev-btn");

            if (slider && nextBtn && prevBtn) {

                nextBtn.addEventListener("click", () => {
                    slider.scrollBy({
                        left: 350,
                        behavior: "smooth"
                    });
                });

                prevBtn.addEventListener("click", () => {
                    slider.scrollBy({
                        left: -350,
                        behavior: "smooth"
                    });
                });

            }

        });

});

function changeQty(id, amount){

    let qty = document.getElementById(id);

    let current = parseInt(qty.textContent);

    current += amount;

    if(current < 1){
        current = 1;
    }

    qty.textContent = current;

    updatePrice(id);
}

function updatePrice(id){

    const prices = {
        cat1: 250,
        cat2: 450,
        cat3: 700,
        cat4: 1000,
        vip: 2500
    };

    const qty = parseInt(document.getElementById(id).textContent);

    const total = prices[id] * qty;

    const priceElement = document.getElementById(id + "-price");

    if(priceElement){

        priceElement.textContent =
            "$" + total.toFixed(2);

    }

}

function displayKickoffTime() {

    const kickoffElement = document.getElementById("kickoff");

    if (!kickoffElement) return;

    const matchTime = kickoffElement.dataset.time;

    const kickoff = new Date(matchTime);

    kickoffElement.textContent = kickoff.toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

displayKickoffTime();

const currencySelect = document.getElementById("currencySelect");

if (currencySelect) {

    const savedCurrency = localStorage.getItem("currency") || "USD";

    currencySelect.value = savedCurrency;

    currencySelect.addEventListener("change", function () {

        localStorage.setItem("currency", this.value);

        location.reload();

    });

}


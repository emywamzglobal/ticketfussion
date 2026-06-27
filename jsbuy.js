/*=========================================
  TicketFussion Checkout
  buy.js
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    //==========================
    // LOAD SELECTED TICKET
    //==========================

    const eventName = localStorage.getItem("eventName");
    const category = localStorage.getItem("ticketCategory");
    const ticketPrice = localStorage.getItem("ticketPrice");
    const ticketQty = localStorage.getItem("ticketQuantity");

    //==========================
    // ELEMENTS
    //==========================

    const eventField = document.getElementById("eventName");
    const categoryField = document.getElementById("ticketCategory");
    const priceField = document.getElementById("ticketPrice");

    const subtotalField = document.getElementById("subTotal");
    const serviceFeeField = document.getElementById("serviceFee");
    const totalField = document.getElementById("totalPrice");

    const quantityInput = document.getElementById("quantity");

    const plusBtn = document.getElementById("plus");
    const minusBtn = document.getElementById("minus");

    const payButton = document.getElementById("payButton");

    const fullname = document.getElementById("fullname");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const country = document.getElementById("country");

    const agree = document.getElementById("agree");



    //==========================
    // DEFAULT VALUES
    //==========================

    let quantity = Number(ticketQty) || 1;

let price = Number(ticketPrice) || 0;

let total = 0;

const SERVICE_FEE_PER_TICKET = 5;
const MAX_TICKETS = 10;



    //==========================
    // DISPLAY DATA
    //==========================

    eventField.textContent = eventName || "";

    categoryField.textContent = category || "";

    priceField.textContent =
        "$" + price.toFixed(2);

    quantityInput.value = quantity;



    //==========================
    // UPDATE SUMMARY
    //==========================

    function updateSummary(){

        const subtotal =
            quantity * price;

        const fee =
            quantity * SERVICE_FEE_PER_TICKET;

        total = subtotal + fee;

        quantityInput.value = quantity;

        subtotalField.textContent =
            "$" + subtotal.toFixed(2);

        serviceFeeField.textContent =
            "$" + fee.toFixed(2);

        totalField.textContent =
            "$" + total.toFixed(2);

    }



    //==========================
    // PLUS
    //==========================

    plusBtn.addEventListener("click", () => {

        if(quantity < MAX_TICKETS){

            quantity++;

            updateSummary();

        }

    });



    //==========================
    // MINUS
    //==========================

    minusBtn.addEventListener("click", () => {

        if(quantity > 1){

            quantity--;

            updateSummary();

        }

    });



    updateSummary();
    
        //==========================
    // PROCEED TO PAYMENT
    //==========================

    payButton.addEventListener("click", () => {

        // Validate Full Name
        if(fullname.value.trim() === ""){

            alert("Please enter your full name.");

            fullname.focus();

            return;

        }

        // Validate Email
        if(email.value.trim() === ""){

            alert("Please enter your email address.");

            email.focus();

            return;

        }

        // Validate Terms
        if(!agree.checked){

            alert("Please accept the Terms & Conditions.");

            return;

        }

        // Save latest quantity

        localStorage.setItem("ticketQuantity", quantity);

        // Build Order Object

        const order = {

            event: eventName,

            category: category,

            price: price,

            quantity: quantity,

            subtotal: quantity * price,

            serviceFee: quantity * SERVICE_FEE_PER_TICKET,

            total: (quantity * price) + (quantity * SERVICE_FEE_PER_TICKET),

            customer:{

                fullname: fullname.value.trim(),

                email: email.value.trim(),

                phone: phone.value.trim(),

                country: country.value

            }

        };

        console.log(order);

        // Prevent multiple clicks

        payButton.disabled = true;

        payButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Preparing Secure Payment...';

        /*
        =====================================

        PAYSTACK

        Integration begins here.

        Next phase:

        1. Send order to backend.
        2. Backend creates Paystack transaction.
        3. Redirect customer.
        4. Verify payment.
        5. Generate Ticket.
        6. Generate QR Code.
        7. Email Ticket.

        =====================================
        */

        PaystackPop.setup({

    key: "YOUR_PAYSTACK_PUBLIC_KEY",

    email: document.getElementById("email").value,

    amount: total * 100,

    currency: "USD",

    callback: function(response){

        window.location.href =
            "/success.html?reference=" + response.reference;

    },

    onClose: function(){

        payButton.disabled = false;

        payButton.innerHTML =
        '<i class="fa-solid fa-lock"></i> Proceed to Payment';

    }

}).openIframe();

    });

});
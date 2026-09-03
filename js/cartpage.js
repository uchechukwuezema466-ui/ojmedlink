import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { firebaseConfig } from "./firebaseconfig.js";


// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

console.log("CART PAGE FIREBASE CONNECTED");
console.log("FIRESTORE:", db);

// ========================================
// CART PAGE
// ========================================


// ========================================
// GET SAVED CART
// ========================================

let cartItems =
    JSON.parse(localStorage.getItem("medilinkCart")) || [];

const cartContainer =
    document.querySelector("#cart-items");

const cartSubtotal =
    document.querySelector("#cart-subtotal");

const cartTotal =
    document.querySelector("#cart-total");


// ========================================
// DISPLAY CART
// ========================================

function displayCart() {

    cartContainer.innerHTML = "";


    // Check if cart is empty
    if (cartItems.length === 0) {

        cartContainer.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

        calculateCartTotal();

        return;
    }


    cartItems.forEach(function (item) {

        const cartItem =
            document.createElement("div");

        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            <div class="cart-item-image">

                <img
                    src="${item.image}"
                    alt="${item.name}">

            </div>


            <div class="cart-item-info">

                <h3>
                    ${item.name}
                </h3>

                <p>
                    ${item.packSize}
                </p>

                <div class="cart-item-price">

                    <span class="unit-price">
                        ₦${item.price.toLocaleString()} per unit
                    </span>

                    <strong>
                        ₦${(item.price * item.quantity).toLocaleString()}
                    </strong>

                </div>

            </div>


            <div class="cart-item-controls">

                <label>
                    Quantity
                </label>

                <input
                    type="number"
                    class="cart-quantity"
                    data-id="${item.id}"
                    value="${item.quantity}"
                    min="1">


                <button
                    class="remove-cart-item"
                    data-id="${item.id}">

                    <i class="fa-solid fa-trash"></i>

                    Remove

                </button>

            </div>

        `;


        cartContainer.appendChild(cartItem);

    });


    connectCartControls();

    calculateCartTotal();

}


// ========================================
// CALCULATE TOTAL
// ========================================

function calculateCartTotal() {

    let total = 0;


    cartItems.forEach(function (item) {

        total += Number(item.price) * Number(item.quantity);

    });


    cartSubtotal.textContent =
        "₦" + total.toLocaleString();

    cartTotal.textContent =
        "₦" + total.toLocaleString();

}


// ========================================
// CART CONTROLS
// ========================================

function connectCartControls() {

    const quantityInputs =
        document.querySelectorAll(".cart-quantity");


    const removeButtons =
        document.querySelectorAll(".remove-cart-item");


    // Change quantity
    quantityInputs.forEach(function (input) {

        input.addEventListener("change", function () {

            const medicineId =
                input.dataset.id;


            let newQuantity =
                Number(input.value);


            if (newQuantity < 1 || isNaN(newQuantity)) {

                newQuantity = 1;

                input.value = 1;

            }


            const item =
                cartItems.find(function (item) {

                    return item.id === medicineId;

                });


            if (item) {

                item.quantity = newQuantity;

            }


            saveCart();

            displayCart();

        });

    });


    // Remove item
    removeButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const medicineId =
                button.dataset.id;


            cartItems =
                cartItems.filter(function (item) {

                    return item.id !== medicineId;

                });


            saveCart();

            displayCart();

        });

    });

}


// ========================================
// SAVE CART
// ========================================

function saveCart() {

    localStorage.setItem(
        "medilinkCart",
        JSON.stringify(cartItems)
    );

}


// ========================================
// START CART PAGE
// ========================================

displayCart();

// ========================================
// SWITCH TO CUSTOMER DETAILS
// ========================================

const proceedButton =
    document.querySelector("#proceed-order");

const cartSection =
    document.querySelector("#cart-section");

const orderSection =
    document.querySelector("#order-section");


proceedButton.addEventListener("click", function () {

    cartSection.classList.add("hide");

    orderSection.classList.add("show");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// ========================================
// SEND CART ORDER TO WHATSAPP + FIRESTORE
// ========================================

const orderForm =
    document.querySelector("#order-form");


if (orderForm) {

    orderForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        // ========================================
        // GET CUSTOMER DETAILS
        // ========================================

        const customerName =
            document.querySelector("#customer-name").value.trim();

        const customerPhone =
            document.querySelector("#customer-phone").value.trim();

        const deliveryAddress =
            document.querySelector("#delivery-address").value.trim();

        const customerState =
            document.querySelector("#customer-state").value.trim();

        const orderNotes =
            document.querySelector("#order-notes").value.trim();


        // ========================================
        // BUILD ORDER ITEMS
        // ========================================

        let orderItems = [];

        let total = 0;


        cartItems.forEach(function (item) {

            const itemTotal =
                Number(item.price) * Number(item.quantity);


            total += itemTotal;


            orderItems.push({

                name: item.name,

                packSize: item.packSize,

                price: Number(item.price),

                quantity: Number(item.quantity),

                itemTotal: itemTotal

            });

        });


        // ========================================
        // CREATE ORDER OBJECT
        // ========================================

        const order = {

            customerName: customerName,

            customerPhone: customerPhone,

            deliveryAddress: deliveryAddress,

            customerState: customerState,

            orderNotes: orderNotes,

            items: orderItems,

            total: total,

            orderType: "cart",

            status: "new",

            createdAt: serverTimestamp()

        };


        try {

            // ========================================
            // SAVE ORDER TO FIRESTORE
            // ========================================

            const orderRef = await addDoc(
                collection(db, "orders"),
                order
            );


            console.log(
                "ORDER SAVED TO FIRESTORE:",
                orderRef.id
            );


            // ========================================
            // BUILD WHATSAPP MESSAGE
            // ========================================

            let whatsappItems = "";


            orderItems.forEach(function (item, index) {

                whatsappItems +=
`${index + 1}. ${item.name}
   Pack Size: ${item.packSize}
   Quantity: ${item.quantity}
   Unit Price: ₦${item.price.toLocaleString()}
   Item Total: ₦${item.itemTotal.toLocaleString()}

`;

            });


            const message =
`MEDILINK WHOLESALE ORDER

ORDER ID:
${orderRef.id}

CUSTOMER DETAILS

Name: ${customerName}
Phone: ${customerPhone}
State: ${customerState}
Delivery Address: ${deliveryAddress}

ORDER ITEMS

${whatsappItems}
TOTAL: ₦${total.toLocaleString()}

ADDITIONAL NOTES:
${orderNotes || "None"}`;


            // ========================================
            // WHATSAPP
            // ========================================

            const whatsappNumber =
                "2349136313871";


            const whatsappURL =
                "https://api.whatsapp.com/send?phone=" +
                whatsappNumber +
                "&text=" +
                encodeURIComponent(message);


            // ========================================
            // CLEAR CART
            // ========================================

            localStorage.removeItem("medilinkCart");


            // ========================================
            // OPEN WHATSAPP
            // ========================================

            window.location.href = whatsappURL;


        } catch (error) {

            console.error(
                "ERROR SAVING ORDER:",
                error
            );


            alert(
                "We could not submit your order. Please try again."
            );

        }

    });

}
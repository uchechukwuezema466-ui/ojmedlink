// ========================================
// FIREBASE
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { firebaseConfig } from "./firebaseconfig.js";


// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// ========================================
// MEDICINE DATA
// ========================================

console.log("MEDICINE.JS IS RUNNING");

let medicines = [];

window.medicines = medicines

// ========================================
// GET THE MEDICINE GRID
// ========================================

const medicineGrid = document.querySelector(".medicine-grid");

// ========================================
// LOAD MEDICINES FROM FIRESTORE
// ========================================

async function loadMedicines() {

    console.log("LOADING MEDICINES FROM FIRESTORE...");

    try {

        const medicinesSnapshot =
            await getDocs(
                collection(db, "medicines")
            );


        medicines = [];


        medicinesSnapshot.forEach(function (medicineDoc) {

            medicines.push({

                id: medicineDoc.id,

                ...medicineDoc.data()

            });

        });

        window.medicines = medicines


        console.log(
            "MEDICINES LOADED:",
            medicines.length
        );


        // Show medicines on page

        displayMedicines(medicines);

        window.dispatchEvent(
            new CustomEvent("medicinesLoaded")
        );


    } catch (error) {

        console.error(
            "ERROR LOADING MEDICINES:",
            error
        );

    }

}


// ========================================
// CREATE A MEDICINE CARD
// ========================================

function createMedicineCard(medicine) {

    const card = document.createElement("div");

    card.className = "medicine-card";


    card.innerHTML = `

        <div class="medicine-image">

            <span class="stock-status">
                ${medicine.stock}
            </span>

            <img
                src="${medicine.imageUrl}"
                alt="${medicine.name}">

        </div>


        <div class="medicine-info">

            <span class="medicine-category">
                ${String(medicine.category || "")
                .replaceAll("-", " ")
                .toUpperCase()}
            </span>

            <h3>
                ${medicine.name}
            </h3>

            <p class="medicine-description">
                ${medicine.description}
            </p>

            <p class="pack-size">
                Pack Size: ${medicine.packSize}
            </p>


            <div class="medicine-divider"></div>


            <div class="medicine-purchase">

                <div class="price">

                    <span class="price-label">
                        Wholesale Price
                    </span>

                    <strong>
                        ₦${medicine.price.toLocaleString()}
                    </strong>

                </div>


                <div class="purchase-controls">

                    <select class="quantity-select">

                        ${(medicine.quantities || [2, 5, 10, 20, 50, 100]).map(function(quantity) {

                            return `
                                <option value="${quantity}">
                                    ${quantity}
                                </option>
                            `;

                        }).join("")}

                    </select>


                    <button class="add-cart-btn" data-id="${medicine.id}">

                        <i class="fa-solid fa-cart-plus"></i>

                    </button>

                </div>

            </div>

        </div>

    `;


    return card;
}
console.log(medicines);
console.log(medicineGrid);

// ========================================
// DISPLAY ALL MEDICINES
// ========================================

// ========================================
// DISPLAY MEDICINES
// ========================================

function displayMedicines(medicineList) {

    medicineGrid.innerHTML = "";

    medicineList.forEach(function(medicine) {

        const card = createMedicineCard(medicine);

        medicineGrid.appendChild(card);

    });

}


// ========================================
// LOAD MEDICINES
// ========================================

loadMedicines();



const searchInput = document.querySelector("#medicine-search");


// ========================================
// SEARCH MEDICINES
// ========================================

searchInput.addEventListener("input", function () {

    const searchValue = searchInput.value.toLowerCase().trim();

    const filteredMedicines = medicines.filter(function (medicine) {

        return medicine.name.toLowerCase().includes(searchValue);

    });

    displayMedicines(filteredMedicines);

});

// ========================================
// CATEGORY FILTER
// ========================================

const categoryButtons = document.querySelectorAll(".category-btn");

categoryButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const selectedCategory = button.dataset.category;

        categoryButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        if (selectedCategory === "all") {

            displayMedicines(medicines);

            return;
        }

        const filteredMedicines = medicines.filter(function (medicine) {

            return medicine.category === selectedCategory;

        });

        displayMedicines(filteredMedicines);

    });

});

// ========================================
// CUSTOM ORDER → CUSTOMER DETAILS
// ========================================

const customOrderForm =
    document.querySelector("#writeorder-form");

const customCustomerSection =
    document.querySelector("#custom-customer-section");

const closeCustomerForm =
    document.querySelector("#close-customer-form");


customOrderForm.addEventListener("submit", function (event) {

    event.preventDefault();


    // Get the custom order information
    const medicineNames =
        document.querySelector("#medicine-name").value.trim();

    const quantityNeeded =
        document.querySelector("#quantity-needed").value.trim();

    const medicineDetails =
        document.querySelector("#medicine-details").value.trim();


    // Save the custom order temporarily
    const customOrder = {

        medicineNames: medicineNames,
        quantityNeeded: quantityNeeded,
        medicineDetails: medicineDetails

    };


    localStorage.setItem(
        "medilinkCustomOrder",
        JSON.stringify(customOrder)
    );


    // Open customer details modal
    customCustomerSection.classList.add("show");

    document.body.style.overflow = "hidden";

});


closeCustomerForm.addEventListener("click", function () {

    customCustomerSection.classList.remove("show");

    document.body.style.overflow = "";

});

// ========================================
// CUSTOM ORDER → WHATSAPP
// ========================================

const sendCustomOrderButton =
    document.querySelector("#custom-send-order");


sendCustomOrderButton.addEventListener("click", function (event) {

    // Stop the form from refreshing/submitting normally
    event.preventDefault();


    console.log("WHATSAPP BUTTON CLICKED");


    // ========================================
    // GET CUSTOM ORDER
    // ========================================

    const customOrder =
        JSON.parse(
            localStorage.getItem("medilinkCustomOrder")
        ) || {};


    // ========================================
    // GET CUSTOMER DETAILS
    // ========================================

    const customerName =
        document.querySelector("#custom-customer-name").value.trim();

    const customerPhone =
        document.querySelector("#custom-customer-phone").value.trim();

    const deliveryAddress =
        document.querySelector("#custom-delivery-address").value.trim();

    const customerState =
        document.querySelector("#custom-customer-state").value.trim();

    const orderNotes =
        document.querySelector("#custom-order-notes").value.trim();


    // ========================================
    // BUILD MESSAGE
    // ========================================

    const message =
`MEDILINK CUSTOM ORDER

CUSTOMER DETAILS
Name: ${customerName}
Phone: ${customerPhone}
State: ${customerState}
Delivery Address: ${deliveryAddress}

MEDICINE REQUEST
${customOrder.medicineNames || "Not provided"}

QUANTITY NEEDED
${customOrder.quantityNeeded || "Not provided"}

SPECIFICATIONS / DETAILS
${customOrder.medicineDetails || "None"}

ADDITIONAL NOTES
${orderNotes || "None"}`;


    // ========================================
    // WHATSAPP
    // ========================================

    const whatsappNumber = "2349136313871";

    const whatsappURL =
        "https://api.whatsapp.com/send?phone=" +
        whatsappNumber +
        "&text=" +
        encodeURIComponent(message);


    window.location.href = whatsappURL;

});


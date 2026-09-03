// ========================================
// CART
// ========================================

const cartCount = document.querySelector(".cart-count");

let cartItems = JSON.parse(localStorage.getItem("medilinkCart")) || [];


// ========================================
// UPDATE CART COUNT
// ========================================

function updateCartCount() {

    let totalItems = 0;

    cartItems.forEach(function(item) {

        totalItems += item.quantity;

    });

    cartCount.textContent = totalItems;

}

updateCartCount();


// ========================================
// ADD MEDICINE TO CART
// ========================================

function addToCart(button) {

    const medicineId = button.dataset.id;

    const selectedMedicine = window.medicines.find(function (medicine) {

        return medicine.id === medicineId;

    });

    if (!selectedMedicine) {
        return;
    }

    const medicineCard = button.closest(".medicine-card");

    const quantitySelect =
        medicineCard.querySelector(".quantity-select");

    const selectedQuantity =
        Number(quantitySelect.value);

    const existingItem = cartItems.find(function (item) {

        return item.id === medicineId;

    });

    if (existingItem) {

        existingItem.quantity += selectedQuantity;

    } else {

        cartItems.push({

            id: selectedMedicine.id,
            name: selectedMedicine.name,
            price: selectedMedicine.price,
            image: selectedMedicine.image,
            packSize: selectedMedicine.packSize,
            quantity: selectedQuantity

        });

    }

    localStorage.setItem(
        "medilinkCart",
        JSON.stringify(cartItems)
    );

    updateCartCount();

    // alert(selectedMedicine.name + " added to cart!");

}


// ========================================
// CART BUTTONS
// ========================================

function connectCartButtons() {

    const addCartButtons =
        document.querySelectorAll(".add-cart-btn");


    addCartButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            addToCart(button);

        });

    });

}

window.addEventListener(
    "medicinesLoaded",
    function () {

        connectCartButtons();

    }
);

// ========================================
// OPEN CART PAGE
// ========================================

const cartIcon = document.querySelector(".cart");

cartIcon.addEventListener("click", function () {

    window.location.href = "/html/cartpage.html";

});
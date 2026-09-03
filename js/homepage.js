
// ========================================
// 1. GET ELEMENTS FROM THE HTML
// ========================================

const browseButton = document.querySelector(".browse-btn");
const requestButton = document.querySelector(".request-btn");
const cart = document.querySelector(".cart");
const cartCount = document.querySelector(".cart-count");


// ========================================
// 2. CREATE / GET THE CART
// ========================================

// Check if a cart already exists in localStorage
const cartItems = JSON.parse(localStorage.getItem("medilinkCart")) || [];


// ========================================
// 3. UPDATE CART COUNT
// ========================================

function updateCartCount() {

    if (cartCount) {
        cartCount.textContent = cartItems.length;
    }

}


// Update the cart when the homepage loads
updateCartCount();


// ========================================
// 4. BROWSE MEDICINES BUTTON
// ========================================

if (browseButton) {

    browseButton.addEventListener("click", function () {

        window.location.href = "/medicine.html";

    });

}


// ========================================
// 5. WRITE ORDER BUTTON
// ========================================

if (requestButton) {

    requestButton.addEventListener("click", function () {

        alert("The Write Order form will be available soon.");

    });

}


// ========================================
// 6. CART BUTTON
// ========================================

if (cart) {

    cart.addEventListener("click", function () {

        alert("Your cart will be available soon.");

    });

}

// ========================================
// HERO IMAGE SLIDER
// ========================================

const heroSlide =
    document.querySelector("#hero-slide");


const heroImages = [

    "/image/hero1.png",

    "/image/hero2.jpg",

    "/image/hero3.png"

];


let currentHeroImage = 0;


if (heroSlide) {

    setInterval(function () {

        currentHeroImage++;

        if (currentHeroImage >= heroImages.length) {

            currentHeroImage = 0;

        }

        heroSlide.src =
            heroImages[currentHeroImage];

    }, 4000);

}
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { firebaseConfig } from "./firebaseconfig.js";


// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
let currentOrder = null;


// ========================================
// CHECK ADMIN LOGIN
// ========================================

onAuthStateChanged(auth, function (user) {

    if (!user) {

        window.location.href = "/html/adminlogin.html";

        return;
    }

    console.log("Admin authenticated:", user.email);

    console.log("ABOUT TO LOAD ORDERS");

    loadOrders();

});


// ========================================
// LOAD ORDERS FROM FIRESTORE
// ========================================

async function loadOrders() {

    console.log("LOAD ORDERS FUNCTION STARTED");

    try {

        const ordersSnapshot =
            await getDocs(
                collection(db, "orders")
            );

        console.log("FIRESTORE RESPONSE RECEIVED");

        const orders = [];

        ordersSnapshot.forEach(function (doc) {

            orders.push({

                id: doc.id,

                ...doc.data()

            });

        });

        console.log(
            "Orders found:",
            orders.length
        );


        // ========================================
        // GET DASHBOARD ELEMENTS
        // ========================================

        const ordersList =
            document.querySelector("#orders-list");

        const ordersEmpty =
            document.querySelector("#orders-empty");

        const newOrdersCount =
            document.querySelector("#new-orders-count");

        const processingOrdersCount =
            document.querySelector("#processing-orders-count");

        const completedOrdersCount =
            document.querySelector("#completed-orders-count");


        // ========================================
        // CLEAR CURRENT TABLE
        // ========================================

        ordersList.innerHTML = "";


        // ========================================
        // EMPTY STATE
        // ========================================

        if (orders.length === 0) {

            ordersEmpty.style.display = "flex";

            newOrdersCount.textContent = "0";
            processingOrdersCount.textContent = "0";
            completedOrdersCount.textContent = "0";

            return;
        }


        ordersEmpty.style.display = "none";


        // ========================================
        // COUNT ORDER STATUSES
        // ========================================

        let newOrders = 0;
        let processingOrders = 0;
        let completedOrders = 0;


        orders.forEach(function (order) {

            const status =
                String(order.status || "new").toLowerCase();


            if (status === "new") {

                newOrders++;

            } else if (status === "processing") {

                processingOrders++;

            } else if (status === "completed") {

                completedOrders++;

            }

        });


        // ========================================
        // UPDATE STATISTICS
        // ========================================

        newOrdersCount.textContent =
            newOrders;

        processingOrdersCount.textContent =
            processingOrders;

        completedOrdersCount.textContent =
            completedOrders;


        // ========================================
        // DISPLAY ORDERS
        // ========================================

        orders.forEach(function (order, index) {

            const row =
                document.createElement("tr");


            const customerName =
                order.customerName ||
                "Unknown customer";


            const items =
                Array.isArray(order.items)
                    ? order.items
                    : [];


            const total =
                Number(order.total || 0);


            const status =
                String(
                    order.status || "new"
                ).toLowerCase();


            const statusText =
                status.charAt(0).toUpperCase() +
                status.slice(1);


            // ========================================
            // ORDER NUMBER
            // ========================================

            const orderNumber =
                "#" +
                String(index + 1).padStart(3, "0");


            row.innerHTML = `

                <td>
                    ${orderNumber}
                </td>

                <td>
                    ${customerName}
                </td>

                <td>
                    ${items.length}
                    ${items.length === 1 ? "item" : "items"}
                </td>

                <td>
                    ₦${total.toLocaleString()}
                </td>

                <td>

                    <span class="order-status ${status}">
                        ${statusText}
                    </span>

                </td>

                <td>

                    <button
                        type="button"
                        class="view-order-button"
                        data-order-id="${order.id}">

                        View

                    </button>

                </td>

            `;


            ordersList.appendChild(row);


            // ========================================
            // VIEW BUTTON
            // ========================================

            const viewButton =
                row.querySelector(
                    ".view-order-button"
                );


            viewButton.addEventListener(
                "click",
                function () {

                    showOrderDetails(order);

                }
            );

        });


    } catch (error) {

        console.error(
            "ERROR LOADING ORDERS:",
            error
        );

    }

}


// ========================================
// SHOW ORDER DETAILS
// ========================================

function showOrderDetails(order) {

    currentOrder = order;

    const deleteButton =
    document.querySelector("#delete-order");

const processingButton =
    document.querySelector("#mark-processing");

const completedButton =
    document.querySelector("#mark-completed");


deleteButton.style.display = "none";

processingButton.style.display = "none";

completedButton.style.display = "none";


if (order.status === "new") {

    processingButton.style.display =
        "inline-flex";

}


if (order.status === "processing") {

    completedButton.style.display =
        "inline-flex";

}


if (order.status === "completed") {

    deleteButton.style.display =
        "inline-flex";

}

    const orderDetails =
        document.querySelector("#order-details");

    const orderNumber =
        document.querySelector(
            "#details-order-number"
        );

    const detailsName =
        document.querySelector("#details-name");

    const detailsPhone =
        document.querySelector("#details-phone");

    const detailsState =
        document.querySelector("#details-state");

    const detailsAddress =
        document.querySelector("#details-address");

    const detailsItems =
        document.querySelector("#details-items");

    const detailsTotal =
        document.querySelector("#details-total");


    // ========================================
    // CUSTOMER INFORMATION
    // ========================================

    orderNumber.textContent =
        `Order #${order.id.substring(0, 8)}`;

    detailsName.textContent =
        order.customerName || "—";

    detailsPhone.textContent =
        order.customerPhone || "—";

    detailsState.textContent =
        order.customerState || "—";

    detailsAddress.textContent =
        order.deliveryAddress || "—";


    // ========================================
    // ORDER ITEMS
    // ========================================

    detailsItems.innerHTML = "";


    const items =
        Array.isArray(order.items)
            ? order.items
            : [];


    items.forEach(function (item) {

        const itemElement =
            document.createElement("div");


        itemElement.className =
            "detail-item";


        itemElement.innerHTML = `

            <div>

                <div class="detail-item-name">
                    ${item.name || "Unknown medicine"}
                </div>

                <div class="detail-item-info">
                    Quantity: ${item.quantity || 0}
                    ${item.packSize
                        ? ` • ${item.packSize}`
                        : ""}
                </div>

            </div>


            <div class="detail-item-info">

                ₦${Number(
                    item.itemTotal || 0
                ).toLocaleString()}

            </div>

        `;


        detailsItems.appendChild(
            itemElement
        );

    });


    // ========================================
    // TOTAL
    // ========================================

    detailsTotal.textContent =
        `₦${Number(
            order.total || 0
        ).toLocaleString()}`;


    // ========================================
    // SHOW DETAILS
    // ========================================

    orderDetails.classList.add("show");


    orderDetails.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


// ========================================
// CLOSE ORDER DETAILS
// ========================================

const closeDetails =
    document.querySelector("#close-details");


closeDetails.addEventListener(
    "click",
    function () {

        const orderDetails =
            document.querySelector(
                "#order-details"
            );

        orderDetails.classList.remove("show");

    }
);


// ========================================
// LOGOUT
// ========================================

const logoutButton =
    document.querySelector("#logout-button");


logoutButton.addEventListener(
    "click",
    async function () {

        try {

            await signOut(auth);

            window.location.href =
                "/html/adminlogin.html";

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);

// ========================================
// MARK ORDER AS PROCESSING
// ========================================

const markProcessing =
    document.querySelector("#mark-processing");


markProcessing.addEventListener(
    "click",
    async function () {

        if (!currentOrder) {
            return;
        }

        try {

            await updateDoc(
                doc(db, "orders", currentOrder.id),
                {
                    status: "processing"
                }
            );

            console.log(
                "Order marked as processing"
            );

            currentOrder.status = "processing";

            await loadOrders();

            showOrderDetails(currentOrder);

        } catch (error) {

            console.error(
                "Error updating order:",
                error
            );

        }

    }
);

// ========================================
// MARK ORDER AS COMPLETED
// ========================================

const markCompleted =
    document.querySelector("#mark-completed");


markCompleted.addEventListener(
    "click",
    async function () {

        if (!currentOrder) {
            return;
        }

        try {

            await updateDoc(
                doc(db, "orders", currentOrder.id),
                {
                    status: "completed"
                }
            );

            console.log(
                "Order marked as completed"
            );

            currentOrder.status = "completed";

            await loadOrders();

            showOrderDetails(currentOrder);

        } catch (error) {

            console.error(
                "Error updating order:",
                error
            );

        }

    }
);

// ========================================
// DELETE COMPLETED ORDER
// ========================================

const deleteOrderButton =
    document.querySelector("#delete-order");


deleteOrderButton.addEventListener(
    "click",
    async function () {

        if (!currentOrder) {
            return;
        }


        // Only completed orders can be deleted

        if (currentOrder.status !== "completed") {

            alert(
                "Only completed orders can be deleted."
            );

            return;
        }


        // Confirm before deleting

        const confirmed =
            confirm(
                "Are you sure you want to delete this completed order?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteDoc(
                doc(
                    db,
                    "orders",
                    currentOrder.id
                )
            );


            console.log(
                "Order deleted:",
                currentOrder.id
            );


            // Close details panel

            document
                .querySelector("#order-details")
                .classList.remove("show");


            // Clear selected order

            currentOrder = null;


            // Reload orders

            await loadOrders();


        } catch (error) {

            console.error(
                "Error deleting order:",
                error
            );

            alert(
                "Could not delete the order. Please try again."
            );

        }

    }
);
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    updateDoc,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { firebaseConfig } from "./firebaseconfig.js";

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

let editingMedicineId = null;

// ========================================
// DASHBOARD NAVIGATION
// ========================================

const dashboardLink =
    document.querySelector('.sidebar-link[href="#"]');

const ordersLink =
    document.querySelector('.sidebar-link[href="#orders"]');

const medicinesLink =
    document.querySelector('.sidebar-link[href="#medicines"]');


const dashboardSection =
    document.querySelector("#dashboard");

const ordersSection =
    document.querySelector("#orders");

const medicinesSection =
    document.querySelector("#medicines");

const orderDetails =
    document.querySelector("#order-details");

    // ========================================
// SHOW DASHBOARD
// ========================================

dashboardLink.addEventListener("click", function (event) {

    event.preventDefault();

    dashboardSection.style.display = "block";
    ordersSection.style.display = "none";
    medicinesSection.classList.remove("show");
    orderDetails.classList.remove("show");

    dashboardLink.classList.add("active");
    ordersLink.classList.remove("active");
    medicinesLink.classList.remove("active");

});


// ========================================
// SHOW ORDERS
// ========================================

ordersLink.addEventListener("click", function (event) {

    event.preventDefault();

    dashboardSection.style.display = "none";
    ordersSection.style.display = "block";
    medicinesSection.classList.remove("show");
    orderDetails.classList.remove("show");

    dashboardLink.classList.remove("active");
    ordersLink.classList.add("active");
    medicinesLink.classList.remove("active");

});


// ========================================
// SHOW MEDICINES
// ========================================

medicinesLink.addEventListener("click", function (event) {

    event.preventDefault();

    dashboardSection.style.display = "none";
    ordersSection.style.display = "none";
    medicinesSection.classList.add("show");
    orderDetails.classList.remove("show");

    dashboardLink.classList.remove("active");
    ordersLink.classList.remove("active");
    medicinesLink.classList.add("active");

    loadMedicines();

});

// ========================================
// ADD MEDICINE FORM
// ========================================

const addMedicineButton =
    document.querySelector("#add-medicine-button");

const medicineFormWrapper =
    document.querySelector("#add-medicine-form-wrapper");

const closeMedicineForm =
    document.querySelector("#close-medicine-form");

const cancelMedicineButton =
    document.querySelector("#cancel-medicine-button");


// ========================================
// OPEN ADD MEDICINE FORM
// ========================================

addMedicineButton.addEventListener("click", function () {

    // ========================================
    // START A NEW MEDICINE
    // ========================================

    editingMedicineId = null;

    medicineForm.reset();


    // Change button back to "Save Medicine"

    const saveButton =
        document.querySelector("#save-medicine-button");

    saveButton.innerHTML =
        '<i class="fa-solid fa-check"></i> Save Medicine';


    // Show form

    medicineFormWrapper.classList.add("show");


    medicineFormWrapper.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});

// ========================================
// CLOSE ADD MEDICINE FORM
// ========================================

closeMedicineForm.addEventListener("click", function () {

    medicineFormWrapper.classList.remove("show");

});


// ========================================
// CANCEL ADD MEDICINE
// ========================================

cancelMedicineButton.addEventListener("click", function () {

    medicineFormWrapper.classList.remove("show");

});

// ========================================
// SAVE MEDICINE TO FIRESTORE
// ========================================

const medicineForm =
    document.querySelector("#add-medicine-form");

    // ========================================
    // SAVE / UPDATE MEDICINE
    // ========================================

    medicineForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ========================================
            // GET FORM VALUES
            // ========================================

            const medicineName =
                document.querySelector("#medicine-name").value.trim();

            const category =
                document.querySelector("#medicine-category").value.trim();

            const price =
                Number(
                    document.querySelector("#medicine-price").value
                );

            const packSize =
                document.querySelector("#medicine-pack-size").value.trim();

            const stock =
                Number(
                    document.querySelector("#medicine-stock").value
                );

            const description =
                document.querySelector("#medicine-description").value.trim();

            const medicineImageUrl =
                document.querySelector("#medicine-image-url").value.trim();


            // ========================================
            // MEDICINE DATA
            // ========================================

            const medicineData = {

                name: medicineName,

                category: category,

                price: price,

                packSize: packSize,

                stock: stock,

                description: description,

                imageUrl: medicineImageUrl

            };


            try {

                // ========================================
                // EDIT EXISTING MEDICINE
                // ========================================

                if (editingMedicineId) {

                    await updateDoc(
                        doc(
                            db,
                            "medicines",
                            editingMedicineId
                        ),
                        medicineData
                    );


                    console.log(
                        "MEDICINE UPDATED:",
                        editingMedicineId
                    );


                    alert(
                        "Medicine updated successfully!"
                    );

                }


                // ========================================
                // ADD NEW MEDICINE
                // ========================================

                else {

                    await addDoc(
                        collection(db, "medicines"),
                        {
                            ...medicineData,


                            createdAt: serverTimestamp()
                        }
                    );


                    console.log(
                        "MEDICINE SAVED"
                    );


                    alert(
                        "Medicine saved successfully!"
                    );

                }


                // ========================================
                // RESET EDIT MODE
                // ========================================

                editingMedicineId = null;


                // ========================================
                // RESET FORM
                // ========================================

                medicineForm.reset();


                // ========================================
                // CHANGE BUTTON BACK
                // ========================================

                const saveButton =
                    document.querySelector("#save-medicine-button");


                saveButton.innerHTML =
                    '<i class="fa-solid fa-check"></i> Save Medicine';


                // ========================================
                // CLOSE FORM
                // ========================================

                medicineFormWrapper.classList.remove("show");


                // ========================================
                // REFRESH MEDICINES
                // ========================================

                await loadMedicines();


            } catch (error) {

                console.error(
                    "ERROR SAVING/UPDATING MEDICINE:",
                    error
                );


                alert(
                    "Could not save the medicine. Please try again."
                );

            }

        }
    );

// ========================================
// LOAD MEDICINES FROM FIRESTORE
// ========================================

async function loadMedicines() {

    console.log("LOADING MEDICINES...");

    try {

        const medicinesSnapshot =
            await getDocs(
                collection(db, "medicines")
            );


        console.log(
            "Medicines found:",
            medicinesSnapshot.size
        );


        const medicinesList =
            document.querySelector("#medicines-list");

        const medicinesEmpty =
            document.querySelector("#medicines-empty");


        medicinesList.innerHTML = "";

        // ========================================
        // OPEN EDIT MEDICINE
        // ========================================

        function openEditMedicine(medicineId, medicine) {

            editingMedicineId = medicineId;


            // ========================================
            // GET FORM ELEMENTS
            // ========================================

            const medicineFormWrapper =
                document.querySelector("#add-medicine-form-wrapper");

            const medicineForm =
                document.querySelector("#add-medicine-form");

            const medicineName =
                document.querySelector("#medicine-name");

            const medicineCategory =
                document.querySelector("#medicine-category");

            const medicinePrice =
                document.querySelector("#medicine-price");

            const medicinePackSize =
                document.querySelector("#medicine-pack-size");

            const medicineStock =
                document.querySelector("#medicine-stock");

            const medicineDescription =
                document.querySelector("#medicine-description");

            const medicineImageUrl =
                document.querySelector("#medicine-image-url");

            const saveButton =
                document.querySelector("#save-medicine-button");


            // ========================================
            // PUT EXISTING DATA INTO FORM
            // ========================================

            medicineName.value =
                medicine.name || "";

            medicineCategory.value =
                medicine.category || "";

            medicinePrice.value =
                medicine.price || "";

            medicinePackSize.value =
                medicine.packSize || "";

            medicineStock.value =
                medicine.stock || "";

            medicineDescription.value =
                medicine.description || "";

            medicineImageUrl.value =
                medicine.imageUrl || "";


            // ========================================
            // CHANGE BUTTON TEXT
            // ========================================

            saveButton.innerHTML =
                '<i class="fa-solid fa-check"></i> Save Changes';


            // ========================================
            // SHOW FORM
            // ========================================

            medicineFormWrapper.classList.add("show");


            medicineFormWrapper.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


        // ========================================
        // NO MEDICINES
        // ========================================

        if (medicinesSnapshot.empty) {

            medicinesEmpty.style.display = "flex";

            return;
        }


        medicinesEmpty.style.display = "none";


        // ========================================
        // DISPLAY MEDICINES
        // ========================================

        medicinesSnapshot.forEach(function (medicinedoc) {

            const medicine =
                medicinedoc.data();


            const row =
                document.createElement("tr");


            const name =
                medicine.name || "Unknown medicine";


            const category =
                medicine.category || "—";


            const price =
                Number(medicine.price || 0);


            const stock =
                Number(medicine.stock || 0);


            // ========================================
            // STOCK STATUS
            // ========================================

            let stockText = "";
            let stockClass = "";


            if (stock <= 0) {

                stockText = "Out of Stock";
                stockClass = "out-of-stock";

            } else if (stock <= 5) {

                stockText = "Low Stock";
                stockClass = "low-stock";

            } else {

                stockText = "In Stock";
                stockClass = "in-stock";

            }


            // ========================================
            // TABLE ROW
            // ========================================

            row.innerHTML = `

                <td>
                    ${name}
                </td>

                <td>
                    ${category}
                </td>

                <td>
                    ₦${price.toLocaleString()}
                </td>

                <td>

                    <span class="medicine-stock ${stockClass}">
                        ${stockText}
                    </span>

                </td>

                <td>

                    <button
                        type="button"
                        class="edit-medicine-button"
                        data-medicine-id="${doc.id}">

                        Edit

                    </button>

                    <button
                        type="button"
                        class="delete-medicine-button"
                        data-medicine-id="${doc.id}">

                        Delete

                    </button>

                </td>

            `;


            medicinesList.appendChild(row);

            const editButton =
                row.querySelector(".edit-medicine-button");


             editButton.addEventListener("click", function () {

                openEditMedicine(doc.id, medicine);

            });

            const deleteButton =
                row.querySelector(".delete-medicine-button");


            deleteButton.addEventListener("click", async function () {

                const confirmed =
                    confirm(
                        "Are you sure you want to delete this medicine?"
                    );


                if (!confirmed) {
                    return;
                }


                try {

                    await deleteDoc(
                        doc(
                            db,
                            "medicines",
                            medicinedoc.id
                        )
                    );


                    console.log(
                        "MEDICINE DELETED:",
                        doc.id
                    );


                    await loadMedicines();


                } catch (error) {

                    console.error(
                        "ERROR DELETING MEDICINE:",
                        error
                    );


                    alert(
                        "Could not delete the medicine. Please try again."
                    );

                }

            });

        });


    } catch (error) {

        console.error(
            "ERROR LOADING MEDICINES:",
            error
        );

    }

}
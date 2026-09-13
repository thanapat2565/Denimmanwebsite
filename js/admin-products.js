import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// ========================================
// VARIABLES
// ========================================

let allProducts = [];
let editingProductId = null;


// ========================================
// AUTH CHECK
// ========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "admin-login.html";
        return;
    }

    loadProducts();

});


// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

    const container = document.getElementById("admin-products-list");

    if (!container) {
        console.error("ไม่พบ #admin-products-list");
        return;
    }

    container.innerHTML = `
        <p class="admin-loading">
            Loading products...
        </p>
    `;

    try {

        const productsSnapshot = await getDocs(
            collection(db, "products")
        );

        allProducts = [];

        productsSnapshot.forEach((productDoc) => {

            const data = productDoc.data();

            allProducts.push({

                // ใช้ Firestore Document ID เป็น ID หลัก
                id: String(productDoc.id),

                // ข้อมูลอื่น ๆ จาก Firestore
                ...data

            });

        });


        // ====================================
        // SORT PRODUCTS
        // ====================================

        allProducts.sort((a, b) => {

            const idA = Number(a.id);
            const idB = Number(b.id);

            if (
                !Number.isNaN(idA) &&
                !Number.isNaN(idB)
            ) {

                return idA - idB;

            }

            return String(a.id).localeCompare(
                String(b.id)
            );

        });


        renderProducts();

    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );

        container.innerHTML = `
            <p class="admin-loading">
                ไม่สามารถโหลดข้อมูลสินค้าได้
            </p>
        `;

    }

}


// ========================================
// RENDER PRODUCTS
// ========================================

function renderProducts() {

    const container =
        document.getElementById(
            "admin-products-list"
        );

    const productCount =
        document.getElementById(
            "product-count"
        );


    if (!container) {
        return;
    }


    if (productCount) {

        productCount.textContent =
            allProducts.length;

    }


    // ====================================
    // NO PRODUCTS
    // ====================================

    if (allProducts.length === 0) {

        container.innerHTML = `
            <div class="admin-products-empty">

                <h3>
                    ยังไม่มีสินค้า
                </h3>

                <p>
                    กด + ADD PRODUCT เพื่อเพิ่มสินค้า
                </p>

            </div>
        `;

        return;

    }


    // ====================================
    // CREATE HTML
    // ====================================

    let html = "";


    allProducts.forEach((product) => {

        const productId =
            String(product.id);

        const productName =
            product.name || "-";

        const category =
            product.category || "-";

        const price =
            Number(product.price) || 0;

        const tag =
            product.tag || "-";

        const image =
            product.image || "";

        const active =
            product.active !== false;


        html += `

            <div class="admin-product-row">

                <!-- IMAGE -->
                <div class="admin-product-image">

                    ${
                        image

                        ? `
                            <img
                                src="${image}"
                                alt="${productName}"
                                onerror="this.style.display='none'"
                            >
                        `

                        : `
                            <div class="admin-no-image">
                                NO IMAGE
                            </div>
                        `
                    }

                </div>


                <!-- PRODUCT INFO -->
                <div class="admin-product-info">

                    <strong>
                        ${productName}
                    </strong>

                    <span>
                        ${category}
                    </span>

                </div>


                <!-- PRICE -->
                <div class="admin-product-price">

                    ฿${price.toLocaleString("th-TH")}

                </div>


                <!-- TAG -->
                <div class="admin-product-tag">

                    ${
                        tag !== "-"

                        ? `
                            <span>
                                ${tag}
                            </span>
                        `

                        : "-"
                    }

                </div>


                <!-- STATUS -->
                <div class="admin-product-status">

                    <span
                        class="${
                            active
                            ? "product-active"
                            : "product-inactive"
                        }"
                    >

                        ${
                            active
                            ? "ACTIVE"
                            : "INACTIVE"
                        }

                    </span>

                </div>


                <!-- ACTIONS -->
                <div class="admin-product-actions">

                    <button
                        type="button"
                        class="admin-edit-product"
                        data-product-id="${productId}"
                    >
                        EDIT
                    </button>


                    <button
                        type="button"
                        class="admin-toggle-product ${
                            active
                            ? "deactivate"
                            : "activate"
                        }"
                        data-product-id="${productId}"
                    >

                        ${
                            active
                            ? "DISABLE"
                            : "ENABLE"
                        }

                    </button>

                </div>

            </div>

        `;

    });


    container.innerHTML = html;


    // ========================================
    // EDIT BUTTON
    // ========================================

    const editButtons =
        container.querySelectorAll(
            ".admin-edit-product"
        );


    editButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const productId =
                    String(
                        button.dataset.productId
                    );

                console.log(
                    "EDIT PRODUCT ID:",
                    productId
                );

                openEditProduct(productId);

            }
        );

    });


    // ========================================
    // ENABLE / DISABLE BUTTON
    // ========================================

    const toggleButtons =
        container.querySelectorAll(
            ".admin-toggle-product"
        );


    toggleButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const productId =
                    String(
                        button.dataset.productId
                    );

                toggleProduct(productId);

            }
        );

    });

}


// ========================================
// OPEN ADD PRODUCT FORM
// ========================================

function openAddProduct() {

    editingProductId = null;


    document.getElementById(
        "product-form-title"
    ).textContent =
        "ADD PRODUCT";


    document.getElementById(
        "product-id"
    ).value = "";


    document.getElementById(
        "product-name"
    ).value = "";


    document.getElementById(
        "product-category"
    ).value = "";


    document.getElementById(
        "product-price"
    ).value = "";


    document.getElementById(
        "product-tag"
    ).value = "";


    document.getElementById(
        "product-description"
    ).value = "";


    document.getElementById(
        "product-image"
    ).value = "";


    document.getElementById(
        "product-active"
    ).checked = true;


    document.getElementById(
        "product-save-message"
    ).textContent = "";


    updateImagePreview();


    showProductForm();

}


// ========================================
// OPEN EDIT PRODUCT
// ========================================

function openEditProduct(productId) {

    // บังคับให้เป็น String
    const targetId =
        String(productId);


    console.log(
        "กำลังค้นหาสินค้า ID:",
        targetId
    );


    // ====================================
    // FIND PRODUCT
    // ====================================

    const product =
        allProducts.find(
            (item) =>
                String(item.id) === targetId
        );


    // ====================================
    // PRODUCT NOT FOUND
    // ====================================

    if (!product) {

        console.error(
            "ไม่พบสินค้า ID:",
            targetId
        );

        console.log(
            "สินค้าที่มีอยู่:",
            allProducts
        );

        alert(
            "ไม่พบข้อมูลสินค้า ID: " +
            targetId
        );

        return;

    }


    // ====================================
    // SET EDITING ID
    // ====================================

    editingProductId =
        targetId;


    // ====================================
    // FORM TITLE
    // ====================================

    document.getElementById(
        "product-form-title"
    ).textContent =
        "EDIT PRODUCT";


    // ====================================
    // PRODUCT ID
    // ====================================

    document.getElementById(
        "product-id"
    ).value =
        targetId;


    // ====================================
    // PRODUCT NAME
    // ====================================

    document.getElementById(
        "product-name"
    ).value =
        product.name || "";


    // ====================================
    // CATEGORY
    // ====================================

    document.getElementById(
        "product-category"
    ).value =
        product.category || "";


    // ====================================
    // PRICE
    // ====================================

    document.getElementById(
        "product-price"
    ).value =
        product.price ?? "";


    // ====================================
    // TAG
    // ====================================

    document.getElementById(
        "product-tag"
    ).value =
        product.tag || "";


    // ====================================
    // DESCRIPTION
    // ====================================

    document.getElementById(
        "product-description"
    ).value =
        product.description || "";


    // ====================================
    // IMAGE
    // ====================================

    document.getElementById(
        "product-image"
    ).value =
        product.image || "";


    // ====================================
    // ACTIVE
    // ====================================

    document.getElementById(
        "product-active"
    ).checked =
        product.active !== false;


    // ====================================
    // CLEAR MESSAGE
    // ====================================

    document.getElementById(
        "product-save-message"
    ).textContent = "";


    // ====================================
    // IMAGE PREVIEW
    // ====================================

    updateImagePreview();


    // ====================================
    // SHOW FORM
    // ====================================

    showProductForm();

}


// ========================================
// SHOW PRODUCT FORM
// ========================================

function showProductForm() {

    const formSection =
        document.getElementById(
            "product-form-section"
        );


    if (!formSection) {
        return;
    }


    formSection.style.display =
        "block";


    formSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ========================================
// CLOSE PRODUCT FORM
// ========================================

function closeProductForm() {

    const formSection =
        document.getElementById(
            "product-form-section"
        );


    if (formSection) {

        formSection.style.display =
            "none";

    }


    editingProductId = null;


    const saveMessage =
        document.getElementById(
            "product-save-message"
        );


    if (saveMessage) {

        saveMessage.textContent = "";

        saveMessage.classList.remove(
            "success"
        );

    }

}


// ========================================
// SAVE PRODUCT
// ========================================

async function saveProduct(event) {

    event.preventDefault();


    const saveButton =
        document.getElementById(
            "save-product-button"
        );


    const saveMessage =
        document.getElementById(
            "product-save-message"
        );


    // ====================================
    // GET FORM DATA
    // ====================================

    const name =
        document.getElementById(
            "product-name"
        ).value.trim();


    const category =
        document.getElementById(
            "product-category"
        ).value;


    const priceInput =
        document.getElementById(
            "product-price"
        ).value;


    const price =
        Number(priceInput);


    const tag =
        document.getElementById(
            "product-tag"
        ).value;


    const description =
        document.getElementById(
            "product-description"
        ).value.trim();


    const image =
        document.getElementById(
            "product-image"
        ).value.trim();


    const active =
        document.getElementById(
            "product-active"
        ).checked;


    // ====================================
    // VALIDATION
    // ====================================

    if (!name) {

        alert(
            "กรุณากรอกชื่อสินค้า"
        );

        return;

    }


    if (!category) {

        alert(
            "กรุณาเลือกหมวดหมู่"
        );

        return;

    }


    if (
        priceInput === "" ||
        Number.isNaN(price) ||
        price < 0
    ) {

        alert(
            "กรุณากรอกราคาสินค้าให้ถูกต้อง"
        );

        return;

    }


    // ====================================
    // DISABLE BUTTON
    // ====================================

    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "SAVING...";

    }


    if (saveMessage) {

        saveMessage.textContent =
            "";

        saveMessage.classList.remove(
            "success"
        );

    }


    try {

        // ==================================
        // PRODUCT DATA
        // ==================================

        const productData = {

            name: name,

            category: category,

            price: price,

            tag: tag,

            description: description,

            image: image,

            active: active

        };


        // ==================================
        // EDIT EXISTING PRODUCT
        // ==================================

        if (editingProductId !== null) {

            const productId =
                String(
                    editingProductId
                );


            console.log(
                "กำลังแก้ไขสินค้า:",
                productId
            );


            const productRef =
                doc(
                    db,
                    "products",
                    productId
                );


            await updateDoc(
                productRef,
                productData
            );


            if (saveMessage) {

                saveMessage.textContent =
                    "แก้ไขสินค้าเรียบร้อยแล้ว";

                saveMessage.classList.add(
                    "success"
                );

            }

        }


        // ==================================
        // ADD NEW PRODUCT
        // ==================================

        else {

            const newProductId =
                generateProductId();


            console.log(
                "กำลังเพิ่มสินค้า ID:",
                newProductId
            );


            const productRef =
                doc(
                    db,
                    "products",
                    newProductId
                );


            await setDoc(
                productRef,
                {
                    ...productData,

                    // เก็บ ID ไว้ในข้อมูลด้วย
                    id:
                        Number(newProductId)
                        || newProductId
                }
            );


            if (saveMessage) {

                saveMessage.textContent =
                    "เพิ่มสินค้าเรียบร้อยแล้ว";

                saveMessage.classList.add(
                    "success"
                );

            }

        }


        // ==================================
        // RELOAD PRODUCTS
        // ==================================

        await loadProducts();


        // ==================================
        // CLOSE FORM
        // ==================================

        setTimeout(() => {

            closeProductForm();

        }, 700);


    } catch (error) {

        console.error(
            "Error saving product:",
            error
        );


        if (saveMessage) {

            saveMessage.textContent =
                "ไม่สามารถบันทึกสินค้าได้";

            saveMessage.classList.remove(
                "success"
            );

        }


        alert(
            "ไม่สามารถบันทึกสินค้าได้\n\n" +
            "กรุณาตรวจสอบ Firestore Rules"
        );

    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "SAVE PRODUCT";

        }

    }

}


// ========================================
// GENERATE PRODUCT ID
// ========================================

function generateProductId() {

    // ถ้ายังไม่มีสินค้า
    if (allProducts.length === 0) {

        return "1";

    }


    // ====================================
    // GET NUMERIC IDS
    // ====================================

    const numericIds =
        allProducts
            .map(
                (product) =>
                    Number(
                        product.id
                    )
            )
            .filter(
                (id) =>
                    !Number.isNaN(id)
            );


    // ====================================
    // NO NUMERIC ID
    // ====================================

    if (numericIds.length === 0) {

        return String(
            Date.now()
        );

    }


    // ====================================
    // FIND MAX ID
    // ====================================

    const maxId =
        Math.max(
            ...numericIds
        );


    return String(
        maxId + 1
    );

}


// ========================================
// ENABLE / DISABLE PRODUCT
// ========================================

async function toggleProduct(productId) {

    const targetId =
        String(productId);


    // ====================================
    // FIND PRODUCT
    // ====================================

    const product =
        allProducts.find(
            (item) =>
                String(item.id) === targetId
        );


    if (!product) {

        alert(
            "ไม่พบข้อมูลสินค้า ID: " +
            targetId
        );

        return;

    }


    // ====================================
    // CURRENT STATUS
    // ====================================

    const isCurrentlyActive =
        product.active !== false;


    const newStatus =
        !isCurrentlyActive;


    const actionText =
        newStatus
        ? "เปิดการขาย"
        : "ปิดการขาย";


    // ====================================
    // CONFIRM
    // ====================================

    const confirmed =
        confirm(
            `ต้องการ${actionText} "${product.name}" หรือไม่?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const productRef =
            doc(
                db,
                "products",
                targetId
            );


        await updateDoc(
            productRef,
            {
                active: newStatus
            }
        );


        await loadProducts();


    } catch (error) {

        console.error(
            "Error updating product status:",
            error
        );


        alert(
            "ไม่สามารถเปลี่ยนสถานะสินค้าได้\n\n" +
            "กรุณาตรวจสอบ Firestore Rules"
        );

    }

}


// ========================================
// IMAGE PREVIEW
// ========================================

function updateImagePreview() {

    const imageInput =
        document.getElementById(
            "product-image"
        );


    const preview =
        document.getElementById(
            "product-image-preview"
        );


    if (!imageInput || !preview) {
        return;
    }


    const imagePath =
        imageInput.value.trim();


    // ====================================
    // NO IMAGE
    // ====================================

    if (!imagePath) {

        preview.innerHTML = "";

        return;

    }


    // ====================================
    // SHOW PREVIEW
    // ====================================

    preview.innerHTML = `
        <img
            src="${imagePath}"
            alt="Product Preview"
            onerror="this.parentElement.innerHTML='<p>ไม่พบรูปภาพจาก Path นี้</p>'"
        >
    `;

}


// ========================================
// DOM READY
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        // ==================================
        // ADD PRODUCT
        // ==================================

        const addProductButton =
            document.getElementById(
                "add-product-button"
            );


        if (addProductButton) {

            addProductButton.addEventListener(
                "click",
                openAddProduct
            );

        }


        // ==================================
        // CLOSE FORM
        // ==================================

        const closeProductButton =
            document.getElementById(
                "close-product-form"
            );


        if (closeProductButton) {

            closeProductButton.addEventListener(
                "click",
                closeProductForm
            );

        }


        // ==================================
        // PRODUCT FORM
        // ==================================

        const productForm =
            document.getElementById(
                "product-form"
            );


        if (productForm) {

            productForm.addEventListener(
                "submit",
                saveProduct
            );

        }


        // ==================================
        // IMAGE INPUT
        // ==================================

        const imageInput =
            document.getElementById(
                "product-image"
            );


        if (imageInput) {

            imageInput.addEventListener(
                "input",
                updateImagePreview
            );

        }


        // ==================================
        // LOGOUT
        // ==================================

        const logoutButton =
            document.getElementById(
                "admin-logout"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async () => {

                    try {

                        await signOut(auth);

                        window.location.href =
                            "admin-login.html";

                    } catch (error) {

                        console.error(
                            "Logout error:",
                            error
                        );

                        alert(
                            "ไม่สามารถออกจากระบบได้"
                        );

                    }

                }
            );

        }

    }
);
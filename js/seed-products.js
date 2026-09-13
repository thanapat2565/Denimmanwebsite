// ==========================================
// DENIMMAN - PRODUCT DATA
// FIRESTORE VERSION
// ==========================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ==========================================
// PRODUCT DATA
// ==========================================

let products = [];


// ==========================================
// REVIEW DATA
// ==========================================

let selectedRating = 0;


// ==========================================
// LOAD PRODUCTS FROM FIRESTORE
// ==========================================

async function loadProducts() {

    try {

        const productsSnapshot =
            await getDocs(
                collection(db, "products")
            );


        products = [];


        productsSnapshot.forEach((productDoc) => {

            const data = productDoc.data();


            products.push({

                // ใช้ Document ID ของ Firestore
                id: String(productDoc.id),

                // ข้อมูลสินค้าจาก Firestore
                ...data

            });

        });


        // ====================================
        // แสดงเฉพาะสินค้าที่ ACTIVE
        // ====================================

        products = products.filter(
            product => product.active !== false
        );


        // ====================================
        // SORT PRODUCT ID
        // ====================================

        products.sort((a, b) => {

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


        console.log(
            "Products loaded from Firestore:",
            products
        );


        return products;


    } catch (error) {

        console.error(
            "ไม่สามารถโหลดสินค้าได้:",
            error
        );


        return [];

    }

}


// ==========================================
// GET PRODUCT BY ID
// ==========================================

function getProductById(id) {

    return products.find(
        product =>
            String(product.id) === String(id)
    );

}


// ==========================================
// FORMAT PRICE
// ==========================================

function formatPrice(price) {

    return new Intl.NumberFormat(
        "th-TH"
    ).format(price);

}


// ==========================================
// CREATE STAR DISPLAY
// ==========================================

function createStars(rating) {

    const roundedRating =
        Math.round(Number(rating) || 0);


    let stars = "";


    for (let i = 1; i <= 5; i++) {

        if (i <= roundedRating) {

            stars += "★";

        } else {

            stars += "☆";

        }

    }


    return stars;

}


// ==========================================
// LOAD REVIEWS
// ==========================================

async function loadReviews(productId) {

    const reviewList =
        document.getElementById(
            "review-list"
        );


    const averageRating =
        document.getElementById(
            "average-rating"
        );


    const averageStars =
        document.getElementById(
            "average-stars"
        );


    const reviewCount =
        document.getElementById(
            "review-count"
        );


    if (!reviewList) {

        return;

    }


    reviewList.innerHTML = `
        <p class="review-placeholder">
            LOADING REVIEWS...
        </p>
    `;


    try {

        const reviewsQuery = query(

            collection(db, "reviews"),

            where(
                "productId",
                "==",
                String(productId)
            ),

            orderBy(
                "createdAt",
                "desc"
            )

        );


        const reviewsSnapshot =
            await getDocs(
                reviewsQuery
            );


        const reviews = [];


        reviewsSnapshot.forEach(
            (reviewDoc) => {

                reviews.push({

                    id: reviewDoc.id,

                    ...reviewDoc.data()

                });

            }
        );


        // ====================================
        // ไม่มีรีวิว
        // ====================================

        if (reviews.length === 0) {

            if (averageRating) {

                averageRating.textContent =
                    "0.0";

            }


            if (averageStars) {

                averageStars.textContent =
                    "☆☆☆☆☆";

            }


            if (reviewCount) {

                reviewCount.textContent =
                    "0 reviews";

            }


            reviewList.innerHTML = `
                <div class="review-empty">

                    <h3>
                        NO REVIEWS YET
                    </h3>

                    <p>
                        Be the first customer
                        to review this product.
                    </p>

                </div>
            `;


            return;

        }


        // ====================================
        // คำนวณคะแนนเฉลี่ย
        // ====================================

        let totalRating = 0;


        reviews.forEach(
            review => {

                totalRating +=
                    Number(review.rating) || 0;

            }
        );


        const average =
            totalRating / reviews.length;


        if (averageRating) {

            averageRating.textContent =
                average.toFixed(1);

        }


        if (averageStars) {

            averageStars.textContent =
                createStars(average);

        }


        if (reviewCount) {

            reviewCount.textContent =
                `${reviews.length} reviews`;

        }


        // ====================================
        // แสดงรีวิว
        // ====================================

        let html = "";


        reviews.forEach(
            review => {

                const name =
                    review.customerName ||
                    "Anonymous";


                const rating =
                    Number(review.rating) || 0;


                const text =
                    review.review || "";


                let dateText = "";


                if (
                    review.createdAt &&
                    typeof review.createdAt.toDate ===
                    "function"
                ) {

                    const date =
                        review.createdAt.toDate();


                    dateText =
                        date.toLocaleDateString(
                            "th-TH"
                        );

                }


                html += `

                    <div class="review-item">

                        <div class="review-item-header">

                            <div>

                                <strong>
                                    ${escapeHTML(name)}
                                </strong>

                                <div class="review-stars">
                                    ${createStars(rating)}
                                </div>

                            </div>


                            ${
                                dateText
                                ? `
                                    <span class="review-date">
                                        ${dateText}
                                    </span>
                                `
                                : ""
                            }

                        </div>


                        <p class="review-text">
                            ${escapeHTML(text)}
                        </p>

                    </div>

                `;

            }
        );


        reviewList.innerHTML =
            html;


    } catch (error) {

        console.error(
            "ไม่สามารถโหลดรีวิวได้:",
            error
        );


        /*
         * Firestore อาจแจ้งให้สร้าง Index
         * ถ้าเกิดกรณีนี้ สามารถกดลิงก์ที่ Firebase
         * แสดงใน Console เพื่อสร้าง Index ได้
         */

        reviewList.innerHTML = `
            <div class="review-error">

                <h3>
                    REVIEWS UNAVAILABLE
                </h3>

                <p>
                    ไม่สามารถโหลดรีวิวได้
                    กรุณาลองใหม่อีกครั้ง
                </p>

            </div>
        `;

    }

}


// ==========================================
// ESCAPE HTML
// ป้องกันข้อความรีวิวแทรก HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}


// ==========================================
// SELECT RATING
// ==========================================

function setupRatingButtons() {

    const ratingButtons =
        document.querySelectorAll(
            "#rating-stars button"
        );


    ratingButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectedRating =
                        Number(
                            button.dataset.rating
                        );


                    ratingButtons.forEach(
                        item => {

                            const rating =
                                Number(
                                    item.dataset.rating
                                );


                            if (
                                rating <=
                                selectedRating
                            ) {

                                item.textContent =
                                    "★";

                            } else {

                                item.textContent =
                                    "☆";

                            }

                        }
                    );

                }
            );

        }
    );

}


// ==========================================
// SUBMIT REVIEW
// ==========================================

async function submitReview() {

    const nameInput =
        document.getElementById(
            "review-name"
        );


    const textInput =
        document.getElementById(
            "review-text"
        );


    const button =
        document.getElementById(
            "submit-review"
        );


    const message =
        document.getElementById(
            "review-message"
        );


    if (
        !nameInput ||
        !textInput ||
        !button
    ) {

        return;

    }


    const name =
        nameInput.value.trim();


    const reviewText =
        textInput.value.trim();


    // ====================================
    // ตรวจสอบชื่อ
    // ====================================

    if (!name) {

        alert(
            "กรุณากรอกชื่อ"
        );

        nameInput.focus();

        return;

    }


    // ====================================
    // ตรวจสอบคะแนน
    // ====================================

    if (
        selectedRating < 1 ||
        selectedRating > 5
    ) {

        alert(
            "กรุณาเลือกคะแนนดาว"
        );

        return;

    }


    // ====================================
    // ตรวจสอบข้อความ
    // ====================================

    if (!reviewText) {

        alert(
            "กรุณาเขียนรีวิว"
        );

        textInput.focus();

        return;

    }


    // ====================================
    // ตรวจสอบว่ามี Product ID
    // ====================================

    if (
        !window.currentProduct ||
        !window.currentProduct.id
    ) {

        alert(
            "ไม่พบข้อมูลสินค้า"
        );

        return;

    }


    button.disabled =
        true;


    button.textContent =
        "SUBMITTING...";


    if (message) {

        message.textContent =
            "";

    }


    try {

        // ==================================
        // บันทึกลง Firestore
        // ==================================

        await addDoc(
            collection(
                db,
                "reviews"
            ),
            {

                productId:
                    String(
                        window.currentProduct.id
                    ),

                customerName:
                    name,

                rating:
                    selectedRating,

                review:
                    reviewText,

                createdAt:
                    serverTimestamp()

            }
        );


        // ==================================
        // เคลียร์ฟอร์ม
        // ==================================

        nameInput.value =
            "";

        textInput.value =
            "";


        selectedRating =
            0;


        document
            .querySelectorAll(
                "#rating-stars button"
            )
            .forEach(
                button => {

                    button.textContent =
                        "☆";

                }
            );


        if (message) {

            message.textContent =
                "รีวิวของคุณถูกส่งเรียบร้อยแล้ว";

        }


        // ==================================
        // โหลดรีวิวใหม่
        // ==================================

        await loadReviews(
            window.currentProduct.id
        );


    } catch (error) {

        console.error(
            "ไม่สามารถส่งรีวิวได้:",
            error
        );


        alert(
            "ไม่สามารถส่งรีวิวได้\n\n" +
            error.message
        );


    } finally {

        button.disabled =
            false;


        button.textContent =
            "SUBMIT REVIEW";

    }

}


// ==========================================
// LOAD PRODUCT DETAIL
// ใช้กับ product.html?id=1
// ==========================================

async function loadProductDetail() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("id");


    // ====================================
    // ตรวจสอบว่ามี ID หรือไม่
    // ====================================

    if (!productId) {

        console.error(
            "ไม่พบ Product ID"
        );

        return;

    }


    // ====================================
    // โหลดสินค้าจาก Firestore
    // ====================================

    await loadProducts();


    // ====================================
    // ค้นหาสินค้า
    // ====================================

    const product =
        getProductById(productId);


    if (!product) {

        console.error(
            "ไม่พบสินค้านี้:",
            productId
        );

        return;

    }


    // ====================================
    // ชื่อสินค้า
    // ====================================

    const productName =
        document.getElementById(
            "product-name"
        );


    if (productName) {

        productName.textContent =
            product.name;

    }


    // ====================================
    // ราคา
    // ====================================

    const productPrice =
        document.getElementById(
            "product-price"
        );


    if (productPrice) {

        productPrice.textContent =
            `฿${formatPrice(product.price)}`;

    }


    // ====================================
    // รูปสินค้า
    // ====================================

    const productImage =
        document.getElementById(
            "product-image"
        );


    if (productImage) {

        productImage.src =
            product.image;

        productImage.alt =
            product.name;

    }


    // ====================================
    // หมวดหมู่
    // ====================================

    const productCategory =
        document.getElementById(
            "product-category"
        );


    if (productCategory) {

        productCategory.textContent =
            product.category;

    }


    // ====================================
    // TAG
    // ====================================

    const productTag =
        document.getElementById(
            "product-tag"
        );


    if (productTag) {

        productTag.textContent =
            product.tag || "";

    }


    // ====================================
    // รายละเอียด
    // ====================================

    const productDescription =
        document.getElementById(
            "product-description"
        );


    if (productDescription) {

        productDescription.textContent =
            product.description || "";

    }


    // ====================================
    // BREADCRUMB
    // ====================================

    const breadcrumbName =
        document.getElementById(
            "breadcrumb-name"
        );


    if (breadcrumbName) {

        breadcrumbName.textContent =
            product.name;

    }


    // ====================================
    // เก็บสินค้าไว้ให้ cart.js
    // ====================================

    window.currentProduct =
        product;


    console.log(
        "Current Product:",
        window.currentProduct
    );


    // ====================================
    // โหลดรีวิวของสินค้านี้
    // ====================================

    await loadReviews(
        product.id
    );

}


// ==========================================
// LOAD PRODUCT LIST
// ใช้สำหรับ products.html
// ==========================================

async function loadProductList() {

    const productList =
        document.getElementById(
            "product-list"
        );


    // ถ้าหน้านี้ไม่มี product-list
    // แสดงว่าไม่ใช่หน้า products.html

    if (!productList) {

        return;

    }


    productList.innerHTML = `
        <p class="products-loading">
            LOADING PRODUCTS...
        </p>
    `;


    await loadProducts();


    // ====================================
    // ไม่มีสินค้า
    // ====================================

    if (products.length === 0) {

        productList.innerHTML = `
            <div class="products-empty">

                <h3>
                    NO PRODUCTS
                </h3>

                <p>
                    ยังไม่มีสินค้าที่เปิดขาย
                </p>

            </div>
        `;

        return;

    }


    // ====================================
    // สร้าง Product Cards
    // ====================================

    let html = "";


    products.forEach((product) => {

        const price =
            Number(product.price) || 0;


        html += `

            <a
                href="product.html?id=${encodeURIComponent(product.id)}"
                class="product-card"
            >

                <div class="product-image">

                    <img
                        src="${product.image || ""}"
                        alt="${product.name || ""}"
                    >

                    ${
                        product.tag
                        ? `
                            <span class="product-tag">
                                ${product.tag}
                            </span>
                        `
                        : ""
                    }

                </div>


                <div class="product-card-info">

                    <p class="product-category">
                        ${product.category || ""}
                    </p>


                    <h3>
                        ${product.name || ""}
                    </h3>


                    <strong>
                        ฿${formatPrice(price)}
                    </strong>

                </div>

            </a>

        `;

    });


    productList.innerHTML =
        html;

}


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ==================================
        // Rating buttons
        // ==================================

        setupRatingButtons();


        // ==================================
        // Submit review
        // ==================================

        const submitButton =
            document.getElementById(
                "submit-review"
            );


        if (submitButton) {

            submitButton.addEventListener(
                "click",
                submitReview
            );

        }


        // ==================================
        // หน้า Product Detail
        // ==================================

        if (
            document.getElementById(
                "product-name"
            )
        ) {

            loadProductDetail();

        }


        // ==================================
        // หน้า Products
        // ==================================

        if (
            document.getElementById(
                "product-list"
            )
        ) {

            loadProductList();

        }

    }
);
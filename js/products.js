// ==========================================
// DENIMMAN - PRODUCT DATA
// FIRESTORE VERSION
// ==========================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
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


    // ====================================
    // ตรวจสอบว่าหน้านี้มีระบบรีวิวหรือไม่
    // ====================================

    if (!reviewList) {

        return;

    }


    // ====================================
    // แสดง Loading
    // ====================================

    reviewList.innerHTML = `
        <p class="review-placeholder">
            LOADING REVIEWS...
        </p>
    `;


    try {

        // ==================================
        // ดึงรีวิวของสินค้านี้
        //
        // ไม่ใช้ orderBy()
        // เพื่อไม่ต้องสร้าง Composite Index
        // ==================================

        const reviewsQuery = query(

            collection(db, "reviews"),

            where(
                "productId",
                "==",
                String(productId)
            )

        );


        const reviewsSnapshot =
            await getDocs(
                reviewsQuery
            );


        const reviews = [];


        // ==================================
        // เก็บข้อมูลรีวิว
        // ==================================

        reviewsSnapshot.forEach(
            (reviewDoc) => {

                reviews.push({

                    id: reviewDoc.id,

                    ...reviewDoc.data()

                });

            }
        );


        // ==================================
        // เรียงรีวิว
        // ใหม่สุด → เก่าสุด
        //
        // ใช้ JavaScript แทน orderBy()
        // ==================================

        reviews.sort((a, b) => {

            const timeA =
                a.createdAt &&
                typeof a.createdAt.toMillis === "function"
                    ? a.createdAt.toMillis()
                    : 0;


            const timeB =
                b.createdAt &&
                typeof b.createdAt.toMillis === "function"
                    ? b.createdAt.toMillis()
                    : 0;


            return timeB - timeA;

        });


        // ==================================
        // ไม่มีรีวิว
        // ==================================

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


        // ==================================
        // คำนวณคะแนนรวม
        // ==================================

        let totalRating = 0;


        reviews.forEach(
            review => {

                totalRating +=
                    Number(review.rating) || 0;

            }
        );


        // ==================================
        // คำนวณคะแนนเฉลี่ย
        // ==================================

        const average =
            totalRating / reviews.length;


        // ==================================
        // แสดงคะแนนเฉลี่ย
        // ==================================

        if (averageRating) {

            averageRating.textContent =
                average.toFixed(1);

        }


        // ==================================
        // แสดงดาวเฉลี่ย
        // ==================================

        if (averageStars) {

            averageStars.textContent =
                createStars(average);

        }


        // ==================================
        // แสดงจำนวนรีวิว
        // ==================================

        if (reviewCount) {

            reviewCount.textContent =
                `${reviews.length} reviews`;

        }


        // ==================================
        // สร้าง HTML รีวิว
        // ==================================

        let html = "";


        reviews.forEach(
            review => {

                // ==================================
                // ชื่อลูกค้า
                // ==================================

                const name =
                    review.customerName ||
                    "Anonymous";


                // ==================================
                // คะแนน
                // ==================================

                const rating =
                    Number(review.rating) || 0;


                // ==================================
                // ข้อความรีวิว
                // ==================================

                const text =
                    review.review || "";


                // ==================================
                // วันที่รีวิว
                // ==================================

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


                // ==================================
                // สร้าง Review Item
                // ==================================

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


        // ==================================
        // แสดงรีวิวบนหน้าเว็บ
        // ==================================

        reviewList.innerHTML =
            html;


    } catch (error) {

        // ==================================
        // แสดง Error ใน Console
        // ==================================

        console.error(
            "ไม่สามารถโหลดรีวิวได้:",
            error
        );


        // ==================================
        // แสดง Error บนหน้าเว็บ
        // ==================================

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


                    // ==================================
                    // เปลี่ยนดาวตามคะแนนที่เลือก
                    // ==================================

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


    // ====================================
    // ตรวจสอบ Element
    // ====================================

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
    // ตรวจสอบ Product ID
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


    // ====================================
    // ป้องกันการกดปุ่มซ้ำ
    // ====================================

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
        // บันทึกรีวิวลง Firestore
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


        // ==================================
        // รีเซ็ตคะแนน
        // ==================================

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


        // ==================================
        // แจ้งเตือนว่าส่งสำเร็จ
        // ==================================

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

        // ==================================
        // เปิดปุ่มกลับมา
        // ==================================

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
    // ตรวจสอบ Product ID
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


    // ====================================
    // ถ้าหน้านี้ไม่มี product-list
    // แสดงว่าไม่ใช่หน้า products.html
    // ====================================

    if (!productList) {

        return;

    }


    // ====================================
    // Loading
    // ====================================

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
        // ตั้งค่าปุ่มดาว
        // ==================================

        setupRatingButtons();


        // ==================================
        // ตั้งค่าปุ่มส่งรีวิว
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
// ==========================================
// DENIMMAN - CHECKOUT
// ==========================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ==========================================
// GET CART
// ==========================================

function getCart() {
    return JSON.parse(
        localStorage.getItem("denimmanCart")
    ) || [];
}


// ==========================================
// FORMAT PRICE
// ==========================================

function formatPrice(price) {
    return "฿" + Number(price).toLocaleString("th-TH");
}


// ==========================================
// RENDER CHECKOUT
// ==========================================

function renderCheckout() {

    const cart = getCart();

    const itemsContainer =
        document.getElementById("checkout-items");

    const itemCount =
        document.getElementById("checkout-item-count");

    const subtotalElement =
        document.getElementById("checkout-subtotal");

    const shippingElement =
        document.getElementById("checkout-shipping");

    const totalElement =
        document.getElementById("checkout-total");


    // ======================================
    // ถ้าไม่มีสินค้า
    // ======================================

    if (cart.length === 0) {

        if (itemsContainer) {

            itemsContainer.innerHTML = `
                <div class="checkout-empty">
                    <p>ยังไม่มีสินค้าในตะกร้า</p>

                    <a href="products.html">
                        เลือกซื้อสินค้า
                    </a>
                </div>
            `;

        }


        if (itemCount) {
            itemCount.textContent = "0 ชิ้น";
        }


        if (subtotalElement) {
            subtotalElement.textContent = "฿0";
        }


        if (shippingElement) {
            shippingElement.textContent = "฿0";
        }


        if (totalElement) {
            totalElement.textContent = "฿0";
        }


        return;
    }


    // ======================================
    // RENDER ITEMS
    // ======================================

    let subtotal = 0;
    let totalQuantity = 0;


    if (itemsContainer) {

        itemsContainer.innerHTML = "";


        cart.forEach(item => {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 0;

            const itemTotal =
                price * quantity;


            subtotal += itemTotal;
            totalQuantity += quantity;


            const itemElement =
                document.createElement("div");

            itemElement.className =
                "checkout-item";


            itemElement.innerHTML = `

                <div class="checkout-item-info">

                    <strong>
                        ${item.name}
                    </strong>

                    <span>
                        Size: ${item.size}
                    </span>

                    <span>
                        จำนวน: ${quantity}
                    </span>

                </div>


                <div class="checkout-item-price">
                    ${formatPrice(itemTotal)}
                </div>

            `;


            itemsContainer.appendChild(
                itemElement
            );

        });


    } else {

        cart.forEach(item => {

            subtotal +=
                Number(item.price) *
                Number(item.quantity);

            totalQuantity +=
                Number(item.quantity);

        });

    }


    // ======================================
    // SHIPPING
    // ======================================

    const shipping =
        subtotal >= 1500
            ? 0
            : 50;


    const total =
        subtotal + shipping;


    // ======================================
    // DISPLAY SUMMARY
    // ======================================

    if (itemCount) {

        itemCount.textContent =
            `${totalQuantity} ชิ้น`;

    }


    if (subtotalElement) {

        subtotalElement.textContent =
            formatPrice(subtotal);

    }


    if (shippingElement) {

        shippingElement.textContent =
            shipping === 0
                ? "ฟรี"
                : formatPrice(shipping);

    }


    if (totalElement) {

        totalElement.textContent =
            formatPrice(total);

    }

}


// ==========================================
// CREATE ORDER ID
// ==========================================

function createOrderId() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

    const random =
        Math.floor(
            1000 + Math.random() * 9000
        );


    return `DM${year}${month}${day}${random}`;

}


// ==========================================
// VALIDATE FORM
// ==========================================

function validateForm() {

    const name =
        document.getElementById("customer-name")
            ?.value.trim();

    const phone =
        document.getElementById("customer-phone")
            ?.value.trim();

    const email =
        document.getElementById("customer-email")
            ?.value.trim();

    const address =
        document.getElementById("customer-address")
            ?.value.trim();

    const province =
        document.getElementById("customer-province")
            ?.value.trim();

    const postcode =
        document.getElementById("customer-postcode")
            ?.value.trim();


    if (!name) {

        alert(
            "กรุณากรอกชื่อ - นามสกุล"
        );

        return null;

    }


    if (!phone) {

        alert(
            "กรุณากรอกเบอร์โทรศัพท์"
        );

        return null;

    }


    if (!address) {

        alert(
            "กรุณากรอกที่อยู่จัดส่ง"
        );

        return null;

    }


    if (!province) {

        alert(
            "กรุณากรอกจังหวัด"
        );

        return null;

    }


    if (!postcode) {

        alert(
            "กรุณากรอกรหัสไปรษณีย์"
        );

        return null;

    }


    return {

        name,
        phone,
        email,
        address,
        province,
        postcode

    };

}


// ==========================================
// SAVE ORDER TO FIREBASE
// ==========================================

async function saveOrderToFirebase(order) {

    try {

        const ordersCollection =
            collection(db, "orders");


        const docRef =
            await addDoc(
                ordersCollection,
                order
            );


        console.log(
            "Order saved successfully:",
            docRef.id
        );


        return docRef.id;

    }

    catch (error) {

        console.error(
            "Error saving order:",
            error
        );

        throw error;

    }

}


// ==========================================
// SAVE ORDER STATUS TO FIREBASE
// ==========================================

async function saveOrderStatusToFirebase(
    orderId,
    customerName,
    paymentStatus,
    items
) {

    try {

        // ใช้ Order ID เป็นชื่อ Document
        const orderStatusRef =
            doc(
                db,
                "orderStatus",
                orderId
            );


        await setDoc(
            orderStatusRef,
            {

                orderId,
                customerName,
                status:
                    "รอดำเนินการ",

                paymentStatus,

                shippingCompany:
                    "",

                trackingNumber:
                    "",
                items

            }
        );


        console.log(
            "Order status saved successfully:",
            orderId
        );

    }

    catch (error) {

        console.error(
            "Error saving order status:",
            error
        );

        throw error;

    }

}


// ==========================================
// CONFIRM ORDER
// ==========================================

async function confirmOrder() {

    const cart = getCart();


    // ======================================
    // CHECK CART
    // ======================================

    if (cart.length === 0) {

        alert(
            "ยังไม่มีสินค้าในตะกร้า"
        );

        return;

    }


    // ======================================
    // CHECK CUSTOMER
    // ======================================

    const customer =
        validateForm();


    if (!customer) {
        return;
    }


    // ======================================
    // GET PAYMENT METHOD
    // ======================================

    const paymentElement =
        document.querySelector(
            'input[type="radio"][name="payment-method"]:checked'
        );


    if (!paymentElement) {

        alert(
            "กรุณาเลือกวิธีชำระเงิน"
        );

        return;

    }


    const paymentMethod =
        paymentElement.value;


    console.log(
        "Payment method:",
        paymentMethod
    );


    // ======================================
    // CALCULATE TOTAL
    // ======================================

    let subtotal = 0;


    cart.forEach(item => {

        subtotal +=
            Number(item.price) *
            Number(item.quantity);

    });


    const shipping =
        subtotal >= 1500
            ? 0
            : 50;


    const total =
        subtotal + shipping;


    // ======================================
    // CREATE ORDER ID
    // ======================================

    const orderId =
        createOrderId();


    // ======================================
    // PAYMENT STATUS
    // ======================================

    const paymentStatus =
        paymentMethod === "COD"
            ? "ชำระเมื่อได้รับสินค้า"
            : "รอชำระเงิน";


    // ======================================
    // CREATE ORDER
    // ======================================

    const order = {

        orderId,

        customer: {

            name:
                customer.name,

            phone:
                customer.phone,

            email:
                customer.email,

            address:
                customer.address,

            province:
                customer.province,

            postcode:
                customer.postcode

        },

        items:
            cart,

        subtotal,

        shipping,

        total,

        paymentMethod,

        orderStatus:
            "รอดำเนินการ",

        paymentStatus,

        createdAt:
            new Date().toISOString()

    };


    // ======================================
    // DISABLE BUTTON
    // ======================================

    const button =
        document.getElementById(
            "confirm-order"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "กำลังบันทึกคำสั่งซื้อ...";

    }


    // ======================================
    // SAVE
    // ======================================

    try {

        // ----------------------------------
        // 1. Save ข้อมูลคำสั่งซื้อ
        // ----------------------------------

        const firebaseDocumentId =
            await saveOrderToFirebase(
                order
            );


        // ----------------------------------
        // 2. Save ข้อมูลสำหรับ Order Status
        // ----------------------------------

        await saveOrderStatusToFirebase(
            orderId,
            customer.name,
            paymentStatus,
            cart
        );


        // ----------------------------------
        // 3. Save Current Order
        // ----------------------------------

        localStorage.setItem(

            "denimmanCurrentOrder",

            JSON.stringify({

                ...order,

                firebaseDocumentId

            })

        );


        // ----------------------------------
        // 4. Clear Cart
        // ----------------------------------

        localStorage.removeItem(
            "denimmanCart"
        );


        // ----------------------------------
        // 5. Go To Payment Page
        // ----------------------------------

        window.location.href =
            "payment.html";

    }


    catch (error) {

        console.error(
            "Order process error:",
            error
        );


        alert(
            "ไม่สามารถบันทึกคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง"
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                "CONFIRM ORDER";

        }

    }

}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderCheckout();


        const confirmButton =
            document.getElementById(
                "confirm-order"
            );


        if (confirmButton) {

            confirmButton.addEventListener(
                "click",
                confirmOrder
            );

        }

    }
);
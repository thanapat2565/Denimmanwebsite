import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// ========================================
// VARIABLES
// ========================================

let allOrders = [];
let currentOrder = null;


// ========================================
// AUTH CHECK
// ========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "admin-login.html";

        return;
    }

    loadOrders();

});


// ========================================
// LOAD ORDERS
// ========================================

async function loadOrders() {

    const ordersList =
        document.getElementById("admin-orders-list");

    ordersList.innerHTML = `
        <p class="admin-loading">
            Loading orders...
        </p>
    `;

    try {

        const ordersSnapshot =
            await getDocs(
                collection(db, "orders")
            );

        allOrders = [];

        ordersSnapshot.forEach((orderDoc) => {

            allOrders.push({
                id: orderDoc.id,
                ...orderDoc.data()
            });

        });


        // Sort newest first

        allOrders.sort((a, b) => {

            const dateA =
                new Date(a.createdAt || 0);

            const dateB =
                new Date(b.createdAt || 0);

            return dateB - dateA;

        });


        renderOrders(allOrders);

    } catch (error) {

        console.error(
            "Error loading orders:",
            error
        );

        ordersList.innerHTML = `
            <p class="admin-loading">
                ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้
            </p>
        `;

    }

}


// ========================================
// RENDER ORDERS
// ========================================

function renderOrders(orders) {

    const container =
        document.getElementById(
            "admin-orders-list"
        );

    const orderCount =
        document.getElementById(
            "order-count"
        );


    orderCount.textContent =
        orders.length;


    if (orders.length === 0) {

        container.innerHTML = `
            <p class="admin-loading">
                ไม่พบคำสั่งซื้อ
            </p>
        `;

        return;
    }


    let html = "";


    orders.forEach((order) => {

        const orderId =
            order.orderId || order.id;

        const customerName =
            order.customer?.name || "-";

        const total =
            Number(order.total) || 0;

        const paymentMethod =
            order.paymentMethod || "-";

        const status =
            order.orderStatus ||
            "รอดำเนินการ";


        html += `

            <div class="admin-order-table-row">

                <div
                    class="admin-table-order-id"
                    data-label="ORDER ID"
                >
                    ${orderId}
                </div>


                <div
                    class="admin-table-customer"
                    data-label="CUSTOMER"
                >
                    ${customerName}
                </div>


                <div
                    class="admin-table-total"
                    data-label="TOTAL"
                >
                    ฿${total.toLocaleString("th-TH")}
                </div>


                <div
                    class="admin-table-payment"
                    data-label="PAYMENT"
                >
                    ${paymentMethod}
                </div>


                <div
                    class="admin-table-status"
                    data-label="STATUS"
                >
                    <span class="admin-status-badge">
                        ${status}
                    </span>
                </div>


                <div
                    class="admin-table-action"
                    data-label="ACTION"
                >
                    <button
                        class="admin-view-button"
                        data-order-id="${order.id}"
                    >
                        VIEW
                    </button>
                </div>

            </div>

        `;

    });


    container.innerHTML =
        html;


    // Add View button events

    const viewButtons =
        container.querySelectorAll(
            ".admin-view-button"
        );


    viewButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const orderId =
                    button.dataset.orderId;

                openOrderDetail(orderId);

            }
        );

    });

}


// ========================================
// SEARCH + FILTER
// ========================================

function filterOrders() {

    const searchInput =
        document.getElementById(
            "order-search"
        );

    const statusFilter =
        document.getElementById(
            "order-status-filter"
        );


    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    const filteredOrders =
        allOrders.filter((order) => {

            const orderId =
                (
                    order.orderId ||
                    order.id ||
                    ""
                ).toLowerCase();


            const customerName =
                (
                    order.customer?.name ||
                    ""
                ).toLowerCase();


            const matchesSearch =
                orderId.includes(search) ||
                customerName.includes(search);


            const orderStatus =
                order.orderStatus ||
                "รอดำเนินการ";


            const matchesStatus =
                selectedStatus === "ALL" ||
                orderStatus === selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    renderOrders(filteredOrders);

}


// ========================================
// OPEN ORDER DETAIL
// ========================================

function openOrderDetail(orderDocumentId) {

    const order =
        allOrders.find(
            (item) =>
                item.id === orderDocumentId
        );


    if (!order) {

        alert(
            "ไม่พบข้อมูลคำสั่งซื้อ"
        );

        return;
    }


    currentOrder =
        order;


    const orderId =
        order.orderId ||
        order.id;


    // ====================================
    // BASIC INFORMATION
    // ====================================

    document.getElementById(
        "detail-order-id"
    ).textContent =
        `ORDER #${orderId}`;


    document.getElementById(
        "detail-customer-name"
    ).textContent =
        order.customer?.name || "-";


    document.getElementById(
        "detail-customer-phone"
    ).textContent =
        order.customer?.phone || "-";


    document.getElementById(
        "detail-customer-email"
    ).textContent =
        order.customer?.email || "-";


    // Address

    const addressParts = [

        order.customer?.address,
        order.customer?.province,
        order.customer?.postcode

    ].filter(Boolean);


    document.getElementById(
        "detail-customer-address"
    ).textContent =

        addressParts.length > 0
            ? addressParts.join(" ")
            : "-";


    // ====================================
    // PAYMENT
    // ====================================

    document.getElementById(
        "detail-payment-method"
    ).textContent =
        order.paymentMethod || "-";


    document.getElementById(
        "detail-payment-status"
    ).textContent =
        order.paymentStatus || "รอชำระเงิน";


    document.getElementById(
        "detail-subtotal"
    ).textContent =
        formatCurrency(
            order.subtotal
        );


    document.getElementById(
        "detail-shipping"
    ).textContent =
        formatCurrency(
            order.shipping
        );


    document.getElementById(
        "detail-total"
    ).textContent =
        formatCurrency(
            order.total
        );


    // ====================================
    // PAYMENT STATUS SELECT
    // ====================================

    const paymentStatusSelect =
        document.getElementById(
            "detail-payment-status-select"
        );


    if (paymentStatusSelect) {

        paymentStatusSelect.value =
            order.paymentStatus ||
            (
                order.paymentMethod === "COD"
                    ? "ชำระเงินปลายทาง"
                    : "รอชำระเงิน"
            );

    }


    // ====================================
    // ORDER STATUS
    // ====================================

    document.getElementById(
        "detail-order-status"
    ).value =
        order.orderStatus ||
        "รอดำเนินการ";


    document.getElementById(
        "detail-shipping-company"
    ).value =
        order.shippingCompany ||
        "";


    document.getElementById(
        "detail-tracking-number"
    ).value =
        order.trackingNumber ||
        "";


    // ====================================
    // PRODUCTS
    // ====================================

    renderOrderItems(
        order.items
    );


    // ====================================
    // SHOW DETAIL
    // ====================================

    const detailSection =
        document.getElementById(
            "order-detail-section"
        );


    detailSection.style.display =
        "block";


    detailSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ========================================
// RENDER ORDER ITEMS
// ========================================

function renderOrderItems(items) {

    const container =
        document.getElementById(
            "detail-order-items"
        );


    if (!items || items.length === 0) {

        container.innerHTML = `
            <p>
                ไม่พบรายการสินค้า
            </p>
        `;

        return;
    }


    let html = "";


    items.forEach((item) => {

        const name =
            item.name || "-";

        const size =
            item.size || "-";

        const quantity =
            Number(item.quantity) || 0;

        const price =
            Number(item.price) || 0;

        const itemTotal =
            price * quantity;


        html += `

            <div class="admin-detail-product">

                <div>

                    <strong>
                        ${name}
                    </strong>

                    <span>
                        Size: ${size}
                    </span>

                    <span>
                        Quantity: ${quantity}
                    </span>

                </div>


                <strong>
                    ฿${itemTotal.toLocaleString("th-TH")}
                </strong>

            </div>

        `;

    });


    container.innerHTML =
        html;

}


// ========================================
// SAVE ORDER STATUS
// ========================================

async function saveOrderStatus() {

    if (!currentOrder) {

        alert(
            "ไม่พบคำสั่งซื้อ"
        );

        return;
    }


    // ====================================
    // GET PAYMENT STATUS
    // ====================================

    const paymentStatusSelect =
        document.getElementById(
            "detail-payment-status-select"
        );


    const paymentStatus =
        paymentStatusSelect
            ? paymentStatusSelect.value
            : (
                currentOrder.paymentStatus ||
                "รอชำระเงิน"
            );


    // ====================================
    // GET ORDER STATUS
    // ====================================

    const status =
        document.getElementById(
            "detail-order-status"
        ).value;


    // ====================================
    // GET SHIPPING
    // ====================================

    const shippingCompany =
        document.getElementById(
            "detail-shipping-company"
        ).value.trim();


    const trackingNumber =
        document.getElementById(
            "detail-tracking-number"
        ).value.trim();


    const saveButton =
        document.getElementById(
            "save-order-status"
        );


    const saveMessage =
        document.getElementById(
            "order-save-message"
        );


    saveButton.disabled =
        true;

    saveButton.textContent =
        "SAVING...";


    saveMessage.textContent =
        "";

    saveMessage.classList.remove(
        "success"
    );


    try {

        // ==================================
        // UPDATE ORDERS
        // ==================================

        const orderRef =
            doc(
                db,
                "orders",
                currentOrder.id
            );


        await updateDoc(
            orderRef,
            {

                paymentStatus:
                    paymentStatus,

                orderStatus:
                    status,

                shippingCompany:
                    shippingCompany,

                trackingNumber:
                    trackingNumber

            }
        );


        // ==================================
        // UPDATE ORDER STATUS
        // ==================================

        const orderStatusRef =
            doc(
                db,
                "orderStatus",
                currentOrder.orderId ||
                currentOrder.id
            );


        await setDoc(
            orderStatusRef,
            {

                orderId:
                    currentOrder.orderId ||
                    currentOrder.id,

                customerName:
                    currentOrder.customer?.name ||
                    "-",

                status:
                    status,

                paymentStatus:
                    paymentStatus,

                shippingCompany:
                    shippingCompany,

                trackingNumber:
                    trackingNumber,

                items:
                    currentOrder.items ||
                    []

            },
            {
                merge: true
            }
        );


        // ==================================
        // UPDATE LOCAL DATA
        // ==================================

        currentOrder.paymentStatus =
            paymentStatus;


        currentOrder.orderStatus =
            status;


        currentOrder.shippingCompany =
            shippingCompany;


        currentOrder.trackingNumber =
            trackingNumber;


        const index =
            allOrders.findIndex(
                (order) =>
                    order.id ===
                    currentOrder.id
            );


        if (index !== -1) {

            allOrders[index] =
                currentOrder;

        }


        // ==================================
        // UPDATE DETAIL DISPLAY
        // ==================================

        document.getElementById(
            "detail-payment-status"
        ).textContent =
            paymentStatus;


        // ==================================
        // SUCCESS
        // ==================================

        saveMessage.textContent =
            "บันทึกข้อมูลเรียบร้อยแล้ว";


        saveMessage.classList.add(
            "success"
        );


        renderOrders(
            getFilteredOrders()
        );


    } catch (error) {

        console.error(
            "Error saving order:",
            error
        );


        saveMessage.textContent =
            "ไม่สามารถบันทึกข้อมูลได้";


        saveMessage.classList.remove(
            "success"
        );


        alert(
            "ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบ Firestore Rules"
        );

    } finally {

        saveButton.disabled =
            false;

        saveButton.textContent =
            "SAVE ORDER";

    }

}


// ========================================
// GET CURRENT FILTERED ORDERS
// ========================================

function getFilteredOrders() {

    const searchInput =
        document.getElementById(
            "order-search"
        );


    const statusFilter =
        document.getElementById(
            "order-status-filter"
        );


    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    return allOrders.filter((order) => {

        const orderId =
            (
                order.orderId ||
                order.id ||
                ""
            ).toLowerCase();


        const customerName =
            (
                order.customer?.name ||
                ""
            ).toLowerCase();


        const matchesSearch =
            orderId.includes(search) ||
            customerName.includes(search);


        const status =
            order.orderStatus ||
            "รอดำเนินการ";


        const matchesStatus =
            selectedStatus === "ALL" ||
            status === selectedStatus;


        return (
            matchesSearch &&
            matchesStatus
        );

    });

}


// ========================================
// CLOSE DETAIL
// ========================================

function closeOrderDetail() {

    const detailSection =
        document.getElementById(
            "order-detail-section"
        );


    detailSection.style.display =
        "none";


    currentOrder =
        null;


    document.getElementById(
        "order-save-message"
    ).textContent =
        "";

}


// ========================================
// FORMAT CURRENCY
// ========================================

function formatCurrency(value) {

    const number =
        Number(value) || 0;


    return (
        "฿" +
        number.toLocaleString("th-TH")
    );

}


// ========================================
// REFRESH BUTTON
// ========================================

document
    .getElementById("refresh-orders")
    .addEventListener(
        "click",
        () => {

            loadOrders();

        }
    );


// ========================================
// SEARCH
// ========================================

document
    .getElementById("order-search")
    .addEventListener(
        "input",
        filterOrders
    );


// ========================================
// STATUS FILTER
// ========================================

document
    .getElementById("order-status-filter")
    .addEventListener(
        "change",
        filterOrders
    );


// ========================================
// CLOSE BUTTON
// ========================================

document
    .getElementById("close-order-detail")
    .addEventListener(
        "click",
        closeOrderDetail
    );


// ========================================
// SAVE BUTTON
// ========================================

document
    .getElementById("save-order-status")
    .addEventListener(
        "click",
        saveOrderStatus
    );


// ========================================
// LOGOUT
// ========================================

document
    .getElementById("admin-logout")
    .addEventListener(
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
// ==========================================
// DENIMMAN - ORDER STATUS
// ==========================================

import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ==========================================
// TRACKING URL
// ==========================================

function getTrackingUrl(company, trackingNumber) {

    const encodedTracking =
        encodeURIComponent(trackingNumber);

    const companyName =
        company.toLowerCase();


    // Flash Express
    if (
        companyName.includes("flash")
    ) {

        return `https://www.flashexpress.com/fle/tracking?se=${encodedTracking}`;

    }


    // Kerry Express
    if (
        companyName.includes("kerry")
    ) {

        return `https://th.kerryexpress.com/th/track/?track=${encodedTracking}`;

    }


    // ไปรษณีย์ไทย
    if (
        companyName.includes("ไปรษณีย์ไทย") ||
        companyName.includes("thailand post")
    ) {

        return `https://track.thailandpost.co.th/?trackNumber=${encodedTracking}`;

    }


    // ไม่รู้จักบริษัทขนส่ง
    return null;

}


// ==========================================
// CHECK ORDER STATUS
// ==========================================

async function checkOrderStatus() {

    const input =
        document.getElementById("order-id");

    const result =
        document.getElementById("order-status-result");

    const button =
        document.getElementById("check-order");


    const orderId =
        input.value.trim();


    if (!orderId) {

        alert("กรุณากรอกเลขที่คำสั่งซื้อ");

        return;

    }


    button.disabled = true;
    button.textContent = "CHECKING...";


    result.innerHTML = `
        <p class="status-placeholder">
            กำลังตรวจสอบคำสั่งซื้อ...
        </p>
    `;


    try {

        // ==========================================
        // ค้นหาคำสั่งซื้อจาก Firebase
        // ==========================================

        const orderStatusRef =
            doc(
                db,
                "orderStatus",
                orderId
            );


        const orderStatusDoc =
            await getDoc(
                orderStatusRef
            );


        // ==========================================
        // ถ้าไม่พบคำสั่งซื้อ
        // ==========================================

        if (!orderStatusDoc.exists()) {

            result.innerHTML = `
                <div class="order-status-card">

                    <h3>
                        ไม่พบคำสั่งซื้อ
                    </h3>

                    <p>
                        ไม่พบเลขที่คำสั่งซื้อ
                        <strong>${orderId}</strong>
                    </p>

                    <p>
                        กรุณาตรวจสอบเลขที่คำสั่งซื้อ
                        แล้วลองใหม่อีกครั้ง
                    </p>

                </div>
            `;

            return;

        }


        // ==========================================
        // ข้อมูลคำสั่งซื้อ
        // ==========================================

        const order =
            orderStatusDoc.data();


        const orderStatus =
            order.status ||
            "รอดำเนินการ";


        const customerName =
            order.customerName ||
            "-";


        const paymentStatus =
            order.paymentStatus ||
            "-";


        const items =
            order.items ||
            [];


        const shippingCompany =
            order.shippingCompany ||
            "-";


        const trackingNumber =
            order.trackingNumber ||
            "-";


        // ==========================================
        // แสดงรายการสินค้า
        // ==========================================

        let itemsHTML = "";


        items.forEach(item => {

            const price =
                Number(item.price) ||
                0;


            const quantity =
                Number(item.quantity) ||
                0;


            const itemTotal =
                price * quantity;


            itemsHTML += `
                <div class="order-product-item">

                    <div>

                        <strong>
                            ${item.name || "-"}
                        </strong>

                        <span>
                            Size: ${item.size || "-"}
                            × ${quantity}
                        </span>

                    </div>

                    <strong>
                        ฿${itemTotal.toLocaleString("th-TH")}
                    </strong>

                </div>
            `;

        });


        // ==========================================
        // ถ้าไม่มีรายการสินค้า
        // ==========================================

        if (!itemsHTML) {

            itemsHTML = `
                <p>
                    ไม่พบข้อมูลสินค้า
                </p>
            `;

        }


        // ==========================================
        // สร้างปุ่ม TRACK PACKAGE
        // ==========================================

        let trackingButtonHTML = "";


        // ต้องมีบริษัทขนส่งและ Tracking Number
        if (
            shippingCompany !== "-" &&
            trackingNumber !== "-"
        ) {

            trackingButtonHTML = `
                <div class="order-tracking-button">

                    <button
                        type="button"
                        class="btn btn-black"
                        id="track-package"
                        data-company="${shippingCompany}"
                        data-tracking="${trackingNumber}"
                    >
                        TRACK PACKAGE
                    </button>

                </div>
            `;

        }


        // ==========================================
        // แสดงผลข้อมูลคำสั่งซื้อ
        // ==========================================

        result.innerHTML = `

            <div class="order-status-card">

                <h3>
                    ORDER #${orderId}
                </h3>


                <!-- ชื่อลูกค้า -->

                <div class="order-status-info">

                    <span>
                        ชื่อลูกค้า
                    </span>

                    <strong>
                        ${customerName}
                    </strong>

                </div>


                <!-- รายการสินค้า -->

                <div class="order-products">

                    <h4>
                        รายการสินค้า
                    </h4>

                    ${itemsHTML}

                </div>


                <!-- สถานะคำสั่งซื้อ -->

                <div class="order-status-info">

                    <span>
                        สถานะคำสั่งซื้อ
                    </span>

                    <strong>

                        <span class="order-status-badge">
                            ${orderStatus}
                        </span>

                    </strong>

                </div>


                <!-- สถานะการชำระเงิน -->

                <div class="order-status-info">

                    <span>
                        สถานะการชำระเงิน
                    </span>

                    <strong>
                        ${paymentStatus}
                    </strong>

                </div>


                <!-- บริษัทขนส่ง -->

                <div class="order-status-info">

                    <span>
                        บริษัทขนส่ง
                    </span>

                    <strong>
                        ${shippingCompany}
                    </strong>

                </div>


                <!-- Tracking Number -->

                <div class="order-status-info">

                    <span>
                        Tracking Number
                    </span>

                    <strong>
                        ${trackingNumber}
                    </strong>

                </div>


                <!-- TRACK PACKAGE -->

                ${trackingButtonHTML}

            </div>

        `;


        // ==========================================
        // TRACK PACKAGE BUTTON
        // ==========================================

        const trackButton =
            document.getElementById(
                "track-package"
            );


        if (trackButton) {

            trackButton.addEventListener(
                "click",
                () => {

                    const company =
                        trackButton.dataset.company;


                    const tracking =
                        trackButton.dataset.tracking;


                    const trackingUrl =
                        getTrackingUrl(
                            company,
                            tracking
                        );


                    // ถ้าไม่พบ URL
                    if (!trackingUrl) {

                        alert(
                            "ไม่พบระบบติดตามของบริษัทขนส่งนี้"
                        );

                        return;

                    }


                    // เปิดหน้าติดตามในแท็บใหม่
                    window.open(
                        trackingUrl,
                        "_blank"
                    );

                }
            );

        }


    } catch (error) {

        console.error(
            "Error checking order:",
            error
        );


        result.innerHTML = `

            <div class="order-status-card">

                <h3>
                    เกิดข้อผิดพลาด
                </h3>

                <p>
                    ไม่สามารถตรวจสอบคำสั่งซื้อได้
                    กรุณาลองใหม่อีกครั้ง
                </p>

            </div>

        `;

    } finally {

        button.disabled = false;

        button.textContent =
            "CHECK STATUS";

    }

}


// ==========================================
// BUTTON + ENTER KEY
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const button =
            document.getElementById(
                "check-order"
            );


        const input =
            document.getElementById(
                "order-id"
            );


        // ==========================================
        // กดปุ่ม CHECK STATUS
        // ==========================================

        if (button) {

            button.addEventListener(
                "click",
                checkOrderStatus
            );

        }


        // ==========================================
        // กด Enter ในช่องกรอกเลข Order
        // ==========================================

        if (input) {

            input.addEventListener(
                "keydown",
                (event) => {

                    if (
                        event.key === "Enter"
                    ) {

                        checkOrderStatus();

                    }

                }
            );

        }

    }
);
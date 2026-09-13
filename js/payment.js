document.addEventListener("DOMContentLoaded", function () {

    // =================================
    // GET CURRENT ORDER
    // =================================

    const orderData =
        localStorage.getItem("denimmanCurrentOrder");

    const paymentContent =
        document.getElementById("payment-content");


    // =================================
    // NO ORDER
    // =================================

    if (!orderData) {

        paymentContent.innerHTML = `

            <h2>
                ไม่พบคำสั่งซื้อ
            </h2>

            <p>
                กรุณาทำรายการสั่งซื้อก่อน
            </p>

            <a
                href="products.html"
                class="btn btn-dark"
            >
                SHOP NOW
            </a>

        `;

        return;
    }


    // =================================
    // PARSE ORDER
    // =================================

    let order;

    try {

        order = JSON.parse(orderData);

    } catch (error) {

        console.error("Invalid order data:", error);

        paymentContent.innerHTML = `

            <h2>
                เกิดข้อผิดพลาด
            </h2>

            <p>
                ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้
            </p>

            <a
                href="products.html"
                class="btn btn-dark"
            >
                SHOP NOW
            </a>

        `;

        return;
    }


    // =================================
    // BASIC ORDER INFORMATION
    // =================================

    const orderId =
        order.orderId || "-";

    const total =
        Number(order.total || 0);

    const paymentMethod =
        order.paymentMethod || "-";


    // =================================
    // DISPLAY ORDER ID
    // =================================

    const orderIdElement =
        document.getElementById("payment-order-id");

    if (orderIdElement) {

        orderIdElement.textContent =
            orderId;

    }


    // =================================
    // DISPLAY TOTAL
    // =================================

    const totalElement =
        document.getElementById("payment-total");

    if (totalElement) {

        totalElement.textContent =
            "฿" +
            total.toLocaleString("th-TH");

    }


    // =================================
    // CUSTOMER INFORMATION
    // =================================

    const customer =
        order.customer || {};


    const customerName =
        document.getElementById("customer-name");

    if (customerName) {

        customerName.textContent =
            customer.name || "-";

    }


    const customerPhone =
        document.getElementById("customer-phone");

    if (customerPhone) {

        customerPhone.textContent =
            customer.phone || "-";

    }


    const customerAddress =
        document.getElementById("customer-address");

    if (customerAddress) {

        customerAddress.textContent =
            customer.address || "-";

    }


    const customerProvince =
        document.getElementById("customer-province");

    if (customerProvince) {

        customerProvince.textContent =
            customer.province || "-";

    }


    const customerPostcode =
        document.getElementById("customer-postcode");

    if (customerPostcode) {

        customerPostcode.textContent =
            customer.postcode || "-";

    }


    // =================================
    // PAYMENT METHOD ELEMENT
    // =================================

    const paymentMethodElement =
        document.getElementById("payment-method");


    // =================================
    // PROMPTPAY
    // =================================

    if (paymentMethod === "PromptPay") {

        if (paymentMethodElement) {

            paymentMethodElement.textContent =
                "PromptPay";

        }


        paymentContent.innerHTML = `

            <h2>
                PROMPTPAY
            </h2>

            <p>
                กรุณาชำระเงินตามยอดรวม
                ของคำสั่งซื้อ
            </p>


            <div class="payment-amount">

                <span>
                    ยอดที่ต้องชำระ
                </span>

                <strong>
                    ฿${total.toLocaleString("th-TH")}
                </strong>

            </div>


            <div class="payment-qr">

                <div class="qr-box">

                    <img
                        src="images/13279234.jpg"
                        alt="PromptPay QR"
                        style="width: 250px; max-width: 100%;"
                    >

                    <p>
                        สแกน QR เพื่อชำระเงิน
                    </p>

                </div>

            </div>


            <div class="payment-instruction">

                <h3>
                    วิธีชำระเงิน
                </h3>

                <ol>

                    <li>
                        สแกน QR PromptPay
                    </li>

                    <li>
                        ตรวจสอบยอดเงิน
                    </li>

                    <li>
                        ชำระเงินตามยอดที่ระบุ
                    </li>

                    <li>
                        แจ้งหลักฐานการโอนผ่าน LINE
                    </li>

                </ol>

            </div>


            <div class="payment-notice">

                <strong>
                    IMPORTANT
                </strong>

                <p>
                    กรุณาแจ้งหลักฐานการชำระเงิน
                    พร้อมเลขที่คำสั่งซื้อ
                    ผ่าน LINE ของร้าน
                </p>

            </div>


            <a
                href="payment-notify.html"
                class="btn btn-dark"
            >
                แจ้งการชำระเงินผ่าน LINE
            </a>

        `;

    }


    // =================================
    // COD
    // =================================

    else if (paymentMethod === "COD") {

        if (paymentMethodElement) {

            paymentMethodElement.textContent =
                "เก็บเงินปลายทาง (COD)";

        }


        paymentContent.innerHTML = `

            <h2>
                CASH ON DELIVERY 📦
            </h2>


            <div class="cod-message">

                <h3>
                    สั่งซื้อเรียบร้อยแล้ว!
                </h3>

                <p>
                    คุณเลือกชำระเงิน
                    เก็บเงินปลายทาง เมื่อได้รับสินค้า
                </p>

            </div>


            <div class="payment-amount">

                <span>
                    ยอดที่ต้องชำระ
                </span>

                <strong>
                    ฿${total.toLocaleString("th-TH")}
                </strong>

            </div>


            <div class="payment-instruction">

                <h3>
                    วิธีการชำระเงิน
                </h3>

                <ol>

                    <li>
                        รอรับสินค้าตามที่อยู่จัดส่ง
                    </li>

                    <li>
                        ชำระเงินกับพนักงานขนส่ง
                    </li>

                    <li>
                        ตรวจสอบสินค้า
                        ก่อนรับสินค้า
                    </li>

                </ol>

            </div>


            <div class="payment-notice">

                <strong>
                    IMPORTANT
                </strong>

                <p>
                    กรุณาเตรียมเงินตามยอดรวม
                    ฿${total.toLocaleString("th-TH")}
                    สำหรับชำระเมื่อได้รับสินค้า
                </p>

            </div>

        `;

    }


    // =================================
    // UNKNOWN PAYMENT
    // =================================

    else {

        if (paymentMethodElement) {

            paymentMethodElement.textContent =
                "-";

        }


        paymentContent.innerHTML = `

            <h2>
                PAYMENT
            </h2>

            <p>
                ไม่พบวิธีการชำระเงิน
            </p>

        `;

    }

});
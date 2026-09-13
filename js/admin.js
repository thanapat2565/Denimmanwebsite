// ==========================================
// DENIMMAN - ADMIN DASHBOARD
// ==========================================

import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// ==========================================
// CHECK ADMIN LOGIN
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "admin-login.html";

        return;
    }

    loadDashboard();

});


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        const ordersSnapshot =
            await getDocs(
                collection(db, "orders")
            );

        const orders = [];

        ordersSnapshot.forEach((doc) => {

            orders.push({
                id: doc.id,
                ...doc.data()
            });

        });


        // ==========================================
        // STATISTICS
        // ==========================================

        const totalOrders =
            orders.length;


        let totalSales = 0;

        let pendingOrders = 0;

        let shippingOrders = 0;


        orders.forEach(order => {

            totalSales +=
                Number(order.total) || 0;


            const status =
                order.orderStatus || "";


            if (
                status === "รอดำเนินการ"
            ) {

                pendingOrders++;

            }


            if (
                status === "กำลังจัดส่ง"
            ) {

                shippingOrders++;

            }

        });


        // ==========================================
        // DISPLAY STATISTICS
        // ==========================================

        document.getElementById(
            "total-orders"
        ).textContent =
            totalOrders;


        document.getElementById(
            "total-sales"
        ).textContent =
            "฿" +
            totalSales.toLocaleString("th-TH");


        document.getElementById(
            "pending-orders"
        ).textContent =
            pendingOrders;


        document.getElementById(
            "shipping-orders"
        ).textContent =
            shippingOrders;


        // ==========================================
        // RECENT ORDERS
        // ==========================================

        renderRecentOrders(orders);

    } catch (error) {

        console.error(
            "Error loading dashboard:",
            error
        );

        document.getElementById(
            "recent-orders"
        ).innerHTML = `
            <p class="admin-loading">
                ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้
            </p>
        `;

    }

}


// ==========================================
// RECENT ORDERS
// ==========================================

function renderRecentOrders(orders) {

    const container =
        document.getElementById(
            "recent-orders"
        );


    if (orders.length === 0) {

        container.innerHTML = `
            <p class="admin-loading">
                ยังไม่มีคำสั่งซื้อ
            </p>
        `;

        return;

    }


    // เรียงจาก Order ล่าสุด
    orders.sort((a, b) => {

        const dateA =
            new Date(a.createdAt || 0);

        const dateB =
            new Date(b.createdAt || 0);

        return dateB - dateA;

    });


    // เอาแค่ 5 Order ล่าสุด
    const recentOrders =
        orders.slice(0, 5);


    let html = "";


    recentOrders.forEach(order => {

        const orderId =
            order.orderId || order.id;

        const customerName =
            order.customer?.name || "-";

        const total =
            Number(order.total) || 0;

        const status =
            order.orderStatus ||
            "รอดำเนินการ";


        html += `

            <div class="admin-order-row">

                <div class="admin-order-id">
                    ${orderId}
                </div>

                <div class="admin-order-customer">
                    ${customerName}
                </div>

                <div class="admin-order-total">
                    ฿${total.toLocaleString("th-TH")}
                </div>

                <div class="admin-order-status">
                    ${status}
                </div>

            </div>

        `;

    });


    container.innerHTML = html;

}


// ==========================================
// LOGOUT
// ==========================================

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
// ==========================================
// DENIMMAN - MAIN JAVASCRIPT
// ==========================================


// ==========================================
// MOBILE MENU
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (menuToggle && navMenu) {

        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });

        // ปิดเมนูเมื่อกดลิงก์
        const navLinks = navMenu.querySelectorAll("a");

        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
            });
        });
    }

});


// ==========================================
// UPDATE CART COUNT
// ==========================================

function updateCartCount() {

    const cartCountElements =
        document.querySelectorAll("#cart-count");

    const cart = JSON.parse(
        localStorage.getItem("denimmanCart")
    ) || [];

    let totalQuantity = 0;

    cart.forEach(item => {
        totalQuantity += Number(item.quantity) || 0;
    });

    cartCountElements.forEach(element => {
        element.textContent = totalQuantity;
    });
}


// ==========================================
// RUN CART COUNT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
});
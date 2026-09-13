// ==========================================
// DENIMMAN - SHOPPING CART
// FIRESTORE PRODUCT COMPATIBLE VERSION
// ==========================================


// ==========================================
// GET CART FROM LOCAL STORAGE
// ==========================================

function getCart() {

    return JSON.parse(
        localStorage.getItem("denimmanCart")
    ) || [];

}


// ==========================================
// SAVE CART TO LOCAL STORAGE
// ==========================================

function saveCart(cart) {

    localStorage.setItem(
        "denimmanCart",
        JSON.stringify(cart)
    );

}


// ==========================================
// ADD PRODUCT TO CART
// ==========================================

function addToCart(product, size, quantity) {

    // ตรวจสอบสินค้า
    if (!product) {

        alert("ไม่พบข้อมูลสินค้า");

        return;
    }


    // ตรวจสอบ Size
    if (!size) {

        alert("กรุณาเลือกไซซ์");

        return;
    }


    // ตรวจสอบจำนวน
    quantity = Number(quantity);

    if (
        Number.isNaN(quantity) ||
        quantity < 1
    ) {

        quantity = 1;

    }


    const cart = getCart();


    // แปลง Product ID เป็น String
    // เพื่อให้เข้ากันได้กับ Firestore
    const productId =
        String(product.id);


    // ตรวจสอบว่ามีสินค้า
    // ตัวเดิม + ไซซ์เดิมหรือไม่
    const existingItem = cart.find(item =>

        String(item.productId) === productId &&
        String(item.size) === String(size)

    );


    if (existingItem) {

        // ถ้ามีอยู่แล้ว
        // ให้เพิ่มจำนวน
        existingItem.quantity =
            Number(existingItem.quantity) +
            quantity;

    } else {

        // ถ้ายังไม่มี
        // ให้เพิ่มสินค้าใหม่
        cart.push({

            productId: productId,

            name: product.name || "",

            price: Number(product.price) || 0,

            image: product.image || "",

            size: size,

            quantity: quantity

        });

    }


    saveCart(cart);

    updateCartCount();

    alert("เพิ่มสินค้าลงรถเข็นแล้ว");

}


// ==========================================
// REMOVE PRODUCT FROM CART
// ==========================================

function removeFromCart(productId, size) {

    let cart = getCart();


    cart = cart.filter(item =>

        !(
            String(item.productId) ===
            String(productId) &&

            String(item.size) ===
            String(size)
        )

    );


    saveCart(cart);

    renderCart();

    updateCartCount();

}


// ==========================================
// CHANGE QUANTITY
// ==========================================

function changeCartQuantity(
    productId,
    size,
    change
) {

    const cart = getCart();


    const item = cart.find(item =>

        String(item.productId) ===
        String(productId) &&

        String(item.size) ===
        String(size)

    );


    if (!item) {

        return;

    }


    item.quantity =
        Number(item.quantity) +
        Number(change);


    // ถ้าจำนวนเหลือ 0
    // ให้ลบสินค้าออก
    if (item.quantity <= 0) {

        const newCart = cart.filter(cartItem =>

            !(
                String(cartItem.productId) ===
                String(productId) &&

                String(cartItem.size) ===
                String(size)
            )

        );


        saveCart(newCart);

    } else {

        saveCart(cart);

    }


    renderCart();

    updateCartCount();

}


// ==========================================
// CALCULATE TOTAL
// ==========================================

function calculateCartTotal(cart) {

    return cart.reduce(
        (total, item) => {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 0;


            return total +
                (price * quantity);

        },
        0
    );

}


// ==========================================
// FORMAT PRICE
// ==========================================

function formatCartPrice(price) {

    return new Intl.NumberFormat(
        "th-TH"
    ).format(price);

}


// ==========================================
// DISPLAY CART
// ==========================================

function renderCart() {

    const cartList =
        document.getElementById(
            "cart-list"
        );


    if (!cartList) {

        return;

    }


    const cart = getCart();


    const emptyCart =
        document.getElementById(
            "empty-cart"
        );


    // ======================================
    // CART EMPTY
    // ======================================

    if (cart.length === 0) {

        cartList.innerHTML = "";


        if (emptyCart) {

            emptyCart.style.display =
                "block";

        }


        updateCartSummary(cart);

        return;

    }


    // ======================================
    // CART HAS PRODUCTS
    // ======================================

    if (emptyCart) {

        emptyCart.style.display =
            "none";

    }


    cartList.innerHTML = "";


    cart.forEach(item => {

        const cartItem =
            document.createElement(
                "div"
            );


        cartItem.className =
            "cart-item";


        const productId =
            String(item.productId);


        const size =
            String(item.size || "");


        const quantity =
            Number(item.quantity) || 1;


        const price =
            Number(item.price) || 0;


        const itemTotal =
            price * quantity;


        cartItem.innerHTML = `

            <img
                src="${item.image || ""}"
                alt="${item.name || ""}"
                class="cart-item-image"
            >


            <div class="cart-item-details">

                <h3>
                    ${item.name || "-"}
                </h3>


                <p>
                    Size: ${size || "-"}
                </p>


                <p class="cart-item-price">

                    ฿${formatCartPrice(price)}

                </p>


                <div class="cart-item-actions">


                    <div class="cart-quantity">


                        <button
                            type="button"
                            class="cart-minus-button"
                        >
                            −
                        </button>


                        <span>
                            ${quantity}
                        </span>


                        <button
                            type="button"
                            class="cart-plus-button"
                        >
                            +
                        </button>


                    </div>


                    <button
                        type="button"
                        class="remove-item"
                    >
                        Remove
                    </button>


                </div>


            </div>


            <div class="cart-item-total">

                ฿${formatCartPrice(itemTotal)}

            </div>

        `;


        // ==================================
        // MINUS BUTTON
        // ==================================

        const minusButton =
            cartItem.querySelector(
                ".cart-minus-button"
            );


        if (minusButton) {

            minusButton.addEventListener(
                "click",
                () => {

                    changeCartQuantity(
                        productId,
                        size,
                        -1
                    );

                }
            );

        }


        // ==================================
        // PLUS BUTTON
        // ==================================

        const plusButton =
            cartItem.querySelector(
                ".cart-plus-button"
            );


        if (plusButton) {

            plusButton.addEventListener(
                "click",
                () => {

                    changeCartQuantity(
                        productId,
                        size,
                        1
                    );

                }
            );

        }


        // ==================================
        // REMOVE BUTTON
        // ==================================

        const removeButton =
            cartItem.querySelector(
                ".remove-item"
            );


        if (removeButton) {

            removeButton.addEventListener(
                "click",
                () => {

                    removeFromCart(
                        productId,
                        size
                    );

                }
            );

        }


        cartList.appendChild(
            cartItem
        );

    });


    updateCartSummary(cart);

}


// ==========================================
// UPDATE CART SUMMARY
// ==========================================

function updateCartSummary(cart) {

    const itemCount =
        cart.reduce(
            (total, item) => {

                return total +
                    (Number(item.quantity) || 0);

            },
            0
        );


    const subtotal =
        calculateCartTotal(cart);


    const summaryItems =
        document.getElementById(
            "summary-items"
        );


    const cartSubtotal =
        document.getElementById(
            "cart-subtotal"
        );


    const cartTotal =
        document.getElementById(
            "cart-total"
        );


    const cartCount =
        document.getElementById(
            "cart-count"
        );


    if (summaryItems) {

        summaryItems.textContent =
            itemCount;

    }


    if (cartSubtotal) {

        cartSubtotal.textContent =
            `฿${formatCartPrice(subtotal)}`;

    }


    if (cartTotal) {

        cartTotal.textContent =
            `฿${formatCartPrice(subtotal)}`;

    }


    if (cartCount) {

        cartCount.textContent =
            itemCount;

    }

}


// ==========================================
// UPDATE CART COUNT
// ==========================================

function updateCartCount() {

    const cart =
        getCart();


    const totalQuantity =
        cart.reduce(
            (total, item) => {

                return total +
                    (Number(item.quantity) || 0);

            },
            0
        );


    const cartCountElements =
        document.querySelectorAll(
            "#cart-count"
        );


    cartCountElements.forEach(
        element => {

            element.textContent =
                totalQuantity;

        }
    );

}


// ==========================================
// ADD TO CART BUTTON
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        const addToCartButton =
            document.getElementById(
                "add-to-cart"
            );


        if (addToCartButton) {

            addToCartButton.addEventListener(
                "click",
                () => {


                    // --------------------------
                    // CHECK PRODUCT
                    // --------------------------

                    if (!window.currentProduct) {

                        alert(
                            "ไม่พบข้อมูลสินค้า"
                        );

                        return;

                    }


                    // --------------------------
                    // GET SELECTED SIZE
                    // --------------------------

                    const selectedSize =
                        document.querySelector(
                            ".size-btn.active"
                        );


                    if (!selectedSize) {

                        alert(
                            "กรุณาเลือกไซซ์"
                        );

                        return;

                    }


                    const size =
                        selectedSize.textContent
                            .trim();


                    // --------------------------
                    // GET QUANTITY
                    // --------------------------

                    const quantityElement =
                        document.getElementById(
                            "quantity"
                        );


                    const quantity =
                        quantityElement
                            ? Number(
                                quantityElement
                                    .textContent
                            )
                            : 1;


                    // --------------------------
                    // ADD PRODUCT
                    // --------------------------

                    addToCart(
                        window.currentProduct,
                        size,
                        quantity
                    );

                }
            );

        }


        // ======================================
        // SIZE BUTTON
        // ======================================

        const sizeButtons =
            document.querySelectorAll(
                ".size-btn"
            );


        sizeButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {


                        sizeButtons.forEach(
                            btn => {

                                btn.classList.remove(
                                    "active"
                                );

                            }
                        );


                        button.classList.add(
                            "active"
                        );

                    }
                );

            }
        );


        // ======================================
        // PRODUCT QUANTITY
        // ======================================

        const minusButton =
            document.getElementById(
                "minus-btn"
            );


        const plusButton =
            document.getElementById(
                "plus-btn"
            );


        const quantityElement =
            document.getElementById(
                "quantity"
            );


        // --------------------------
        // MINUS
        // --------------------------

        if (
            minusButton &&
            quantityElement
        ) {

            minusButton.addEventListener(
                "click",
                () => {

                    let quantity =
                        Number(
                            quantityElement
                                .textContent
                        );


                    if (quantity > 1) {

                        quantity--;

                        quantityElement
                            .textContent =
                            quantity;

                    }

                }
            );

        }


        // --------------------------
        // PLUS
        // --------------------------

        if (
            plusButton &&
            quantityElement
        ) {

            plusButton.addEventListener(
                "click",
                () => {

                    let quantity =
                        Number(
                            quantityElement
                                .textContent
                        );


                    quantity++;


                    quantityElement
                        .textContent =
                        quantity;

                }
            );

        }


        // ======================================
        // CART PAGE
        // ======================================

        renderCart();

        updateCartCount();

    }
);
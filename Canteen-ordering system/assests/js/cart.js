document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const cartItemsContainer = document.getElementById("cart-items");
    const totalAmount = document.getElementById("total-amount");
    const scheduleTimeInput = document.getElementById("scheduleTime");
    const checkoutButton = document.getElementById("checkout-btn");
    const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');

    // ✅ Toggle Navbar in Mobile View (Dropdown Effect)
    hamburger.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent immediate closing due to document click
        if (navLinks.classList.contains("active")) {
            closeNavbar();
        } else {
            openNavbar();
        }
    }); 

    function openNavbar() {
        navLinks.classList.add("active");
        navLinks.style.display = "flex";
        navLinks.style.flexDirection = "column";
        navLinks.style.position = "absolute";
        navLinks.style.top = "100%"; // Opens from navbar position downwards
        navLinks.style.left = "0";
        navLinks.style.width = "100%";
        navLinks.style.background = "rgba(0, 0, 0, 0.8)";
        navLinks.style.padding = "10px 0";
        navLinks.style.borderRadius = "0 0 10px 10px";
        navLinks.style.transition = "max-height 0.3s ease-in-out";
        navLinks.style.maxHeight = "300px"; // Smooth dropdown effect
    } 

  /*  function closeNavbar() {
        navLinks.classList.remove("active");
        navLinks.style.maxHeight = "0";
        setTimeout(() => {
            navLinks.style.display = "none";
        }, 300); // Wait for animation to complete before hiding
    }
*/
    // ✅ Close Navbar when clicking outside
    document.addEventListener("click", function (event) {
        if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
            closeNavbar();
        }
    });

    // ✅ Handle Dropdown Menu (Profile)
    const profileDropdown = document.querySelector(".profile-dropdown");
    const dropdownMenu = document.querySelector(".dropdown");

    profileDropdown.addEventListener("mouseenter", function () {
        dropdownMenu.style.display = "block";
    });

    profileDropdown.addEventListener("mouseleave", function () {
        setTimeout(() => {
            dropdownMenu.style.display = "none";
        }, 300); // Smooth transition for better UX
    });

    // ✅ Load Cart from Local Storage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function updateCartDisplay() {
        cartItemsContainer.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
            totalAmount.innerText = "Total Amount: ₹0";
            return;
        }

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <span>${item.name} - ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}</span>
                <div>
                    <button onclick="decreaseQuantity(${index})">➖</button>
                    <button onclick="increaseQuantity(${index})">➕</button>
                    <button onclick="removeItem(${index})">❌</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        totalAmount.innerText = `Total Amount: ₹${total}`;
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // ✅ Increase Quantity of Item
    window.increaseQuantity = function (index) {
        cart[index].quantity++;
        updateCartDisplay();
    };

    // ✅ Decrease Quantity of Item
    window.decreaseQuantity = function (index) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            removeItem(index); // Remove item if quantity becomes 0
        }
        updateCartDisplay();
    };

    // ✅ Remove Item from Cart
    window.removeItem = function (index) {
        cart.splice(index, 1);
        updateCartDisplay();
    };

    // ✅ Handle Order Type Selection
    orderTypeRadios.forEach((radio) => {
        radio.addEventListener("change", function () {
            scheduleTimeInput.disabled = this.value !== "schedule";
        });
    });

    // ✅ Proceed to Payment with Improved Validation
    checkoutButton.addEventListener("click", function () {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        let orderType = document.querySelector('input[name="orderType"]:checked').value;
        let scheduleTime = scheduleTimeInput.value;

        if (orderType === "schedule" && (!scheduleTime || new Date(scheduleTime) < new Date())) {
            alert("Please select a valid future schedule time.");
            return;
        }

        window.location.href = "payment.html";
    });

    // ✅ Initial Display
    updateCartDisplay();
});

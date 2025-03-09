document.addEventListener("DOMContentLoaded", function () {
    // Generate a unique order ID
    const orderId = 'ORD-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);

    // Store order ID in localStorage
    localStorage.setItem("orderId", orderId);

    // Load order details from localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        document.getElementById("status-text").textContent = "⚠️ Your cart is empty!";
        return; // Exit if there are no items in the cart
    }

    // Calculate the total amount
    let totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Display cart items
    let orderItemsDiv = document.getElementById("order-items");
    orderItemsDiv.innerHTML = cart.map(item => `
        <p>${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}</p>
    `).join("");

    // Display the order ID in the summary
    document.getElementById("order-id").textContent = orderId;

    // Show total amount
    document.getElementById("total-amount").textContent = totalAmount;

    // Toggle the active button based on payment selection
    const payButton = document.getElementById("pay-btn");
    const checkoutButton = document.getElementById("checkout-btn");
    const paymentRadios = document.querySelectorAll('input[name="payment"]');

    // Function to handle button enabling/disabling based on payment method
    function togglePaymentButtons() {
        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;

        if (selectedPayment === "upi") {
            payButton.disabled = false; // Enable "Proceed to Payment"
            checkoutButton.disabled = true; // Disable "Checkout"
        } else if (selectedPayment === "cash") {
            payButton.disabled = true; // Disable "Proceed to Payment"
            checkoutButton.disabled = false; // Enable "Checkout"
        }
    }

    // Set initial state
    togglePaymentButtons();

    // Listen for changes in payment method selection
    paymentRadios.forEach(radio => {
        radio.addEventListener("change", togglePaymentButtons);
    });

    // Handle UPI Payment (Proceed to Payment button)
    payButton.addEventListener("click", function () {
        let selectedPayment = document.querySelector('input[name="payment"]:checked').value;

        if (selectedPayment === "upi") {
            document.getElementById("status-text").textContent = "Redirecting to UPI payment... Please wait.";
            setTimeout(() => {
                // Store order details and payment status in localStorage
                localStorage.setItem("paymentStatus", "Completed");
                localStorage.setItem("orderDetails", JSON.stringify(cart)); // Store the cart (order details)
                localStorage.removeItem("cart"); // Clear cart after successful payment
                window.location.href = "payment-success.html"; // Redirect to success page
            }, 2000);
        }
    });

    // Handle Cash on Delivery (Checkout button)
    checkoutButton.addEventListener("click", function () {
        document.getElementById("status-text").textContent = "✅ Cash on Delivery Selected. Your order is confirmed!";
        // Store order details and payment status in localStorage
        localStorage.setItem("paymentStatus", "Cash on Delivery");
        localStorage.setItem("orderDetails", JSON.stringify(cart)); // Store the cart (order details)
        localStorage.removeItem("cart"); // Clear cart after payment
        window.location.href = "track-order.html"; // Redirect to success page
    });
});
function toggleMenu() {
    document.querySelector(".nav-links").classList.toggle("active");
}

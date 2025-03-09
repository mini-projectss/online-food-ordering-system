document.addEventListener("DOMContentLoaded", function () {
    // Load order details from localStorage
    let orderDetails = JSON.parse(localStorage.getItem("orderDetails")) || [];
    let orderId = localStorage.getItem("orderId") || "Not Available";
    let paymentStatus = localStorage.getItem("paymentStatus") || "Order not yet confirmed.";

    // Display Order ID
    document.getElementById("order-id").textContent = orderId;

    // Display Payment Status
    document.getElementById("status-text").textContent = `Payment Status: ${paymentStatus}`;

    // If order details exist, display them
    if (orderDetails.length > 0) {
        let totalAmount = orderDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let orderItemsDiv = document.getElementById("order-items");

        orderItemsDiv.innerHTML = orderDetails.map(item => `
            <p>${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}</p>
        `).join("");

        document.getElementById("total-amount").textContent = totalAmount;
    } else {
        document.getElementById("order-items").innerHTML = "<p>No order details available.</p>";
        document.getElementById("total-amount").textContent = "0";
    }
});

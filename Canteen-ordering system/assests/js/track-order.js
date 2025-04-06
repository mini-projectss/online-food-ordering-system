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

    // Add Firebase real-time order status listener
    const user = auth.currentUser;
    if (orderId && user) {
        db.collection("orders")
            .where("orderId", "==", orderId)
            .where("userId", "==", user.uid)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "modified") {
                        const data = change.doc.data();
                        updateOrderStatus(data.status);
                    }
                });
            });
    }

    function updateOrderStatus(status) {
        const statusText = document.getElementById("status-text");
        statusText.textContent = `Order Status: ${status}`;

        if (status === "completed") {
            showNotification("Order ready for pickup!");
        }
    }

    function showNotification(message) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Order Update", { body: message });
        }
    }
});
// Navbar toggle for mobile
document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", function () {
            // Toggle the 'show' class on navLinks to display the menu
            navLinks.classList.toggle("show");

            // Toggle the 'active' class on hamburger to change icon to cross
            hamburger.classList.toggle("active");
        });
    }
});

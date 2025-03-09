document.addEventListener("DOMContentLoaded", function () {
    // Get the payment status
    let paymentStatus = localStorage.getItem("paymentStatus");
    if (paymentStatus) {
        document.getElementById("payment-status").textContent = `Payment Status: ${paymentStatus}`;
    } else {
        document.getElementById("payment-status").textContent = "Payment Status: Not Found";
    }

    // Auto-redirect after a short delay (3 seconds)
    setTimeout(() => {
        window.location.href = "track-order.html";  // Redirect to track order page
    }, 3000);
});

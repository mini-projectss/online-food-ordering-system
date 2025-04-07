// payment.js - Core functionality
const firebaseConfig = {
    apiKey: "AIzaSyAiJplG7u_x_ijhxC9AD9F2JPYoU0k2Lnk",
    authDomain: "online-cateen-ordeing.firebaseapp.com",
    projectId: "online-cateen-ordeing",
    storageBucket: "online-cateen-ordeing.firebasestorage.app",
    messagingSenderId: "1088334175531",
    appId: "1:1088334175531:web:586611bcf1bbba05f5f96e",
    measurementId: "G-BL8BCFH88B"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Order Display
    const orderId = 'ORD-' + Date.now();
    localStorage.setItem("orderId", orderId);
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Display Order Details
    if (cart.length === 0) {
        document.getElementById("status-text").textContent = "⚠️ Your cart is empty!";
        return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById("order-id").textContent = orderId;
    document.getElementById("total-amount").textContent = totalAmount;
    document.getElementById("order-items").innerHTML = cart.map(item => 
        `<p>${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}</p>`
    ).join("");

    // Payment Method Toggle
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const payButton = document.getElementById("pay-btn");
    const checkoutButton = document.getElementById("checkout-btn");

    function toggleButtons() {
        const method = document.querySelector('input[name="payment"]:checked').value;
        payButton.disabled = method !== "razorpay";
        checkoutButton.disabled = method !== "cash";
    }
    paymentRadios.forEach(radio => radio.addEventListener("change", toggleButtons));
    toggleButtons();

    // Payment Handlers
    payButton.addEventListener("click", handleRazorpay);
    checkoutButton.addEventListener("click", handleCOD);
});

async function handleRazorpay() {
    try {
        const response = await fetch('https://online-food-ordering-system-ffv5.onrender.com/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: totalAmount })
        });
        
        const razorpayOrder = await response.json();
        
        const options = {
            // ... [Keep previous Razorpay config]
            handler: async (response) => {
                await saveOrder({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                });
                localStorage.removeItem("cart");
                window.location.href = "payment-success.html";
            }
        };
        new Razorpay(options).open();
    } catch (error) {
        // ... [Keep error handling]
    }
}

async function handleCOD() {
    try {
        await saveOrder({
            method: "Cash on Delivery",
            status: "Success",
            transactionId: `COD-${Date.now()}`
        });
        localStorage.removeItem("cart");
        document.getElementById("status-text").textContent = "✅ Order confirmed! Redirecting...";
        setTimeout(() => window.location.href = "track-order.html", 1500);
    } catch (error) {
        // ... [Keep error handling]
    }
}

async function saveOrder(paymentResponse) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");
    
    const orderData = {
        orderId: localStorage.getItem("orderId"),
        paymentResponse, // This will store either COD or Razorpay response
        cart: JSON.parse(localStorage.getItem("cart")).map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("users")
        .doc(user.uid)
        .collection("orders")
        .add(orderData);
}
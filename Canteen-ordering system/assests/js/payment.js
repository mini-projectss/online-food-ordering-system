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

auth.onAuthStateChanged(user => {
    if (user) {
      db.collection("users").doc(user.uid).get()
        .then(doc => {
          userData = doc.data() || {};
        })
        .catch(error => console.error("Error fetching user data: ", error));
    }
  });

let userData = {};
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
    
    async function handleRazorpay() {
        try {
            const user = auth.currentUser;
            if (!user) {
                alert("User not logged in!");
                return;
            }
    
            const response = await fetch('https://online-food-ordering-system-ffv5.onrender.com/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: totalAmount })
            });
    
            const order = await response.json();
    
            const options = {
                key: "rzp_test_Ywd9gWBWFV1zVA",
                amount: order.amount,
                currency: "INR",
                handler: async function(response) {
                    try {
                        await saveOrder({
                            ...response,
                            method: "razorpay",
                            currency: "INR"  // Explicitly set currency
                        });
                        localStorage.removeItem("cart");
                        localStorage.setItem("paymentStatus", "Completed");
                        window.location.href = "payment-success.html";  // Ensure redirect
                    } catch (error) {
                        console.error("Save order error:", error);
                    }
                },
                prefill: {
                    name: userData?.name?.trim() || "Customer",
                    email: userData?.email || "test@example.com",
                    contact: (userData?.phone || "9876543210").replace(/^\+?91?/, '') // Indian format
                },
                notes: {
                    internal_payment: "true"  // Flag for domestic payments
                }
            };
    
            new Razorpay(options).open();
        } catch (error) {
            console.error("Payment error:", error);
            document.getElementById("status-text").textContent = `Payment failed! ${error.message}`;
        }
    };

    async function saveOrder(paymentResponse) {
        const user = auth.currentUser;
        if (!user) throw new Error("User not logged in");
    
        // Get user details
        const userDoc = await db.collection("users").doc(user.uid).get();
        const userData = userDoc.data();
    
        // Get order metadata
        const orderType = localStorage.getItem("orderType") || "instant";
        const scheduleTime = localStorage.getItem("scheduleTime");
        
        const orderData = {
            orderId: localStorage.getItem("orderId"),
            userId: user.uid,
            userName: userData.name,
            orderType,
            scheduleTime: orderType === "schedule" ? scheduleTime : null,
            paymentResponse,
            cart: JSON.parse(localStorage.getItem("cart")).map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            totalAmount: JSON.parse(localStorage.getItem("cart")).reduce((sum, item) => 
                sum + (item.price * item.quantity), 0),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            paymentStatus: paymentResponse.method ? "pending" : "completed",
            status: "processing"
        };
    
  // Remove undefined fields
  Object.keys(orderData).forEach(key => 
    orderData[key] === undefined && delete orderData[key]
);


        // Save to both collections
        const ordersCollection = db.collection("orders");
        const userOrdersCollection = db.collection("users").doc(user.uid).collection("orders");
        
        const batch = db.batch();
        
        // Add to global orders collection
        const orderRef = ordersCollection.doc();
        batch.set(orderRef, orderData);
        
        // Add to user's orders subcollection
        const userOrderRef = userOrdersCollection.doc(orderRef.id);
        batch.set(userOrderRef, orderData);
    
        await batch.commit();
        
        // Clear temporary storage
        localStorage.removeItem("orderType");
        localStorage.removeItem("scheduleTime");
    }

});


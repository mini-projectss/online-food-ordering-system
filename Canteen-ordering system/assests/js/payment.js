// Initialize Firebase
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

// Global variable to hold user data
let userData = {};

// Fetch user data when the auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    db.collection("users").doc(user.uid).get()
      .then(doc => {
        userData = doc.data() || {};
      })
      .catch(error => console.error("Error fetching user data: ", error));
  }
});

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
        if (selectedPayment === "razorpay") {
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

    payButton.addEventListener("click", async function () {
        try {
          const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
          
          if (selectedPayment === "razorpay") {
            const user = auth.currentUser;
            if (!user) {
              alert("User not logged in!");
              return;
            }
      
            // Get total amount again (if needed)
            const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
            // Call your Render server to create an order
            const response = await fetch('https://online-food-ordering-system-ffv5.onrender.com/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: totalAmount })
            });
      
            const order = await response.json();
      
            // Configure Razorpay options including prefill using userData
            const options = {
              key: "rzp_test_Ywd9gWBWFV1zVA", // Your Razorpay TEST key
              amount: order.amount,
              currency: "INR",
              order_id: order.id,
              name: "College Canteen",
              description: "Food Order Payment",
              image: "Canteen-ordering system/assests/images/VISUAL-ART-LOGO-1-1024x1024.png",
              handler: async function(response) {
                await saveOrderToFirebase(response);
                localStorage.setItem("paymentStatus", "Completed");
                window.location.href = "payment-success.html";
              },
              prefill: {
                name: userData?.name || "Customer",
                email: userData?.email || "test@example.com",
                contact: userData?.phone || "9876543210"
              },
              theme: { color: "#3399cc" }
            };
      
            const rzp = new Razorpay(options);
            rzp.open();
          }
        } catch (error) {
          console.error("Payment error:", error);
          document.getElementById("status-text").textContent = "Payment failed! Error: " + error.message;
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

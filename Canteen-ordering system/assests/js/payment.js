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
  localStorage.setItem("orderId", orderId);

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const orderItemsDiv = document.getElementById("order-items");
  const payButton = document.getElementById("pay-btn");
  const checkoutButton = document.getElementById("checkout-btn");
  const paymentRadios = document.querySelectorAll('input[name="payment"]');

  if (cart.length === 0) {
      document.getElementById("status-text").textContent = "⚠️ Your cart is empty!";
      return;
  }

  // Calculate and display order details
  let totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  orderItemsDiv.innerHTML = cart.map(item => `
      <p>${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}</p>
  `).join("");
  document.getElementById("order-id").textContent = orderId;
  document.getElementById("total-amount").textContent = totalAmount;

  // Payment method handling
  function togglePaymentButtons() {
      const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
      payButton.disabled = selectedPayment !== "razorpay";
      checkoutButton.disabled = selectedPayment !== "cash";
  }

  togglePaymentButtons();
  paymentRadios.forEach(radio => radio.addEventListener("change", togglePaymentButtons));

  // Razorpay Payment Handler
  payButton.addEventListener("click", async function () {
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

          new Razorpay(options).open();
      } catch (error) {
          console.error("Payment error:", error);
          document.getElementById("status-text").textContent = `Payment failed! ${error.message}`;
      }
  });

  // Cash on Delivery Handler
  checkoutButton.addEventListener("click", async function () {
      try {
          const codResponse = {
              method: "Cash on Delivery",
              status: "Success",
              transactionId: "COD-" + new Date().getTime()
          };

          await saveOrderToFirebase(codResponse);
          
          document.getElementById("status-text").textContent = "✅ Order confirmed! Redirecting...";
          localStorage.setItem("paymentStatus", "Cash on Delivery");
          localStorage.removeItem("cart");
          
          setTimeout(() => window.location.href = "track-order.html", 1500);
      } catch (error) {
          console.error("COD Error:", error);
          document.getElementById("status-text").textContent = "❌ Order failed! " + error.message;
      }
  });

  // Unified Order Saving Function
  async function saveOrderToFirebase(paymentResponse) {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      const orderData = {
          orderId: localStorage.getItem("orderId"),
          paymentResponse,
          cart: JSON.parse(localStorage.getItem("cart")),
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection("users").doc(user.uid).collection("orders").add(orderData);
      console.log("Order saved successfully");
  }
});

function toggleMenu() {
  document.querySelector(".nav-links").classList.toggle("active");
}
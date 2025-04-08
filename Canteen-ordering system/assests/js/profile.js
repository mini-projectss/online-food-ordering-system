// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAiJplG7u_x_ijhxC9AD9F2JPYoU0k2Lnk",
    authDomain: "online-cateen-ordeing.firebaseapp.com",
    projectId: "online-cateen-ordeing",
    storageBucket: "online-cateen-ordeing.appspot.com",
    messagingSenderId: "1088334175531",
    appId: "1:1088334175531:web:586611bcf1bbba05f5f96e",
    measurementId: "G-BL8BCFH88B"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Profile page elements
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profilePhone = document.getElementById("profile-phone");
const profileRole = document.getElementById("profile-role");
const logoutBtn = document.getElementById("logout");

// Order history page elements
const orderList = document.getElementById("order-history");
const expandOrdersBtn = document.getElementById("expand-orders-btn");

// State to manage the toggling of orders
let isOrderHistoryExpanded = false;

// Navbar toggle for mobile
document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", function () {
            navLinks.classList.toggle("show");
            hamburger.innerHTML = navLinks.classList.contains("show") ? "✖" : "☰";
        });
    }

    // Check authentication state
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = "../auth/user/login.html";
            return;
        }

        // Fetch user data from Firestore
        db.collection("users").doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    // Update profile fields
                    profileName.textContent = userData.name || "Not available";
                    profileEmail.textContent = userData.email;
                    profilePhone.textContent = userData.phone || "Not provided";
                    profileRole.textContent = userData.role?.toUpperCase() || "USER";
                } else {
                    console.log("No user data found");
                    profileName.textContent = "Data not found";
                }
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
                profileName.textContent = "Error loading data";
                profileEmail.textContent = "Please refresh the page";
            });

        // Load initial order history (show 3 orders by default)
        loadOrderHistory(3);
    });

    // Logout functionality
    logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        auth.signOut()
            .then(() => {
                window.location.href = "../auth/user/login.html";
            })
            .catch(error => {
                console.error("Logout error:", error);
                alert("Error during logout. Please try again.");
            });
    });

});

document.addEventListener("DOMContentLoaded", function () {
    const viewAllOrdersBtn = document.getElementById("view-all-orders-btn");
    const showLessOrdersBtn = document.getElementById("show-less-orders-btn");

    if (viewAllOrdersBtn) {
        viewAllOrdersBtn.addEventListener("click", function () {
            loadOrderHistory(null); // Load all orders
            viewAllOrdersBtn.style.display = "none";
            showLessOrdersBtn.style.display = "block"; // Show "Show Less" button
        });
    }
});


function loadOrderHistory(limit = null) {
    const container = document.getElementById("order-cards-container");
    container.innerHTML = '<div class="loading-text">Loading orders...</div>';

    auth.onAuthStateChanged(user => {
        if (user) {
            let ordersRef = db.collection("orders")
                .where("userId", "==", user.uid)
                .orderBy("createdAt", "desc");

            if (limit) ordersRef = ordersRef.limit(limit);

            ordersRef.get().then(querySnapshot => {
                container.innerHTML = "";
                
                if (querySnapshot.empty) {
                    container.innerHTML = '<div class="loading-text">No orders found</div>';
                    return;
                }

                querySnapshot.forEach(doc => {
                    const order = doc.data();
                    const orderDate = order.createdAt?.toDate();
                    const orderCard = createOrderCard(order, orderDate);
                    container.appendChild(orderCard);
                });
            }).catch(error => {
                console.error("Error fetching orders:", error);
                container.innerHTML = '<div class="loading-text">Error loading orders</div>';
            });
        }
    });
}

function createOrderCard(order, orderDate) {
    const card = document.createElement("div");
    card.className = "order-card";

    const itemsList = order.cart.map(item => `
        <li class="order-item">
            <span class="item-name">${item.name}</span>
            <span class="item-qty">x${item.quantity}</span>
            <span class="item-price">₹${item.price * item.quantity}</span>
        </li>
    `).join("");

    card.innerHTML = `
        <div class="order-header">
            <div class="order-id">Order ID: ${order.orderId}</div>
            <div class="order-date">${orderDate.toLocaleDateString('en-IN', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</div>
        </div>
        <ul class="order-items">${itemsList}</ul>
        <div class="order-total">
            Total: ₹${order.totalAmount}
            <div style="font-size:0.9em;color:#666;margin-top:5px">
                Payment: ${order.paymentResponse.method || 'Online'}
            </div>
        </div>
    `;

    return card;
}

// Keep existing showLessOrders function
// Update the button toggle in your existing functions
function showLessOrders() {
    loadOrderHistory(3);
    document.getElementById("view-all-orders-btn").style.display = "flex";
    document.getElementById("show-less-orders-btn").style.display = "none";
}

// In your view all orders event listener
document.getElementById("view-all-orders-btn").addEventListener("click", function() {
    loadOrderHistory(null);
    this.style.display = "none";
    document.getElementById("show-less-orders-btn").style.display = "flex";
});
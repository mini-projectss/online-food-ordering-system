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
    orderList.innerHTML = "<li>Loading order history...</li>";

    auth.onAuthStateChanged(user => {
        if (user) {
            let ordersRef = db.collection("users").doc(user.uid).collection("orders")
                .orderBy("createdAt", "desc");

            // If a limit is set, apply it
            if (limit !== null) {
                ordersRef = ordersRef.limit(limit);
            }

            ordersRef.get()
                .then(querySnapshot => {
                    orderList.innerHTML = ""; // Clear existing list
                    if (querySnapshot.empty) {
                        orderList.innerHTML = "<li>No orders found</li>";
                        return;
                    }

                    querySnapshot.forEach(doc => {
                        const order = doc.data();
                        const li = document.createElement("li");
                        li.innerHTML = `
                            <strong>Order ID:</strong> ${order.orderId}<br>
                            <strong>Date:</strong> ${new Date(order.createdAt?.toDate()).toLocaleString()}<br>
                            <strong>Total Items:</strong> ${order.cart?.length || 0}
                        `;
                        orderList.appendChild(li);
                    });
                })
                .catch(error => {
                    console.error("Error fetching orders:", error);
                    orderList.innerHTML = "<li>Error loading orders</li>";
                });
        }
    });
}
function showLessOrders() {
    loadOrderHistory(3); // Load only 3 orders
    document.getElementById("view-all-orders-btn").style.display = "block";
    document.getElementById("show-less-orders-btn").style.display = "none";
}
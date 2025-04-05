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

document.addEventListener("DOMContentLoaded", function () {
    // Profile elements
    const profileName = document.getElementById("profile-name");
    const profileEmail = document.getElementById("profile-email");
    const profilePhone = document.getElementById("profile-phone");
    const profileRole = document.getElementById("profile-role");
    const logoutBtn = document.getElementById("logout");

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

    // Initialize order history
    const orderList = document.getElementById("order-history");
    orderList.innerHTML = "<li>Loading order history...</li>";

    // Fetch order history from Firestore
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection("users").doc(user.uid).collection("orders")
                .orderBy("createdAt", "desc")
                .get()
                .then(querySnapshot => {
                    orderList.innerHTML = "";
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
});
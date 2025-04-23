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
  
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const profilePhone = document.getElementById("profile-phone");
  const profileRole = document.getElementById("profile-role");
  const profileJoined = document.getElementById("profile-joined");
  const logoutBtn = document.getElementById("logout");
  const orderList = document.getElementById("order-history");
  const expandOrdersBtn = document.getElementById("expand-orders-btn");
  let isOrderHistoryExpanded = false;
  
  document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
  
    if (hamburger && navLinks) {
      hamburger.addEventListener("click", function () {
        navLinks.classList.toggle("show");
        hamburger.innerHTML = navLinks.classList.contains("show") ? "✖" : "☰";
      });
    }
  
    auth.onAuthStateChanged(user => {
      if (!user) {
        window.location.href = "../auth/user/login.html";
        return;
      }
  
      db.collection("users").doc(user.uid).get()
        .then(doc => {
          if (doc.exists) {
            const userData = doc.data();
            profileName.textContent = userData.name || "Not available";
            profileEmail.textContent = userData.email;
            profilePhone.textContent = userData.phone || "Not provided";
            profileRole.textContent = userData.collegeID || userData.id || "Not available";
            profileJoined.textContent = userData.createdAt
              ? "Joined at: " + userData.createdAt.toDate().toLocaleString()
              : "Joined at: Not available";
          } else {
            profileName.textContent = "Data not found";
          }
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
          profileName.textContent = "Error loading data";
          profileEmail.textContent = "Please refresh the page";
        });
  
      loadOrderHistory(3);
    });
  
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      auth.signOut().then(() => {
        window.location.href = "../auth/user/login.html";
      }).catch(error => {
        console.error("Logout error:", error);
        alert("Error during logout. Please try again.");
      });
    });
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
        <div class="order-date">${orderDate.toLocaleString()}</div>
      </div>
      <ul class="order-items">${itemsList}</ul>
      <div class="order-total">
        Total: ₹${order.totalAmount || 0}
        <div style="font-size:0.9em;color:#666;margin-top:5px">
          Payment: ${order.paymentResponse?.method || 'Online'}<br>
          Status: <strong>${order.status}</strong>
        </div>
      </div>
    `;
  
    return card;
  }
  
  function showLessOrders() {
    loadOrderHistory(3);
    document.getElementById("view-all-orders-btn").style.display = "flex";
    document.getElementById("show-less-orders-btn").style.display = "none";
  }
  
  document.getElementById("view-all-orders-btn").addEventListener("click", function () {
    loadOrderHistory(null);
    this.style.display = "none";
    document.getElementById("show-less-orders-btn").style.display = "flex";
  });
  
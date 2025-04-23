// dashboard.js

firebase.initializeApp({
  apiKey: "AIzaSyAiJplG7u_x_ijhxC9AD9F2JPYoU0k2Lnk",
  authDomain: "online-cateen-ordeing.firebaseapp.com",
  projectId: "online-cateen-ordeing",
});

const db = firebase.firestore();
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", () => {
  populateMonthYear("rev-month", "rev-year");
  populateMonthYear("history-month", "history-year");

  countStudents();
  countActiveOrders();
  calculateTodayRevenue();
  calculateThisMonthRevenue();
});

function countStudents() {
  db.collection("users").where("role", "==", "student").get()
      .then(snapshot => {
          document.getElementById("student-count").querySelector("p").textContent = snapshot.size;
      });
}

function countActiveOrders() {
  db.collection("orders").where("status", "==", "processing").get()
      .then(snapshot => {
          document.getElementById("active-orders").querySelector("p").textContent = snapshot.size;
      });
}

function calculateTodayRevenue() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  db.collection("orders").where("createdAt", ">=", firebase.firestore.Timestamp.fromDate(start)).get()
      .then(snapshot => {
          let total = 0;
          snapshot.forEach(doc => {
              const order = doc.data();
              if (order.totalAmount) total += order.totalAmount;
          });
          document.getElementById("revenue-today").querySelector("p").textContent = "₹" + total;
      });
}

function calculateThisMonthRevenue() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  db.collection("orders").where("createdAt", ">=", firebase.firestore.Timestamp.fromDate(start)).get()
      .then(snapshot => {
          let total = 0;
          snapshot.forEach(doc => {
              const order = doc.data();
              if (order.totalAmount) total += order.totalAmount;
          });
          document.getElementById("revenue-month").querySelector("p").textContent = "₹" + total;
      });
}

function fetchMonthlyRevenue() {
  const month = document.getElementById("rev-month").value;
  const year = document.getElementById("rev-year").value;
  const start = new Date(year, month, 1);
  const end = new Date(year, parseInt(month) + 1, 1);

  db.collection("orders")
      .where("createdAt", ">=", firebase.firestore.Timestamp.fromDate(start))
      .where("createdAt", "<", firebase.firestore.Timestamp.fromDate(end))
      .get()
      .then(snapshot => {
          let total = 0;
          snapshot.forEach(doc => {
              const order = doc.data();
              if (order.totalAmount) total += order.totalAmount;
          });
          document.getElementById("revenue-result").textContent = `Revenue: ₹${total}`;
      });
}

function fetchOrderHistory() {
  const month = document.getElementById("history-month").value;
  const year = document.getElementById("history-year").value;
  const start = new Date(year, month, 1);
  const end = new Date(year, parseInt(month) + 1, 1);

  const container = document.getElementById("order-cards-container");
  container.innerHTML = '<div class="loading-text">Loading...</div>';

  db.collection("orders")
      .where("createdAt", ">=", firebase.firestore.Timestamp.fromDate(start))
      .where("createdAt", "<", firebase.firestore.Timestamp.fromDate(end))
      .orderBy("createdAt", "desc")
      .get()
      .then(snapshot => {
          container.innerHTML = "";
          if (snapshot.empty) {
              container.innerHTML = '<div class="loading-text">No orders found.</div>';
              return;
          }
          snapshot.forEach(doc => {
              const order = doc.data();
              const orderDate = order.createdAt?.toDate();
              const card = createOrderCard(order, orderDate);
              container.appendChild(card);
          });

          // Change the button text to "Show Less"
          const viewOrdersBtn = document.getElementById("view-orders-btn");
          viewOrdersBtn.textContent = "Show Less";
          viewOrdersBtn.setAttribute("onclick", "hideOrderHistory()");
      });
}

function hideOrderHistory() {
  const container = document.getElementById("order-cards-container");
  container.innerHTML = '<div class="loading-text">Orders will appear here...</div>';

  // Change the button text back to "View Orders"
  const viewOrdersBtn = document.getElementById("view-orders-btn");
  viewOrdersBtn.textContent = "View Orders";
  viewOrdersBtn.setAttribute("onclick", "fetchOrderHistory()");
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
          Total: ₹${order.totalAmount || 0}<br/>
          <small>By: ${order.userId}</small><br/>
          <small>Payment: ${order.paymentResponse?.method || 'Online'}</small>
      </div>
  `;

  return card;
}

function populateMonthYear(monthId, yearId) {
  const monthSelect = document.getElementById(monthId);
  const yearSelect = document.getElementById(yearId);
  const now = new Date();

  for (let m = 0; m < 12; m++) {
      const option = document.createElement("option");
      option.value = m;
      option.textContent = new Date(0, m).toLocaleString('default', { month: 'long' });
      monthSelect.appendChild(option);
  }
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) {
      const option = document.createElement("option");
      option.value = y;
      option.textContent = y;
      yearSelect.appendChild(option);
  }

  monthSelect.value = now.getMonth();
  yearSelect.value = now.getFullYear();
}

// Firebase config
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
  const db = firebase.firestore();
  
  // Menu Items Array (for most ordered items)
  const menuItems = [
    { name: "Vada Pav", price: 15, image: "../assests/images/menu-items/vada-pav-9.jpg" },
    { name: "Samosa Pav", price: 17, image: "../assests/images/menu-items/samosa pav.jpg" },
    { name: "Misal pav", price: 40, image: "../assests/images/menu-items/misal pav.jpg" },
    { name: "Biryani", price: 100, image: "../assests/images/menu-items/chickenbiryani.webp" },
    { name: "Veg Fried Rice", price: 50, image: "../assests/images/menu-items/Vegetable-Fried-Rice-2-3.jpg" },
    { name: "Schezwan Noodels", price: 50, image: "../assests/images/menu-items/veg noodels.jpg" },
    { name: "Puri Bhaji", price: 50, image: "../assests/images/menu-items/puri.avif" },
    { name: "Dal Rice", price: 50, image: "../assests/images/menu-items/dal chawal.jpg" },
    { name: "Dal Khichdi", price: 80, image: "../assests/images/menu-items/dalkhichdi.jpg" },
    { name: "Chicken Schezwan Fried Rice", price: 60, image: "../assests/images/menu-items/chick fried rice.avif" },
    { name: "Chicken Schezwan Noodles", price: 60, image: "../assests/images/menu-items/chicken noodels.jpg" },
    { name: "Masala Dosa", price: 50, image: "../assests/images/menu-items/masala_dosa_1.webp" },
    { name: "Veg Thali", price: 80, image: "../assests/images/menu-items/veg thali.jpg" },
    { name: "Chapati Sabji", price: 50, image: "../assests/images/menu-items/chapati.avif" },
    { name: "Egg Bhurji Chapati", price: 60, image: "../assests/images/menu-items/egg chapati.jpg" },
    { name: "Dahi Samosa", price: 20, image: "../assests/images/menu-items/dahi samosa.webp" },
    { name: "Coffee", price: 15, image: "../assests/images/menu-items/coffee.jpg" },
    { name: "Tea", price: 10, image: "../assests/images/menu-items/tea.webp" },
    { name: "Smoodh", price: 10, image: "../assests/images/menu-items/soomdh.jpg" },
    { name: "Pepsi", price: 20, image: "../assests/images/menu-items/pepsi.jpeg" }
  ];
  
  // Load dashboard data
  loadStudentCount();
  loadActiveOrders();
  loadRevenueToday();
  loadRevenueThisMonth();
  populateMonthYearSelectors();
  
  function loadStudentCount() {
    db.collection("users").where("role", "==", "student").get().then(snapshot => {
      document.getElementById("student-count").querySelector("p").textContent = snapshot.size;
    });
  }
  
  function loadActiveOrders() {
    db.collection("orders").where("status", "==", "processing").get().then(snapshot => {
      document.getElementById("active-orders").querySelector("p").textContent = snapshot.size;
    });
  }
  
  function loadRevenueToday() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
    db.collection("orders")
      .where("status", "==", "finished")
      .where("createdAt", ">=", start)
      .where("createdAt", "<", end)
      .get().then(snapshot => {
        let total = 0;
        snapshot.forEach(doc => {
          const order = doc.data();
          if (order.totalAmount) total += order.totalAmount;
        });
        document.getElementById("revenue-today").querySelector("p").textContent = `₹${total}`;
      });
  }
  
  function loadRevenueThisMonth() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
    db.collection("orders")
      .where("status", "==", "finished")
      .where("createdAt", ">=", start)
      .where("createdAt", "<", end)
      .get().then(snapshot => {
        let total = 0;
        snapshot.forEach(doc => {
          const order = doc.data();
          if (order.totalAmount) total += order.totalAmount;
        });
        document.getElementById("revenue-month").querySelector("p").textContent = `₹${total}`;
      });
  }
  
  function populateMonthYearSelectors() {
    const monthSelectors = ["rev-month", "history-month"];
    const yearSelectors = ["rev-year", "history-year"];
  
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = new Date(2000, i).toLocaleString('default', { month: 'long' });
      monthSelectors.forEach(id => document.getElementById(id).appendChild(option.cloneNode(true)));
    }
  
    for (let year = now.getFullYear(); year >= 2022; year--) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelectors.forEach(id => document.getElementById(id).appendChild(option.cloneNode(true)));
    }
  }
  
  function fetchMonthlyRevenue() {
    const month = parseInt(document.getElementById("rev-month").value);
    const year = parseInt(document.getElementById("rev-year").value);
    const result = document.getElementById("revenue-result");
  
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
  
    db.collection("orders")
      .where("status", "==", "finished")
      .where("createdAt", ">=", start)
      .where("createdAt", "<", end)
      .get().then(snapshot => {
        let total = 0;
        snapshot.forEach(doc => {
          const order = doc.data();
          if (order.totalAmount) total += order.totalAmount;
        });
        result.textContent = `Revenue for ${start.toLocaleString('default', { month: 'long' })} ${year}: ₹${total}`;
      });
  }
  
  function fetchOrderHistory() {
    const month = parseInt(document.getElementById("history-month").value);
    const year = parseInt(document.getElementById("history-year").value);
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    const container = document.getElementById("order-cards-container");
    const statsContainer = document.getElementById("most-ordered-items");
  
    container.innerHTML = '<div class="loading-text">Loading orders...</div>';
    statsContainer.innerHTML = '<div class="loading-text">Calculating popular items...</div>';
  
    db.collection("orders")
      .where("createdAt", ">=", start)
      .where("createdAt", "<", end)
      .orderBy("createdAt", "desc")
      .get().then(snapshot => {
        container.innerHTML = "";
        const itemCounts = {};
        const userNameCache = {};
  
        if (snapshot.empty) {
          container.innerHTML = '<div class="loading-text">No orders found</div>';
          statsContainer.innerHTML = '<div class="loading-text">No items found</div>';
          return;
        }
  
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        orders.forEach(order => {
          const orderDate = order.createdAt?.toDate();
          container.appendChild(createOrderCard(order, orderDate));
  
          // Only count finished orders for stats
          if (order.status === "finished") {
            order.cart.forEach(item => {
              if (!itemCounts[item.name]) itemCounts[item.name] = 0;
              itemCounts[item.name] += item.quantity;
            });
          }
        });
  
        // Build most ordered items card
        statsContainer.innerHTML = "";
        Object.entries(itemCounts).forEach(([name, count]) => {
          const item = menuItems.find(m => m.name === name);
          if (item) {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
              <img src="${item.image}" alt="${name}" />
              <h4>${name}</h4>
              <p>Ordered ${count} times</p>
            `;
            statsContainer.appendChild(div);
          }
        });
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
        <div class="order-date">
          ${orderDate.toLocaleDateString('en-IN', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}
          <br><small>By: ${order.userName || "Unknown"}</small>
        </div>
      </div>
      <ul class="order-items">${itemsList}</ul>
      <div class="order-total">
        Total: ₹${order.totalAmount}
        <div style="font-size:0.9em;color:#666;margin-top:5px">
          Payment: ${order.paymentResponse?.method || 'Online'}
        </div>
        <div style="font-size:0.9em;color:#333;margin-top:5px">
          Status: <strong>${order.status}</strong>
        </div>
      </div>
    `;
    return card;
  }
  
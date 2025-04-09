// manage-order.js
const firebaseConfig = {
  apiKey: "AIzaSyAiJplG7u_x_ijhxC9AD9F2JPYoU0k2Lnk",
  authDomain: "online-cateen-ordeing.firebaseapp.com",
  projectId: "online-cateen-ordeing",
  storageBucket: "online-cateen-ordeing.firebasestorage.app",
  messagingSenderId: "1088334175531",
  appId: "1:1088334175531:web:586611bcf1bbba05f5f96e",
  measurementId: "G-BL8BCFH88B"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Global variables to store order data and filtering state
let orders = [];
let currentFilter = "processing"; // default filter
let criticalOrders = 0;

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = '../auth/admin/login.html';
    return;
  }
  initListeners();
});

// Listen for orders having status processing, serve, or finished
function initListeners() {
  db.collection("orders")
    .where("status", "in", ["processing", "serve", "finished"])
    .onSnapshot(handleOrderUpdate);
}

// Process snapshot; rebuild orders array and update timers
function handleOrderUpdate(snapshot) {
  orders = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate()
    };
  });
  
  const now = new Date();
  // Reset criticalOrders count
  criticalOrders = 0;
  orders.forEach(order => {
    const elapsed = Math.floor((now - order.createdAt) / 1000);
    order.timer = 420 - elapsed; // 7-minute timer
    if (order.timer < 180) {
      criticalOrders++;
    }
    order.cart = order.cart.map(item => {
      if (typeof item.ready === "undefined") {
        item.ready = false;
      }
      return item;
    });
  });
  
  updateIndicators();
  renderOrders();
}

// Render orders based on current filter; adapt footer controls per filter
function renderOrders() {
  const grid = document.getElementById("ordersGrid");
  grid.innerHTML = "";
  
  // Filter orders by current status
  let filteredOrders = orders.filter(order => {
    if (currentFilter === "processing") {
      return order.status === "processing";
    } else if (currentFilter === "serve") {
      return order.status === "serve";
    } else if (currentFilter === "finished") {
      return order.status === "finished";
    } else if (currentFilter === "pinned") {
      return order.pinned;
    }
    return true;
  });
  
  // ***** NEW: Only load today's orders when filter is "serve" or "finished" *****
  if (currentFilter === "serve" || currentFilter === "finished") {
    const todayStr = new Date().toLocaleDateString();
    filteredOrders = filteredOrders.filter(order => {
      return order.createdAt.toLocaleDateString() === todayStr;
    });
  }
  
  filteredOrders.sort((a, b) => b.timer - a.timer);
  
  if (filteredOrders.length === 0) {
    grid.innerHTML = `<div class="loading-text">No orders to display.</div>`;
    return;
  }
  
  // Determine footer mode:
  // interactive mode: processing or pinned filter – show tick, pin, info & serve buttons.
  // serve mode: show only info button.
  // finished: no footer.
  const interactive = (currentFilter === "processing" || currentFilter === "pinned");
  const showInfoOnly = currentFilter === "serve";
  
  filteredOrders.forEach(order => {
    const card = document.createElement("div");
    card.className = `order-card ${getTimerColor(order.timer)}`;
    
    let cardHTML = `
      <div class="order-header">
        <div class="order-id">${order.orderId || order.id}</div>
        <div class="timer" data-order-id="${order.id}">${formatTime(order.timer)}</div>
      </div>
      <ul class="order-items">
        ${order.cart.map((item, index) => `
          <li class="item-row">
            <div>
              <span class="item-quantity">${item.quantity}x</span>
              ${item.name}
            </div>
            ${interactive ? `<input type="checkbox" class="item-checkbox" onchange="updateItemReady('${order.id}', ${index}, this.checked)" ${item.ready ? "checked" : ""}>` : ``}
          </li>
        `).join("")}
      </ul>`;
      
    // Add footer based on mode
    if (interactive) {
      cardHTML += `
      <div class="order-footer">
        <button class="action-btn pin-btn" onclick="togglePin('${order.id}')">
          <i class="fas fa-thumbtack"></i>
        </button>
        <button class="action-btn info-btn" onclick="showInfo('${order.id}')">
          <i class="fas fa-info"></i>
        </button>
        <button class="action-btn serve-btn" onclick="serveOrder('${order.id}')">
          Serve
        </button>
      </div>`;
    } else if (showInfoOnly) {
      cardHTML += `
      <div class="order-footer">
        <button class="action-btn info-btn" onclick="showInfo('${order.id}')">
          <i class="fas fa-info"></i>
        </button>
      </div>`;
    }
    card.innerHTML = cardHTML;
    grid.appendChild(card);
  });
}

// Update a cart item's "ready" state in Firestore when checkbox is toggled
async function updateItemReady(orderId, index, readyState) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const updatedCart = order.cart.map((item, idx) => {
    if (idx === index) {
      return { ...item, ready: readyState };
    }
    return item;
  });
  
  await db.collection("orders").doc(orderId).update({
    cart: updatedCart
  });
}

// Format seconds into MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Get timer color (green: new, yellow: due soon, red: critical)
// ***** For indicators only count active orders (processing) *****
function getTimerColor(seconds) {
  if (seconds > 300) return "green";
  if (seconds > 180) return "yellow";
  return "red";
}

// Toggle the pinned state of an order
async function togglePin(orderId) {
  const order = orders.find(o => o.id === orderId);
  const newPinnedState = order ? !order.pinned : true;
  await db.collection("orders").doc(orderId).update({
    pinned: newPinnedState
  });
}

// Mark an order as served by updating its status and timestamp
async function serveOrder(orderId) {
  await db.collection("orders").doc(orderId).update({
    status: "serve",
    servedAt: new Date()
  });
}

// Show order information including user name (fetched from "users" collection)
async function showInfo(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  let userName = "N/A";
  if (order.userId) {
    try {
      const userDoc = await db.collection("users").doc(order.userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        userName = userData.name || userName;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
  alert(`Order Info:
ID: ${order.orderId || order.id}
Placed at: ${order.createdAt}
User: ${userName}`);
}

// Update sidebar counts and indicator cards
function updateIndicators() {
  // Sidebar counts (all orders regardless of creation date)
  document.getElementById("activeCount").textContent = orders.filter(o => o.status === 'processing').length;
  document.getElementById("serveCount").textContent = orders.filter(o => o.status === 'serve').length;
  document.getElementById("finishedCount").textContent = orders.filter(o => o.status === 'finished').length;
  document.getElementById("pinnedCount").textContent = orders.filter(o => o.pinned).length;
  
  // Indicators: Only count "active" orders (status processing)
  const activeOrders = orders.filter(o => o.status === "processing");
  const newOrdersCount = activeOrders.filter(o => o.timer > 300).length;
  const dueSoonCount = activeOrders.filter(o => o.timer <= 300 && o.timer > 180).length;
  const criticalCount = activeOrders.filter(o => o.timer <= 180).length;
  
  document.getElementById("newOrdersIndicator").textContent = newOrdersCount;
  document.getElementById("dueSoonIndicator").textContent = dueSoonCount;
  document.getElementById("criticalIndicator").textContent = criticalCount;
}

// Listen for filter button clicks and update timer every second
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.status;
      renderOrders();
    });
  });
  
  setInterval(() => {
    const now = new Date();
    orders.forEach(order => {
      const elapsed = Math.floor((now - order.createdAt) / 1000);
      order.timer = 420 - elapsed;
    });
    updateIndicators();
    renderOrders();
  }, 1000);
});

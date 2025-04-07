// Firebase Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch Orders
async function fetchOrders() {
  const ordersTableBody = document.getElementById("ordersTableBody");
  ordersTableBody.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "orders"));

    querySnapshot.forEach((docSnap) => {
      const orderData = docSnap.data();
      const orderId = docSnap.id;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${orderId}</td>
        <td>${orderData.userEmail || "N/A"}</td>
        <td>${orderData.items.map(item => `${item.name} x${item.quantity}`).join("<br>")}</td>
        <td>₹${orderData.totalAmount}</td>
        <td>${orderData.paymentType}</td>
        <td>${orderData.orderStatus}</td>
        <td>
          <select data-id="${orderId}">
            <option value="Pending" ${orderData.orderStatus === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Preparing" ${orderData.orderStatus === "Preparing" ? "selected" : ""}>Preparing</option>
            <option value="Ready" ${orderData.orderStatus === "Ready" ? "selected" : ""}>Ready</option>
            <option value="Delivered" ${orderData.orderStatus === "Delivered" ? "selected" : ""}>Delivered</option>
            <option value="Cancelled" ${orderData.orderStatus === "Cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </td>
      `;

      ordersTableBody.appendChild(row);
    });

    // Add event listeners to dropdowns
    document.querySelectorAll("select").forEach((dropdown) => {
      dropdown.addEventListener("change", async (e) => {
        const newStatus = e.target.value;
        const orderId = e.target.getAttribute("data-id");

        await updateOrderStatus(orderId, newStatus);
      });
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}

// Update Order Status
async function updateOrderStatus(orderId, newStatus) {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      orderStatus: newStatus,
    });
    alert("Order status updated successfully!");
    fetchOrders(); // Refresh the table
  } catch (error) {
    console.error("Error updating order status:", error);
  }
}

// Initial fetch
fetchOrders();

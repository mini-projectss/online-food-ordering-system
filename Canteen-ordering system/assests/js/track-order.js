document.addEventListener("DOMContentLoaded", function () {
    auth.onAuthStateChanged(function (user) {
      if (!user) {
        window.location.href = "../auth/user/login.html";
        return;
      }
  
      const ordersContainer = document.getElementById("orders-container");
      ordersContainer.innerHTML = `
        <div class="orders-list">
          <div id="orders-content" style="padding: 10px;"></div>
        </div>
        <p id="no-orders" style="text-align: center; display: none;">No recent orders found</p>
      `;
  
      const ordersContent = document.getElementById("orders-content");
      const noOrdersMessage = document.getElementById("no-orders");
  
      db.collection("orders")
        .where("userId", "==", user.uid)
        .orderBy("createdAt", "desc")
        .onSnapshot(function (snapshot) {
          ordersContent.innerHTML = "";
  
          if (snapshot.empty) {
            noOrdersMessage.style.display = "block";
            return;
          } else {
            noOrdersMessage.style.display = "none";
          }
  
          snapshot.forEach((doc) => {
            const order = doc.data();
            order.id = doc.id;
            if (order.status === "cancelled" || order.status === "finished") return;
            const orderElement = createOrderElement(order);
            ordersContent.appendChild(orderElement);
          });
        });
    });
  });
  
  function createOrderElement(order) {
    const element = document.createElement("div");
    element.className = "order-card";
  
    const orderDate = order.createdAt?.toDate() || new Date();
    const now = new Date();
    const timeDiffMinutes = Math.floor((now - orderDate) / 60000);
    const canCancel = timeDiffMinutes <= 2 && order.status === "processing";
  
    const scheduledTime = order.scheduleTime
      ? new Date(order.scheduleTime).toLocaleString()
      : null;
  
    const itemsHTML = order.cart.map((item) => `
      <p>${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}</p>
    `).join("");
  
    element.innerHTML = `
      <h3>Order ID: ${order.orderId || order.id}</h3>
      <p><strong>Placed on:</strong> ${orderDate.toLocaleString()}</p>
      ${scheduledTime ? `<p><strong>Scheduled for:</strong> ${scheduledTime}</p>` : ""}
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Type:</strong> ${order.orderType || "instant"}</p>
      <p><strong>Total:</strong> ₹${order.totalAmount || 0}</p>
      <p><strong>Payment:</strong> ${getPaymentStatus(order)}</p>
      <div class="order-items">
        <h4>Items:</h4>
        ${itemsHTML}
      </div>
      <button class="pickup-btn" onclick="pickUpOrder('${order.id}')" ${order.status === "serve" ? "" : "disabled"}>Picked Up</button>
      <button class="cancel-btn" onclick="cancelOrder('${order.id}')" ${canCancel ? "" : "disabled"}>Cancel</button>
    `;
  
    return element;
  }
  
  function getPaymentStatus(order) {
    if (order.paymentResponse?.method === "Cash on Delivery") {
      return "Cash on Delivery (Pending)";
    } else if (order.paymentResponse?.razorpay_payment_id) {
      return "Paid Online";
    }
    return "Payment status unknown";
  }
  
  function pickUpOrder(orderId) {
    db.collection("orders").doc(orderId).update({
      status: "finished",
      finishedAt: new Date(),
    }).then(() => {
      alert("Thank you! Your order has been marked as picked up.");
    }).catch((error) => {
      console.error("Error updating order status:", error);
      alert("There was an error updating your order. Please try again.");
    });
  }
  
  function cancelOrder(orderId) {
    db.collection("orders").doc(orderId).update({
      status: "cancelled",
      cancelledAt: new Date(),
    }).then(() => {
      alert("Your order has been cancelled successfully.");
    }).catch((error) => {
      console.error("Error cancelling order:", error);
      alert("There was an error cancelling your order. Please try again.");
    });
  }
  
document.addEventListener("DOMContentLoaded", function () {
    auth.onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = '../auth/user/login.html';
            return;
        }

        // Calculate timestamp for 7 minutes ago (instead of 5 minutes)
        const sevenMinutesAgo = firebase.firestore.Timestamp.fromDate(
            new Date(Date.now() - 7 * 60 * 1000)
        );

        const ordersContainer = document.getElementById("orders-container");
        ordersContainer.innerHTML = `
            <div class="orders-list">
                <div id="orders-content" style="padding: 10px;"></div>
            </div>
            <p id="no-orders" style="text-align: center; display: none;">No recent orders found</p>
        `;

        // Query orders from last 7 minutes
        const ordersQuery = db.collection("orders")
            .where("userId", "==", user.uid)
            .where("createdAt", ">=", sevenMinutesAgo)
            .orderBy("createdAt", "desc");

        const unsubscribe = ordersQuery.onSnapshot(function(snapshot) {
            const ordersContent = document.getElementById("orders-content");
            const noOrdersMessage = document.getElementById("no-orders");
            
            // Clear existing orders
            ordersContent.innerHTML = "";
            
            if (snapshot.empty) {
                noOrdersMessage.style.display = "block";
                return;
            } else {
                noOrdersMessage.style.display = "none";
            }

            snapshot.forEach(doc => {
                const order = doc.data();
                // Attach the document id so that we can reference it later
                order.id = doc.id;
                const orderElement = createOrderElement(order);
                ordersContent.appendChild(orderElement);

                // Calculate remaining time
                const createdAt = order.createdAt.toDate();
                const expirationTime = createdAt.getTime() + 7 * 60 * 1000; // 7 minutes window
                const timeRemaining = expirationTime - Date.now();

                if (timeRemaining > 0) {
                    setTimeout(function() {
                        if (orderElement.parentNode) {
                            orderElement.remove();
                            if (ordersContent.children.length === 0) {
                                noOrdersMessage.style.display = "block";
                            }
                        }
                    }, timeRemaining);
                } else {
                    orderElement.remove();
                }
            });
        }, function(error) {
            console.error("Error fetching orders:", error);
        });

        window.addEventListener('beforeunload', function () {
            unsubscribe();
        });
    });

    function createOrderElement(order) {
        const element = document.createElement("div");
        element.className = "order-card";
        
        // Format the date
        const orderDate = order.createdAt?.toDate 
            ? order.createdAt.toDate().toLocaleString() 
            : new Date().toLocaleString();
        
        // Format scheduled time if exists
        const scheduledTime = order.scheduleTime 
            ? new Date(order.scheduleTime).toLocaleString() 
            : null;
        
        // Determine if button should be active (if status is "serve") or disabled
        let pickupButtonHTML = "";
        if (order.status === "serve") {
            pickupButtonHTML = `<button class="pickup-btn" onclick="pickUpOrder('${order.id}')">Picked Up</button>`;
        } else {
            // Alternatively, you could choose not to show the button at all; here it’s shown as disabled.
            pickupButtonHTML = `<button class="pickup-btn" disabled>Picked Up</button>`;
        }
    
        element.innerHTML = `
            <h3>Order ID: ${order.orderId || order.id}</h3>
            <p><strong>Placed on:</strong> ${orderDate}</p>
            ${scheduledTime ? `<p><strong>Scheduled for:</strong> ${scheduledTime}</p>` : ''}
            <p><strong>Status:</strong> ${order.status || 'processing'}</p>
            <p><strong>Type:</strong> ${order.orderType || 'instant'}</p>
            <p><strong>Total:</strong> ₹${order.totalAmount || '0'}</p>
            <p><strong>Payment:</strong> ${getPaymentStatus(order)}</p>
            <div class="order-items">
                <h4>Items:</h4>
                ${order.cart.map(item => `
                    <p>${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}</p>
                `).join('')}
            </div>
            ${pickupButtonHTML}
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
});

// Global function to update order status to "finished" when "Picked Up" is clicked
function pickUpOrder(orderId) {
    db.collection("orders").doc(orderId).update({
        status: "finished",
        finishedAt: new Date()
    }).then(() => {
        alert("Thank you! Your order has been marked as picked up.");
    }).catch(error => {
        console.error("Error updating order status:", error);
        alert("There was an error updating your order. Please try again.");
    });
}

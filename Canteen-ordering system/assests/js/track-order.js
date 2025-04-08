document.addEventListener("DOMContentLoaded", function () {
    auth.onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = '../auth/user/login.html';
            return;
        }

        // Calculate timestamp for 5 minutes ago
        const fiveMinutesAgo = firebase.firestore.Timestamp.fromDate(
            new Date(Date.now() - 5 * 60 * 1000)
        );

        const ordersContainer = document.getElementById("orders-container");
        ordersContainer.innerHTML = `
            <div class="orders-list">
                <div id="orders-content" style="padding: 10px;"></div>
            </div>
            <p id="no-orders" style="text-align: center; display: none;">No recent orders found</p>
        `;

        // Query orders from last 5 minutes
        const ordersQuery = db.collection("orders")
            .where("userId", "==", user.uid)
            .where("createdAt", ">=", fiveMinutesAgo)
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
                const orderElement = createOrderElement(order);
                ordersContent.appendChild(orderElement);

                // Calculate remaining time
                const createdAt = order.createdAt.toDate();
                const expirationTime = createdAt.getTime() + 300000; // 5 minutes
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
    
        element.innerHTML = `
            <h3>Order ID: ${order.orderId}</h3>
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

document.addEventListener("DOMContentLoaded", function () {
    // Fetch student info from localStorage (or use defaults)
    const studentUsername = localStorage.getItem("studentUsername") || "";
    const studentId = localStorage.getItem("studentId") || "";
    const studentEmail = localStorage.getItem("studentEmail") || "";
    const studentPhone = localStorage.getItem("studentPhone") || "";
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];

    // Get input fields & buttons
    const usernameInput = document.getElementById("username");
    const idInput = document.getElementById("student-id");
    const emailInput = document.getElementById("student-email");
    const phoneInput = document.getElementById("student-phone");
    const saveBtn = document.getElementById("save-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const orderList = document.getElementById("order-history");

    // Create a success message element
    const successMessage = document.createElement("div");
    successMessage.id = "success-message";
    Object.assign(successMessage.style, {
        display: "none",
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "10px 20px",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
    });
    document.body.appendChild(successMessage);

    // Load stored values into input fields
    usernameInput.value = studentUsername;
    idInput.value = studentId;
    emailInput.value = studentEmail;
    phoneInput.value = studentPhone;

    // Prevent typing non-numeric values in the phone number field
    phoneInput.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, ""); // Removes any non-numeric characters
    });

    // Save updated details with validation
    saveBtn.addEventListener("click", function () {
        const usernameValue = usernameInput.value.trim();
        const idValue = idInput.value.trim();
        const emailValue = emailInput.value.trim();
        const phoneValue = phoneInput.value.trim();

        // Check if any field is empty
        if (!usernameValue || !idValue || !emailValue || !phoneValue) {
            alert("⚠ Please fill in all fields before saving.");
            return;
        }

        // Email validation using a regex pattern
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(emailValue)) {
            alert("❌ Invalid email! Please enter a valid email address (e.g., example@gmail.com).");
            emailInput.focus();
            return;
        }

        // Phone validation: Ensure it's exactly 10 digits
        if (!/^\d{10}$/.test(phoneValue)) {
            alert("❌ Invalid phone number! Please enter a 10-digit number.");
            phoneInput.focus();
            return;
        }

        // Save data if validation passes
        localStorage.setItem("studentUsername", usernameValue);
        localStorage.setItem("studentId", idValue);
        localStorage.setItem("studentEmail", emailValue);
        localStorage.setItem("studentPhone", phoneValue);

        // Show success message
        successMessage.textContent = "✅ Profile saved successfully!";
        successMessage.style.display = "block";

        // Hide message after 3 seconds
        setTimeout(() => {
            successMessage.style.display = "none";
        }, 3000);
    });

    // Load order history
    orderList.innerHTML = ""; // Clear previous content
    if (Array.isArray(orderHistory) && orderHistory.length > 0) {
        orderHistory.forEach(order => {
            if (order?.name && order?.price && order?.quantity) {
                const li = document.createElement("li");
                li.textContent = `${order.name} - ₹${order.price} x ${order.quantity}`;
                orderList.appendChild(li);
            }
        });
    } else {
        orderList.innerHTML = "<li>No orders found.</li>";
    }

    // Logout functionality
    logoutBtn.addEventListener("click", function () {
        localStorage.clear(); // Clear all stored data
        alert("🔴 Logged out successfully!");
        window.location.href = "login.html"; // Redirect to login page
    });
});

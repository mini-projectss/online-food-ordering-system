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

const categories = {
    "All": menuItems,
    "Veg": menuItems.filter(item => ["Vada Pav", "Samosa Pav", "Misal Pav", "Veg Fried Rice","Schezwan Noodels", "Masala Dosa", "Veg Thali", "Dal Rice","Dal Khichdi", "Puri Bhaji", "Chapati Sabji","Dahi Samosa"].includes(item.name)),
    "Non-Veg": menuItems.filter(item => ["Biryani","Chicken Schezwan Fried Rice", "Chicken Schezwan Noodles", "Egg Bhurji Chapati"].includes(item.name)),
    "Beverages": menuItems.filter(item => ["Coffee", "Tea","Smoodh", "Pepsi"].includes(item.name)),
};

const menuContainer = document.querySelector(".menu-container");

// Load Menu Items
function loadMenuItems(category = "All") {
    menuContainer.innerHTML = "";
    categories[category].forEach(item => {
        const menuItem = document.createElement("div");
        menuItem.classList.add("menu-item");
        
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>₹${item.price}</p>
            <button onclick="addToCart('${item.name}', ${item.price})">Add to Cart</button>
        `;
        
        menuContainer.appendChild(menuItem);
    });
}

// Cart Functionality using localStorage
function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} added to cart!`);
}

// Search functionality
document.getElementById("search")?.addEventListener("input", function () {
    const searchValue = this.value.toLowerCase();
    document.querySelectorAll(".menu-item").forEach(item => {
        const name = item.querySelector("h3").textContent.toLowerCase();
        item.style.display = name.includes(searchValue) ? "block" : "none";
    });
});

// Navbar toggle for mobile
document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", function () {
            navLinks.classList.toggle("show");
            hamburger.innerHTML = navLinks.classList.contains("show") ? "✖" : "☰";
        });
    }
});

// Highlight active menu item
const currentPage = window.location.pathname.split("/").pop();
document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
    }
});

// Load menu items dynamically
document.addEventListener("DOMContentLoaded", function () {
    loadMenuItems();
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            loadMenuItems(this.dataset.category);
        });
    });
});

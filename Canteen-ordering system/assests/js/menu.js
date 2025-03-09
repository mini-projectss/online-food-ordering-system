const menuItems = [
    { name: "Pizza", price: 200, image: "../assests/images/menu-items/pizza.jpg" },
    { name: "Burger", price: 120, image: "../assests/images/menu-items/burger.png" },
    { name: "Pasta", price: 150, image: "../assests/images/menu-items/pasta1.jpeg" },
    { name: "Maggi", price: 100, image: "../assests/images/menu-items/maggi.webp" },
    { name: "Biryani", price: 200, image: "../assests/images/menu-items/chickenbiryani.webp" },
    { name: "Momo", price: 80, image: "../assests/images/menu-items/momos.jpeg" },
    { name: "FrenchFries", price: 90, image: "../assests/images/menu-items/FF.jpg" },
    { name: "Coffee", price: 80, image: "../assests/images/menu-items/coffee.jpg" },
    { name: "Milkshake", price: 90, image: "../assests/images/menu-items/milkshake.jpg" },
    { name: "Drinks", price: 50, image: "../assests/images/menu-items/drink.png" }
];

const categories = {
    "All": menuItems,
    "Veg": menuItems.filter(item => ["Pizza", "Pasta", "Maggi", "FrenchFries"].includes(item.name)),
    "Non-Veg": menuItems.filter(item => ["Burger","Biryani", "Momo"].includes(item.name)),
    "Beverages": menuItems.filter(item => ["Coffee", "Milkshake", "Drinks"].includes(item.name)),
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

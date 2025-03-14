/* user login */
// Student Login Form Submission

const firebaseConfig = {
  apiKey: "AIzaSyAiJplG7u_x_ijhxC9AD9F2JPYoU0k2Lnk",
  authDomain: "online-cateen-ordeing.firebaseapp.com",
  projectId: "online-cateen-ordeing",
  storageBucket: "online-cateen-ordeing.appspot.com",
  messagingSenderId: "1088334175531",
  appId: "1:1088334175531:web:586611bcf1bbba05f5f96e",
  measurementId: "G-BL8BCFH88B"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Logout Function
function logout() {
  auth.signOut().then(() => {
    window.location.href = '../auth/user/login.html'; // or admin/login.html
  }).catch((error) => {
    alert('Error logging out: ' + error.message);
  });
}

document.getElementById('student-login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.getElementById('student-email').value;
  const password = document.getElementById('student-password').value;

  // Simulate login validation
  if (email === "student@example.com" && password === "password") {
    alert("Login successful! Redirecting to the menu...");
    window.location.href = "../../student/menu.html"; // Redirect to menu page
  } else {
    alert("Invalid email or password. Please try again.");
  }
});

// admin login
// Admin Login Form Submission
document.getElementById('admin-login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  // Simulate login validation
  if (email === "admin@example.com" && password === "password") {
    alert("Login successful! Redirecting to the dashboard...");
    window.location.href = "../../admin/dashboard.html"; // Redirect to dashboard
  } else {
    alert("Invalid email or password. Please try again.");
  }
});

// Student Signup Form Submission
document.getElementById('student-signup-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('student-name').value;
  const email = document.getElementById('student-email').value;
  const password = document.getElementById('student-password').value;
  const confirmPassword = document.getElementById('student-confirm-password').value;

  // Validate password match
  if (password !== confirmPassword) {
    alert("Passwords do not match. Please try again.");
    return;
  }

  // Simulate signup process
  alert("Signup successful! Redirecting to the login page...");
  window.location.href = "login.html"; // Redirect to login page
});

// Admin Signup Form Submission
document.getElementById('admin-signup-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('admin-name').value;
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;
  const confirmPassword = document.getElementById('admin-confirm-password').value;

  // Validate password match
  if (password !== confirmPassword) {
    alert("Passwords do not match. Please try again.");
    return;
  }

  // Simulate signup process
  alert("Signup successful! Redirecting to the login page...");
  window.location.href = "login.html"; // Redirect to login page
});
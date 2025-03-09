/* user login */
// Student Login Form Submission
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
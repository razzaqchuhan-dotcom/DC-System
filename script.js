const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("loginMessage");

    if (username === "admin" && password === "1234") {
        window.location.assign("dashboard.html");
    } else {
        message.textContent = "Invalid Username or Password";
    }
});
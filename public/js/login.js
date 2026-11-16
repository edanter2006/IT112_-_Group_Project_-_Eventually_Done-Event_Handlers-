const authMsg = document.getElementById("authMsg");

function showAuthMessage(text, type = "info") {
    if (authMsg) {
        authMsg.innerHTML = `<div class="alert alert-${type} py-2 mb-3">${text}</div>`;
    }
}

// Check session on load
window.addEventListener("DOMContentLoaded", () => {
    const existingToken = localStorage.getItem("token");
    if (existingToken) {
        showAuthMessage("Active session found! Redirecting...", "warning");
        setTimeout(() => { window.location.href = "/dashboard.html"; }, 800);
    } else {
        showAuthMessage("System ready. Please sign in.", "secondary");
    }
});

async function executeLogin() {
    const emailField = document.getElementById("emailInput");
    const passwordField = document.getElementById("passwordInput");
    
    if (!emailField || !passwordField) return;

    const email = emailField.value.trim();
    const password = passwordField.value;

    if (!email || !password) {
        showAuthMessage("Please fill in both email and password.", "danger");
        return;
    }

    showAuthMessage("Connecting to server...", "info");

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            showAuthMessage(`Login Failed: ${data.message || "Invalid credentials"}`, "danger");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        showAuthMessage("Login successful! Redirecting...", "success");
        
        setTimeout(() => {
            window.location.href = "/dashboard.html";
        }, 800);

    } catch (err) {
        showAuthMessage(`Connection Error: ${err.message}`, "danger");
    }
}

// Attach listeners once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    const passwordInput = document.getElementById("passwordInput");
    const emailInput = document.getElementById("emailInput");

    if (loginBtn) loginBtn.addEventListener("click", executeLogin);
    if (passwordInput) {
        passwordInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") executeLogin();
        });
    }
    if (emailInput) {
        emailInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") executeLogin();
        });
    }
});
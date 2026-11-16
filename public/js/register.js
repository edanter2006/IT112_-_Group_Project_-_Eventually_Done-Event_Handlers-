const authMsg = document.getElementById("authMsg");

function showAuthMessage(text, type = "info") {
    if (authMsg) {
        authMsg.innerHTML = `<div class="alert alert-${type} py-2 mb-3">${text}</div>`;
    }
}

// System ready status on load
window.addEventListener("DOMContentLoaded", () => {
    showAuthMessage("Please fill out the form to register.", "secondary");
});

async function executeRegister() {
    const username = document.getElementById("usernameInput").value.trim();
    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passwordInput").value;
    const confirmPassword = document.getElementById("confirmPasswordInput").value;

    if (!username || !email || !password || !confirmPassword) {
        showAuthMessage("Please fill in all required fields.", "danger");
        return;
    }

    if (password !== confirmPassword) {
        showAuthMessage("Passwords do not match.", "danger");
        return;
    }

    showAuthMessage("Registering account...", "info");

    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, confirmPassword })
        });
        const data = await res.json();

        if (!res.ok) {
            showAuthMessage(`Registration Failed: ${data.error || data.message || "Unknown error"}`, "danger");
            return;
        }

        showAuthMessage("Registration successful! Redirecting to login...", "success");
        
        setTimeout(() => {
            window.location.href = "/";
        }, 1200);

    } catch (err) {
        showAuthMessage(`Connection Error: ${err.message}`, "danger");
    }
}

// Attach listeners once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const registerBtn = document.getElementById("registerBtn");
    const inputs = [
        document.getElementById("usernameInput"),
        document.getElementById("emailInput"),
        document.getElementById("passwordInput"),
        document.getElementById("confirmPasswordInput")
    ];

    if (registerBtn) {
        registerBtn.addEventListener("click", executeRegister);
    }

    inputs.forEach(input => {
        if (input) {
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") executeRegister();
            });
        }
    });
});
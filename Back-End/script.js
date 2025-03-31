// Make API_URL globally available
window.API_URL = "http://localhost:5000";

// Make functions globally available
window.checkLoginStatus = function() {
    const token = localStorage.getItem("token");
    console.log("Token found:", token); // Debugging log

    if (token) {
        console.log("User is logged in, showing To-Do list.");
        document.getElementById("auth").style.display = "none";
        document.getElementById("todo-container").style.display = "block";
        // Load tasks when showing todo container
        if (typeof loadTasks === 'function') {
            loadTasks();
        }
    } else {
        console.log("User NOT logged in, showing login page.");
        document.getElementById("auth").style.display = "block";
        document.getElementById("todo-container").style.display = "none";
    }
};

window.login = async function() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok && data.token) {
            localStorage.setItem("token", data.token);
            checkLoginStatus();
            alert("Login successful!");
        } else {
            alert(data.message || "Login failed");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please try again.");
    }
};

window.register = async function() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        alert(data.message);
    } catch (error) {
        console.error("Registration error:", error);
        alert("Registration failed. Please try again.");
    }
};

window.logout = function() {
    localStorage.removeItem("token");
    document.getElementById("tasklist").innerHTML = ""; // Clear tasks
    document.getElementById("taskinput").value = ""; // Clear input
    checkLoginStatus();
};

// Run when page loads
document.addEventListener("DOMContentLoaded", checkLoginStatus);

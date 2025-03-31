document.addEventListener("DOMContentLoaded", function () {
    // Only set up task-related event listeners
    const addTaskButton = document.getElementById("addtaskbutton");
    const taskInput = document.getElementById("taskinput");
    
    if (addTaskButton) {
        addTaskButton.addEventListener("click", addTask);
    }
    
    if (taskInput) {
        taskInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") addTask();
        });
    }

    // Only load tasks if we have a token
    const token = localStorage.getItem("token");
    if (token) {
        loadTasks();
    }
});

let isLoadingTasks = false; // Flag to prevent multiple simultaneous loads

async function loadTasks() {
    const token = localStorage.getItem("token");
    if (!token) {
        document.getElementById("tasklist").innerHTML = "";
        return;
    }

    // Prevent multiple simultaneous loads
    if (isLoadingTasks) {
        console.log("Task loading already in progress, skipping...");
        return;
    }

    isLoadingTasks = true;
    const taskList = document.getElementById("tasklist");
    
    try {
        // Show loading state
        taskList.innerHTML = "<div class='loading'>Loading tasks...</div>";
        
        const res = await fetch(`${window.API_URL}/tasks`, {
            method: "GET",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (res.ok) {
            const tasks = await res.json();
            // Clear loading state and display tasks
            taskList.innerHTML = "";
            displayTasks(tasks);
        } else {
            if (res.status === 401 || res.status === 403) {
                // Token is invalid or expired
                localStorage.removeItem("token");
                checkLoginStatus();
                alert("Session expired. Please login again.");
            } else {
                taskList.innerHTML = "<div class='error'>Failed to load tasks</div>";
                console.error("Failed to load tasks:", res.status);
            }
        }
    } catch (error) {
        console.error("Error loading tasks:", error);
        taskList.innerHTML = "<div class='error'>Failed to load tasks</div>";
    } finally {
        isLoadingTasks = false;
    }
}

// Add a debounced version of loadTasks for frequent calls
let loadTasksTimeout;
function debouncedLoadTasks() {
    clearTimeout(loadTasksTimeout);
    loadTasksTimeout = setTimeout(loadTasks, 300); // Wait 300ms before loading
}

function displayTasks(tasks) {
    const taskList = document.getElementById("tasklist");
    taskList.innerHTML = "";  
    tasks.forEach(task => {
        taskList.appendChild(createTaskItem(task.text, task._id));
    });
}

async function addTask() {
    const taskText = document.getElementById("taskinput").value.trim();
    if (!taskText) return alert("Enter a valid task");

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You need to log in first!");
        checkLoginStatus();
        return;
    }

    try {
        const res = await fetch(`${window.API_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text: taskText })
        });

        if (res.ok) {
            document.getElementById("taskinput").value = "";
            loadTasks();
        } else {
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                checkLoginStatus();
                alert("Session expired. Please login again.");
            } else {
                alert("Failed to add task");
            }
        }
    } catch (error) {
        console.error("Error adding task:", error);
        alert("Failed to add task");
    }
}

async function deleteTask(taskId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You need to log in first!");
        checkLoginStatus();
        return;
    }

    try {
        const res = await fetch(`${window.API_URL}/tasks/${taskId}`, {
            method: "DELETE",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (res.ok) {
            loadTasks();
        } else {
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                checkLoginStatus();
                alert("Session expired. Please login again.");
            } else {
                alert("Failed to delete task");
            }
        }
    } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task");
    }
}

async function editTask(taskId) {
    const taskItem = document.querySelector(`[data-id='${taskId}']`);
    if (!taskItem) return alert("Task not found!");

    const taskTextElement = taskItem.querySelector(".task-text");
    taskTextElement.contentEditable = "true";
    taskTextElement.focus();

    // Save when Enter key is pressed or input loses focus
    taskTextElement.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            taskTextElement.blur();
        }
    });

    taskTextElement.addEventListener("blur", () => saveEdit(taskId, taskTextElement));
}

async function saveEdit(taskId, taskTextElement) {
    const newText = taskTextElement.innerText.trim();
    if (!newText) return alert("Task cannot be empty!");

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You need to log in first!");
        checkLoginStatus();
        return;
    }

    try {
        const res = await fetch(`${window.API_URL}/tasks/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text: newText })
        });

        if (res.ok) {
            taskTextElement.contentEditable = "false";
            loadTasks(); // Reload tasks to ensure consistency
        } else {
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                checkLoginStatus();
                alert("Session expired. Please login again.");
            } else {
                alert("Failed to update task");
            }
        }
    } catch (error) {
        console.error("Error updating task:", error);
        alert("Failed to update task");
    }
}

function createTaskItem(text, id) {
    const taskItem = document.createElement("div");
    taskItem.classList.add("task-item");
    taskItem.setAttribute("data-id", id);

    taskItem.innerHTML = `
        <span class="task-text">${text}</span>
        <button class="edit-btn" onclick="editTask('${id}')">Edit</button>
        <button class="delete-btn" onclick="deleteTask('${id}')">Delete</button>
    `;

    return taskItem;
}


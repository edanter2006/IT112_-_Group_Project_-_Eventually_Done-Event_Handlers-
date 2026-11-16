const dashboardMsg = document.getElementById("dashboardMsg");

function showMessage(text, type = "info") {
    if (dashboardMsg) {
        dashboardMsg.innerHTML = `<div class="alert alert-${type} py-2 mb-4">${text}</div>`;
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token) {
        window.location.href = "/index.html";
        return;
    }

    if (userString) {
        try {
            const user = JSON.parse(userString);
            
            const usernameEl = document.getElementById("usernameDisplay");
            if (usernameEl && user.username) {
                usernameEl.textContent = user.username;
            }

            const roleBadge = document.getElementById("roleBadge");
            const role = (user.role || "user").toLowerCase();

            if (roleBadge) {
                roleBadge.textContent = role.toUpperCase();
                if (role === "admin") roleBadge.className = "badge bg-danger ms-1";
                else if (role === "organizer") roleBadge.className = "badge bg-warning text-dark ms-1";
                else roleBadge.className = "badge bg-secondary ms-1";
            }

            applyRoleUIPolicy(role, token);

        } catch (e) {
            console.error("Failed to parse user session data");
        }
    }

    await loadDashboardData(token);
});

function applyRoleUIPolicy(role, token) {
    const adminPanel = document.getElementById("adminControlPanel");
    const inventoryFormCard = document.getElementById("inventoryFormCard");

    if (role === "admin") {
        if (adminPanel) adminPanel.style.display = "flex";
        loadUserManagementTable(token);
    } else {
        if (adminPanel) adminPanel.style.display = "none";
    }

    if (role === "user" && inventoryFormCard) {
        inventoryFormCard.innerHTML = `
            <div class="card-body p-4">
                <h5 class="mb-3 text-secondary">Inventory Access</h5>
                <p class="text-muted small mb-0">Regular users have view-only access to inventory. Contact an administrator or event organizer to request new items.</p>
            </div>
        `;
    }
}

function updateSelectColor(selectElement, type) {
    const val = selectElement.value.toLowerCase();
    selectElement.className = "form-select form-select-sm text-white fw-bold ";
    
    if (type === 'role') {
        if (val === 'admin') selectElement.classList.add('bg-danger');
        else if (val === 'organizer') selectElement.classList.add('bg-warning', 'text-dark');
        else selectElement.classList.add('bg-secondary');
    } else if (type === 'reservation') {
        if (val === 'approved') selectElement.classList.add('bg-success');
        else if (val === 'cancelled') selectElement.classList.add('bg-danger');
        else selectElement.classList.add('bg-warning', 'text-dark');
    } else if (type === 'checklist') {
        if (val === 'completed') selectElement.classList.add('bg-success');
        else if (val === 'in progress') selectElement.classList.add('bg-primary');
        else selectElement.classList.add('bg-info', 'text-dark');
    }
}

async function loadUserManagementTable(token) {
    const tableBody = document.getElementById("usersTableBody");
    if (!tableBody) return;

    try {
        const res = await fetch("/api/users", { headers: { "Authorization": `Bearer ${token}` } });
        if (!res.ok) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Failed to load user accounts.</td></tr>`;
            return;
        }

        const users = await res.json();
        if (!Array.isArray(users) || users.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No users found.</td></tr>`;
            return;
        }

        tableBody.innerHTML = users.map((u, index) => `
            <tr>
                <td>${index + 1}</td>
                <td class="fw-bold">${u.username}</td>
                <td>${u.email || "N/A"}</td>
                <td>
                    <select class="form-select form-select-sm role-select fw-bold text-white" data-userid="${u._id}">
                        <option value="user" ${u.role === 'user' ? 'selected' : ''} class="bg-secondary text-white">User</option>
                        <option value="organizer" ${u.role === 'organizer' ? 'selected' : ''} class="bg-warning text-dark">Organizer</option>
                        <option value="admin" ${u.role === 'admin' ? 'selected' : ''} class="bg-danger text-white">Admin</option>
                    </select>
                </td>
            </tr>
        `).join("");

        document.querySelectorAll(".role-select").forEach(select => {
            updateSelectColor(select, 'role');
            select.addEventListener("change", async (e) => {
                updateSelectColor(e.target, 'role');
                const userId = e.target.getAttribute("data-userid");
                const newRole = e.target.value;
                await updateUserRole(userId, newRole, token);
            });
        });

    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Connection error loading users.</td></tr>`;
    }
}

async function updateUserRole(userId, newRole, token) {
    const actionMsg = document.getElementById("adminActionMsg");
    try {
        const res = await fetch(`/api/users/${userId}/role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ role: newRole })
        });

        const data = await res.json();
        if (!res.ok) {
            if (actionMsg) actionMsg.innerHTML = `<div class="alert alert-danger py-1 mb-2 small">Error: ${data.message}</div>`;
            return;
        }

        if (actionMsg) actionMsg.innerHTML = `<div class="alert alert-success py-1 mb-2 small">User role successfully updated!</div>`;
        setTimeout(() => { actionMsg.innerHTML = ""; }, 2500);
        await loadUserManagementTable(token);
    } catch (err) {
        if (actionMsg) actionMsg.innerHTML = `<div class="alert alert-danger py-1 mb-2 small">Connection error updating role.</div>`;
    }
}

async function loadDashboardData(token) {
    await loadMetrics(token);
    await loadInventoryTable(token);
    await loadReservationsQueue(token);
    await loadChecklistsTable(token);
}

async function loadMetrics(token) {
    try {
        const [itemsRes, reservationsRes, checklistsRes] = await Promise.all([
            fetch("/api/items", { headers: { "Authorization": `Bearer ${token}` } }),
            fetch("/api/reservations", { headers: { "Authorization": `Bearer ${token}` } }),
            fetch("/api/checklists", { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        if (itemsRes.ok) {
            const itemsData = await itemsRes.json();
            document.getElementById("itemCount").textContent = Array.isArray(itemsData) ? itemsData.length : "0";
        }

        if (reservationsRes.ok) {
            const reservationsData = await reservationsRes.json();
            document.getElementById("reservationCount").textContent = Array.isArray(reservationsData) ? reservationsData.length : "0";
        }

        if (checklistsRes.ok) {
            const checklistsData = await checklistsRes.json();
            document.getElementById("checklistCount").textContent = Array.isArray(checklistsData) ? checklistsData.length : "0";
        }
    } catch (err) {
        console.error("Error loading metrics:", err);
    }
}

async function loadInventoryTable(token) {
    const tableBody = document.getElementById("inventoryTableBody");
    if (!tableBody) return;

    try {
        const res = await fetch("/api/items", { headers: { "Authorization": `Bearer ${token}` } });
        if (!res.ok) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Failed to load inventory.</td></tr>`;
            return;
        }
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No inventory items found.</td></tr>`;
            return;
        }

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const isPrivileged = ['admin', 'organizer'].includes((user.role || '').toLowerCase());

        tableBody.innerHTML = data.map((item, index) => {
            const actionControl = isPrivileged ? `
                <button class="btn btn-sm btn-outline-danger py-0 px-2" title="Delete Item" onclick="deleteInventoryItem('${item._id}')">✕ Delete</button>
            ` : `<span class="text-muted small">View Only</span>`;

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td class="fw-bold">${item.name || "Untitled"}</td>
                    <td>${item.quantity || "0"}</td>
                    <td>${actionControl}</td>
                </tr>
            `;
        }).join("");
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Connection error loading inventory.</td></tr>`;
    }
}

async function deleteInventoryItem(id) {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/index.html"; return; }
    if (!confirm("Are you sure you want to delete this inventory item?")) return;

    try {
        const res = await fetch(`/api/items/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) alert("Failed to delete item.");
        else await loadDashboardData(token);
    } catch (err) {
        console.error("Error deleting item:", err);
    }
}

async function loadReservationsQueue(token) {
    const tableBody = document.getElementById("reservationsTableBody");
    if (!tableBody) return;

    try {
        const res = await fetch("/api/reservations", { headers: { "Authorization": `Bearer ${token}` } });
        if (!res.ok) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Failed to load queue.</td></tr>`;
            return;
        }
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No reservations found.</td></tr>`;
            return;
        }

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const isPrivileged = ['admin', 'organizer'].includes((user.role || '').toLowerCase());

        tableBody.innerHTML = data.map((item, index) => {
            const currentStatus = item.status || 'Pending';
            
            const statusControl = isPrivileged ? `
                <div class="d-flex align-items-center gap-2">
                    <select class="form-select form-select-sm res-status-select fw-bold text-white flex-grow-1" data-resid="${item._id}">
                        <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''} class="bg-warning text-dark">Pending</option>
                        <option value="Approved" ${currentStatus === 'Approved' ? 'selected' : ''} class="bg-success text-white">Approved</option>
                        <option value="Cancelled" ${currentStatus === 'Cancelled' ? 'selected' : ''} class="bg-danger text-white">Cancelled</option>
                    </select>
                    <button class="btn btn-sm btn-outline-danger py-0 px-2" title="Delete Reservation" onclick="deleteReservation('${item._id}')">✕</button>
                </div>
            ` : `<span class="badge bg-${currentStatus === 'Approved' ? 'success' : (currentStatus === 'Cancelled' ? 'danger' : 'warning text-dark')}">${currentStatus}</span>`;

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td class="fw-bold">${item.title || "Untitled"}</td>
                    <td>${item.details || "N/A"}</td>
                    <td>${statusControl}</td>
                </tr>
            `;
        }).join("");

        document.querySelectorAll(".res-status-select").forEach(select => {
            updateSelectColor(select, 'reservation');
            select.addEventListener("change", async (e) => {
                updateSelectColor(e.target, 'reservation');
                const resId = e.target.getAttribute("data-resid");
                const newStatus = e.target.value;
                await updateReservationStatus(resId, newStatus, token);
            });
        });

    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Connection error loading queue.</td></tr>`;
    }
}

async function updateReservationStatus(id, newStatus, token) {
    try {
        const res = await fetch(`/api/reservations/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) alert("Failed to update reservation status.");
        else await loadDashboardData(token);
    } catch (err) {
        console.error("Error updating reservation:", err);
    }
}

async function deleteReservation(id) {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/index.html"; return; }
    if (!confirm("Are you sure you want to delete this reservation?")) return;

    try {
        const res = await fetch(`/api/reservations/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) alert("Failed to delete reservation.");
        else await loadDashboardData(token);
    } catch (err) {
        console.error("Error deleting reservation:", err);
    }
}

async function loadChecklistsTable(token) {
    const tableBody = document.getElementById("checklistsTableBody");
    if (!tableBody) return;

    try {
        const res = await fetch("/api/checklists", { headers: { "Authorization": `Bearer ${token}` } });
        if (!res.ok) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Failed to load checklists.</td></tr>`;
            return;
        }
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No checklists found.</td></tr>`;
            return;
        }

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const isPrivileged = ['admin', 'organizer'].includes((user.role || '').toLowerCase());

        tableBody.innerHTML = data.map((item, index) => {
            const currentStatus = item.status || 'Pending';

            const statusControl = isPrivileged ? `
                <div class="d-flex align-items-center gap-2">
                    <select class="form-select form-select-sm check-status-select fw-bold text-white flex-grow-1" data-checkid="${item._id}">
                        <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''} class="bg-info text-dark">Pending</option>
                        <option value="In Progress" ${currentStatus === 'In Progress' ? 'selected' : ''} class="bg-primary text-white">In Progress</option>
                        <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''} class="bg-success text-white">Completed</option>
                    </select>
                    <button class="btn btn-sm btn-outline-danger py-0 px-2" title="Delete Checklist" onclick="deleteChecklist('${item._id}')">✕</button>
                </div>
            ` : `<span class="badge bg-info text-dark">${currentStatus}</span>`;

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td class="fw-bold">${item.title || "Untitled Checklist"}</td>
                    <td>${item.tasks || "N/A"}</td>
                    <td>${statusControl}</td>
                </tr>
            `;
        }).join("");

        document.querySelectorAll(".check-status-select").forEach(select => {
            updateSelectColor(select, 'checklist');
            select.addEventListener("change", async (e) => {
                updateSelectColor(e.target, 'checklist');
                const checkId = e.target.getAttribute("data-checkid");
                const newStatus = e.target.value;
                await updateChecklistStatus(checkId, newStatus, token);
            });
        });

    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Connection error loading checklists.</td></tr>`;
    }
}

async function updateChecklistStatus(id, newStatus, token) {
    try {
        const res = await fetch(`/api/checklists/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) alert("Failed to update checklist status.");
        else await loadDashboardData(token);
    } catch (err) {
        console.error("Error updating checklist:", err);
    }
}

async function deleteChecklist(id) {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/index.html"; return; }
    if (!confirm("Are you sure you want to delete this checklist?")) return;

    try {
        const res = await fetch(`/api/checklists/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) alert("Failed to delete checklist.");
        else await loadDashboardData(token);
    } catch (err) {
        console.error("Error deleting checklist:", err);
    }
}

async function saveNewItem() {
    const nameInput = document.getElementById("itemNameInput");
    const qtyInput = document.getElementById("itemQtyInput");
    const formMsg = document.getElementById("itemFormMsg");
    if (!nameInput || !qtyInput) return;

    const name = nameInput.value.trim();
    const quantity = qtyInput.value.trim();

    if (!name || !quantity) {
        formMsg.innerHTML = `<div class="alert alert-danger py-1 mb-2 small">Provide name and quantity.</div>`;
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/index.html"; return; }

    try {
        const res = await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ name, quantity })
        });

        if (!res.ok) {
            formMsg.innerHTML = `<div class="alert alert-danger py-1 mb-2 small">Error saving item.</div>`;
            return;
        }

        formMsg.innerHTML = `<div class="alert alert-success py-1 mb-2 small">Item saved!</div>`;
        nameInput.value = "";
        qtyInput.value = "";
        await loadDashboardData(token);
        setTimeout(() => { formMsg.innerHTML = ""; }, 2500);
    } catch (err) {
        formMsg.innerHTML = `<div class="alert alert-danger py-1 mb-2 small">Connection exception.</div>`;
    }
}

async function createReservation() {
    const titleInput = document.getElementById("resTitleInput");
    const detailsInput = document.getElementById("resDetailsInput");
    const formMsg = document.getElementById("resFormMsg");

    const title = titleInput.value.trim();
    const details = detailsInput.value.trim();

    if (!title) {
        formMsg.innerHTML = `<div class="alert alert-danger py-1 mb-2 small">Provide a title.</div>`;
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/index.html"; return; }

    try {
        const res = await fetch("/api/reservations", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ title, details })
        });

        if (!res.ok) {
            formMsg.innerHTML = `<div class="alert alert-danger py-1 mb-2 small">Error creating reservation.</div>`;
            return;
        }

        formMsg.innerHTML = `<div class="alert alert-success py-1 mb-2 small">Reservation added!</div>`;
        titleInput.value = "";
        detailsInput.value = "";
        await loadDashboardData(token);
        setTimeout(() => { formMsg.innerHTML = ""; }, 2500);
    } catch (err) {
        formMsg.innerHTML = `<div class="alert alert-danger py-1 mb-2 small">Connection exception.</div>`;
    }
}

async function createChecklist() {
    const titleInput = document.getElementById("checkTitleInput");
    const tasksInput = document.getElementById("checkTasksInput");
    const formMsg = document.getElementById("checkFormMsg");

    const title = titleInput.value.trim();
    const tasks = tasksInput.value.trim();

    if (!title) {
        formMsg.innerHTML = `<div class="alert alert-danger py-1 mb-2 small">Provide a checklist title.</div>`;
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/index.html"; return; }

    try {
        const res = await fetch("/api/checklists", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ title, tasks })
        });

        if (!res.ok) {
            formMsg.innerHTML = `<div class="alert alert-danger py-1 mb-2 small">Error saving checklist.</div>`;
            return;
        }

        formMsg.innerHTML = `<div class="alert alert-success py-1 mb-2 small">Checklist saved!</div>`;
        titleInput.value = "";
        tasksInput.value = "";
        await loadDashboardData(token);
        setTimeout(() => { formMsg.innerHTML = ""; }, 2500);
    } catch (err) {
        formMsg.innerHTML = `<div class="alert alert-danger py-1 mb-2 small">Connection exception.</div>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/index.html";
        });
    }

    const refreshBtn = document.getElementById("refreshDataBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", async () => {
            const token = localStorage.getItem("token");
            if (token) await loadDashboardData(token);
            showMessage("All dashboard data refreshed.", "success");
            setTimeout(() => { dashboardMsg.innerHTML = ""; }, 2000);
        });
    }

    const saveItemBtn = document.getElementById("saveItemBtn");
    if (saveItemBtn) saveItemBtn.addEventListener("click", saveNewItem);

    const saveResBtn = document.getElementById("saveResBtn");
    if (saveResBtn) saveResBtn.addEventListener("click", createReservation);

    const saveCheckBtn = document.getElementById("saveCheckBtn");
    if (saveCheckBtn) saveCheckBtn.addEventListener("click", createChecklist);
});
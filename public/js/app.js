const itemForm = document.getElementById("itemForm");
const itemList = document.getElementById("itemList");
const reservationForm = document.getElementById("reservationForm");
const reservationList = document.getElementById("reservationList");
const msg = document.getElementById("msg");

function showMessage(text, type = "success") {
    msg.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
    setTimeout(() => (msg.innerHTML = ""), 3000);
}

// --- LOAD ITEMS ---
async function loadItems() {
    try {
        const res = await fetch("/api/items");
        const items = await res.json();
        
        itemList.innerHTML = "";
        if (!items || items.length === 0) {
            itemList.innerHTML = '<div class="text-muted p-2">No items found.</div>';
            return;
        }

        items.forEach(item => {
            const div = document.createElement("div");
            div.className = "list-group-item d-flex justify-content-between align-items-center";
            div.innerHTML = `
                <div>
                    <div class="fw-semibold">${item.item_name} <span class="badge bg-secondary">${item.category}</span></div>
                    <div class="text-muted small">Qty: ${item.quantity} | Available: ${item.available_quantity}</div>
                    <div class="text-secondary font-monospace" style="font-size: 0.7rem;">ID: ${item._id}</div>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('${item._id}')">Delete</button>
            `;
            itemList.appendChild(div);
        });
    } catch (err) {
        console.error("Error loading items:", err);
    }
}

// --- LOAD RESERVATIONS ---
async function loadReservations() {
    try {
        const res = await fetch("/api/reservations");
        const reservations = await res.json();
        
        reservationList.innerHTML = "";
        if (!reservations || reservations.length === 0) {
            reservationList.innerHTML = '<div class="text-muted p-2">No reservations found.</div>';
            return;
        }

        reservations.forEach(r => {
            const div = document.createElement("div");
            div.className = "list-group-item";
            div.innerHTML = `
                <div class="fw-semibold">Event: ${r.event_name} <span class="badge bg-info text-dark">${r.status}</span></div>
                <div class="text-muted small">User: ${r.user_id ? r.user_id.username : 'Unknown'}</div>
            `;
            reservationList.appendChild(div);
        });
    } catch (err) {
        console.error("Error loading reservations:", err);
    }
}

// --- SUBMIT NEW ITEM ---
itemForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(itemForm);
    const payload = {
        item_name: formData.get("item_name"),
        category: formData.get("category"),
        quantity: Number(formData.get("quantity")),
        available_quantity: Number(formData.get("available_quantity")),
        description: formData.get("description")
    };

    const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errData = await res.json();
        showMessage(errData.error || "Failed to create item", "danger");
        return;
    }

    itemForm.reset();
    showMessage("Item added successfully!");
    loadItems();
});

// --- SUBMIT NEW RESERVATION ---
reservationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(reservationForm);
    const payload = {
        event_name: formData.get("event_name"),
        items: [{
            item_id: formData.get("item_id"),
            quantity: Number(formData.get("res_quantity"))
        }],
        event_date: formData.get("event_date"),
        start_date: formData.get("start_date"),
        end_date: formData.get("end_date")
    };

    const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errData = await res.json();
        showMessage(errData.error || "Failed to create reservation", "danger");
        return;
    }

    reservationForm.reset();
    showMessage("Reservation submitted!");
    loadReservations();
});

// --- DELETE ITEM HELPER ---
async function deleteItem(id) {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (res.ok) {
        showMessage("Item deleted", "warning");
        loadItems();
    } else {
        showMessage("Failed to delete item (Admin access required)", "danger");
    }
}

// Initial load
loadItems();
loadReservations();
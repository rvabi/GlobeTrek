document.addEventListener("DOMContentLoaded", () => {
    if (!requireRole(["Staff", "Admin"])) {
        return;
    }

    const form = document.getElementById("transportForm");
    const grid = document.getElementById("transportGrid");
    const loading = document.getElementById("transportLoading");
    const emptyState = document.getElementById("transportEmpty");
    const messageBox = document.getElementById("transportMessage");
    const searchInput = document.getElementById("transportSearch");
    const editingId = document.getElementById("editingTransportationId");
    const formTitle = document.getElementById("transportFormTitle");
    const saveButton = document.getElementById("saveTransportBtn");
    const cancelButton = document.getElementById("cancelTransportEdit");
    const activeGroup = document.getElementById("transportActiveGroup");
    const activeCheckbox = document.getElementById("transportIsActive");

    let services = [];

    function escapeHtml(value) {
        if (value === null || value === undefined) return "";
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0
        }).format(Number(value || 0));
    }

    function showMessage(message, type = "") {
        messageBox.textContent = message;
        messageBox.className = "auth-message";
        if (type) messageBox.classList.add(type);
    }

    function resetForm() {
        form.reset();
        editingId.value = "";
        formTitle.textContent = "Add Transportation";
        saveButton.innerHTML = `Add Transportation <span>→</span>`;
        cancelButton.hidden = true;
        activeGroup.hidden = true;
        activeCheckbox.checked = true;
    }

    function getFormData() {
        return {
            transportType: document.getElementById("transportType").value.trim(),
            providerName: document.getElementById("providerName").value.trim(),
            fromLocation: document.getElementById("fromLocation").value.trim(),
            toLocation: document.getElementById("toLocation").value.trim(),
            price: Number(document.getElementById("transportPrice").value),
            description: document.getElementById("transportDescription").value.trim()
        };
    }

    function render(items) {
        grid.innerHTML = "";

        if (!items.length) {
            emptyState.hidden = false;
            return;
        }

        emptyState.hidden = true;

        items.forEach(item => {
            const card = document.createElement("article");
            card.className = "portal-management-card portal-transport-card";

            const route = [item.fromLocation, item.toLocation]
                .filter(Boolean)
                .join(" → ") || "Flexible route";

            card.innerHTML = `
                <div class="portal-icon-banner">
                    <span>TRANSPORT #${item.transportationId}</span>
                    <div>↗</div>
                </div>

                <div class="portal-card-body">
                    <small>${escapeHtml(item.providerName)}</small>
                    <h3>${escapeHtml(item.transportType)}</h3>
                    <p>${escapeHtml(item.description || "No description provided.")}</p>

                    <div class="portal-meta-grid">
                        <div><span>Route</span><strong>${escapeHtml(route)}</strong></div>
                        <div><span>Price</span><strong>${formatCurrency(item.price)}</strong></div>
                    </div>

                    <div class="portal-card-actions">
                        <button type="button" class="booking-outline-btn transport-edit-btn" data-id="${item.transportationId}">Edit</button>
                        <button type="button" class="portal-danger-btn transport-delete-btn" data-id="${item.transportationId}">Deactivate</button>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        grid.querySelectorAll(".transport-edit-btn").forEach(button => {
            button.addEventListener("click", () => editService(Number(button.dataset.id)));
        });

        grid.querySelectorAll(".transport-delete-btn").forEach(button => {
            button.addEventListener("click", () => deactivateService(Number(button.dataset.id)));
        });
    }

    function applySearch() {
        const search = searchInput.value.trim().toLowerCase();

        const filtered = !search
            ? services
            : services.filter(item => `
                ${item.transportType || ""}
                ${item.providerName || ""}
                ${item.fromLocation || ""}
                ${item.toLocation || ""}
                ${item.description || ""}
            `.toLowerCase().includes(search));

        render(filtered);
    }

    function editService(id) {
        const item = services.find(x => x.transportationId === id);
        if (!item) return;

        editingId.value = item.transportationId;
        document.getElementById("transportType").value = item.transportType || "";
        document.getElementById("providerName").value = item.providerName || "";
        document.getElementById("fromLocation").value = item.fromLocation || "";
        document.getElementById("toLocation").value = item.toLocation || "";
        document.getElementById("transportPrice").value = item.price || "";
        document.getElementById("transportDescription").value = item.description || "";

        activeCheckbox.checked = item.isActive !== false;
        activeGroup.hidden = false;
        formTitle.textContent = "Edit Transportation";
        saveButton.innerHTML = `Save Changes <span>→</span>`;
        cancelButton.hidden = false;

        window.scrollTo({ top: 420, behavior: "smooth" });
    }

    async function deactivateService(id) {
        if (!window.confirm("Deactivate this transportation service?")) return;

        try {
            const result = await apiRequest(`/Transportations/${id}`, {
                method: "DELETE"
            });

            showMessage(
                result.message || "Transportation deactivated successfully.",
                "success"
            );

            await load();
        }
        catch (error) {
            showMessage(error.message || "Unable to deactivate transportation.", "error");
        }
    }

    async function load() {
        loading.style.display = "flex";

        try {
            services = await apiRequest("/Transportations");
            applySearch();
        }
        catch (error) {
            showMessage(error.message || "Unable to load transportation.", "error");
        }
        finally {
            loading.style.display = "none";
        }
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const id = Number(editingId.value);
        const data = getFormData();

        if (!data.transportType || !data.providerName || data.price <= 0) {
            showMessage("Transport type, provider and a valid price are required.", "error");
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = id ? "Saving changes..." : "Adding transportation...";

        try {
            if (id) {
                const result = await apiRequest(`/Transportations/${id}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        ...data,
                        isActive: activeCheckbox.checked
                    })
                });

                resetForm();
                showMessage(result.message || "Transportation updated successfully.", "success");
            }
            else {
                await apiRequest("/Transportations", {
                    method: "POST",
                    body: JSON.stringify(data)
                });

                resetForm();
                showMessage("Transportation added successfully.", "success");
            }

            await load();
        }
        catch (error) {
            showMessage(error.message || "Unable to save transportation.", "error");
        }
        finally {
            saveButton.disabled = false;
            saveButton.innerHTML = editingId.value
                ? `Save Changes <span>→</span>`
                : `Add Transportation <span>→</span>`;
        }
    });

    cancelButton.addEventListener("click", () => {
        resetForm();
        showMessage("");
    });

    searchInput.addEventListener("input", applySearch);

    load();
});

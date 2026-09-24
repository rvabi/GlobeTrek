document.addEventListener("DOMContentLoaded", () => {
    if (!requireRole(["Staff", "Admin"])) {
        return;
    }

    const form = document.getElementById("destinationForm");
    const grid = document.getElementById("destinationGrid");
    const loading = document.getElementById("destinationLoading");
    const emptyState = document.getElementById("destinationEmpty");
    const messageBox = document.getElementById("destinationMessage");
    const searchInput = document.getElementById("destinationSearch");
    const editingId = document.getElementById("editingDestinationId");
    const formTitle = document.getElementById("destinationFormTitle");
    const saveButton = document.getElementById("saveDestinationBtn");
    const cancelButton = document.getElementById("cancelDestinationEdit");
    const activeGroup = document.getElementById("destinationActiveGroup");
    const activeCheckbox = document.getElementById("destinationIsActive");

    let destinations = [];

    function escapeHtml(value) {
        if (value === null || value === undefined) return "";
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function showMessage(message, type = "") {
        messageBox.textContent = message;
        messageBox.className = "auth-message";
        if (type) messageBox.classList.add(type);
    }

    function getImage(item) {
        const text = `${item.name || ""} ${item.location || ""}`.toLowerCase();

        if (text.includes("ella")) return "../../assets/images/destination-ella.jpg";
        if (text.includes("galle")) return "../../assets/images/destination-galle.jpg";
        if (text.includes("yala")) return "../../assets/images/destination-yala.jpg";
        if (text.includes("sigiriya")) return "../../assets/images/package-sigiriya.jpg";
        if (text.includes("mirissa")) return "../../assets/images/package-mirissa.jpg";

        const value = item.imageUrl?.trim();

        if (value?.startsWith("http://") || value?.startsWith("https://")) return value;
        if (value?.startsWith("assets/")) return `../../${value}`;
        if (value?.startsWith("images/")) return `../../assets/${value}`;

        return "../../assets/images/hero-sri-lanka.jpg";
    }

    function resetForm() {
        form.reset();
        editingId.value = "";
        formTitle.textContent = "Add Destination";
        saveButton.innerHTML = `Add Destination <span>→</span>`;
        cancelButton.hidden = true;
        activeGroup.hidden = true;
        activeCheckbox.checked = true;
    }

    function getFormData() {
        return {
            name: document.getElementById("destinationName").value.trim(),
            location: document.getElementById("destinationLocation").value.trim(),
            description: document.getElementById("destinationDescription").value.trim(),
            bestTimeToVisit: document.getElementById("destinationBestTime").value.trim(),
            attractions: document.getElementById("destinationAttractions").value.trim(),
            travelTips: document.getElementById("destinationTravelTips").value.trim(),
            imageUrl: document.getElementById("destinationImageUrl").value.trim()
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
            card.className = "portal-management-card";

            card.innerHTML = `
                <div class="portal-card-image"
                     style="background-image:
                        linear-gradient(180deg,rgba(8,30,19,.02),rgba(8,30,19,.65)),
                        url('${escapeHtml(getImage(item))}')">
                    <span>${escapeHtml(item.location)}</span>
                </div>

                <div class="portal-card-body">
                    <small>DESTINATION #${item.destinationId}</small>
                    <h3>${escapeHtml(item.name)}</h3>
                    <p>${escapeHtml(item.description || "No description provided.")}</p>

                    <div class="portal-detail-box">
                        <span>BEST TIME</span>
                        <p>${escapeHtml(item.bestTimeToVisit || "Flexible throughout the year")}</p>
                    </div>

                    <div class="portal-detail-box">
                        <span>ATTRACTIONS</span>
                        <p>${escapeHtml(item.attractions || "No attractions specified.")}</p>
                    </div>

                    <div class="portal-card-actions">
                        <button type="button" class="booking-outline-btn destination-edit-btn" data-id="${item.destinationId}">Edit</button>
                        <button type="button" class="portal-danger-btn destination-delete-btn" data-id="${item.destinationId}">Deactivate</button>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        grid.querySelectorAll(".destination-edit-btn").forEach(button => {
            button.addEventListener("click", () => editDestination(Number(button.dataset.id)));
        });

        grid.querySelectorAll(".destination-delete-btn").forEach(button => {
            button.addEventListener("click", () => deactivateDestination(Number(button.dataset.id)));
        });
    }

    function applySearch() {
        const search = searchInput.value.trim().toLowerCase();

        const filtered = !search
            ? destinations
            : destinations.filter(item => `
                ${item.name || ""}
                ${item.location || ""}
                ${item.description || ""}
                ${item.bestTimeToVisit || ""}
                ${item.attractions || ""}
                ${item.travelTips || ""}
            `.toLowerCase().includes(search));

        render(filtered);
    }

    function editDestination(id) {
        const item = destinations.find(x => x.destinationId === id);
        if (!item) return;

        editingId.value = item.destinationId;
        document.getElementById("destinationName").value = item.name || "";
        document.getElementById("destinationLocation").value = item.location || "";
        document.getElementById("destinationDescription").value = item.description || "";
        document.getElementById("destinationBestTime").value = item.bestTimeToVisit || "";
        document.getElementById("destinationAttractions").value = item.attractions || "";
        document.getElementById("destinationTravelTips").value = item.travelTips || "";
        document.getElementById("destinationImageUrl").value = item.imageUrl || "";

        activeCheckbox.checked = item.isActive !== false;
        activeGroup.hidden = false;
        formTitle.textContent = "Edit Destination";
        saveButton.innerHTML = `Save Changes <span>→</span>`;
        cancelButton.hidden = false;

        window.scrollTo({ top: 420, behavior: "smooth" });
    }

    async function deactivateDestination(id) {
        if (!window.confirm("Deactivate this destination?")) return;

        try {
            const result = await apiRequest(`/Destinations/${id}`, {
                method: "DELETE"
            });

            showMessage(
                result.message || "Destination deactivated successfully.",
                "success"
            );

            await load();
        }
        catch (error) {
            showMessage(error.message || "Unable to deactivate destination.", "error");
        }
    }

    async function load() {
        loading.style.display = "flex";

        try {
            destinations = await apiRequest("/Destinations");
            applySearch();
        }
        catch (error) {
            showMessage(error.message || "Unable to load destinations.", "error");
        }
        finally {
            loading.style.display = "none";
        }
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const id = Number(editingId.value);
        const data = getFormData();

        if (!data.name || !data.location) {
            showMessage("Destination name and location are required.", "error");
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = id ? "Saving changes..." : "Adding destination...";

        try {
            if (id) {
                const result = await apiRequest(`/Destinations/${id}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        ...data,
                        isActive: activeCheckbox.checked
                    })
                });

                resetForm();
                showMessage(result.message || "Destination updated successfully.", "success");
            }
            else {
                await apiRequest("/Destinations", {
                    method: "POST",
                    body: JSON.stringify(data)
                });

                resetForm();
                showMessage("Destination added successfully.", "success");
            }

            await load();
        }
        catch (error) {
            showMessage(error.message || "Unable to save destination.", "error");
        }
        finally {
            saveButton.disabled = false;
            saveButton.innerHTML = editingId.value
                ? `Save Changes <span>→</span>`
                : `Add Destination <span>→</span>`;
        }
    });

    cancelButton.addEventListener("click", () => {
        resetForm();
        showMessage("");
    });

    searchInput.addEventListener("input", applySearch);

    load();
});

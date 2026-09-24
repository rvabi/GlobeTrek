document.addEventListener("DOMContentLoaded", () => {
    if (!requireRole(["Staff", "Admin"])) {
        return;
    }

    const form = document.getElementById("accommodationForm");
    const grid = document.getElementById("accommodationGrid");
    const loading = document.getElementById("accommodationLoading");
    const emptyState = document.getElementById("accommodationEmpty");
    const messageBox = document.getElementById("accommodationMessage");
    const searchInput = document.getElementById("accommodationSearch");
    const editingId = document.getElementById("editingAccommodationId");
    const formTitle = document.getElementById("accommodationFormTitle");
    const saveButton = document.getElementById("saveAccommodationBtn");
    const cancelButton = document.getElementById("cancelAccommodationEdit");
    const activeGroup = document.getElementById("accommodationActiveGroup");
    const activeCheckbox = document.getElementById("accommodationIsActive");

    let accommodations = [];

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

    function getImage(item) {
        const value = item.imageUrl?.trim();

        if (value?.startsWith("http://") || value?.startsWith("https://")) {
            return value;
        }

        if (value?.startsWith("assets/")) {
            return `../../${value}`;
        }

        if (value?.startsWith("images/")) {
            return `../../assets/${value}`;
        }

        const text = `${item.name || ""} ${item.location || ""}`.toLowerCase();

        if (text.includes("ella")) return "../../assets/images/package-ella.jpg";
        if (text.includes("galle") || text.includes("mirissa")) return "../../assets/images/package-mirissa.jpg";
        if (text.includes("sigiriya")) return "../../assets/images/package-sigiriya.jpg";

        return "../../assets/images/packages-hero.jpg";
    }

    function resetForm() {
        form.reset();
        editingId.value = "";
        formTitle.textContent = "Add Accommodation";
        saveButton.innerHTML = `Add Accommodation <span>→</span>`;
        cancelButton.hidden = true;
        activeGroup.hidden = true;
        activeCheckbox.checked = true;
    }

    function getFormData() {
        return {
            name: document.getElementById("accommodationName").value.trim(),
            location: document.getElementById("accommodationLocation").value.trim(),
            description: document.getElementById("accommodationDescription").value.trim(),
            pricePerNight: Number(document.getElementById("accommodationPrice").value),
            roomType: document.getElementById("accommodationRoomType").value.trim(),
            facilities: document.getElementById("accommodationFacilities").value.trim(),
            imageUrl: document.getElementById("accommodationImageUrl").value.trim()
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
                    <small>STAY #${item.accommodationId}</small>
                    <h3>${escapeHtml(item.name)}</h3>
                    <p>${escapeHtml(item.description || "No description provided.")}</p>

                    <div class="portal-meta-grid">
                        <div><span>Room Type</span><strong>${escapeHtml(item.roomType || "Not specified")}</strong></div>
                        <div><span>Per Night</span><strong>${formatCurrency(item.pricePerNight)}</strong></div>
                    </div>

                    <div class="portal-detail-box">
                        <span>FACILITIES</span>
                        <p>${escapeHtml(item.facilities || "No facilities specified.")}</p>
                    </div>

                    <div class="portal-card-actions">
                        <button type="button" class="booking-outline-btn accommodation-edit-btn" data-id="${item.accommodationId}">Edit</button>
                        <button type="button" class="portal-danger-btn accommodation-delete-btn" data-id="${item.accommodationId}">Deactivate</button>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        grid.querySelectorAll(".accommodation-edit-btn").forEach(button => {
            button.addEventListener("click", () => editAccommodation(Number(button.dataset.id)));
        });

        grid.querySelectorAll(".accommodation-delete-btn").forEach(button => {
            button.addEventListener("click", () => deactivateAccommodation(Number(button.dataset.id)));
        });
    }

    function applySearch() {
        const search = searchInput.value.trim().toLowerCase();

        const filtered = !search
            ? accommodations
            : accommodations.filter(item => `
                ${item.name || ""}
                ${item.location || ""}
                ${item.description || ""}
                ${item.roomType || ""}
                ${item.facilities || ""}
            `.toLowerCase().includes(search));

        render(filtered);
    }

    function editAccommodation(id) {
        const item = accommodations.find(x => x.accommodationId === id);
        if (!item) return;

        editingId.value = item.accommodationId;
        document.getElementById("accommodationName").value = item.name || "";
        document.getElementById("accommodationLocation").value = item.location || "";
        document.getElementById("accommodationDescription").value = item.description || "";
        document.getElementById("accommodationPrice").value = item.pricePerNight || "";
        document.getElementById("accommodationRoomType").value = item.roomType || "";
        document.getElementById("accommodationFacilities").value = item.facilities || "";
        document.getElementById("accommodationImageUrl").value = item.imageUrl || "";

        activeCheckbox.checked = item.isActive !== false;
        activeGroup.hidden = false;
        formTitle.textContent = "Edit Accommodation";
        saveButton.innerHTML = `Save Changes <span>→</span>`;
        cancelButton.hidden = false;

        window.scrollTo({ top: 420, behavior: "smooth" });
    }

    async function deactivateAccommodation(id) {
        if (!window.confirm("Deactivate this accommodation?")) return;

        try {
            const result = await apiRequest(`/Accommodations/${id}`, {
                method: "DELETE"
            });

            showMessage(
                result.message || "Accommodation deactivated successfully.",
                "success"
            );

            await load();
        }
        catch (error) {
            showMessage(error.message || "Unable to deactivate accommodation.", "error");
        }
    }

    async function load() {
        loading.style.display = "flex";

        try {
            accommodations = await apiRequest("/Accommodations");
            applySearch();
        }
        catch (error) {
            showMessage(error.message || "Unable to load accommodation.", "error");
        }
        finally {
            loading.style.display = "none";
        }
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const id = Number(editingId.value);
        const data = getFormData();

        if (!data.name || !data.location || data.pricePerNight <= 0) {
            showMessage("Please enter a valid name, location and price.", "error");
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = id ? "Saving changes..." : "Adding accommodation...";

        try {
            if (id) {
                const result = await apiRequest(`/Accommodations/${id}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        ...data,
                        isActive: activeCheckbox.checked
                    })
                });

                resetForm();
                showMessage(result.message || "Accommodation updated successfully.", "success");
            }
            else {
                await apiRequest("/Accommodations", {
                    method: "POST",
                    body: JSON.stringify(data)
                });

                resetForm();
                showMessage("Accommodation added successfully.", "success");
            }

            await load();
        }
        catch (error) {
            showMessage(error.message || "Unable to save accommodation.", "error");
        }
        finally {
            saveButton.disabled = false;
            saveButton.innerHTML = editingId.value
                ? `Save Changes <span>→</span>`
                : `Add Accommodation <span>→</span>`;
        }
    });

    cancelButton.addEventListener("click", () => {
        resetForm();
        showMessage("");
    });

    searchInput.addEventListener("input", applySearch);

    load();
});

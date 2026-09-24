document.addEventListener("DOMContentLoaded", () => {

    if (!requireRole("Admin")) {
        return;
    }


    const grid =
        document.getElementById(
            "adminUsersGrid"
        );

    const loading =
        document.getElementById(
            "adminUsersLoading"
        );

    const emptyState =
        document.getElementById(
            "adminUsersEmpty"
        );

    const messageBox =
        document.getElementById(
            "adminUsersMessage"
        );

    const searchInput =
        document.getElementById(
            "adminUserSearch"
        );

    const roleFilter =
        document.getElementById(
            "adminUserRoleFilter"
        );

    const statusFilter =
        document.getElementById(
            "adminUserStatusFilter"
        );


    let allUsers = [];


    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }


        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    function formatDate(value) {

        if (!value) {
            return "—";
        }


        return new Intl.DateTimeFormat(
            "en-LK",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        ).format(
            new Date(value)
        );
    }


    function showMessage(
        message,
        type
    ) {

        messageBox.textContent =
            message;


        messageBox.className =
            "auth-message";


        if (type) {

            messageBox.classList.add(
                type
            );
        }
    }


    function roleToId(role) {

        const value =
            role?.toLowerCase();


        if (
            value === "customer"
        ) {
            return 1;
        }


        if (
            value === "staff"
        ) {
            return 2;
        }


        if (
            value === "admin"
        ) {
            return 3;
        }


        return 1;
    }


    function getRoleClass(role) {

        const value =
            role?.toLowerCase();


        if (
            value === "admin"
        ) {
            return "admin-role-admin";
        }


        if (
            value === "staff"
        ) {
            return "admin-role-staff";
        }


        return "admin-role-customer";
    }


    function updateStats() {

        document.getElementById(
            "adminUsersTotal"
        ).textContent =
            allUsers.length;


        document.getElementById(
            "adminCustomersTotal"
        ).textContent =
            allUsers.filter(
                user =>
                    user.role
                        ?.toLowerCase() ===
                    "customer"
            ).length;


        document.getElementById(
            "adminStaffTotal"
        ).textContent =
            allUsers.filter(
                user =>
                    user.role
                        ?.toLowerCase() ===
                    "staff"
            ).length;


        document.getElementById(
            "adminInactiveTotal"
        ).textContent =
            allUsers.filter(
                user =>
                    user.isActive ===
                    false
            ).length;
    }


    function renderUsers(users) {

        grid.innerHTML =
            "";


        if (
            users.length === 0
        ) {

            emptyState.hidden =
                false;

            return;
        }


        emptyState.hidden =
            true;


        users.forEach(
            user => {

                const isSelf = Number(getCurrentUser()?.id) === user.userId;
                const fullName =
                    `${user.firstName || ""} ${user.lastName || ""}`
                        .trim() ||
                    "GlobeTrek User";


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "admin-user-card";


                card.innerHTML = `

                    <div class="admin-user-card-header">

                        <div class="admin-user-avatar">

                            ${escapeHtml(
                                fullName
                                    .charAt(0)
                                    .toUpperCase()
                            )}

                        </div>


                        <div class="admin-user-title">

                            <span>
                                USER #${user.userId}
                            </span>

                            <h3>
                                ${escapeHtml(
                                    fullName
                                )}
                            </h3>

                            <p>
                                ${escapeHtml(
                                    user.email
                                )}
                            </p>

                        </div>


                        <span
                            class="
                                admin-user-status
                                ${
                                    user.isActive
                                        ? "admin-user-active"
                                        : "admin-user-inactive"
                                }
                            "
                        >

                            ${
                                user.isActive
                                    ? "Active"
                                    : "Inactive"
                            }

                        </span>

                    </div>


                    <div class="admin-user-details">

                        <div>

                            <span>
                                Role
                            </span>

                            <strong
                                class="
                                    admin-role-badge
                                    ${getRoleClass(
                                        user.role
                                    )}
                                "
                            >
                                ${escapeHtml(
                                    user.role
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Phone
                            </span>

                            <strong>
                                ${escapeHtml(
                                    user.phoneNumber ||
                                    "Not provided"
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Joined
                            </span>

                            <strong>
                                ${formatDate(
                                    user.createdAt
                                )}
                            </strong>

                        </div>

                    </div>


                    <div class="admin-user-controls">

                        <div class="form-group">

                            <label for="adminRole-${user.userId}">
                                Change Role
                            </label>

                            <select
                                id="adminRole-${user.userId}"
                                class="admin-role-select"
                                data-id="${user.userId}"
                                ${isSelf ? "disabled title='You cannot change your own role'" : ""}
                            >

                                <option
                                    value="1"
                                    ${
                                        user.role ===
                                        "Customer"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Customer
                                </option>


                                <option
                                    value="2"
                                    ${
                                        user.role ===
                                        "Staff"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Staff
                                </option>


                                <option
                                    value="3"
                                    ${
                                        user.role ===
                                        "Admin"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Admin
                                </option>

                            </select>

                        </div>


                        <button
                            type="button"
                            class="btn btn-primary admin-role-save"
                            data-id="${user.userId}"
                            ${isSelf ? "disabled title='You cannot change your own role'" : ""}
                        >
                            Update Role
                        </button>

                    </div>


                    <div class="admin-user-status-control">

                        <div>

                            <span>
                                Account Access
                            </span>

                            <p>
                                ${
                                    user.isActive
                                        ? "User can currently sign in."
                                        : "Account access is currently disabled."
                                }
                            </p>

                        </div>


                        <button
                            type="button"
                            class="
                                ${
                                    user.isActive
                                        ? "admin-disable-btn"
                                        : "admin-enable-btn"
                                }
                                admin-status-toggle
                            "
                            data-id="${user.userId}"
                            data-active="${user.isActive}"
                            ${isSelf && user.isActive ? "disabled title='You cannot deactivate your own account'" : ""}
                        >

                            ${
                                user.isActive
                                    ? "Deactivate"
                                    : "Activate"
                            }

                        </button>

                    </div>
                `;


                grid.appendChild(
                    card
                );
            }
        );


        document.querySelectorAll(
            ".admin-role-save"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            Number(
                                button.dataset.id
                            );


                        const select =
                            document.querySelector(
                                `.admin-role-select[data-id="${id}"]`
                            );


                        if (!select) {
                            return;
                        }


                        await updateRole(
                            id,
                            Number(
                                select.value
                            ),
                            button
                        );
                    }
                );
            }
        );


        document.querySelectorAll(
            ".admin-status-toggle"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            Number(
                                button.dataset.id
                            );


                        const currentState =
                            button.dataset.active ===
                            "true";


                        await updateStatus(
                            id,
                            !currentState,
                            button
                        );
                    }
                );
            }
        );
    }


    function applyFilters() {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        const selectedRole =
            roleFilter.value
                .toLowerCase();


        const selectedStatus =
            statusFilter.value;


        const filtered =
            allUsers.filter(
                user => {

                    const text = `
                        ${user.userId || ""}
                        ${user.firstName || ""}
                        ${user.lastName || ""}
                        ${user.email || ""}
                        ${user.phoneNumber || ""}
                        ${user.role || ""}
                    `.toLowerCase();


                    const matchesSearch =
                        !search ||
                        text.includes(
                            search
                        );


                    const matchesRole =
                        selectedRole === "all" ||
                        user.role
                            ?.toLowerCase() ===
                        selectedRole;


                    let matchesStatus =
                        true;


                    if (
                        selectedStatus ===
                        "active"
                    ) {

                        matchesStatus =
                            user.isActive ===
                            true;
                    }


                    if (
                        selectedStatus ===
                        "inactive"
                    ) {

                        matchesStatus =
                            user.isActive ===
                            false;
                    }


                    return (
                        matchesSearch &&
                        matchesRole &&
                        matchesStatus
                    );
                }
            );


        renderUsers(
            filtered
        );
    }


    async function updateRole(
        id,
        roleId,
        button
    ) {

        const currentUser =
            getCurrentUser();


        if (
            Number(currentUser?.id) ===
            id
        ) {

            const confirmed =
                window.confirm(
                    "You are changing your own role. This may affect your access after you log in again. Continue?"
                );


            if (!confirmed) {
                return;
            }
        }


        const originalText =
            button.textContent;


        button.disabled =
            true;

        button.textContent =
            "Updating...";


        try {

            const result =
                await apiRequest(
                    `/Admin/users/${id}/role`,
                    {
                        method:
                            "PUT",

                        body:
                            JSON.stringify({
                                roleId
                            })
                    }
                );


            showMessage(
                result.message ||
                "User role updated successfully.",
                "success"
            );


            await loadUsers();

        }
        catch (error) {

            showMessage(
                error.message ||
                "Unable to update user role.",
                "error"
            );

        }
        finally {

            button.disabled =
                false;

            button.textContent =
                originalText;
        }
    }


    async function updateStatus(
        id,
        isActive,
        button
    ) {

        const currentUser =
            getCurrentUser();


        if (
            Number(currentUser?.id) ===
            id &&
            isActive === false
        ) {

            const confirmed =
                window.confirm(
                    "You are deactivating your own admin account. Continue?"
                );


            if (!confirmed) {
                return;
            }
        }


        const originalText =
            button.textContent;


        button.disabled =
            true;

        button.textContent =
            "Updating...";


        try {

            const result =
                await apiRequest(
                    `/Admin/users/${id}/status`,
                    {
                        method:
                            "PUT",

                        body:
                            JSON.stringify({
                                isActive
                            })
                    }
                );


            showMessage(
                result.message ||
                "User status updated successfully.",
                "success"
            );


            await loadUsers();

        }
        catch (error) {

            showMessage(
                error.message ||
                "Unable to update account status.",
                "error"
            );

        }
        finally {

            button.disabled =
                false;

            button.textContent =
                originalText;
        }
    }


    async function loadUsers() {

        loading.style.display =
            "flex";


        try {

            allUsers =
                await apiRequest(
                    "/Admin/users"
                );


            updateStats();

            applyFilters();

        }
        catch (error) {

            console.error(error);


            showMessage(
                error.message ||
                "Unable to load users.",
                "error"
            );

        }
        finally {

            loading.style.display =
                "none";
        }
    }


    searchInput.addEventListener(
        "input",
        applyFilters
    );


    roleFilter.addEventListener(
        "change",
        applyFilters
    );


    statusFilter.addEventListener(
        "change",
        applyFilters
    );


    loadUsers();
});

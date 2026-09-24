document.addEventListener("DOMContentLoaded", () => {

    if (!requireRole(["Staff", "Admin"])) {
        return;
    }


    const grid =
        document.getElementById(
            "staffBookingsGrid"
        );

    const loading =
        document.getElementById(
            "staffBookingsLoading"
        );

    const emptyState =
        document.getElementById(
            "staffBookingsEmpty"
        );

    const messageBox =
        document.getElementById(
            "staffBookingsMessage"
        );

    const searchInput =
        document.getElementById(
            "staffBookingSearch"
        );

    const statusFilter =
        document.getElementById(
            "staffBookingStatusFilter"
        );


    let allBookings = [];


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


    function formatCurrency(value) {

        return new Intl.NumberFormat(
            "en-LK",
            {
                style: "currency",
                currency: "LKR",
                maximumFractionDigits: 0
            }
        ).format(
            Number(value || 0)
        );
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


    function getStatusClass(status) {

        const value =
            status
                ?.toLowerCase();


        if (
            value === "confirmed"
        ) {
            return "staff-booking-confirmed";
        }


        if (
            value === "completed"
        ) {
            return "staff-booking-completed";
        }


        if (
            value === "cancelled"
        ) {
            return "staff-booking-cancelled";
        }


        return "staff-booking-pending";
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


    function updateStats() {

        document.getElementById(
            "bookingTotalCount"
        ).textContent =
            allBookings.length;


        document.getElementById(
            "bookingPendingCount"
        ).textContent =
            allBookings.filter(
                booking =>
                    booking.bookingStatus
                        ?.toLowerCase() ===
                    "pending"
            ).length;


        document.getElementById(
            "bookingConfirmedCount"
        ).textContent =
            allBookings.filter(
                booking =>
                    booking.bookingStatus
                        ?.toLowerCase() ===
                    "confirmed"
            ).length;


        document.getElementById(
            "bookingCompletedCount"
        ).textContent =
            allBookings.filter(
                booking =>
                    booking.bookingStatus
                        ?.toLowerCase() ===
                    "completed"
            ).length;
    }


    function renderBookings(
        bookings
    ) {

        grid.innerHTML =
            "";


        if (
            bookings.length === 0
        ) {

            emptyState.hidden =
                false;

            return;
        }


        emptyState.hidden =
            true;


        bookings.forEach(
            booking => {

                const customer =
                    booking.user || {};


                const packageInfo =
                    booking.tourPackage || {};


                const customerName =
                    `${customer.firstName || ""} ${customer.lastName || ""}`
                        .trim() ||
                    "Former customer";


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "staff-booking-card";


                card.innerHTML = `

                    <div class="staff-booking-card-top">

                        <div>

                            <span class="staff-booking-number">
                                BOOKING #${booking.bookingId}
                            </span>

                            <h3>
                                ${escapeHtml(
                                    packageInfo.packageName ||
                                    "GlobeTrek Journey"
                                )}
                            </h3>

                            <p>
                                ${escapeHtml(
                                    packageInfo.destination ||
                                    "Sri Lanka"
                                )}
                            </p>

                        </div>


                        <span
                            class="
                                staff-booking-status
                                ${getStatusClass(
                                    booking.bookingStatus
                                )}
                            "
                        >
                            ${escapeHtml(
                                booking.bookingStatus ||
                                "Pending"
                            )}
                        </span>

                    </div>


                    <div class="staff-booking-customer">

                        <div class="staff-customer-avatar">

                            ${escapeHtml(
                                customerName
                                    .charAt(0)
                                    .toUpperCase()
                            )}

                        </div>


                        <div>

                            <span>
                                CUSTOMER
                            </span>

                            <strong>
                                ${escapeHtml(
                                    customerName
                                )}
                            </strong>

                            <p>
                                ${escapeHtml(
                                    customer.email ||
                                    ""
                                )}
                            </p>

                        </div>

                    </div>


                    <div class="staff-booking-detail-grid">

                        <div>

                            <span>
                                Travel Date
                            </span>

                            <strong>
                                ${formatDate(
                                    booking.travelDate
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Travelers
                            </span>

                            <strong>
                                ${booking.numberOfTravelers || 0}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Total Amount
                            </span>

                            <strong>
                                ${formatCurrency(
                                    booking.totalAmount
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Booking Date
                            </span>

                            <strong>
                                ${formatDate(
                                    booking.bookingDate
                                )}
                            </strong>

                        </div>

                    </div>


                    <div class="staff-booking-actions">

                        <div class="staff-status-control">

                            <label>
                                Update Status
                            </label>


                            <select
                                class="staff-status-select"
                                data-id="${booking.bookingId}"
                            >

                                <option
                                    value="Pending"
                                    ${
                                        booking.bookingStatus ===
                                        "Pending"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Pending
                                </option>


                                <option
                                    value="Confirmed"
                                    ${
                                        booking.bookingStatus ===
                                        "Confirmed"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Confirmed
                                </option>


                                <option
                                    value="Completed"
                                    ${
                                        booking.bookingStatus ===
                                        "Completed"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Completed
                                </option>


                                <option
                                    value="Cancelled"
                                    ${
                                        booking.bookingStatus ===
                                        "Cancelled"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Cancelled
                                </option>

                            </select>

                        </div>


                        <button
                            type="button"
                            class="btn btn-primary staff-status-save"
                            data-id="${booking.bookingId}"
                        >
                            Save Status
                        </button>

                    </div>
                `;


                grid.appendChild(
                    card
                );
            }
        );


        document.querySelectorAll(
            ".staff-status-save"
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
                                `.staff-status-select[data-id="${id}"]`
                            );


                        if (!select) {
                            return;
                        }


                        await updateBookingStatus(
                            id,
                            select.value,
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


        const status =
            statusFilter.value
                .toLowerCase();


        const filtered =
            allBookings.filter(
                booking => {

                    const customer =
                        booking.user || {};


                    const packageInfo =
                        booking.tourPackage || {};


                    const searchableText = `
                        ${booking.bookingId || ""}
                        ${customer.firstName || ""}
                        ${customer.lastName || ""}
                        ${customer.email || ""}
                        ${packageInfo.packageName || ""}
                        ${packageInfo.destination || ""}
                    `.toLowerCase();


                    const matchesSearch =
                        !search ||
                        searchableText.includes(
                            search
                        );


                    const bookingStatus =
                        booking.bookingStatus
                            ?.toLowerCase() || "";


                    const matchesStatus =
                        status === "all" ||
                        bookingStatus ===
                        status;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );


        renderBookings(
            filtered
        );
    }


    async function updateBookingStatus(
        id,
        status,
        button
    ) {

        const originalText =
            button.textContent;


        button.disabled =
            true;

        button.textContent =
            "Saving...";


        try {

            const result =
                await apiRequest(
                    `/Bookings/${id}/status?status=${encodeURIComponent(
                        status
                    )}`,
                    {
                        method:
                            "PUT"
                    }
                );


            showMessage(
                result.message ||
                "Booking status updated successfully.",
                "success"
            );


            await loadBookings();

        }
        catch (error) {

            showMessage(
                error.message ||
                "Unable to update booking status.",
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


    async function loadBookings() {

        loading.style.display =
            "flex";


        try {

            allBookings =
                await apiRequest(
                    "/Bookings"
                );


            updateStats();

            applyFilters();

        }
        catch (error) {

            console.error(error);


            showMessage(
                error.message ||
                "Unable to load bookings.",
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


    statusFilter.addEventListener(
        "change",
        applyFilters
    );


    loadBookings();
});

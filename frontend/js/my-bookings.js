document.addEventListener("DOMContentLoaded", () => {

    if (!requireRole("Customer")) {
        return;
    }


    const bookingsGrid =
        document.getElementById(
            "bookingsGrid"
        );

    const bookingsLoading =
        document.getElementById(
            "bookingsLoading"
        );

    const emptyBookings =
        document.getElementById(
            "emptyBookings"
        );

    const bookingsMessage =
        document.getElementById(
            "bookingsMessage"
        );

    const filterButtons =
        document.querySelectorAll(
            ".booking-filter"
        );


    let allBookings = [];


    function formatCurrency(value) {

        return new Intl.NumberFormat(
            "en-LK",
            {
                style: "currency",
                currency: "LKR",
                maximumFractionDigits: 0
            }
        ).format(value || 0);
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


    function getPackageImage(
        destination
    ) {

        const name =
            destination
                ?.toLowerCase() || "";


        if (
            name.includes("ella")
        ) {
            return "../../assets/images/package-ella.jpg";
        }


        if (
            name.includes("sigiriya") ||
            name.includes("dambulla")
        ) {
            return "../../assets/images/package-sigiriya.jpg";
        }


        if (
            name.includes("mirissa") ||
            name.includes("galle")
        ) {
            return "../../assets/images/package-mirissa.jpg";
        }


        return "../../assets/images/packages-hero.jpg";
    }


    function getStatusClass(status) {

        const value =
            status
                ?.toLowerCase() || "";


        if (value === "confirmed") {
            return "booking-status-confirmed";
        }


        if (value === "completed") {
            return "booking-status-completed";
        }


        if (value === "cancelled") {
            return "booking-status-cancelled";
        }


        return "booking-status-pending";
    }


    function updateStats() {

        const total =
            allBookings.length;


        const confirmed =
            allBookings.filter(
                booking =>
                    booking.bookingStatus
                        ?.toLowerCase() ===
                    "confirmed"
            ).length;


        const pending =
            allBookings.filter(
                booking =>
                    booking.bookingStatus
                        ?.toLowerCase() ===
                    "pending"
            ).length;


        const totalValue =
            allBookings.reduce(
                (
                    sum,
                    booking
                ) =>
                    sum +
                    Number(
                        booking.totalAmount || 0
                    ),
                0
            );


        document.getElementById(
            "totalBookings"
        ).textContent =
            total;


        document.getElementById(
            "confirmedBookings"
        ).textContent =
            confirmed;


        document.getElementById(
            "pendingBookings"
        ).textContent =
            pending;


        document.getElementById(
            "totalBookingValue"
        ).textContent =
            formatCurrency(
                totalValue
            );
    }


    function renderBookings(
        bookings
    ) {

        bookingsGrid.innerHTML =
            "";


        if (
            allBookings.length === 0
        ) {

            emptyBookings.hidden =
                false;

            return;
        }


        emptyBookings.hidden =
            true;


        if (
            bookings.length === 0
        ) {

            bookingsGrid.innerHTML = `
                <div class="filtered-empty-state">
                    <h3>No matching bookings</h3>
                    <p>
                        There are no journeys
                        with this booking status.
                    </p>
                </div>
            `;

            return;
        }


        bookings.forEach(
            booking => {

                const tourPackage =
                    booking.tourPackage || {};


                const status =
                    booking.bookingStatus ||
                    "Pending";


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "customer-booking-card";


                card.innerHTML = `

                    <div
                        class="customer-booking-image"
                        style="
                            background-image:
                            linear-gradient(
                                180deg,
                                rgba(7, 28, 19, 0.04),
                                rgba(7, 28, 19, 0.42)
                            ),
                            url('${getPackageImage(
                                tourPackage.destination
                            )}');
                        "
                    >

                        <span
                            class="
                                customer-booking-status
                                ${getStatusClass(
                                    status
                                )}
                            "
                        >
                            ${escapeHtml(status)}
                        </span>

                        <div
                            class="booking-image-destination"
                        >
                            ${escapeHtml(
                                tourPackage.destination ||
                                "Sri Lanka"
                            )}
                        </div>

                    </div>


                    <div class="customer-booking-body">

                        <div class="customer-booking-heading">

                            <div>

                                <span>
                                    BOOKING #${booking.bookingId}
                                </span>

                                <h3>
                                    ${escapeHtml(
                                        tourPackage.packageName ||
                                        "GlobeTrek Journey"
                                    )}
                                </h3>

                            </div>


                            <strong>
                                ${formatCurrency(
                                    booking.totalAmount
                                )}
                            </strong>

                        </div>


                        <div class="customer-booking-info">

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
                                    ${booking.numberOfTravelers}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Booked On
                                </span>

                                <strong>
                                    ${formatDate(
                                        booking.bookingDate
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div class="customer-booking-actions">

                            <a
                                href="../package-details.html?id=${tourPackage.tourPackageId}"
                                class="booking-outline-btn"
                            >
                                View Journey
                            </a>

                            ${
                                status.toLowerCase() ===
                                "pending"
                                    ? `
                                        <a
                                            href="payment.html?bookingId=${booking.bookingId}"
                                            class="btn btn-primary booking-action-btn"
                                        >
                                            Complete Payment
                                            <span>→</span>
                                        </a>
                                    `
                                    : `
                                        <a
                                            href="travel-plan.html"
                                            class="btn btn-primary booking-action-btn"
                                        >
                                            Travel Plan
                                            <span>→</span>
                                        </a>
                                    `
                            }

                        </div>

                    </div>
                `;


                bookingsGrid.appendChild(
                    card
                );
            }
        );
    }


    function filterBookings(
        filter
    ) {

        if (
            filter === "all"
        ) {

            renderBookings(
                allBookings
            );

            return;
        }


        const filtered =
            allBookings.filter(
                booking =>
                    booking.bookingStatus
                        ?.toLowerCase() ===
                    filter
            );


        renderBookings(
            filtered
        );
    }


    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    filterButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    filterBookings(
                        button.dataset.filter
                    );
                }
            );
        }
    );


    async function loadBookings() {

        try {

            bookingsLoading.style.display =
                "flex";


            allBookings =
                await apiRequest(
                    "/Bookings/my"
                );


            updateStats();


            renderBookings(
                allBookings
            );

        }
        catch (error) {

            console.error(error);


            bookingsMessage.textContent =
                error.message ||
                "Unable to load your bookings.";


            bookingsMessage.className =
                "auth-message error";

        }
        finally {

            bookingsLoading.style.display =
                "none";
        }
    }


    loadBookings();
});
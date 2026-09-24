document.addEventListener("DOMContentLoaded", () => {

    if (!requireRole("Staff")) {
        return;
    }


    const messageBox =
        document.getElementById(
            "staffDashboardMessage"
        );


    const recentBookings =
        document.getElementById(
            "staffRecentBookings"
        );


    const recentQueries =
        document.getElementById(
            "staffRecentQueries"
        );


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


    function getUserName() {

        const user =
            getCurrentUser();


        if (!user) {
            return "Staff";
        }


        const fullName =
            `${user.firstName || ""} ${user.lastName || ""}`
                .trim();


        return fullName || "Staff";
    }


    function renderBookings(bookings) {

        recentBookings.innerHTML =
            "";


        if (!bookings.length) {

            recentBookings.innerHTML = `
                <div class="staff-empty-row">
                    No bookings available.
                </div>
            `;

            return;
        }


        bookings
            .slice(0, 5)
            .forEach(
                booking => {

                    const packageData =
                        booking.tourPackage || {};


                    const customer =
                        booking.user || {};


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "staff-recent-item";


                    item.innerHTML = `

                        <div>

                            <span>
                                BOOKING #${booking.bookingId}
                            </span>

                            <strong>
                                ${escapeHtml(
                                    packageData.packageName ||
                                    "GlobeTrek Journey"
                                )}
                            </strong>

                            <p>${escapeHtml(
                                `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
                                "Former customer"
                            )}</p>

                        </div>


                        <div class="staff-recent-meta">

                            <span>
                                ${formatDate(
                                    booking.travelDate
                                )}
                            </span>

                            <strong>
                                ${escapeHtml(
                                    booking.bookingStatus
                                )}
                            </strong>

                        </div>
                    `;


                    recentBookings.appendChild(
                        item
                    );
                }
            );
    }


    function renderQueries(queries) {

        recentQueries.innerHTML =
            "";


        if (!queries.length) {

            recentQueries.innerHTML = `
                <div class="staff-empty-row">
                    No customer queries available.
                </div>
            `;

            return;
        }


        queries
            .slice(0, 5)
            .forEach(
                query => {

                    const customer =
                        query.customer || {};


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "staff-recent-item";


                    item.innerHTML = `

                        <div>

                            <span>
                                QUERY #${query.customerQueryId}
                            </span>

                            <strong>
                                ${escapeHtml(
                                    query.subject
                                )}
                            </strong>

                            <p>
                                ${
                                    escapeHtml(
                                        customer.firstName || ""
                                    )
                                }
                                ${
                                    escapeHtml(
                                        customer.lastName || ""
                                    )
                                }
                            </p>

                        </div>


                        <div class="staff-recent-meta">

                            <span>
                                ${formatDate(
                                    query.createdAt
                                )}
                            </span>

                            <strong>
                                ${escapeHtml(
                                    query.queryStatus
                                )}
                            </strong>

                        </div>
                    `;


                    recentQueries.appendChild(
                        item
                    );
                }
            );
    }


    async function loadDashboard() {

        try {

            document.getElementById(
                "staffName"
            ).textContent =
                getUserName();


            const [
                bookings,
                packages,
                queries,
                payments
            ] =
                await Promise.all([

                    apiRequest(
                        "/Bookings"
                    ),

                    apiRequest(
                        "/TourPackages"
                    ),

                    apiRequest(
                        "/CustomerQueries"
                    ),

                    apiRequest(
                        "/Payments"
                    )

                ]);


            document.getElementById(
                "staffTotalBookings"
            ).textContent =
                bookings.length;


            document.getElementById(
                "staffPendingBookings"
            ).textContent =
                bookings.filter(
                    booking =>
                        booking.bookingStatus
                            ?.toLowerCase() ===
                        "pending"
                ).length;


            document.getElementById(
                "staffConfirmedBookings"
            ).textContent =
                bookings.filter(
                    booking =>
                        booking.bookingStatus
                            ?.toLowerCase() ===
                        "confirmed"
                ).length;


            document.getElementById(
                "staffActivePackages"
            ).textContent =
                packages.length;


            document.getElementById(
                "staffOpenQueries"
            ).textContent =
                queries.filter(
                    query => {

                        const status =
                            query.queryStatus
                                ?.toLowerCase();


                        return (
                            status === "open" ||
                            status === "in progress"
                        );
                    }
                ).length;


            const completedRevenue =
                payments
                    .filter(
                        payment =>
                            payment.paymentStatus
                                ?.toLowerCase() ===
                            "completed"
                    )
                    .reduce(
                        (
                            total,
                            payment
                        ) =>
                            total +
                            Number(
                                payment.amount || 0
                            ),
                        0
                    );


            document.getElementById(
                "staffRevenue"
            ).textContent =
                formatCurrency(
                    completedRevenue
                );


            renderBookings(
                bookings
            );


            renderQueries(
                queries
            );

        }
        catch (error) {

            console.error(error);


            messageBox.textContent =
                error.message ||
                "Unable to load staff dashboard.";


            messageBox.className =
                "auth-message error";
        }
    }


    loadDashboard();
});

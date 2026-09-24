document.addEventListener("DOMContentLoaded", () => {

    if (!requireRole("Admin")) {
        return;
    }


    const messageBox =
        document.getElementById(
            "adminReportsMessage"
        );


    const tabs =
        document.querySelectorAll(
            ".admin-report-tab"
        );


    const panels =
        document.querySelectorAll(
            ".admin-report-panel"
        );


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


    function getStatusClass(status) {

        const value =
            status
                ?.toLowerCase();


        if (
            value === "confirmed"
        ) {
            return "report-status-confirmed";
        }


        if (
            value === "completed"
        ) {
            return "report-status-completed";
        }


        if (
            value === "cancelled"
        ) {
            return "report-status-cancelled";
        }


        return "report-status-pending";
    }


    function setupTabs() {

        tabs.forEach(
            tab => {

                tab.addEventListener(
                    "click",
                    () => {

                        const report =
                            tab.dataset.report;


                        tabs.forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                        panels.forEach(
                            panel =>
                                panel.classList.remove(
                                    "active"
                                )
                        );


                        tab.classList.add(
                            "active"
                        );


                        const target =
                            document.getElementById(
                                `${report}ReportSection`
                            );


                        if (target) {

                            target.classList.add(
                                "active"
                            );
                        }
                    }
                );
            }
        );
    }


    async function loadDashboardSummary() {

        try {

            const dashboard =
                await apiRequest(
                    "/Reports/dashboard"
                );


            document.getElementById(
                "reportTotalSales"
            ).textContent =
                formatCurrency(
                    dashboard.totalSales
                );


            document.getElementById(
                "reportCustomers"
            ).textContent =
                dashboard.totalCustomers ?? 0;


            document.getElementById(
                "reportBookings"
            ).textContent =
                dashboard.totalBookings ?? 0;

        }
        catch (error) {

            console.error(
                "Dashboard report error:",
                error
            );
        }
    }


    async function loadSalesReport() {

        const loading =
            document.getElementById(
                "salesReportLoading"
            );


        const body =
            document.getElementById(
                "salesReportBody"
            );


        loading.style.display =
            "flex";


        try {

            const report =
                await apiRequest(
                    "/Reports/sales"
                );


            document.getElementById(
                "reportTransactions"
            ).textContent =
                report.totalTransactions ?? 0;


            document.getElementById(
                "salesReportTotal"
            ).textContent =
                formatCurrency(
                    report.totalSales
                );


            body.innerHTML =
                "";


            const payments =
                report.payments || [];


            if (
                payments.length === 0
            ) {

                body.innerHTML = `
                    <tr>
                        <td
                            colspan="6"
                            class="admin-report-empty"
                        >
                            No completed payments available.
                        </td>
                    </tr>
                `;

                return;
            }


            payments.forEach(
                payment => {

                    const customer =
                        payment.customer || {};


                    const packageInfo =
                        payment.tourPackage || {};


                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            <strong>
                                #${payment.paymentId}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    payment.transactionReference ||
                                    "No reference"
                                )}
                            </small>
                        </td>


                        <td>

                            <strong>
                                ${escapeHtml(
                                    `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    customer.email || ""
                                )}
                            </small>

                        </td>


                        <td>

                            <strong>
                                ${escapeHtml(
                                    packageInfo.packageName ||
                                    "Journey"
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    packageInfo.destination ||
                                    ""
                                )}
                            </small>

                        </td>


                        <td>
                            ${escapeHtml(
                                payment.paymentMethod ||
                                "—"
                            )}
                        </td>


                        <td>
                            ${formatDate(
                                payment.paymentDate
                            )}
                        </td>


                        <td>
                            <strong>
                                ${formatCurrency(
                                    payment.amount
                                )}
                            </strong>
                        </td>
                    `;


                    body.appendChild(
                        row
                    );
                }
            );

        }
        catch (error) {

            showMessage(
                error.message ||
                "Unable to load sales report.",
                "error"
            );

        }
        finally {

            loading.style.display =
                "none";
        }
    }


    async function loadCustomerReport() {

        const loading =
            document.getElementById(
                "customersReportLoading"
            );


        const body =
            document.getElementById(
                "customersReportBody"
            );


        loading.style.display =
            "flex";


        try {

            const customers =
                await apiRequest(
                    "/Reports/customers"
                );


            body.innerHTML =
                "";


            if (
                customers.length === 0
            ) {

                body.innerHTML = `
                    <tr>
                        <td
                            colspan="7"
                            class="admin-report-empty"
                        >
                            No customer records available.
                        </td>
                    </tr>
                `;

                return;
            }


            customers.forEach(
                customer => {

                    const fullName =
                        `${customer.firstName || ""} ${customer.lastName || ""}`
                            .trim();


                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>

                            <strong>
                                ${escapeHtml(
                                    fullName
                                )}
                            </strong>

                            <small>
                                User #${customer.userId}
                            </small>

                        </td>


                        <td>
                            ${escapeHtml(
                                customer.email
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                customer.phoneNumber ||
                                "—"
                            )}
                        </td>


                        <td>
                            ${formatDate(
                                customer.createdAt
                            )}
                        </td>


                        <td>
                            ${customer.totalBookings ?? 0}
                        </td>


                        <td>
                            <strong>
                                ${formatCurrency(
                                    customer.totalSpent
                                )}
                            </strong>
                        </td>


                        <td>

                            <span
                                class="
                                    report-account-status
                                    ${
                                        customer.isActive
                                            ? "report-account-active"
                                            : "report-account-inactive"
                                    }
                                "
                            >

                                ${
                                    customer.isActive
                                        ? "Active"
                                        : "Inactive"
                                }

                            </span>

                        </td>
                    `;


                    body.appendChild(
                        row
                    );
                }
            );

        }
        catch (error) {

            showMessage(
                error.message ||
                "Unable to load customer report.",
                "error"
            );

        }
        finally {

            loading.style.display =
                "none";
        }
    }


    async function loadBookingReport() {

        const loading =
            document.getElementById(
                "bookingsReportLoading"
            );


        const body =
            document.getElementById(
                "bookingsReportBody"
            );


        loading.style.display =
            "flex";


        try {

            const bookings =
                await apiRequest(
                    "/Reports/bookings"
                );


            body.innerHTML =
                "";


            if (
                bookings.length === 0
            ) {

                body.innerHTML = `
                    <tr>
                        <td
                            colspan="7"
                            class="admin-report-empty"
                        >
                            No booking records available.
                        </td>
                    </tr>
                `;

                return;
            }


            bookings.forEach(
                booking => {

                    const customer =
                        booking.customer || {};


                    const packageInfo =
                        booking.package || {};


                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>

                            <strong>
                                #${booking.bookingId}
                            </strong>

                            <small>
                                ${formatDate(
                                    booking.bookingDate
                                )}
                            </small>

                        </td>


                        <td>

                            <strong>
                                ${escapeHtml(
                                    `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    customer.email || ""
                                )}
                            </small>

                        </td>


                        <td>

                            <strong>
                                ${escapeHtml(
                                    packageInfo.packageName ||
                                    "Journey"
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    packageInfo.destination ||
                                    ""
                                )}
                            </small>

                        </td>


                        <td>
                            ${formatDate(
                                booking.travelDate
                            )}
                        </td>


                        <td>
                            ${booking.numberOfTravelers ?? 0}
                        </td>


                        <td>
                            <strong>
                                ${formatCurrency(
                                    booking.totalAmount
                                )}
                            </strong>
                        </td>


                        <td>

                            <span
                                class="
                                    report-booking-status
                                    ${getStatusClass(
                                        booking.bookingStatus
                                    )}
                                "
                            >

                                ${escapeHtml(
                                    booking.bookingStatus
                                )}

                            </span>

                        </td>
                    `;


                    body.appendChild(
                        row
                    );
                }
            );

        }
        catch (error) {

            showMessage(
                error.message ||
                "Unable to load booking report.",
                "error"
            );

        }
        finally {

            loading.style.display =
                "none";
        }
    }


    async function initialize() {

        setupTabs();


        await Promise.all([
            loadDashboardSummary(),
            loadSalesReport(),
            loadCustomerReport(),
            loadBookingReport()
        ]);
    }


    initialize();
});
document.addEventListener("DOMContentLoaded", () => {

    if (!requireRole("Admin")) {
        return;
    }


    const messageBox =
        document.getElementById(
            "adminDashboardMessage"
        );


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


    async function loadDashboard() {

        try {

            const dashboard =
                await apiRequest(
                    "/Reports/dashboard"
                );


            document.getElementById(
                "adminTotalCustomers"
            ).textContent =
                dashboard.totalCustomers ?? 0;


            document.getElementById(
                "adminTotalStaff"
            ).textContent =
                dashboard.totalStaff ?? 0;


            document.getElementById(
                "adminTotalBookings"
            ).textContent =
                dashboard.totalBookings ?? 0;


            document.getElementById(
                "adminTotalPackages"
            ).textContent =
                dashboard.totalPackages ?? 0;


            document.getElementById(
                "adminPendingBookings"
            ).textContent =
                dashboard.pendingBookings ?? 0;


            document.getElementById(
                "adminConfirmedBookings"
            ).textContent =
                dashboard.confirmedBookings ?? 0;


            document.getElementById(
                "adminTotalQueries"
            ).textContent =
                dashboard.totalQueries ?? 0;


            document.getElementById(
                "adminOpenQueries"
            ).textContent =
                dashboard.openQueries ?? 0;


            document.getElementById(
                "adminTotalSales"
            ).textContent =
                formatCurrency(
                    dashboard.totalSales
                );

        }
        catch (error) {

            console.error(error);


            showMessage(
                error.message ||
                "Unable to load admin dashboard.",
                "error"
            );
        }
    }


    loadDashboard();
});
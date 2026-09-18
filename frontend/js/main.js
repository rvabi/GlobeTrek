document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchPackagesBtn");
    const destinationInput = document.getElementById("destinationSearch");
    const durationSelect = document.getElementById("durationSearch");
    const budgetSelect = document.getElementById("budgetSearch");

    const mobileMenu = document.getElementById("mobileMenu");
    const navLinks = document.getElementById("navLinks");

    // -----------------------------
    // Mobile Navbar
    // -----------------------------
    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener("click", () => {
            navLinks.classList.toggle("show");
        });
    }

    // -----------------------------
    // Home Search
    // -----------------------------
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            const destination = destinationInput?.value.trim() || "";
            const duration = durationSelect?.value || "";
            const budget = budgetSelect?.value || "";

            const params = new URLSearchParams();

            if (destination) {
                params.set("destination", destination);
            }

            if (duration === "1-3") {
                params.set("minDuration", "1");
                params.set("maxDuration", "3");
            }

            if (duration === "4-6") {
                params.set("minDuration", "4");
                params.set("maxDuration", "6");
            }

            if (duration === "7") {
                params.set("minDuration", "7");
            }

            if (budget === "0-30000") {
                params.set("minPrice", "1");
                params.set("maxPrice", "30000");
            }

            if (budget === "30000-60000") {
                params.set("minPrice", "30000");
                params.set("maxPrice", "60000");
            }

            if (budget === "60000") {
                params.set("minPrice", "60000");
            }

            const queryString = params.toString();

            window.location.href =
                `pages/packages.html${queryString ? `?${queryString}` : ""}`;
        });
    }

    // Allow Enter key in destination input
    if (destinationInput) {
        destinationInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                searchBtn?.click();
            }
        });
    }
});
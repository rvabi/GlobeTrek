document.addEventListener("DOMContentLoaded", () => {

    const params =
        new URLSearchParams(window.location.search);

    const packageId =
        params.get("id");


    if (!packageId) {
        window.location.href = "packages.html";
        return;
    }


    const hero =
        document.getElementById("packageHero");

    const detailName =
        document.getElementById("detailName");

    const detailDescription =
        document.getElementById("detailDescription");

    const overviewDescription =
        document.getElementById("overviewDescription");

    const detailDestination =
        document.getElementById("detailDestination");

    const detailDuration =
        document.getElementById("detailDuration");

    const detailLocation =
        document.getElementById("detailLocation");

    const detailPrice =
        document.getElementById("detailPrice");

    const breadcrumbName =
        document.getElementById("breadcrumbName");

    const accommodationName =
        document.getElementById("accommodationName");

    const accommodationInfo =
        document.getElementById("accommodationInfo");

    const transportName =
        document.getElementById("transportName");

    const transportInfo =
        document.getElementById("transportInfo");

    const activitiesList =
        document.getElementById("activitiesList");

    const bookingPrice =
        document.getElementById("bookingPrice");

    const bookingDestination =
        document.getElementById("bookingDestination");

    const bookingDuration =
        document.getElementById("bookingDuration");

    const bookingAccommodation =
        document.getElementById("bookingAccommodation");

    const bookingTransport =
        document.getElementById("bookingTransport");

    const bookNowBtn =
        document.getElementById("bookNowBtn");


    function formatCurrency(value) {
        return new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0
        }).format(value);
    }


    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    function getPackageImage(packageData) {

        const imageUrl =
            packageData.imageUrl?.trim();

        if (imageUrl) {

            if (
                imageUrl.startsWith("http://") ||
                imageUrl.startsWith("https://")
            ) {
                return imageUrl;
            }

            return `../assets/${imageUrl}`;
        }


        const destination =
            packageData.destination
                ?.toLowerCase() || "";


        if (destination.includes("ella")) {
            return "../assets/images/package-ella.jpg";
        }

        if (
            destination.includes("sigiriya") ||
            destination.includes("dambulla")
        ) {
            return "../assets/images/package-sigiriya.jpg";
        }

        if (
            destination.includes("mirissa") ||
            destination.includes("galle")
        ) {
            return "../assets/images/package-mirissa.jpg";
        }

        return "../assets/images/packages-hero.jpg";
    }


    function renderActivities(activitiesText) {

        activitiesList.innerHTML = "";


        if (!activitiesText) {

            activitiesList.innerHTML = `
                <div class="activity-item">
                    <span>✦</span>
                    <p>
                        Flexible activities are
                        available for this journey.
                    </p>
                </div>
            `;

            return;
        }


        const activities =
            activitiesText
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);


        activities.forEach(activity => {

            const item =
                document.createElement("div");

            item.className =
                "activity-item";

            item.innerHTML = `
                <span>✦</span>

                <p>
                    ${escapeHtml(activity)}
                </p>
            `;

            activitiesList.appendChild(item);
        });
    }


    async function loadPackage() {

        try {

            const packageData =
                await apiRequest(
                    `/TourPackages/${packageId}`
                );


            const accommodation =
                packageData
                    .accommodationDetail;


            const transportation =
                packageData
                    .transportationDetail;


            const image =
                getPackageImage(packageData);


            hero.style.backgroundImage = `
                linear-gradient(
                    90deg,
                    rgba(6, 24, 16, 0.90),
                    rgba(13, 39, 28, 0.60),
                    rgba(13, 39, 28, 0.18)
                ),
                url('${image}')
            `;


            detailName.textContent =
                packageData.packageName;


            breadcrumbName.textContent =
                packageData.packageName;


            detailDescription.textContent =
                packageData.description;


            overviewDescription.textContent =
                packageData.description;


            detailDestination.textContent =
                packageData.destination
                    .toUpperCase();


            detailDuration.textContent =
                `◷ ${packageData.durationDays} Days`;


            detailLocation.textContent =
                `⌖ ${packageData.destination}, Sri Lanka`;


            detailPrice.textContent =
                formatCurrency(packageData.price);


            accommodationName.textContent =
                accommodation?.name ||
                packageData.accommodation ||
                "Selected Accommodation";


            accommodationInfo.textContent =
                accommodation
                    ? `${accommodation.roomType || ""}
                       ${accommodation.facilities || ""}`
                    : "Accommodation included with this package.";


            transportName.textContent =
                transportation?.transportType ||
                packageData.transportation ||
                "Selected Transportation";


            transportInfo.textContent =
                transportation
                    ? `${transportation.providerName || ""}
                       ${transportation.fromLocation || ""}
                       ${transportation.toLocation
                            ? `to ${transportation.toLocation}`
                            : ""}`
                    : "Transportation included with this package.";


            renderActivities(
                packageData.activities
            );


            bookingPrice.textContent =
                formatCurrency(packageData.price);


            bookingDestination.textContent =
                packageData.destination;


            bookingDuration.textContent =
                `${packageData.durationDays} Days`;


            bookingAccommodation.textContent =
                accommodation?.name ||
                packageData.accommodation ||
                "Included";


            bookingTransport.textContent =
                transportation?.transportType ||
                packageData.transportation ||
                "Included";


            document.title =
                `${packageData.packageName} | GlobeTrek Adventures`;

        }
        catch (error) {

            console.error(error);

            detailName.textContent =
                "Journey unavailable";

            detailDescription.textContent =
                error.message ||
                "Unable to load this package.";

            bookNowBtn.disabled = true;
        }
    }


    bookNowBtn.addEventListener(
        "click",
        () => {

            const token =
                localStorage.getItem("token");


            if (!token) {

                window.location.href =
                    `login.html?returnUrl=${encodeURIComponent(
                        `package-details.html?id=${packageId}`
                    )}`;

                return;
            }


            const user =
                getCurrentUser();


            if (!user) {

                window.location.href =
                    "login.html";

                return;
            }


            if (user.role !== "Customer") {

                alert(
                    "Only customer accounts can make travel bookings."
                );

                return;
            }


            window.location.href =
                `customer/booking.html?packageId=${packageId}`;
        }
    );


    loadPackage();
});
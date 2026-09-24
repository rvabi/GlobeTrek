document.addEventListener("DOMContentLoaded", () => {
    const packageList =
        document.getElementById("packageList");

    const packageCount =
        document.getElementById("packageCount");

    const packageEmpty =
        document.getElementById("packageEmpty");

    const packageError =
        document.getElementById("packageError");

    const destinationInput =
        document.getElementById("filterDestination");

    const minPriceInput =
        document.getElementById("filterMinPrice");

    const maxPriceInput =
        document.getElementById("filterMaxPrice");

    const minDurationInput =
        document.getElementById("filterMinDuration");

    const maxDurationInput =
        document.getElementById("filterMaxDuration");

    const applyFiltersBtn =
        document.getElementById("applyFiltersBtn");

    const clearFiltersBtn =
        document.getElementById("clearFiltersBtn");

    if (
        !packageList ||
        !packageCount ||
        !destinationInput
    ) {
        return;
    }

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    destinationInput.value =
        urlParams.get("destination") || "";

    minPriceInput.value =
        urlParams.get("minPrice") || "";

    maxPriceInput.value =
        urlParams.get("maxPrice") || "";

    minDurationInput.value =
        urlParams.get("minDuration") || "";

    maxDurationInput.value =
        urlParams.get("maxDuration") || "";


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


    function getPackageImage(packageData) {
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

        const imageUrl =
            packageData.imageUrl?.trim();

        if (imageUrl) {
            if (
                imageUrl.startsWith("http://") ||
                imageUrl.startsWith("https://")
            ) {
                return imageUrl;
            }

            if (imageUrl.startsWith("assets/")) {
                return `../${imageUrl}`;
            }

            if (imageUrl.startsWith("images/")) {
                return `../assets/${imageUrl}`;
            }
        }

        return "../assets/images/hero-sri-lanka.jpg";
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


    function renderPackages(packages) {
        packageList.innerHTML = "";

        packageError?.classList.add(
            "hidden"
        );

        if (!packages?.length) {
            packageEmpty?.classList.remove(
                "hidden"
            );

            packageCount.textContent =
                "0 journeys found";

            return;
        }

        packageEmpty?.classList.add(
            "hidden"
        );

        packageCount.textContent =
            `${packages.length} journey${
                packages.length === 1
                    ? ""
                    : "s"
            } available`;

        packages.forEach(packageData => {
            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "package-card";

            const image =
                getPackageImage(
                    packageData
                );

            const accommodation =
                packageData
                    .accommodationDetail
                    ?.name ||
                packageData.accommodation ||
                "Accommodation available";

            const transportation =
                packageData
                    .transportationDetail
                    ?.transportType ||
                packageData.transportation ||
                "Transport available";

            card.innerHTML = `
                <div
                    class="package-image dynamic-package-image"
                    style="
                        background-image:
                        linear-gradient(
                            rgba(10,20,10,0.03),
                            rgba(10,30,15,0.18)
                        ),
                        url('${escapeHtml(image)}')
                    "
                >
                    <span class="package-badge">
                        ${escapeHtml(
                            packageData.destination
                        )}
                    </span>
                </div>

                <div class="package-content">

                    <div class="package-location">
                        ⌖ ${escapeHtml(
                            packageData.destination
                        )}, Sri Lanka
                    </div>

                    <h3>
                        ${escapeHtml(
                            packageData.packageName
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            packageData.description
                        )}
                    </p>

                    <div class="package-service-info">

                        <span>
                            ⌂ ${escapeHtml(
                                accommodation
                            )}
                        </span>

                        <span>
                            ➜ ${escapeHtml(
                                transportation
                            )}
                        </span>

                    </div>

                    <div class="package-meta">

                        <span>
                            ◷ ${packageData.durationDays} Days
                        </span>

                        <span>
                            ✦ ${
                                packageData.activities
                                    ? "Experiences included"
                                    : "Flexible activities"
                            }
                        </span>

                    </div>

                    <div class="package-footer">

                        <div>
                            <small>From</small>

                            <strong>
                                ${formatCurrency(
                                    packageData.price
                                )}
                            </strong>
                        </div>

                        <a
                            href="package-details.html?id=${
                                packageData.tourPackageId
                            }"
                            class="round-arrow"
                            aria-label="View package"
                        >
                            →
                        </a>

                    </div>

                </div>
            `;

            packageList.appendChild(card);
        });
    }


    async function loadPackages() {
        packageCount.textContent =
            "Loading journeys...";

        packageError?.classList.add(
            "hidden"
        );

        packageEmpty?.classList.add(
            "hidden"
        );

        try {
            const params =
                new URLSearchParams();

            const destination =
                destinationInput.value.trim();

            const minPrice =
                minPriceInput.value.trim();

            const maxPrice =
                maxPriceInput.value.trim();

            const minDuration =
                minDurationInput.value.trim();

            const maxDuration =
                maxDurationInput.value.trim();

            if (destination) {
                params.set(
                    "destination",
                    destination
                );
            }

            if (minPrice) {
                params.set(
                    "minPrice",
                    minPrice
                );
            }

            if (maxPrice) {
                params.set(
                    "maxPrice",
                    maxPrice
                );
            }

            if (minDuration) {
                params.set(
                    "minDuration",
                    minDuration
                );
            }

            if (maxDuration) {
                params.set(
                    "maxDuration",
                    maxDuration
                );
            }

            let endpoint =
                "/TourPackages";

            if (params.toString()) {
                endpoint =
                    `/TourPackages/search?${params.toString()}`;
            }

            const packages =
                await apiRequest(
                    endpoint
                );

            renderPackages(packages);

            const newUrl =
                `${window.location.pathname}${
                    params.toString()
                        ? `?${params.toString()}`
                        : ""
                }`;

            window.history.replaceState(
                {},
                "",
                newUrl
            );
        }
        catch (error) {
            console.error(error);

            packageList.innerHTML =
                "";

            packageCount.textContent =
                "Unable to load journeys";

            if (packageError) {
                packageError.textContent =
                    error.message ||
                    "Unable to load packages.";

                packageError.classList.remove(
                    "hidden"
                );
            }
        }
    }


    applyFiltersBtn?.addEventListener(
        "click",
        loadPackages
    );

    clearFiltersBtn?.addEventListener(
        "click",
        () => {
            destinationInput.value = "";
            minPriceInput.value = "";
            maxPriceInput.value = "";
            minDurationInput.value = "";
            maxDurationInput.value = "";

            loadPackages();
        }
    );

    [
        destinationInput,
        minPriceInput,
        maxPriceInput,
        minDurationInput,
        maxDurationInput
    ].forEach(input => {
        input?.addEventListener(
            "keydown",
            event => {
                if (event.key === "Enter") {
                    loadPackages();
                }
            }
        );
    });

    loadPackages();
});

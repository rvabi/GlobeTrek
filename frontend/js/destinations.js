document.addEventListener("DOMContentLoaded", () => {

    const grid =
        document.getElementById(
            "destinationsGrid"
        );

    const loading =
        document.getElementById(
            "destinationsLoading"
        );

    const emptyState =
        document.getElementById(
            "emptyDestinations"
        );

    const messageBox =
        document.getElementById(
            "destinationsMessage"
        );

    const destinationCount =
        document.getElementById(
            "destinationCount"
        );

    const searchInput =
        document.getElementById(
            "destinationSearch"
        );

    const clearButton =
        document.getElementById(
            "clearDestinationSearch"
        );


    const modal =
        document.getElementById(
            "destinationModal"
        );

    const modalClose =
        document.getElementById(
            "destinationModalClose"
        );


    let destinations = [];


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


    function getDestinationImage(
        destination
    ) {

        const name =
            destination?.name
                ?.toLowerCase() || "";


        const location =
            destination?.location
                ?.toLowerCase() || "";


        const combined =
            `${name} ${location}`;


        if (
            combined.includes("ella")
        ) {
            return "../assets/images/destination-ella.jpg";
        }


        if (
            combined.includes("galle")
        ) {
            return "../assets/images/destination-galle.jpg";
        }


        if (
            combined.includes("yala")
        ) {
            return "../assets/images/destination-yala.jpg";
        }


        if (
            combined.includes("sigiriya")
        ) {
            return "../assets/images/package-sigiriya.jpg";
        }


        if (
            combined.includes("mirissa")
        ) {
            return "../assets/images/package-mirissa.jpg";
        }


        /*
            If backend has an imageUrl,
            use it after our premium
            destination mappings.
        */
        if (
            destination?.imageUrl
        ) {

            const imageUrl =
                destination.imageUrl;


            if (
                imageUrl.startsWith("http")
            ) {
                return imageUrl;
            }


            if (
                imageUrl.startsWith("images/")
            ) {
                return `../assets/${imageUrl}`;
            }


            if (
                imageUrl.startsWith(
                    "assets/"
                )
            ) {
                return `../${imageUrl}`;
            }
        }


        return "../assets/images/packages-hero.jpg";
    }


    function normalizeList(value) {

        if (!value) {
            return [];
        }


        if (
            Array.isArray(value)
        ) {
            return value;
        }


        return String(value)
            .split(/[,;\n]/)
            .map(
                item =>
                    item.trim()
            )
            .filter(Boolean);
    }


    function renderDestinations(
        items
    ) {

        grid.innerHTML =
            "";


        destinationCount.textContent =
            `${items.length} ${
                items.length === 1
                    ? "destination"
                    : "destinations"
            } available`;


        if (
            items.length === 0
        ) {

            emptyState.hidden =
                false;

            return;
        }


        emptyState.hidden =
            true;


        items.forEach(
            destination => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "destination-page-card";


                const attractions =
                    normalizeList(
                        destination.attractions
                    )
                    .slice(
                        0,
                        3
                    );


                card.innerHTML = `

                    <div
                        class="destination-page-card-image"
                        style="
                            background-image:
                            linear-gradient(
                                180deg,
                                rgba(8, 30, 19, 0.05),
                                rgba(8, 30, 19, 0.70)
                            ),
                            url('${escapeHtml(getDestinationImage(
                                destination
                            ))}');
                        "
                    >

                        <div
                            class="destination-page-location"
                        >
                            ${escapeHtml(
                                destination.location ||
                                "Sri Lanka"
                            )}
                        </div>

                    </div>


                    <div class="destination-page-card-body">

                        <div>

                            <p class="section-eyebrow">
                                DISCOVER
                            </p>

                            <h3>
                                ${escapeHtml(
                                    destination.name
                                )}
                            </h3>

                        </div>


                        <p class="destination-card-description">
                            ${escapeHtml(
                                destination.description ||
                                "Discover one of Sri Lanka's remarkable destinations."
                            )}
                        </p>


                        <div class="destination-card-meta">

                            <div>

                                <span>
                                    Best Time
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        destination.bestTimeToVisit ||
                                        "Year-round"
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Highlights
                                </span>

                                <strong>
                                    ${
                                        attractions.length > 0
                                            ? attractions.length
                                            : "Explore"
                                    }
                                </strong>

                            </div>

                        </div>


                        ${
                            attractions.length > 0
                                ? `
                                    <div class="destination-mini-attractions">

                                        ${attractions
                                            .map(
                                                attraction => `
                                                    <span>
                                                        ${escapeHtml(
                                                            attraction
                                                        )}
                                                    </span>
                                                `
                                            )
                                            .join("")}

                                    </div>
                                `
                                : ""
                        }


                        <button
                            type="button"
                            class="destination-explore-btn"
                            data-id="${destination.destinationId}"
                        >
                            Explore Destination
                            <span>→</span>
                        </button>

                    </div>
                `;


                grid.appendChild(
                    card
                );
            }
        );


        document.querySelectorAll(
            ".destination-explore-btn"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                button.dataset.id
                            );


                        openDestination(
                            id
                        );
                    }
                );
            }
        );
    }


    function filterDestinations() {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!search) {

            renderDestinations(
                destinations
            );

            return;
        }


        const filtered =
            destinations.filter(
                destination => {

                    const text = `
                        ${destination.name || ""}
                        ${destination.location || ""}
                        ${destination.description || ""}
                        ${destination.attractions || ""}
                    `.toLowerCase();


                    return text.includes(
                        search
                    );
                }
            );


        renderDestinations(
            filtered
        );
    }


    async function openDestination(id) {

        try {

            const destination =
                await apiRequest(
                    `/Destinations/${id}`
                );


            document.getElementById(
                "destinationModalImage"
            ).style.backgroundImage =
                `linear-gradient(
                    180deg,
                    rgba(8,30,19,0.04),
                    rgba(8,30,19,0.30)
                ),
                url('${getDestinationImage(
                    destination
                )}')`;


            document.getElementById(
                "destinationModalName"
            ).textContent =
                destination.name ||
                "Destination";


            document.getElementById(
                "destinationModalLocation"
            ).textContent =
                destination.location ||
                "SRI LANKA";


            document.getElementById(
                "destinationModalLocationValue"
            ).textContent =
                destination.location ||
                "Sri Lanka";


            document.getElementById(
                "destinationModalDescription"
            ).textContent =
                destination.description ||
                "Discover this beautiful Sri Lankan destination.";


            document.getElementById(
                "destinationModalBestTime"
            ).textContent =
                destination.bestTimeToVisit ||
                "Year-round";


            document.getElementById(
                "destinationModalTips"
            ).textContent =
                destination.travelTips ||
                "Plan ahead and travel comfortably.";


            const attractionContainer =
                document.getElementById(
                    "destinationModalAttractions"
                );


            const attractions =
                normalizeList(
                    destination.attractions
                );


            attractionContainer.innerHTML =
                attractions.length > 0
                    ? attractions
                        .map(
                            attraction => `
                                <div>
                                    <span>✓</span>
                                    <p>
                                        ${escapeHtml(
                                            attraction
                                        )}
                                    </p>
                                </div>
                            `
                        )
                        .join("")
                    : `
                        <div>
                            <span>✓</span>
                            <p>
                                Explore local attractions
                                and experiences.
                            </p>
                        </div>
                    `;


            const packageButton =
                document.getElementById(
                    "destinationPackagesBtn"
                );


            packageButton.href =
                `packages.html?destination=${encodeURIComponent(
                    destination.name ||
                    destination.location ||
                    ""
                )}`;


            modal.classList.add(
                "show"
            );


            document.body.classList.add(
                "modal-open"
            );

        }
        catch (error) {

            messageBox.textContent =
                error.message ||
                "Unable to load destination details.";


            messageBox.className =
                "auth-message error";
        }
    }


    function closeModal() {

        modal.classList.remove(
            "show"
        );


        document.body.classList.remove(
            "modal-open"
        );
    }


    searchInput.addEventListener(
        "input",
        filterDestinations
    );


    clearButton.addEventListener(
        "click",
        () => {

            searchInput.value =
                "";


            renderDestinations(
                destinations
            );


            searchInput.focus();
        }
    );


    modalClose.addEventListener(
        "click",
        closeModal
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeModal();
            }
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal.classList.contains(
                    "show"
                )
            ) {

                closeModal();
            }
        }
    );


    async function loadDestinations() {

        try {

            loading.style.display =
                "flex";


            destinations =
                await apiRequest(
                    "/Destinations"
                );


            renderDestinations(
                destinations
            );

        }
        catch (error) {

            console.error(error);


            destinationCount.textContent =
                "Unable to load";


            messageBox.textContent =
                error.message ||
                "Unable to load destinations.";


            messageBox.className =
                "auth-message error";

        }
        finally {

            loading.style.display =
                "none";
        }
    }


    loadDestinations();
});

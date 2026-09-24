document.addEventListener("DOMContentLoaded", () => {

    if (!requireRole("Staff")) {
        return;
    }


    const form =
        document.getElementById(
            "staffPackageForm"
        );

    const editingIdInput =
        document.getElementById(
            "editingPackageId"
        );

    const formTitle =
        document.getElementById(
            "packageFormTitle"
        );

    const saveButton =
        document.getElementById(
            "savePackageBtn"
        );

    const cancelButton =
        document.getElementById(
            "cancelPackageEditBtn"
        );

    const activeGroup =
        document.getElementById(
            "packageActiveGroup"
        );

    const activeInput =
        document.getElementById(
            "packageIsActive"
        );

    const messageBox =
        document.getElementById(
            "staffPackageMessage"
        );

    const packageGrid =
        document.getElementById(
            "staffPackagesGrid"
        );

    const loading =
        document.getElementById(
            "staffPackagesLoading"
        );

    const emptyState =
        document.getElementById(
            "staffPackagesEmpty"
        );

    const searchInput =
        document.getElementById(
            "staffPackageSearch"
        );


    let allPackages = [];


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


    function getPackageImage(pkg) {

        const text =
            `${pkg.packageName || ""} ${pkg.destination || ""}`
                .toLowerCase();


        if (text.includes("ella")) {
            return "../../assets/images/package-ella.jpg";
        }


        if (text.includes("sigiriya")) {
            return "../../assets/images/package-sigiriya.jpg";
        }


        if (text.includes("mirissa")) {
            return "../../assets/images/package-mirissa.jpg";
        }


        if (pkg.imageUrl) {

            if (
                pkg.imageUrl.startsWith(
                    "http"
                )
            ) {
                return pkg.imageUrl;
            }


            if (
                pkg.imageUrl.startsWith(
                    "images/"
                )
            ) {
                return `../../assets/${pkg.imageUrl}`;
            }


            if (
                pkg.imageUrl.startsWith(
                    "assets/"
                )
            ) {
                return `../../${pkg.imageUrl}`;
            }
        }


        return "../../assets/images/packages-hero.jpg";
    }


    function resetForm() {

        form.reset();


        editingIdInput.value =
            "";


        formTitle.textContent =
            "Create New Package";


        saveButton.innerHTML =
            `Create Package <span>→</span>`;


        cancelButton.hidden =
            true;


        activeGroup.hidden =
            true;


        activeInput.checked =
            true;
    }


    async function loadLinkedServices() {

        try {

            const [
                accommodations,
                transportations
            ] =
                await Promise.all([

                    apiRequest(
                        "/Accommodations"
                    ),

                    apiRequest(
                        "/Transportations"
                    )

                ]);


            const accommodationSelect =
                document.getElementById(
                    "packageAccommodationId"
                );


            const transportationSelect =
                document.getElementById(
                    "packageTransportationId"
                );


            accommodationSelect.innerHTML = `
                <option value="">
                    No linked accommodation
                </option>
            `;


            accommodations.forEach(
                item => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        item.accommodationId;


                    option.textContent =
                        `${item.name} - ${item.location}`;


                    accommodationSelect.appendChild(
                        option
                    );
                }
            );


            transportationSelect.innerHTML = `
                <option value="">
                    No linked transportation
                </option>
            `;


            transportations.forEach(
                item => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        item.transportationId;


                    option.textContent =
                        `${item.transportType} - ${item.providerName}`;


                    transportationSelect.appendChild(
                        option
                    );
                }
            );

        }
        catch (error) {

            console.error(
                "Unable to load linked services:",
                error
            );
        }
    }


    function getFormData() {

        const accommodationId =
            document.getElementById(
                "packageAccommodationId"
            ).value;


        const transportationId =
            document.getElementById(
                "packageTransportationId"
            ).value;


        return {

            packageName:
                document.getElementById(
                    "packageName"
                )
                .value
                .trim(),

            destination:
                document.getElementById(
                    "packageDestination"
                )
                .value
                .trim(),

            description:
                document.getElementById(
                    "packageDescription"
                )
                .value
                .trim(),

            durationDays:
                Number(
                    document.getElementById(
                        "packageDuration"
                    ).value
                ),

            price:
                Number(
                    document.getElementById(
                        "packagePrice"
                    ).value
                ),

            accommodation:
                document.getElementById(
                    "packageAccommodation"
                )
                .value
                .trim(),

            transportation:
                document.getElementById(
                    "packageTransportation"
                )
                .value
                .trim(),

            activities:
                document.getElementById(
                    "packageActivities"
                )
                .value
                .trim(),

            imageUrl:
                document.getElementById(
                    "packageImageUrl"
                )
                .value
                .trim(),

            accommodationId:
                accommodationId
                    ? Number(
                        accommodationId
                    )
                    : null,

            transportationId:
                transportationId
                    ? Number(
                        transportationId
                    )
                    : null
        };
    }


    function renderPackages(
        packages
    ) {

        packageGrid.innerHTML =
            "";


        if (
            packages.length === 0
        ) {

            emptyState.hidden =
                false;

            return;
        }


        emptyState.hidden =
            true;


        packages.forEach(
            pkg => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "staff-package-card";


                card.innerHTML = `

                    <div
                        class="staff-package-card-image"
                        style="
                            background-image:
                            linear-gradient(
                                180deg,
                                rgba(8,30,19,0.02),
                                rgba(8,30,19,0.62)
                            ),
                            url('${escapeHtml(getPackageImage(
                                pkg
                            ))}');
                        "
                    >

                        <span>
                            ${escapeHtml(
                                pkg.destination
                            )}
                        </span>

                    </div>


                    <div class="staff-package-card-content">

                        <span class="staff-package-number">
                            PACKAGE #${pkg.tourPackageId}
                        </span>


                        <h3>
                            ${escapeHtml(
                                pkg.packageName
                            )}
                        </h3>


                        <p class="staff-package-description">
                            ${escapeHtml(
                                pkg.description
                            )}
                        </p>


                        <div class="staff-package-meta">

                            <div>

                                <span>
                                    Duration
                                </span>

                                <strong>
                                    ${pkg.durationDays} days
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Price
                                </span>

                                <strong>
                                    ${formatCurrency(
                                        pkg.price
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div class="staff-package-services">

                            <p>
                                <span>Stay</span>
                                ${escapeHtml(
                                    pkg.accommodationDetail?.name ||
                                    pkg.accommodation ||
                                    "Not specified"
                                )}
                            </p>


                            <p>
                                <span>Transport</span>
                                ${escapeHtml(
                                    pkg.transportationDetail?.transportType ||
                                    pkg.transportation ||
                                    "Not specified"
                                )}
                            </p>

                        </div>


                        <div class="staff-package-actions">

                            <button
                                type="button"
                                class="booking-outline-btn staff-package-edit"
                                data-id="${pkg.tourPackageId}"
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                class="staff-package-delete"
                                data-id="${pkg.tourPackageId}"
                            >
                                Deactivate
                            </button>

                        </div>

                    </div>
                `;


                packageGrid.appendChild(
                    card
                );
            }
        );


        document.querySelectorAll(
            ".staff-package-edit"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        editPackage(
                            Number(
                                button.dataset.id
                            )
                        );
                    }
                );
            }
        );


        document.querySelectorAll(
            ".staff-package-delete"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deletePackage(
                            Number(
                                button.dataset.id
                            )
                        );
                    }
                );
            }
        );
    }


    function applySearch() {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!search) {

            renderPackages(
                allPackages
            );

            return;
        }


        const filtered =
            allPackages.filter(
                pkg => {

                    const text = `
                        ${pkg.packageName || ""}
                        ${pkg.destination || ""}
                        ${pkg.description || ""}
                        ${pkg.activities || ""}
                    `.toLowerCase();


                    return text.includes(
                        search
                    );
                }
            );


        renderPackages(
            filtered
        );
    }


    function editPackage(id) {

        const pkg =
            allPackages.find(
                item =>
                    item.tourPackageId === id
            );


        if (!pkg) {
            return;
        }


        editingIdInput.value =
            pkg.tourPackageId;


        document.getElementById(
            "packageName"
        ).value =
            pkg.packageName || "";


        document.getElementById(
            "packageDestination"
        ).value =
            pkg.destination || "";


        document.getElementById(
            "packageDescription"
        ).value =
            pkg.description || "";


        document.getElementById(
            "packageDuration"
        ).value =
            pkg.durationDays || "";


        document.getElementById(
            "packagePrice"
        ).value =
            pkg.price || "";


        document.getElementById(
            "packageAccommodation"
        ).value =
            pkg.accommodation || "";


        document.getElementById(
            "packageTransportation"
        ).value =
            pkg.transportation || "";


        document.getElementById(
            "packageActivities"
        ).value =
            pkg.activities || "";


        document.getElementById(
            "packageImageUrl"
        ).value =
            pkg.imageUrl || "";


        document.getElementById(
            "packageAccommodationId"
        ).value =
            pkg.accommodationId || "";


        document.getElementById(
            "packageTransportationId"
        ).value =
            pkg.transportationId || "";


        activeInput.checked =
            pkg.isActive !== false;


        activeGroup.hidden =
            false;


        formTitle.textContent =
            "Edit Tour Package";


        saveButton.innerHTML =
            `Save Changes <span>→</span>`;


        cancelButton.hidden =
            false;


        window.scrollTo({
            top: 500,
            behavior: "smooth"
        });
    }


    async function deletePackage(id) {

        const confirmed =
            window.confirm(
                "Deactivate this package?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const result =
                await apiRequest(
                    `/TourPackages/${id}`,
                    {
                        method:
                            "DELETE"
                    }
                );


            showMessage(
                result.message ||
                "Package deactivated successfully.",
                "success"
            );


            await loadPackages();

        }
        catch (error) {

            showMessage(
                error.message ||
                "Unable to deactivate package.",
                "error"
            );
        }
    }


    async function loadPackages() {

        loading.style.display =
            "flex";


        try {

            allPackages =
                await apiRequest(
                    "/TourPackages"
                );


            applySearch();

        }
        catch (error) {

            showMessage(
                error.message ||
                "Unable to load tour packages.",
                "error"
            );

        }
        finally {

            loading.style.display =
                "none";
        }
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const editingId =
                Number(
                    editingIdInput.value
                );


            const data =
                getFormData();


            if (
                !data.packageName ||
                !data.destination ||
                !data.description ||
                data.durationDays <= 0 ||
                data.price <= 0
            ) {

                showMessage(
                    "Please complete the required package details.",
                    "error"
                );

                return;
            }


            saveButton.disabled =
                true;

            saveButton.textContent =
                editingId
                    ? "Saving changes..."
                    : "Creating package...";


            try {

                if (editingId) {

                    const updateData = {
                        ...data,
                        isActive:
                            activeInput.checked
                    };


                    const result =
                        await apiRequest(
                            `/TourPackages/${editingId}`,
                            {
                                method:
                                    "PUT",

                                body:
                                    JSON.stringify(
                                        updateData
                                    )
                            }
                        );


                    resetForm();


                    showMessage(
                        result.message ||
                        "Tour package updated successfully.",
                        "success"
                    );

                }
                else {

                    await apiRequest(
                        "/TourPackages",
                        {
                            method:
                                "POST",

                            body:
                                JSON.stringify(
                                    data
                                )
                        }
                    );


                    resetForm();


                    showMessage(
                        "Tour package created successfully.",
                        "success"
                    );
                }


                await loadPackages();

            }
            catch (error) {

                showMessage(
                    error.message ||
                    "Unable to save tour package.",
                    "error"
                );

            }
            finally {

                saveButton.disabled =
                    false;


                if (
                    editingIdInput.value
                ) {

                    saveButton.innerHTML =
                        `Save Changes <span>→</span>`;
                }
                else {

                    saveButton.innerHTML =
                        `Create Package <span>→</span>`;
                }
            }
        }
    );


    cancelButton.addEventListener(
        "click",
        () => {

            resetForm();

            showMessage(
                "",
                ""
            );
        }
    );


    searchInput.addEventListener(
        "input",
        applySearch
    );


    async function initialize() {

        await loadLinkedServices();

        await loadPackages();
    }


    initialize();
});

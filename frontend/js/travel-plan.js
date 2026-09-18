document.addEventListener("DOMContentLoaded", () => {

    if (!requireRole("Customer")) {
        return;
    }


    const form =
        document.getElementById(
            "travelPlanForm"
        );

    const bookingSelect =
        document.getElementById(
            "bookingSelect"
        );

    const travelPlanIdInput =
        document.getElementById(
            "travelPlanId"
        );

    const accommodationPreference =
        document.getElementById(
            "accommodationPreference"
        );

    const transportationPreference =
        document.getElementById(
            "transportationPreference"
        );

    const selectedActivities =
        document.getElementById(
            "selectedActivities"
        );

    const specialRequests =
        document.getElementById(
            "specialRequests"
        );

    const travelNotes =
        document.getElementById(
            "travelNotes"
        );

    const saveBtn =
        document.getElementById(
            "saveTravelPlanBtn"
        );

    const cancelEditBtn =
        document.getElementById(
            "cancelEditBtn"
        );

    const messageBox =
        document.getElementById(
            "travelPlanMessage"
        );

    const grid =
        document.getElementById(
            "travelPlansGrid"
        );

    const loading =
        document.getElementById(
            "travelPlansLoading"
        );

    const emptyState =
        document.getElementById(
            "emptyTravelPlans"
        );


    let bookings = [];
    let travelPlans = [];


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


    function resetForm() {

        form.reset();

        travelPlanIdInput.value =
            "";

        bookingSelect.disabled =
            false;

        cancelEditBtn.hidden =
            true;

        saveBtn.innerHTML =
            `Save Travel Plan <span>→</span>`;

        showMessage(
            "",
            ""
        );
    }


    function populateBookings() {

        bookingSelect.innerHTML =
            `<option value="">
                Choose a booking
            </option>`;


        const usedBookingIds =
            new Set(
                travelPlans.map(
                    plan =>
                        Number(
                            plan.bookingId
                        )
                )
            );


        bookings.forEach(
            booking => {

                if (
                    usedBookingIds.has(
                        Number(
                            booking.bookingId
                        )
                    )
                ) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    booking.bookingId;


                option.textContent =
                    `#${booking.bookingId} - ${
                        booking.tourPackage
                            ?.packageName ||
                        "GlobeTrek Journey"
                    } - ${formatDate(
                        booking.travelDate
                    )}`;


                bookingSelect.appendChild(
                    option
                );
            }
        );
    }


    function renderPlans() {

        grid.innerHTML =
            "";


        if (
            travelPlans.length === 0
        ) {

            emptyState.hidden =
                false;

            return;
        }


        emptyState.hidden =
            true;


        travelPlans.forEach(
            plan => {

                const booking =
                    plan.booking || {};


                const tourPackage =
                    booking.tourPackage || {};


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "travel-plan-card";


                card.innerHTML = `

                    <div class="travel-plan-card-top">

                        <div>

                            <span>
                                BOOKING #${plan.bookingId}
                            </span>

                            <h3>
                                ${escapeHtml(
                                    tourPackage.packageName ||
                                    "GlobeTrek Journey"
                                )}
                            </h3>

                            <p>
                                ${escapeHtml(
                                    tourPackage.destination ||
                                    "Sri Lanka"
                                )}
                            </p>

                        </div>


                        <div class="travel-plan-status">
                            Personalized
                        </div>

                    </div>


                    <div class="travel-plan-card-date">

                        <span>
                            Travel Date
                        </span>

                        <strong>
                            ${formatDate(
                                booking.travelDate
                            )}
                        </strong>

                    </div>


                    <div class="travel-plan-details-grid">

                        <div>
                            <span>
                                Accommodation
                            </span>

                            <p>
                                ${escapeHtml(
                                    plan.accommodationPreference ||
                                    "No preference added"
                                )}
                            </p>
                        </div>


                        <div>
                            <span>
                                Transportation
                            </span>

                            <p>
                                ${escapeHtml(
                                    plan.transportationPreference ||
                                    "No preference added"
                                )}
                            </p>
                        </div>


                        <div>
                            <span>
                                Activities
                            </span>

                            <p>
                                ${escapeHtml(
                                    plan.selectedActivities ||
                                    "No activities selected"
                                )}
                            </p>
                        </div>


                        <div>
                            <span>
                                Special Requests
                            </span>

                            <p>
                                ${escapeHtml(
                                    plan.specialRequests ||
                                    "No special requests"
                                )}
                            </p>
                        </div>

                    </div>


                    ${
                        plan.notes
                            ? `
                                <div class="travel-plan-notes">
                                    <span>Notes</span>

                                    <p>
                                        ${escapeHtml(
                                            plan.notes
                                        )}
                                    </p>
                                </div>
                            `
                            : ""
                    }


                    <div class="travel-plan-card-footer">

                        <small>
                            Updated ${
                                formatDate(
                                    plan.updatedAt
                                )
                            }
                        </small>


                        <div class="travel-plan-card-actions">

                            <button
                                type="button"
                                class="booking-outline-btn edit-plan-btn"
                                data-id="${plan.travelPlanId}"
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                class="travel-plan-delete-btn delete-plan-btn"
                                data-id="${plan.travelPlanId}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                `;


                grid.appendChild(
                    card
                );
            }
        );


        document.querySelectorAll(
            ".edit-plan-btn"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        editPlan(
                            Number(
                                button.dataset.id
                            )
                        )
                );
            }
        );


        document.querySelectorAll(
            ".delete-plan-btn"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        deletePlan(
                            Number(
                                button.dataset.id
                            )
                        )
                );
            }
        );
    }


    function editPlan(id) {

        const plan =
            travelPlans.find(
                item =>
                    Number(
                        item.travelPlanId
                    ) === id
            );


        if (!plan) {
            return;
        }


        travelPlanIdInput.value =
            plan.travelPlanId;


        bookingSelect.innerHTML = `
            <option value="${plan.bookingId}">
                Booking #${plan.bookingId}
            </option>
        `;


        bookingSelect.value =
            plan.bookingId;

        bookingSelect.disabled =
            true;


        accommodationPreference.value =
            plan.accommodationPreference ||
            "";


        transportationPreference.value =
            plan.transportationPreference ||
            "";


        selectedActivities.value =
            plan.selectedActivities ||
            "";


        specialRequests.value =
            plan.specialRequests ||
            "";


        travelNotes.value =
            plan.notes ||
            "";


        cancelEditBtn.hidden =
            false;


        saveBtn.innerHTML =
            `Update Travel Plan <span>→</span>`;


        window.scrollTo({
            top: 430,
            behavior: "smooth"
        });
    }


    async function deletePlan(id) {

        const confirmed =
            window.confirm(
                "Delete this travel plan?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await apiRequest(
                `/TravelPlans/${id}`,
                {
                    method: "DELETE"
                }
            );


            showMessage(
                "Travel plan deleted successfully.",
                "success"
            );


            await loadTravelPlans();

        }
        catch (error) {

            showMessage(
                error.message ||
                "Unable to delete travel plan.",
                "error"
            );
        }
    }


    async function loadBookings() {

        try {

            bookings =
                await apiRequest(
                    "/Bookings/my"
                );

        }
        catch (error) {

            showMessage(
                error.message ||
                "Unable to load your bookings.",
                "error"
            );
        }
    }


    async function loadTravelPlans() {

        loading.style.display =
            "flex";


        try {

            travelPlans =
                await apiRequest(
                    "/TravelPlans/my"
                );


            renderPlans();

            populateBookings();

        }
        catch (error) {

            showMessage(
                error.message ||
                "Unable to load travel plans.",
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


            const bookingId =
                Number(
                    bookingSelect.value
                );


            if (!bookingId) {

                showMessage(
                    "Please select a booking.",
                    "error"
                );

                return;
            }


            const requestBody = {

                bookingId,

                accommodationPreference:
                    accommodationPreference
                        .value
                        .trim(),

                transportationPreference:
                    transportationPreference
                        .value
                        .trim(),

                selectedActivities:
                    selectedActivities
                        .value
                        .trim(),

                specialRequests:
                    specialRequests
                        .value
                        .trim(),

                notes:
                    travelNotes
                        .value
                        .trim()
            };


            const travelPlanId =
                Number(
                    travelPlanIdInput.value
                );


            saveBtn.disabled =
                true;


            saveBtn.textContent =
                travelPlanId
                    ? "Updating plan..."
                    : "Saving plan...";


            try {

                let result;


                if (travelPlanId) {

                    result =
                        await apiRequest(
                            `/TravelPlans/${travelPlanId}`,
                            {
                                method:
                                    "PUT",

                                body:
                                    JSON.stringify(
                                        requestBody
                                    )
                            }
                        );

                }
                else {

                    result =
                        await apiRequest(
                            "/TravelPlans",
                            {
                                method:
                                    "POST",

                                body:
                                    JSON.stringify(
                                        requestBody
                                    )
                            }
                        );
                }


                showMessage(
                    result.message ||
                    "Travel plan saved successfully.",
                    "success"
                );


                resetForm();

                await loadTravelPlans();

            }
            catch (error) {

                showMessage(
                    error.message ||
                    "Unable to save travel plan.",
                    "error"
                );

            }
            finally {

                saveBtn.disabled =
                    false;


                if (
                    travelPlanIdInput.value
                ) {

                    saveBtn.innerHTML =
                        `Update Travel Plan <span>→</span>`;

                }
                else {

                    saveBtn.innerHTML =
                        `Save Travel Plan <span>→</span>`;
                }
            }

        }
    );


    cancelEditBtn.addEventListener(
        "click",
        () => {

            resetForm();

            populateBookings();
        }
    );


    async function initialize() {

        await loadBookings();

        await loadTravelPlans();
    }


    initialize();
});
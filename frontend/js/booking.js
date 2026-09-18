document.addEventListener("DOMContentLoaded", () => {

    if (!requireRole("Customer")) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const packageId =
        Number(
            params.get("packageId")
        );


    if (!packageId) {

        window.location.href =
            "../packages.html";

        return;
    }


    const bookingForm =
        document.getElementById(
            "bookingForm"
        );

    const bookingMessage =
        document.getElementById(
            "bookingMessage"
        );

    const confirmBookingBtn =
        document.getElementById(
            "confirmBookingBtn"
        );

    const travelDate =
        document.getElementById(
            "travelDate"
        );

    const travelersInput =
        document.getElementById(
            "numberOfTravelers"
        );

    const minusTraveler =
        document.getElementById(
            "minusTraveler"
        );

    const plusTraveler =
        document.getElementById(
            "plusTraveler"
        );


    let packageData = null;


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


    function getPackageImage(data) {

        const destination =
            data?.destination
                ?.toLowerCase() || "";


        if (
            destination.includes("ella")
        ) {
            return "../../assets/images/package-ella.jpg";
        }


        if (
            destination.includes("sigiriya") ||
            destination.includes("dambulla")
        ) {
            return "../../assets/images/package-sigiriya.jpg";
        }


        if (
            destination.includes("mirissa") ||
            destination.includes("galle")
        ) {
            return "../../assets/images/package-mirissa.jpg";
        }


        return "../../assets/images/packages-hero.jpg";
    }


    function updatePrice() {

        if (!packageData) {
            return;
        }


        const travelers =
            Math.max(
                1,
                Number(
                    travelersInput.value
                ) || 1
            );


        travelersInput.value =
            travelers;


        document.getElementById(
            "travelerPreview"
        ).textContent =
            travelers;


        document.getElementById(
            "singlePrice"
        ).textContent =
            formatCurrency(
                packageData.price
            );


        document.getElementById(
            "estimatedTotal"
        ).textContent =
            formatCurrency(
                packageData.price *
                travelers
            );
    }


    function setMinimumDate() {

        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");


        const day =
            String(
                now.getDate()
            ).padStart(2, "0");


        travelDate.min =
            `${year}-${month}-${day}`;
    }


    async function loadPackage() {

        try {

            packageData =
                await apiRequest(
                    `/TourPackages/${packageId}`
                );


            document.getElementById(
                "bookingPackageName"
            ).textContent =
                packageData.packageName;


            document.getElementById(
                "bookingPackageDestination"
            ).textContent =
                packageData.destination;


            document.getElementById(
                "bookingPackageDuration"
            ).textContent =
                `${packageData.durationDays} Days`;


            document.getElementById(
                "bookingPackageAccommodation"
            ).textContent =
                packageData
                    .accommodationDetail
                    ?.name ||
                packageData.accommodation ||
                "Included";


            document.getElementById(
                "bookingPackageTransport"
            ).textContent =
                packageData
                    .transportationDetail
                    ?.transportType ||
                packageData.transportation ||
                "Included";


            document.getElementById(
                "bookingPackageImage"
            ).style.backgroundImage =
                `url('${getPackageImage(
                    packageData
                )}')`;


            updatePrice();

        }
        catch (error) {

            bookingMessage.textContent =
                error.message ||
                "Unable to load this package.";

            bookingMessage.className =
                "auth-message error";


            confirmBookingBtn.disabled =
                true;
        }
    }


    minusTraveler.addEventListener(
        "click",
        () => {

            const current =
                Number(
                    travelersInput.value
                ) || 1;


            travelersInput.value =
                Math.max(
                    1,
                    current - 1
                );


            updatePrice();
        }
    );


    plusTraveler.addEventListener(
        "click",
        () => {

            const current =
                Number(
                    travelersInput.value
                ) || 1;


            travelersInput.value =
                current + 1;


            updatePrice();
        }
    );


    travelersInput.addEventListener(
        "input",
        updatePrice
    );


    bookingForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            bookingMessage.textContent =
                "";

            bookingMessage.className =
                "auth-message";


            const selectedDate =
                travelDate.value;


            const numberOfTravelers =
                Number(
                    travelersInput.value
                );


            if (!selectedDate) {

                bookingMessage.textContent =
                    "Please select your travel date.";

                bookingMessage.className =
                    "auth-message error";

                return;
            }


            if (
                numberOfTravelers <= 0
            ) {

                bookingMessage.textContent =
                    "Number of travelers must be greater than zero.";

                bookingMessage.className =
                    "auth-message error";

                return;
            }


            confirmBookingBtn.disabled =
                true;

            confirmBookingBtn.textContent =
                "Creating booking...";


            try {

                const result =
                    await apiRequest(
                        "/Bookings",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({
                                    tourPackageId:
                                        packageId,

                                    travelDate:
                                        `${selectedDate}T00:00:00`,

                                    numberOfTravelers
                                })
                        }
                    );


                bookingMessage.textContent =
                    result.message ||
                    "Booking created successfully.";

                bookingMessage.className =
                    "auth-message success";


                const bookingId =
                    result.booking
                        ?.bookingId;


                setTimeout(
                    () => {

                        if (bookingId) {

                            window.location.href =
                                `payment.html?bookingId=${bookingId}`;

                        }
                        else {

                            window.location.href =
                                "my-bookings.html";
                        }

                    },
                    1000
                );

            }
            catch (error) {

                bookingMessage.textContent =
                    error.message ||
                    "Unable to create booking.";

                bookingMessage.className =
                    "auth-message error";


                confirmBookingBtn.disabled =
                    false;

                confirmBookingBtn.innerHTML =
                    `Confirm Booking <span>→</span>`;
            }

        }
    );


    setMinimumDate();

    loadPackage();
});
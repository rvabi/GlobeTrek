document.addEventListener("DOMContentLoaded", () => {

    if (!requireRole("Customer")) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const bookingId =
        Number(
            params.get("bookingId")
        );


    if (!bookingId) {

        window.location.href =
            "my-bookings.html";

        return;
    }


    const paymentForm =
        document.getElementById(
            "paymentForm"
        );

    const paymentBtn =
        document.getElementById(
            "paymentBtn"
        );

    const paymentMessage =
        document.getElementById(
            "paymentMessage"
        );

    const transactionReference =
        document.getElementById(
            "transactionReference"
        );

    const successModal =
        document.getElementById(
            "paymentSuccessModal"
        );


    let bookingData = null;


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
                month: "long",
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

        paymentMessage.textContent =
            message;

        paymentMessage.className =
            "auth-message";


        if (type) {

            paymentMessage.classList.add(
                type
            );
        }
    }


    async function loadBooking() {

        try {

            bookingData =
                await apiRequest(
                    `/Bookings/${bookingId}`
                );


            const tourPackage =
                bookingData.tourPackage;


            document.getElementById(
                "summaryBookingId"
            ).textContent =
                `#${bookingData.bookingId}`;


            document.getElementById(
                "paymentPackageName"
            ).textContent =
                tourPackage?.packageName ||
                "GlobeTrek Journey";


            document.getElementById(
                "summaryDestination"
            ).textContent =
                tourPackage?.destination ||
                "Sri Lanka";


            document.getElementById(
                "summaryTravelDate"
            ).textContent =
                formatDate(
                    bookingData.travelDate
                );


            document.getElementById(
                "summaryTravelers"
            ).textContent =
                bookingData.numberOfTravelers;


            document.getElementById(
                "summaryStatus"
            ).textContent =
                bookingData.bookingStatus;


            document.getElementById(
                "summaryTotal"
            ).textContent =
                formatCurrency(
                    bookingData.totalAmount
                );


            if (
                bookingData.bookingStatus
                    ?.toLowerCase() ===
                "confirmed"
            ) {

                showMessage(
                    "This booking is already confirmed.",
                    "success"
                );
            }

        }
        catch (error) {

            console.error(error);


            showMessage(
                error.message ||
                "Unable to load booking details.",
                "error"
            );


            paymentBtn.disabled =
                true;
        }
    }


    paymentForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            showMessage(
                "",
                ""
            );


            const selectedMethod =
                document.querySelector(
                    'input[name="paymentMethod"]:checked'
                );


            const reference =
                transactionReference
                    .value
                    .trim();


            if (!selectedMethod) {

                showMessage(
                    "Please select a payment method.",
                    "error"
                );

                return;
            }


            if (!reference) {

                showMessage(
                    "Please enter a transaction reference.",
                    "error"
                );

                return;
            }


            paymentBtn.disabled =
                true;

            paymentBtn.textContent =
                "Processing payment...";


            try {

                const result =
                    await apiRequest(
                        "/Payments",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({
                                    bookingId:
                                        bookingId,

                                    paymentMethod:
                                        selectedMethod.value,

                                    transactionReference:
                                        reference
                                })
                        }
                    );


                showMessage(
                    result.message ||
                    "Payment completed successfully.",
                    "success"
                );


                successModal.classList.add(
                    "show"
                );

            }
            catch (error) {

                console.error(error);


                showMessage(
                    error.message ||
                    "Unable to complete payment.",
                    "error"
                );


                paymentBtn.disabled =
                    false;

                paymentBtn.innerHTML =
                    `Complete Payment <span>→</span>`;
            }

        }
    );


    loadBooking();
});
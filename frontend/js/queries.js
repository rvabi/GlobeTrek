document.addEventListener("DOMContentLoaded", () => {

    if (!requireRole("Customer")) {
        return;
    }


    const form =
        document.getElementById(
            "queryForm"
        );

    const subjectInput =
        document.getElementById(
            "querySubject"
        );

    const messageInput =
        document.getElementById(
            "queryText"
        );

    const subjectCount =
        document.getElementById(
            "subjectCount"
        );

    const messageCount =
        document.getElementById(
            "messageCount"
        );

    const submitBtn =
        document.getElementById(
            "submitQueryBtn"
        );

    const messageBox =
        document.getElementById(
            "queryMessage"
        );

    const loading =
        document.getElementById(
            "queriesLoading"
        );

    const emptyState =
        document.getElementById(
            "emptyQueries"
        );

    const grid =
        document.getElementById(
            "queriesGrid"
        );

    const filterButtons =
        document.querySelectorAll(
            ".query-filter"
        );


    let allQueries = [];


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
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
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
                ?.toLowerCase() || "";


        if (value === "resolved") {
            return "query-status-resolved";
        }


        if (value === "closed") {
            return "query-status-closed";
        }


        if (value === "in progress") {
            return "query-status-progress";
        }


        return "query-status-open";
    }


    function canDelete(status) {

        const value =
            status
                ?.toLowerCase();


        return (
            value !== "resolved" &&
            value !== "closed"
        );
    }


    function renderQueries(
        queries
    ) {

        grid.innerHTML =
            "";


        if (
            allQueries.length === 0
        ) {

            emptyState.hidden =
                false;

            return;
        }


        emptyState.hidden =
            true;


        if (
            queries.length === 0
        ) {

            grid.innerHTML = `
                <div class="filtered-empty-state">

                    <h3>
                        No matching queries
                    </h3>

                    <p>
                        You don't have any support
                        requests with this status.
                    </p>

                </div>
            `;

            return;
        }


        queries.forEach(
            query => {

                const status =
                    query.queryStatus ||
                    "Open";


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "query-history-card";


                card.innerHTML = `

                    <div class="query-history-top">

                        <div>

                            <span class="query-number">
                                QUERY #${query.customerQueryId}
                            </span>

                            <h3>
                                ${escapeHtml(
                                    query.subject
                                )}
                            </h3>

                            <small>
                                Submitted
                                ${formatDate(
                                    query.createdAt
                                )}
                            </small>

                        </div>


                        <span
                            class="
                                query-status-badge
                                ${getStatusClass(
                                    status
                                )}
                            "
                        >
                            ${escapeHtml(status)}
                        </span>

                    </div>


                    <div class="query-customer-message">

                        <span>
                            YOUR MESSAGE
                        </span>

                        <p>
                            ${escapeHtml(
                                query.message
                            )}
                        </p>

                    </div>


                    ${
                        query.response
                            ? `
                                <div class="query-response-box">

                                    <div class="query-response-title">

                                        <span>
                                            ✦
                                        </span>

                                        <strong>
                                            GlobeTrek Response
                                        </strong>

                                    </div>

                                    <p>
                                        ${escapeHtml(
                                            query.response
                                        )}
                                    </p>

                                    ${
                                        query.respondedAt
                                            ? `
                                                <small>
                                                    Responded
                                                    ${formatDate(
                                                        query.respondedAt
                                                    )}
                                                </small>
                                            `
                                            : ""
                                    }

                                </div>
                            `
                            : `
                                <div class="query-awaiting-response">

                                    <span>
                                        ◷
                                    </span>

                                    <p>
                                        Your query has been received.
                                        A response will appear here
                                        once the travel team replies.
                                    </p>

                                </div>
                            `
                    }


                    <div class="query-history-footer">

                        <span>
                            Status:
                            <strong>
                                ${escapeHtml(status)}
                            </strong>
                        </span>


                        ${
                            canDelete(status)
                                ? `
                                    <button
                                        type="button"
                                        class="query-delete-btn"
                                        data-id="${query.customerQueryId}"
                                    >
                                        Delete Query
                                    </button>
                                `
                                : `
                                    <span class="query-locked-note">
                                        Finalized
                                    </span>
                                `
                        }

                    </div>
                `;


                grid.appendChild(
                    card
                );
            }
        );


        document.querySelectorAll(
            ".query-delete-btn"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteQuery(
                            Number(
                                button.dataset.id
                            )
                        );
                    }
                );
            }
        );
    }


    function filterQueries(
        filter
    ) {

        if (
            filter === "all"
        ) {

            renderQueries(
                allQueries
            );

            return;
        }


        const filtered =
            allQueries.filter(
                query =>
                    query.queryStatus
                        ?.toLowerCase() ===
                    filter
            );


        renderQueries(
            filtered
        );
    }


    async function loadQueries() {

        loading.style.display =
            "flex";


        try {

            allQueries =
                await apiRequest(
                    "/CustomerQueries/my"
                );


            renderQueries(
                allQueries
            );

        }
        catch (error) {

            console.error(error);


            showMessage(
                error.message ||
                "Unable to load your queries.",
                "error"
            );

        }
        finally {

            loading.style.display =
                "none";
        }
    }


    async function deleteQuery(id) {

        const confirmed =
            window.confirm(
                "Delete this query?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const result =
                await apiRequest(
                    `/CustomerQueries/${id}`,
                    {
                        method:
                            "DELETE"
                    }
                );


            showMessage(
                result.message ||
                "Query deleted successfully.",
                "success"
            );


            await loadQueries();

        }
        catch (error) {

            showMessage(
                error.message ||
                "Unable to delete query.",
                "error"
            );
        }
    }


    subjectInput.addEventListener(
        "input",
        () => {

            subjectCount.textContent =
                subjectInput.value.length;
        }
    );


    messageInput.addEventListener(
        "input",
        () => {

            messageCount.textContent =
                messageInput.value.length;
        }
    );


    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    filterButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    filterQueries(
                        button.dataset.filter
                    );
                }
            );
        }
    );


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const subject =
                subjectInput
                    .value
                    .trim();


            const message =
                messageInput
                    .value
                    .trim();


            if (
                !subject ||
                !message
            ) {

                showMessage(
                    "Subject and message are required.",
                    "error"
                );

                return;
            }


            submitBtn.disabled =
                true;

            submitBtn.textContent =
                "Submitting query...";


            try {

                const result =
                    await apiRequest(
                        "/CustomerQueries",
                        {
                            method:
                                "POST",

                            body:
                                JSON.stringify({
                                    subject,
                                    message
                                })
                        }
                    );


                showMessage(
                    result.message ||
                    "Query submitted successfully.",
                    "success"
                );


                form.reset();

                subjectCount.textContent =
                    "0";

                messageCount.textContent =
                    "0";


                await loadQueries();

            }
            catch (error) {

                showMessage(
                    error.message ||
                    "Unable to submit query.",
                    "error"
                );

            }
            finally {

                submitBtn.disabled =
                    false;

                submitBtn.innerHTML =
                    `Submit Query <span>→</span>`;
            }

        }
    );


    loadQueries();
});
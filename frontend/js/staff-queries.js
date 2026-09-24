document.addEventListener("DOMContentLoaded", () => {

    if (!requireRole("Staff")) {
        return;
    }


    const grid =
        document.getElementById(
            "staffQueriesGrid"
        );

    const loading =
        document.getElementById(
            "staffQueriesLoading"
        );

    const emptyState =
        document.getElementById(
            "staffQueriesEmpty"
        );

    const messageBox =
        document.getElementById(
            "staffQueriesMessage"
        );

    const searchInput =
        document.getElementById(
            "staffQuerySearch"
        );

    const statusFilter =
        document.getElementById(
            "staffQueryFilter"
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
                ?.toLowerCase();


        if (
            value === "in progress"
        ) {
            return "staff-query-progress";
        }


        if (
            value === "resolved"
        ) {
            return "staff-query-resolved";
        }


        if (
            value === "closed"
        ) {
            return "staff-query-closed";
        }


        return "staff-query-open";
    }


    function updateStats() {

        document.getElementById(
            "queryTotalCount"
        ).textContent =
            allQueries.length;


        document.getElementById(
            "queryOpenCount"
        ).textContent =
            allQueries.filter(
                query =>
                    query.queryStatus
                        ?.toLowerCase() ===
                    "open"
            ).length;


        document.getElementById(
            "queryProgressCount"
        ).textContent =
            allQueries.filter(
                query =>
                    query.queryStatus
                        ?.toLowerCase() ===
                    "in progress"
            ).length;


        document.getElementById(
            "queryResolvedCount"
        ).textContent =
            allQueries.filter(
                query =>
                    query.queryStatus
                        ?.toLowerCase() ===
                    "resolved"
            ).length;
    }


    function renderQueries(
        queries
    ) {

        grid.innerHTML =
            "";


        if (
            queries.length === 0
        ) {

            emptyState.hidden =
                false;

            return;
        }


        emptyState.hidden =
            true;


        queries.forEach(
            query => {

                const customer =
                    query.customer || {};


                const customerName =
                    `${customer.firstName || ""} ${customer.lastName || ""}`
                        .trim() ||
                    "Customer";


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "staff-query-card";


                card.innerHTML = `

                    <div class="staff-query-card-top">

                        <div>

                            <span class="staff-query-number">
                                QUERY #${query.customerQueryId}
                            </span>


                            <h3>
                                ${escapeHtml(
                                    query.subject
                                )}
                            </h3>


                            <p>
                                Submitted
                                ${formatDate(
                                    query.createdAt
                                )}
                            </p>

                        </div>


                        <span
                            class="
                                staff-query-status
                                ${getStatusClass(
                                    query.queryStatus
                                )}
                            "
                        >
                            ${escapeHtml(
                                query.queryStatus ||
                                "Open"
                            )}
                        </span>

                    </div>


                    <div class="staff-query-customer">

                        <div class="staff-query-avatar">

                            ${escapeHtml(
                                customerName
                                    .charAt(0)
                                    .toUpperCase()
                            )}

                        </div>


                        <div>

                            <span>
                                CUSTOMER
                            </span>

                            <strong>
                                ${escapeHtml(
                                    customerName
                                )}
                            </strong>

                            <p>
                                ${escapeHtml(
                                    customer.email ||
                                    ""
                                )}
                            </p>

                        </div>

                    </div>


                    <div class="staff-query-message">

                        <span>
                            CUSTOMER MESSAGE
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
                                <div class="staff-existing-response">

                                    <span>
                                        CURRENT RESPONSE
                                    </span>

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
                            : ""
                    }


                    <div class="staff-query-response-form">

                        <div class="form-group">

                            <label>
                                Response
                            </label>

                            <textarea
                                class="staff-query-response-input"
                                data-id="${query.customerQueryId}"
                                rows="5"
                                maxlength="2000"
                                placeholder="Write a clear response for the customer..."
                            >${escapeHtml(
                                query.response || ""
                            )}</textarea>

                        </div>


                        <div class="staff-query-response-actions">

                            <div class="form-group">

                                <label>
                                    Query Status
                                </label>

                                <select
                                    class="staff-query-status-select"
                                    data-id="${query.customerQueryId}"
                                >

                                    <option
                                        value="Open"
                                        ${
                                            query.queryStatus ===
                                            "Open"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Open
                                    </option>


                                    <option
                                        value="In Progress"
                                        ${
                                            query.queryStatus ===
                                            "In Progress"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        In Progress
                                    </option>


                                    <option
                                        value="Resolved"
                                        ${
                                            query.queryStatus ===
                                            "Resolved"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Resolved
                                    </option>


                                    <option
                                        value="Closed"
                                        ${
                                            query.queryStatus ===
                                            "Closed"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Closed
                                    </option>

                                </select>

                            </div>


                            <button
                                type="button"
                                class="btn btn-primary staff-query-save-btn"
                                data-id="${query.customerQueryId}"
                            >
                                Save Response
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
            ".staff-query-save-btn"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            Number(
                                button.dataset.id
                            );


                        await saveResponse(
                            id,
                            button
                        );
                    }
                );
            }
        );
    }


    function applyFilters() {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        const status =
            statusFilter.value
                .toLowerCase();


        const filtered =
            allQueries.filter(
                query => {

                    const customer =
                        query.customer || {};


                    const text = `
                        ${query.customerQueryId || ""}
                        ${query.subject || ""}
                        ${query.message || ""}
                        ${query.response || ""}
                        ${customer.firstName || ""}
                        ${customer.lastName || ""}
                        ${customer.email || ""}
                    `.toLowerCase();


                    const matchesSearch =
                        !search ||
                        text.includes(
                            search
                        );


                    const queryStatus =
                        query.queryStatus
                            ?.toLowerCase() || "";


                    const matchesStatus =
                        status === "all" ||
                        queryStatus ===
                        status;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );


        renderQueries(
            filtered
        );
    }


    async function saveResponse(
        id,
        button
    ) {

        const responseInput =
            document.querySelector(
                `.staff-query-response-input[data-id="${id}"]`
            );


        const statusSelect =
            document.querySelector(
                `.staff-query-status-select[data-id="${id}"]`
            );


        if (
            !responseInput ||
            !statusSelect
        ) {
            return;
        }


        const response =
            responseInput.value
                .trim();


        const queryStatus =
            statusSelect.value;


        if (!response) {

            showMessage(
                "Response is required.",
                "error"
            );

            responseInput.focus();

            return;
        }


        const originalText =
            button.textContent;


        button.disabled =
            true;

        button.textContent =
            "Saving...";


        try {

            const result =
                await apiRequest(
                    `/CustomerQueries/${id}/respond`,
                    {
                        method:
                            "PUT",

                        body:
                            JSON.stringify({
                                response,
                                queryStatus
                            })
                    }
                );


            showMessage(
                result.message ||
                "Query response saved successfully.",
                "success"
            );


            await loadQueries();

        }
        catch (error) {

            showMessage(
                error.message ||
                "Unable to save query response.",
                "error"
            );

        }
        finally {

            button.disabled =
                false;

            button.textContent =
                originalText;
        }
    }


    async function loadQueries() {

        loading.style.display =
            "flex";


        try {

            allQueries =
                await apiRequest(
                    "/CustomerQueries"
                );


            updateStats();

            applyFilters();

        }
        catch (error) {

            console.error(error);


            showMessage(
                error.message ||
                "Unable to load customer queries.",
                "error"
            );

        }
        finally {

            loading.style.display =
                "none";
        }
    }


    searchInput.addEventListener(
        "input",
        applyFilters
    );


    statusFilter.addEventListener(
        "change",
        applyFilters
    );


    loadQueries();
});
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const isAuthEndpoint = endpoint.toLowerCase().startsWith("/auth/");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token && !isAuthEndpoint) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;

    let response;
    try {
        response = await fetch(url, { ...options, headers });
    } catch {
        throw new Error("Cannot connect to GlobeTrek right now. Please check your connection and try again.");
    }

    let data = null;

    const contentType =
        response.headers.get("content-type");

    if (
        contentType &&
        contentType.includes("application/json")
    ) {
        data = await response.json();
    }

    if (!response.ok) {
        const validationMessages = data?.errors && typeof data.errors === "object"
            ? Object.values(data.errors).flat().filter(message => typeof message === "string" && message.trim())
            : [];
        const message = validationMessages.length
            ? validationMessages.join(" ")
            : (typeof data?.message === "string" && data.message.trim())
                ? data.message
                : `Request failed (${response.status}). Please try again.`;

        if (response.status === 401 && !isAuthEndpoint) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            const loginPath = typeof getAuthPagePath === "function"
                ? getAuthPagePath("login.html")
                : "/frontend/pages/login.html";
            window.location.assign(`${loginPath}?returnUrl=${encodeURIComponent(window.location.href)}`);
        }

        const error = new Error(message);
        error.status = response.status;
        throw error;
    }

    return data;
}

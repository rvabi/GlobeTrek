async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;

    console.log("API Request:", url);

    const response = await fetch(url, {
        ...options,
        headers
    });

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
        throw new Error(
            data?.message ||
            `Request failed: ${response.status}`
        );
    }

    return data;
}
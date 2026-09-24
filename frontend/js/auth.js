function normalizeRole(role) {
    if (role === 1 || role === "1") {
        return "Customer";
    }

    if (role === 2 || role === "2") {
        return "Staff";
    }

    if (role === 3 || role === "3") {
        return "Admin";
    }

    return role || "Customer";
}


function saveAuthData(authData) {
    if (!authData) {
        return;
    }

    if (authData.token) {
        localStorage.setItem(
            "token",
            authData.token
        );
    }

    const source =
        authData.user || authData;

    const user = {
        id:
            source.userId ??
            source.id ??
            null,

        firstName:
            source.firstName ??
            "",

        lastName:
            source.lastName ??
            "",

        email:
            source.email ??
            "",

        role:
            normalizeRole(
                source.role
            )
    };

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );
}


function getToken() {
    return localStorage.getItem(
        "token"
    );
}


function getCurrentUser() {
    const raw =
        localStorage.getItem(
            "user"
        );

    if (!raw) {
        return null;
    }

    try {
        const user =
            JSON.parse(raw);

        user.role =
            normalizeRole(
                user.role
            );

        return user;
    }
    catch {
        return null;
    }
}


function logout() {
    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    window.location.href =
        getAuthPagePath(
            "login.html"
        );
}


function getAuthPagePath(file) {
    const path =
        window.location.pathname;

    if (
        path.includes(
            "/pages/customer/"
        ) ||
        path.includes(
            "/pages/staff/"
        ) ||
        path.includes(
            "/pages/admin/"
        )
    ) {
        return `../${file}`;
    }

    return file;
}


function requireAuth() {
    if (!getToken()) {
        const currentUrl =
            window.location.href;

        window.location.href =
            `${getAuthPagePath(
                "login.html"
            )}?returnUrl=${encodeURIComponent(
                currentUrl
            )}`;

        return false;
    }

    return true;
}


function requireRole(allowedRoles) {
    if (!requireAuth()) {
        return false;
    }

    const user =
        getCurrentUser();

    if (!user) {
        logout();
        return false;
    }

    const roles =
        Array.isArray(allowedRoles)
            ? allowedRoles
            : [allowedRoles];

    const normalizedAllowedRoles =
        roles.map(
            role =>
                normalizeRole(role)
        );

    const adminInheritsStaff =
        user.role === "Admin" &&
        normalizedAllowedRoles.includes(
            "Staff"
        );

    const allowed =
        normalizedAllowedRoles.includes(
            user.role
        ) ||
        adminInheritsStaff;

    if (!allowed) {
        alert(
            "You do not have permission to access this page."
        );

        if (user.role === "Admin") {
            window.location.href =
                "../admin/dashboard.html";
            return false;
        }

        if (user.role === "Staff") {
            window.location.href =
                "../staff/dashboard.html";
            return false;
        }

        window.location.href =
            "../packages.html";

        return false;
    }

    return true;
}


function getLoginRedirect() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get(
        "returnUrl"
    );
}


async function handleLogin(event) {
    event.preventDefault();

    const messageBox =
        document.getElementById(
            "loginMessage"
        );

    const loginBtn =
        document.getElementById(
            "loginBtn"
        );

    const email =
        document.getElementById(
            "loginEmail"
        )
        .value
        .trim();

    const password =
        document.getElementById(
            "loginPassword"
        )
        .value;

    setAuthMessage(
        messageBox,
        "",
        ""
    );

    if (!email || !password) {
        setAuthMessage(
            messageBox,
            "Email and password are required.",
            "error"
        );

        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent =
        "Signing in...";

    try {
        const result =
            await apiRequest(
                "/Auth/login",
                {
                    method: "POST",
                    body:
                        JSON.stringify({
                            email,
                            password
                        })
                }
            );

        saveAuthData(result);

        const user =
            getCurrentUser();

        if (!user || !getToken()) {
            throw new Error(
                "Login information could not be saved."
            );
        }

        const returnUrl =
            getLoginRedirect();

        if (returnUrl) {
            try {
                const destination = new URL(returnUrl, window.location.href);
                if (destination.origin === window.location.origin &&
                    (destination.pathname.startsWith("/frontend/pages/") ||
                     destination.pathname.startsWith("/pages/"))) {
                    window.location.href = destination.href;
                    return;
                }
            } catch {
                // Ignore an invalid return URL and use the role landing page.
            }
        }

        if (user.role === "Admin") {
            window.location.href =
                "admin/dashboard.html";
            return;
        }

        if (user.role === "Staff") {
            window.location.href =
                "staff/dashboard.html";
            return;
        }

        window.location.href =
            "packages.html";
    }
    catch (error) {
        setAuthMessage(
            messageBox,
            error.message ||
            "Unable to sign in.",
            "error"
        );

        loginBtn.disabled =
            false;

        loginBtn.innerHTML =
            `Sign In <span>→</span>`;
    }
}


async function handleRegister(event) {
    event.preventDefault();

    const messageBox =
        document.getElementById(
            "registerMessage"
        );

    const registerBtn =
        document.getElementById(
            "registerBtn"
        );

    const firstName =
        document.getElementById(
            "firstName"
        )
        .value
        .trim();

    const lastName =
        document.getElementById(
            "lastName"
        )
        .value
        .trim();

    const email =
        document.getElementById(
            "registerEmail"
        )
        .value
        .trim();

    const phoneNumber =
        document.getElementById(
            "phoneNumber"
        )
        .value
        .trim();

    const password =
        document.getElementById(
            "registerPassword"
        )
        .value;

    setAuthMessage(
        messageBox,
        "",
        ""
    );

    if (
        !firstName ||
        !lastName ||
        !email ||
        !password
    ) {
        setAuthMessage(
            messageBox,
            "Please complete all required fields.",
            "error"
        );

        return;
    }

    registerBtn.disabled =
        true;

    registerBtn.textContent =
        "Creating account...";

    try {
        await apiRequest(
            "/Auth/register",
            {
                method: "POST",
                body:
                    JSON.stringify({
                        firstName,
                        lastName,
                        email,
                        phoneNumber,
                        password
                    })
            }
        );

        setAuthMessage(
            messageBox,
            "Account created successfully. Redirecting to sign in...",
            "success"
        );

        setTimeout(
            () => {
                window.location.href =
                    `login.html?email=${encodeURIComponent(
                        email
                    )}`;
            },
            1000
        );
    }
    catch (error) {
        setAuthMessage(
            messageBox,
            error.message ||
            "Unable to create account.",
            "error"
        );

        registerBtn.disabled =
            false;

        registerBtn.innerHTML =
            `Create Account <span>→</span>`;
    }
}


function setAuthMessage(
    element,
    message,
    type
) {
    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        "auth-message";

    if (type) {
        element.classList.add(
            type
        );
    }
}


function setupPasswordToggle(
    buttonId,
    inputId
) {
    const button =
        document.getElementById(
            buttonId
        );

    const input =
        document.getElementById(
            inputId
        );

    if (!button || !input) {
        return;
    }

    button.addEventListener(
        "click",
        () => {
            const hidden =
                input.type ===
                "password";

            input.type =
                hidden
                    ? "text"
                    : "password";

            button.textContent =
                hidden
                    ? "Hide"
                    : "Show";
        }
    );
}


document.addEventListener(
    "DOMContentLoaded",
    () => {
        const loginForm =
            document.getElementById(
                "loginForm"
            );

        if (loginForm) {
            const params =
                new URLSearchParams(
                    window.location.search
                );

            const email =
                params.get("email");

            if (email) {
                const emailInput =
                    document.getElementById(
                        "loginEmail"
                    );

                if (emailInput) {
                    emailInput.value =
                        email;
                }
            }

            loginForm.addEventListener(
                "submit",
                handleLogin
            );

            setupPasswordToggle(
                "loginPasswordToggle",
                "loginPassword"
            );
        }

        const registerForm =
            document.getElementById(
                "registerForm"
            );

        if (registerForm) {
            registerForm.addEventListener(
                "submit",
                handleRegister
            );

            setupPasswordToggle(
                "registerPasswordToggle",
                "registerPassword"
            );
        }
    }
);

function addAdminReturnButton() {

    const user = getCurrentUser();

    if (!user || user.role !== "Admin") {
        return;
    }

    const currentPath =
        window.location.pathname.toLowerCase();

    if (!currentPath.includes("/pages/staff/")) {
        return;
    }

    if (
        document.getElementById(
            "adminReturnButton"
        )
    ) {
        return;
    }

    const button =
        document.createElement("a");

    button.id =
        "adminReturnButton";

    button.href =
        "../admin/dashboard.html";

    button.className =
        "admin-return-button";

    button.innerHTML =
        "← Back to Admin Dashboard";

    document.body.appendChild(button);
}


document.addEventListener(
    "DOMContentLoaded",
    () => {
        addAdminReturnButton();
    }
);

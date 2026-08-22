// ==========================================
// PROTECT LOGGED-IN PAGES
// ==========================================
async function protectPage() {
    try {
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        // NOT LOGGED IN
        if (userError || !user) {
            clearCurrentUser();
            window.location.replace("login.html");
            return;
        }

        // GET CURRENT USER PROFILE
        const { data: profile, error: profileError } =
            await supabaseClient
                .from("profiles")
                .select("full_name, email, role, status")
                .eq("id", user.id)
                .single();

        if (profileError || !profile) {
            await supabaseClient.auth.signOut({
                scope: "local"
            });

            clearCurrentUser();
            window.location.replace("login.html");
            return;
        }

        // BLOCK INACTIVE USER
        if (profile.status !== "active") {
            await supabaseClient.auth.signOut({
                scope: "local"
            });

            clearCurrentUser();

            alert(
                "Your account is inactive. Contact administrator."
            );

            window.location.replace("login.html");
            return;
        }

        // SAVE FRESH USER DETAILS
        localStorage.setItem(
            "currentUser",
            profile.full_name || profile.email
        );

        localStorage.setItem(
            "currentUserEmail",
            profile.email
        );

        localStorage.setItem(
            "currentRole",
            profile.role
        );

        localStorage.setItem(
            "currentUserId",
            user.id
        );

        // APPLY ROLE PERMISSIONS
        if (typeof applyPermissions === "function") {
            applyPermissions();
        }

        if (typeof startPermissionObserver === "function") {
            startPermissionObserver();
        }

    } catch (error) {
        console.error(
            "Authentication Error:",
            error
        );

        clearCurrentUser();

        window.location.replace(
            "login.html"
        );
    }
}


// ==========================================
// CLEAR LOCAL USER DATA
// ==========================================
function clearCurrentUser() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("currentRole");
    localStorage.removeItem("currentUserId");
}


// ==========================================
// REAL SUPABASE LOGOUT
// ==========================================
document.addEventListener(
    "click",
    async function(event) {

        const logoutButton =
            event.target.closest("#logoutButton");

        if (!logoutButton) {
            return;
        }

        event.preventDefault();

        // STOP OLD PAGE LOGOUT HANDLERS
        event.stopImmediatePropagation();

        logoutButton.disabled = true;

        try {
            const { error } =
                await supabaseClient.auth.signOut({
                    scope: "local"
                });

            if (error) {
                console.error(
                    "Logout Error:",
                    error
                );

                alert(
                    "Logout failed. Please try again."
                );

                logoutButton.disabled = false;
                return;
            }

            clearCurrentUser();

            window.location.replace(
                "login.html"
            );

        } catch (error) {
            console.error(
                "Logout Error:",
                error
            );

            alert(
                "Logout failed. Please try again."
            );

            logoutButton.disabled = false;
        }
    },
    true
);


// ==========================================
// START PAGE PROTECTION
// ==========================================
document.addEventListener(
    "DOMContentLoaded",
    protectPage
);
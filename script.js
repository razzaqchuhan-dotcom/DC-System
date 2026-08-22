const loginForm =
    document.getElementById("loginForm");

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const username =
            document
                .getElementById("username")
                .value
                .trim()
                .toLowerCase();

        const password =
            document
                .getElementById("password")
                .value;

        const message =
            document.getElementById(
                "loginMessage"
            );

        if (!username || !password) {

            message.textContent =
                "Please enter Username and Password.";

            return;
        }

        message.textContent =
            "Signing in...";

        try {

            const { data, error } =
                await supabaseClient
                    .functions
                    .invoke(
                        "username-login",
                        {
                            body: {
                                username,
                                password
                            }
                        }
                    );

            if (error) {

                console.error(
                    "Login Function Error:",
                    error
                );

                message.textContent =
                    "Invalid Username or Password";

                return;
            }

            if (
                !data ||
                data.success !== true ||
                !data.access_token ||
                !data.refresh_token
            ) {

                message.textContent =
                    data?.error ||
                    "Invalid Username or Password";

                return;
            }


            // CREATE REAL SUPABASE SESSION

            const {
                data: sessionData,
                error: sessionError
            } =
                await supabaseClient
                    .auth
                    .setSession({

                        access_token:
                            data.access_token,

                        refresh_token:
                            data.refresh_token
                    });


            if (
                sessionError ||
                !sessionData.session
            ) {

                console.error(
                    "Session Error:",
                    sessionError
                );

                message.textContent =
                    "Login session could not be created.";

                return;
            }


            // SAVE USER DETAILS

            localStorage.setItem(
                "currentUser",
                data.user.full_name ||
                data.user.username
            );

            localStorage.setItem(
                "currentUsername",
                data.user.username
            );

            localStorage.setItem(
                "currentRole",
                data.user.role
            );

            localStorage.setItem(
                "currentDiscipline",
                data.user.discipline ||
                "all"
            );

            localStorage.setItem(
                "currentUserId",
                data.user.id
            );


            window.location.replace(
                "dashboard.html"
            );

        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            message.textContent =
                "Login failed. Please try again.";
        }
    }
);
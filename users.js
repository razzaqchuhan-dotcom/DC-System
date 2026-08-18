// ==========================================
// USERS MANAGEMENT
// ==========================================


// ==========================================
// ELEMENTS
// ==========================================

const addUserButton =
    document.getElementById("addUserButton");

const userFormCard =
    document.getElementById("userFormCard");

const cancelUserButton =
    document.getElementById("cancelUserButton");

const saveUserButton =
    document.getElementById("saveUserButton");

const usersTableBody =
    document.getElementById("usersTableBody");

const userRoleSelect =
    document.getElementById("userRole");

const rolePermissionsText =
    document.getElementById(
        "rolePermissionsText"
    );

const logoutButton =
    document.getElementById("logoutButton");


// ==========================================
// DATA
// ==========================================

let users =
    JSON.parse(
        localStorage.getItem("dcUsers")
    ) || [];

let editingUserId = null;


// ==========================================
// INITIAL FORM STATE
// ==========================================

userFormCard.style.display =
    "none";


// ==========================================
// ADD USER
// ==========================================

addUserButton.addEventListener(
    "click",
    function () {

        editingUserId = null;

        clearUserForm();

        document
            .getElementById("userFormTitle")
            .textContent =
            "Add New User";

        saveUserButton.textContent =
            "Save User";

        userFormCard.style.display =
            "block";

        updateRolePermissionsPreview();

    }
);


// ==========================================
// CANCEL
// ==========================================

cancelUserButton.addEventListener(
    "click",
    function () {

        editingUserId = null;

        clearUserForm();

        document
            .getElementById("userFormTitle")
            .textContent =
            "Add New User";

        saveUserButton.textContent =
            "Save User";

        userFormCard.style.display =
            "none";

    }
);


// ==========================================
// SAVE / UPDATE USER
// ==========================================

saveUserButton.addEventListener(
    "click",
    function () {

        const name =
            document
                .getElementById("userName")
                .value
                .trim();

        const email =
            document
                .getElementById("userEmail")
                .value
                .trim()
                .toLowerCase();

        const role =
            document
                .getElementById("userRole")
                .value;

        const status =
            document
                .getElementById("userStatus")
                .value;


        // Temporary password deliberately
        // not stored in localStorage.

        const temporaryPassword =
            document
                .getElementById("userPassword")
                .value;


        // VALIDATION

        if (
            !name ||
            !email ||
            !role
        ) {

            alert(
                "Please enter Name, Email and Role."
            );

            return;
        }


        // DUPLICATE EMAIL CHECK

        const duplicateEmail =
            users.some(
                function (user) {

                    return (
                        user.email === email &&
                        user.id !== editingUserId
                    );

                }
            );


        if (duplicateEmail) {

            alert(
                "A user with this email already exists."
            );

            return;
        }


        // ==================================
        // UPDATE USER
        // ==================================

        if (editingUserId !== null) {

            const user =
                users.find(
                    function (item) {

                        return (
                            item.id ===
                            editingUserId
                        );

                    }
                );


            if (!user) {
                return;
            }


            user.name =
                name;

            user.email =
                email;

            user.role =
                role;

            user.status =
                status;

            user.updatedAt =
                new Date().toISOString();


            saveUsers();

            renderUsers();


            editingUserId =
                null;

            clearUserForm();


            document
                .getElementById(
                    "userFormTitle"
                )
                .textContent =
                "Add New User";


            saveUserButton.textContent =
                "Save User";


            userFormCard.style.display =
                "none";


            alert(
                "User updated successfully."
            );

            return;
        }


        // ==================================
        // CREATE USER
        // ==================================

        const newUser = {

            id:
                Date.now(),

            name:
                name,

            email:
                email,

            role:
                role,

            status:
                status,

            createdAt:
                new Date().toISOString(),

            updatedAt:
                ""

        };


        users.push(newUser);


        saveUsers();

        renderUsers();

        clearUserForm();


        userFormCard.style.display =
            "none";


        alert(
            "User added successfully."
        );

    }
);


// ==========================================
// SAVE USERS
// ==========================================

function saveUsers() {

    localStorage.setItem(
        "dcUsers",
        JSON.stringify(users)
    );

}


// ==========================================
// RENDER USERS
// ==========================================

function renderUsers() {

    usersTableBody.innerHTML =
        "";


    if (users.length === 0) {

        usersTableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="no-data"
                >
                    No users found.
                </td>

            </tr>

        `;

        return;
    }


    users.forEach(
        function (user, index) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHTML(user.name)}
                </td>

                <td>
                    ${escapeHTML(user.email)}
                </td>

                <td>
                    ${getRoleDisplayName(user.role)}
                </td>

                <td>
                    ${user.status || "Active"}
                </td>

                <td class="user-action-cell">

                    <button
                        type="button"
                        class="edit-user-btn"
                        onclick="editUser(${user.id})"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="reset-password-btn"
                        onclick="resetUserPassword(${user.id})"
                    >
                        Reset Password
                    </button>

                    <button
                        type="button"
                        class="toggle-user-btn"
                        onclick="toggleUserStatus(${user.id})"
                    >
                        ${
                            user.status === "Active"
                                ? "Deactivate"
                                : "Activate"
                        }
                    </button>

                </td>

            `;


            usersTableBody.appendChild(
                row
            );

        }
    );

}


// ==========================================
// EDIT USER
// ==========================================

function editUser(userId) {

    const user =
        users.find(
            function (item) {

                return (
                    item.id === userId
                );

            }
        );


    if (!user) {
        return;
    }


    editingUserId =
        user.id;


    document
        .getElementById("userName")
        .value =
        user.name || "";


    document
        .getElementById("userEmail")
        .value =
        user.email || "";


    document
        .getElementById("userRole")
        .value =
        user.role || "";


    document
        .getElementById("userStatus")
        .value =
        user.status || "Active";


    document
        .getElementById("userPassword")
        .value =
        "";


    document
        .getElementById("userFormTitle")
        .textContent =
        "Edit User";


    saveUserButton.textContent =
        "Update User";


    updateRolePermissionsPreview();


    userFormCard.style.display =
        "block";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ==========================================
// ACTIVATE / DEACTIVATE
// ==========================================

function toggleUserStatus(userId) {

    const user =
        users.find(
            function (item) {

                return (
                    item.id === userId
                );

            }
        );


    if (!user) {
        return;
    }


    if (user.status === "Active") {

        user.status =
            "Inactive";

    } else {

        user.status =
            "Active";

    }


    user.updatedAt =
        new Date().toISOString();


    saveUsers();

    renderUsers();

}


// ==========================================
// RESET PASSWORD
// ==========================================

function resetUserPassword(userId) {

    const user =
        users.find(
            function (item) {

                return (
                    item.id === userId
                );

            }
        );


    if (!user) {
        return;
    }


    alert(
        "Password reset for " +
        user.name +
        " will be available after Cloud Authentication is connected."
    );

}


// ==========================================
// PERMISSIONS PREVIEW
// ==========================================

function formatPermission(permission) {

    return permission

        .replace(
            /-/g,
            " "
        )

        .replace(
            /\b\w/g,
            function (letter) {

                return letter.toUpperCase();

            }
        );

}


function updateRolePermissionsPreview() {

    const role =
        userRoleSelect.value;


    if (!role) {

        rolePermissionsText.textContent =
            "Select a role to view permissions.";

        return;
    }


    const permissions =
        rolePermissions[role] || [];


    if (
        permissions.length === 0
    ) {

        rolePermissionsText.textContent =
            "No permissions assigned.";

        return;
    }


    rolePermissionsText.textContent =
        permissions
            .map(formatPermission)
            .join(" | ");

}


userRoleSelect.addEventListener(
    "change",
    updateRolePermissionsPreview
);


// ==========================================
// CLEAR FORM
// ==========================================

function clearUserForm() {

    document
        .getElementById("userName")
        .value =
        "";


    document
        .getElementById("userEmail")
        .value =
        "";


    document
        .getElementById("userRole")
        .value =
        "";


    document
        .getElementById("userStatus")
        .value =
        "Active";


    document
        .getElementById("userPassword")
        .value =
        "";


    updateRolePermissionsPreview();

}


// ==========================================
// BASIC SAFE HTML
// ==========================================

function escapeHTML(value) {

    return String(value || "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// USERS PAGE PERMISSION
// ==========================================

function applyUsersPagePermission() {

    const role =
        getCurrentRole();


    // For current development stage:
    // admin has full user management.

    if (
        role !== "admin" &&
        localStorage.getItem(
            "currentRole"
        )
    ) {

        addUserButton.style.display =
            "none";

    }

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "currentUser"
            );

            localStorage.removeItem(
                "currentRole"
            );

            window.location.href =
                "login.html";

        }
    );

}


// ==========================================
// START
// ==========================================

renderUsers();

updateRolePermissionsPreview();

applyUsersPagePermission();
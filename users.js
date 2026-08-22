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

const userDisciplineSelect =
    document.getElementById("userDiscipline");

const rolePermissionsText =
    document.getElementById(
        "rolePermissionsText"
    );


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

updateDisciplineRules();


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
        updateDisciplineRules();
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
    async function () {

        const name =
            document
                .getElementById("userName")
                .value
                .trim();
        
        const username =
            document
                .getElementById("userUsername")
                .value
                .trim()
                .toLowerCase();      

        const email =
            document
                .getElementById("userEmail")
                .value
                .trim()
                .toLowerCase();

        const role =
            userRoleSelect.value;

        const status =
            document
                .getElementById("userStatus")
                .value;

        // Password abhi localStorage mein save nahi hoga.
        // Real password Supabase Auth handle karega.
        const temporaryPassword =
            document
                .getElementById("userPassword")
                .value;

        let discipline =
            userDisciplineSelect.value;
        

        // ==================================
        // ROLE / DISCIPLINE RULES
        // ==================================

        if (
            role === "admin" ||
            role === "document-controller"
        ) {
            discipline = "all";
        }


        // ENGINEER MUST HAVE ONE DISCIPLINE
        if (
            role === "engineer" &&
            ![
                "civil",
                "architectural",
                "electrical",
                "mechanical"
            ].includes(discipline)
        ) {

            alert(
                "Please select Civil, Architectural, Electrical or Mechanical discipline for Engineer."
            );

            return;
        }


        // VIEWER WITHOUT DISCIPLINE = ALL
        if (
            role === "viewer" &&
            !discipline
        ) {
            discipline = "all";
        }


        // ==================================
        // VALIDATION
        // ==================================

        if (
            !name ||
            !username ||
            !email ||
            !role
        ) {

            alert(
                "Please enter Name, Username, Email and Role."
            );

            return;
        }


        // ==================================
        // DUPLICATE EMAIL CHECK
        // ==================================

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

    saveUserButton.disabled = true;

    saveUserButton.textContent =
        "Updating User...";

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .functions
                .invoke(
                    "manage-user",
                    {
                        body: {
                            action:
                                "update",

                            user_id:
                                editingUserId,

                            full_name:
                                name,

                            username:
                                username,

                            email:
                                email,

                            role:
                                role,

                            discipline:
                                discipline,

                            status:
                                status.toLowerCase()
                        }
                    }
                );


        if (error) {

            console.error(
                "Update User Error:",
                error
            );

            alert(
                "Unable to update user."
            );

            return;
        }


        if (
            !data ||
            data.success !== true
        ) {

            alert(
                data?.error ||
                "Unable to update user."
            );

            return;
        }


        await loadUsersFromSupabase();


        editingUserId = null;

        clearUserForm();


        document
            .getElementById(
                "userFormTitle"
            )
            .textContent =
            "Add New User";


        userFormCard.style.display =
            "none";


        alert(
            "User updated successfully."
        );


    } catch (error) {

        console.error(
            "Update User Error:",
            error
        );

        alert(
            "Unable to update user."
        );

    } finally {

        saveUserButton.disabled =
            false;

        saveUserButton.textContent =
            "Save User";
    }


    return;
}


// ==================================
// CREATE REAL SUPABASE USER
// ==================================

const passwordError =
    document.getElementById("passwordError");

passwordError.textContent = "";


if (!temporaryPassword) {

    passwordError.textContent =
        "Please enter a temporary password.";

    document
        .getElementById("userPassword")
        .focus();

    return;
}


if (temporaryPassword.length < 8) {

    passwordError.textContent =
        "Password must be at least 8 characters.";

    document
        .getElementById("userPassword")
        .focus();

    return;
}

saveUserButton.disabled =
    true;

saveUserButton.textContent =
    "Creating User...";


try {

    const {
        data,
        error
    } =
        await supabaseClient
            .functions
            .invoke(
                "create-user",
                {
                    body: {

                        full_name:
                            name,

                        username:
                            username,

                        email:
                            email,

                        password:
                            temporaryPassword,

                        role:
                            role,

                        discipline:
                            discipline,

                        status:
                            status.toLowerCase()
                    }
                }
            );    

    if (error) {

        console.error(
            "Create User Function Error:",
            error
        );

        alert(
            "Unable to create user."
        );

        return;
    }


    if (
        !data ||
        data.success !== true ||
        !data.user
    ) {

        alert(
            data?.error ||
            "Unable to create user."
        );

        return;
    }


    const newUser = {

        id:
            Date.now(),

        authId:
            data.user.id,

        name:
            data.user.full_name,

        username:
            data.user.username,

        email:
            data.user.email,

        role:
            data.user.role,

        discipline:
            data.user.discipline,

        status:
            data.user.status === "active"
                ? "Active"
                : "Inactive",

        createdAt:
            new Date().toISOString(),

        updatedAt:
            ""
    };


    await loadUsersFromSupabase();

    clearUserForm();

    userFormCard.style.display =
        "none";

    alert(
        "User created successfully."
    );


} catch (error) {

    console.error(
        "Create User Error:",
        error
    );

    alert(
        "Unable to create user. Please try again."
    );

} finally {

    saveUserButton.disabled =
        false;

    saveUserButton.textContent =
        "Save User";
    }
    }    
);




// ==========================================
// SAVE USERS
// ==========================================

async function loadUsersFromSupabase() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(`
                id,
                full_name,
                username,
                email,
                role,
                discipline,
                status
            `)
            .order(
                "full_name",
                { ascending: true }
            );


    if (error) {

        console.error(
            "Load Users Error:",
            error
        );

        usersTableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="no-data"
                >
                    Unable to load users.
                </td>
            </tr>
        `;

        return;
    }


    users =
        (data || []).map(
            function(row) {

                return {

                    id:
                        row.id,

                    authId:
                        row.id,

                    name:
                        row.full_name || "",

                    username:
                        row.username || "",

                    email:
                        row.email || "",

                    role:
                        row.role || "viewer",

                    discipline:
                        row.discipline || "",

                    status:
                        row.status === "active"
                            ? "Active"
                            : "Inactive"
                };
            }
        );


    renderUsers();
}


// ==========================================
// DISCIPLINE RULES
// ==========================================

function updateDisciplineRules() {

    const role =
        userRoleSelect.value;

    const allOption =
        userDisciplineSelect.querySelector(
            'option[value="all"]'
        );


    // NO ROLE SELECTED
    if (!role) {

        userDisciplineSelect.value =
            "";

        userDisciplineSelect.disabled =
            true;

        if (allOption) {
            allOption.disabled = false;
        }

        return;
    }


    // ADMIN + DC = ALL DISCIPLINES
    if (
        role === "admin" ||
        role === "document-controller"
    ) {

        if (allOption) {
            allOption.disabled = false;
        }

        userDisciplineSelect.value =
            "all";

        userDisciplineSelect.disabled =
            true;

        return;
    }


    userDisciplineSelect.disabled =
        false;


    // ENGINEER MUST HAVE SPECIFIC DISCIPLINE
    if (role === "engineer") {

        if (allOption) {
            allOption.disabled = true;
        }

        if (
            userDisciplineSelect.value ===
            "all"
        ) {
            userDisciplineSelect.value =
                "";
        }

        return;
    }


    // VIEWER CAN HAVE ALL OR SPECIFIC
    if (allOption) {
        allOption.disabled = false;
    }
}


// ==========================================
// DISCIPLINE DISPLAY NAME
// ==========================================

function getDisciplineDisplayName(
    discipline
) {

    if (discipline === "all") {
        return "All Disciplines";
    }

    if (discipline === "civil") {
        return "Civil";
    }

    if (
        discipline ===
        "architectural"
    ) {
        return "Architectural";
    }

    if (
        discipline ===
        "electrical"
    ) {
        return "Electrical";
    }

    if (
        discipline ===
        "mechanical"
    ) {
        return "Mechanical";
    }

    return "Not Assigned";
}


// ==========================================
// GET SAVED USER DISCIPLINE
// ==========================================

function getUserDiscipline(user) {

    if (
        user.role === "admin" ||
        user.role ===
            "document-controller"
    ) {
        return "all";
    }


    if (user.discipline) {
        return user.discipline;
    }


    if (user.role === "viewer") {
        return "all";
    }


    return "";
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
                    colspan="7"
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

            const discipline =
                getUserDiscipline(user);


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
                    ${escapeHTML(
                        getRoleDisplayName(
                            user.role
                        )
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        getDisciplineDisplayName(
                            discipline
                        )
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        user.status ||
                        "Active"
                    )}
                </td>

                <td class="user-action-cell">

                    <button
                        type="button"
                        class="edit-user-btn"
                        onclick="editUser('${user.id}')"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="reset-password-btn"
                        onclick="resetUserPassword('${user.id}')"
                    >
                        Reset Password
                    </button>

                    <button
                        type="button"
                        class="toggle-user-btn"
                        onclick="toggleUserStatus('${user.id}')"
                    >
                        ${
                            user.status ===
                            "Active"
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
        .getElementById("userUsername")
        .value =
        user.username || "";    

    userRoleSelect.value =
        user.role || "";


    // Apply role rule first
    updateDisciplineRules();


    // Load saved discipline
    if (
        user.role !== "admin" &&
        user.role !==
            "document-controller"
    ) {

        userDisciplineSelect.value =
            getUserDiscipline(user);
    }


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

async function toggleUserStatus(userId) {

    const user =
        users.find(
            function(item) {
                return item.id === userId;
            }
        );


    if (!user) {
        return;
    }


    const newStatus =
        user.status === "Active"
            ? "inactive"
            : "active";


    // Prevent Admin from disabling own account
    const currentUserId =
        localStorage.getItem(
            "currentUserId"
        );


    if (
        userId === currentUserId &&
        newStatus === "inactive"
    ) {

        alert(
            "You cannot deactivate your own account."
        );

        return;
    }


    const actionText =
        newStatus === "inactive"
            ? "deactivate"
            : "activate";


    const confirmed =
        confirm(
            "Are you sure you want to " +
            actionText +
            " " +
            user.name +
            "?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .functions
                .invoke(
                    "manage-user",
                    {
                        body: {

                            action:
                                "status",

                            user_id:
                                userId,

                            status:
                                newStatus
                        }
                    }
                );


        if (error) {

            console.error(
                "Status Update Error:",
                error
            );

            alert(
                "Unable to update user status."
            );

            return;
        }


        if (
            !data ||
            data.success !== true
        ) {

            alert(
                data?.error ||
                "Unable to update user status."
            );

            return;
        }


        await loadUsersFromSupabase();


        alert(
            newStatus === "active"
                ? "User activated successfully."
                : "User deactivated successfully."
        );


    } catch (error) {

        console.error(
            "Status Error:",
            error
        );

        alert(
            "Unable to update user status."
        );
    }
}


// ==========================================
// RESET PASSWORD
// ==========================================

async function resetUserPassword(userId) {

    const user =
        users.find(
            function(item) {
                return item.id === userId;
            }
        );


    if (!user) {
        return;
    }


    const newPassword =
        prompt(
            "Enter new password for " +
            user.name +
            "\n\nMinimum 8 characters:"
        );


    // User pressed Cancel
    if (newPassword === null) {
        return;
    }


    if (newPassword.length < 8) {

        alert(
            "Password must be at least 8 characters."
        );

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .functions
                .invoke(
                    "manage-user",
                    {
                        body: {

                            action:
                                "password",

                            user_id:
                                userId,

                            password:
                                newPassword
                        }
                    }
                );


        if (error) {

            console.error(
                "Password Reset Error:",
                error
            );

            alert(
                "Unable to reset password."
            );

            return;
        }


        if (
            !data ||
            data.success !== true
        ) {

            alert(
                data?.error ||
                "Unable to reset password."
            );

            return;
        }


        alert(
            "Password reset successfully."
        );


    } catch (error) {

        console.error(
            "Password Reset Error:",
            error
        );

        alert(
            "Unable to reset password."
        );
    }
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


    let disciplineText =
        "";


    if (
        role === "admin" ||
        role === "document-controller"
    ) {

        disciplineText =
            " | Discipline Access: All";
    }


    if (role === "engineer") {

        disciplineText =
            " | Discipline Access: Assigned Discipline Only";
    }


    rolePermissionsText.textContent =
        permissions
            .map(formatPermission)
            .join(" | ") +
        disciplineText;
}


// ROLE CHANGE
userRoleSelect.addEventListener(
    "change",
    function () {

        updateRolePermissionsPreview();

        updateDisciplineRules();
    }
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
        .getElementById("userUsername")
        .value = "";    

    document
        .getElementById("userEmail")
        .value =
        "";


    userRoleSelect.value =
        "";


    userDisciplineSelect.value =
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

    updateDisciplineRules();
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


    // USERS MANAGEMENT = ADMIN ONLY
    if (role !== "admin") {

        addUserButton.style.display =
            "none";
    }
}


// ==========================================
// START
// ==========================================

loadUsersFromSupabase();

updateRolePermissionsPreview();

updateDisciplineRules();

applyUsersPagePermission();
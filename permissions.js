// ==========================================
// CENTRAL ROLE PERMISSIONS
// ==========================================

const rolePermissions = {

    admin: [
        "view-system",
        "manage-users",
        "create-project",
        "edit-project",
        "delete-project",
        "create-submittal",
        "edit-submittal",
        "delete-submittal",
        "update-response",
        "download-reports"
    ],

    "document-controller": [
        "view-system",
        "create-project",
        "edit-project",
        "create-submittal",
        "edit-submittal",
        "delete-submittal",
        "update-response",
        "download-reports"
    ],

    engineer: [
        "view-system",
        "update-response",
        "download-reports"
    ],

    viewer: [
        "view-system",
        "download-reports"
    ]

};


// ==========================================
// CHECK ROLE PERMISSION
// ==========================================

function hasPermission(role, permission) {

    const permissions =
        rolePermissions[role] || [];

    return permissions.includes(permission);
}


// ==========================================
// CURRENT ROLE
// ==========================================

function getCurrentRole() {

    return (
        localStorage.getItem("currentRole") ||
        "admin"
    );
}


// ==========================================
// CURRENT USER PERMISSION
// ==========================================

function can(permission) {

    return hasPermission(
        getCurrentRole(),
        permission
    );
}


// ==========================================
// ROLE DISPLAY NAME
// ==========================================

function getRoleDisplayName(role) {

    if (role === "admin") {
        return "Admin";
    }

    if (role === "document-controller") {
        return "Document Controller";
    }

    if (role === "engineer") {
        return "Engineer";
    }

    if (role === "viewer") {
        return "Viewer";
    }

    return role || "-";
}
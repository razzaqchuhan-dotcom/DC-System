// CENTRAL ROLE PERMISSIONS

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
        "update-response",
        "download-reports"
    ],

    engineer: [
        "view-system",
        "download-reports"
    ],

    viewer: [
        "view-system",
        "download-reports"
    ]
};


// GET CURRENT ROLE
function getCurrentRole() {
    return localStorage.getItem("currentRole") || "viewer";
}


// CHECK ROLE PERMISSION
function hasPermission(role, permission) {
    const permissions = rolePermissions[role] || [];

    return permissions.includes(permission);
}


// SIMPLE PERMISSION CHECK
function can(permission) {
    return hasPermission(
        getCurrentRole(),
        permission
    );
}


// ROLE DISPLAY NAME
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


// APPLY PERMISSION TO ONE ELEMENT
function applyPermissionToElement(element) {

    const permission =
        element.dataset.permission;

    if (!permission) {
        return;
    }

    if (!can(permission)) {

        element.style.display = "none";

        element.setAttribute(
            "aria-hidden",
            "true"
        );

    } else {

        element.style.removeProperty(
            "display"
        );

        element.removeAttribute(
            "aria-hidden"
        );
    }
}


// APPLY ALL PAGE PERMISSIONS
function applyPermissions() {

    const pagePermission =
        document.body.dataset.pagePermission;

    if (
        pagePermission &&
        !can(pagePermission)
    ) {

        alert(
            "You do not have permission to access this page."
        );

        window.location.href =
            "dashboard.html";

        return;
    }


    document
        .querySelectorAll(
            "[data-permission]"
        )
        .forEach(
            applyPermissionToElement
        );
}


// WATCH DYNAMIC ELEMENTS
function startPermissionObserver() {

    const observer =
        new MutationObserver(
            function(mutations) {

                mutations.forEach(
                    function(mutation) {

                        mutation.addedNodes.forEach(
                            function(node) {

                                if (
                                    node.nodeType !== 1
                                ) {
                                    return;
                                }


                                if (
                                    node.matches &&
                                    node.matches(
                                        "[data-permission]"
                                    )
                                ) {

                                    applyPermissionToElement(
                                        node
                                    );
                                }


                                if (
                                    node.querySelectorAll
                                ) {

                                    node
                                        .querySelectorAll(
                                            "[data-permission]"
                                        )
                                        .forEach(
                                            applyPermissionToElement
                                        );
                                }
                            }
                        );
                    }
                );
            }
        );


    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );
}
// ==========================================
// SINGLE PROJECT DASHBOARD
// ==========================================


// ------------------------------------------
// GET PROJECT ID FROM URL
// ------------------------------------------

const urlParams =
    new URLSearchParams(window.location.search);

const selectedProjectId =
    urlParams.get("projectId");


// ------------------------------------------
// LOAD PROJECTS
// ------------------------------------------

const projects =
    JSON.parse(localStorage.getItem("projects")) || [];

const selectedProject =
    projects.find(function(project) {

        return String(project.id) ===
               String(selectedProjectId);

    });


const dashboardContainer =
    document.getElementById(
        "singleProjectDashboard"
    );


// ==========================================
// SAFE VALUE
// ==========================================

function showValue(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "-";
    }

    return value;
}


// ==========================================
// TODAY DATE
// ==========================================

function getTodayDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month =
        String(today.getMonth() + 1)
        .padStart(2, "0");

    const day =
        String(today.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


const todayDate = getTodayDate();


// ==========================================
// DATE ONLY
// ==========================================

function getDateOnly(value) {

    if (!value) {
        return "";
    }

    return String(value).substring(0, 10);
}


// ==========================================
// IF PROJECT NOT FOUND
// ==========================================

if (!selectedProject) {

    dashboardContainer.innerHTML = `

        <div class="no-dashboard-data">

            Project not found.

        </div>

    `;

} else {

    loadProjectDashboard();
}


// ==========================================
// LOAD SELECTED PROJECT
// ==========================================

function loadProjectDashboard() {

    const projectName =
        selectedProject.projectName ||
        selectedProject.name ||
        selectedProject.title ||
        "Project";


    const projectCode =
        selectedProject.projectCode ||
        selectedProject.code ||
        "-";


    // --------------------------------------
    // SHOW PROJECT NAME IN HEADER
    // --------------------------------------

    document.getElementById(
        "dashboardProjectName"
    ).textContent = projectName;


    document.getElementById(
        "dashboardProjectCode"
    ).textContent =
        "Project Code: " + projectCode;


    // --------------------------------------
    // LOAD THIS PROJECT SUBMITTALS ONLY
    // --------------------------------------

    const submittals =
        JSON.parse(
            localStorage.getItem(
                "submittals_" +
                selectedProject.id
            )
        ) || [];


    // ======================================
    // SUMMARY COUNTS
    // ======================================

    const totalDocuments =
        submittals.length;


    const approved =
        submittals.filter(function(item) {

            const status =
                (item.status || "")
                .trim()
                .toLowerCase();

            return (
                status === "approved" ||
                status === "approved as noted"
            );

        }).length;


    const inProgress =
        submittals.filter(function(item) {

            const status =
                (item.status || "")
                .trim()
                .toLowerCase();

            return (
                status === "in progress" ||
                status === "under review"
            );

        }).length;


    const revise =
        submittals.filter(function(item) {

            return (
                (item.status || "")
                .trim()
                .toLowerCase()
                === "revise & resubmit"
            );

        }).length;


    const rejected =
        submittals.filter(function(item) {

            return (
                (item.status || "")
                .trim()
                .toLowerCase()
                === "rejected"
            );

        }).length;


    // ======================================
    // TODAY ISSUED
    // ======================================

    const todayIssued =
        submittals.filter(function(item) {

            const date =
                item.createdAt ||
                item.issueDate;

            return (
                getDateOnly(date) ===
                todayDate
            );

        });


    // ======================================
    // TODAY RESPONSES
    // ======================================

    const todayResponses =
        submittals.filter(function(item) {

            const date =
                item.responseUpdatedAt ||
                item.actionDate ||
                item.responseDate;

            return (
                getDateOnly(date) ===
                todayDate
            );

        });


    // ======================================
    // CLOSED
    // ======================================

    const closedItems =
        submittals.filter(function(item) {

            return (
                (item.closingStatus || "")
                .trim()
                .toLowerCase()
                === "closed"
            );

        });


    // ======================================
    // OPEN
    // ======================================

    const openItems =
        submittals.filter(function(item) {

            return (
                (item.closingStatus || "")
                .trim()
                .toLowerCase()
                !== "closed"
            );

        });


    // ======================================
    // CREATE PAGE
    // ======================================

    dashboardContainer.innerHTML = `

        <div class="project-dashboard-section">


            <div class="project-dashboard-header">

                <div>

                    <h2>${projectName}</h2>

                    <p>
                        Project Code:
                        <strong>
                            ${projectCode}
                        </strong>
                    </p>

                </div>


                <div>

                    Report Date:
                    <strong>
                        ${todayDate}
                    </strong>

                </div>

            </div>


            <!-- SUMMARY -->

            <div class="dashboard-cards">

                <div class="card">
                    <h2>Total Documents</h2>
                    <p>${totalDocuments}</p>
                </div>

                <div class="card">
                    <h2>Today Issued</h2>
                    <p>${todayIssued.length}</p>
                </div>

                <div class="card">
                    <h2>Today Responses</h2>
                    <p>${todayResponses.length}</p>
                </div>

                <div class="card">
                    <h2>Approved</h2>
                    <p>${approved}</p>
                </div>

                <div class="card">
                    <h2>In Progress</h2>
                    <p>${inProgress}</p>
                </div>

                <div class="card">
                    <h2>Revise & Resubmit</h2>
                    <p>${revise}</p>
                </div>

                <div class="card">
                    <h2>Rejected</h2>
                    <p>${rejected}</p>
                </div>

                <div class="card">
                    <h2>Closed</h2>
                    <p>${closedItems.length}</p>
                </div>

            </div>


            <!-- TODAY ISSUED -->

            <h3 class="dashboard-table-title">
                Today Issued Submittals
            </h3>

            ${createIssuedTable(todayIssued)}


            <!-- TODAY RESPONSES -->

            <h3 class="dashboard-table-title">
                Today Received Responses
            </h3>

            ${createResponseTable(todayResponses)}


            <!-- OPEN -->

            <h3 class="dashboard-table-title">
                Open / In Progress Submittals
            </h3>

            ${createOpenTable(openItems)}


            <!-- CLOSED -->

            <h3 class="dashboard-table-title">
                Closed Submittals
            </h3>

            ${createClosedTable(closedItems)}

        </div>

    `;
}


// ==========================================
// TODAY ISSUED TABLE
// ==========================================

function createIssuedTable(items) {

    if (items.length === 0) {

        return `
            <div class="no-dashboard-data">
                No submittals issued today.
            </div>
        `;
    }


    let rows = "";


    items.forEach(function(item, index) {

        rows += `

            <tr>

                <td>${index + 1}</td>

                <td>
                    ${showValue(
                        item.refNo ||
                        item.referenceNo
                    )}
                </td>

                <td>
                    ${showValue(item.subject)}
                </td>

                <td>
                    ${showValue(
                        item.documentType ||
                        item.type
                    )}
                </td>

                <td>
                    ${showValue(item.issueDate)}
                </td>

                <td>
                    ${showValue(
                        item.requestedBy ||
                        item.submittalRequestedBy
                    )}
                </td>

                <td>
                    ${showValue(item.issuerName)}
                </td>

                <td>
                    ${showValue(item.status)}
                </td>

            </tr>

        `;
    });


    return `

        <div class="dashboard-table-wrapper">

            <table class="dashboard-table">

                <thead>

                    <tr>
                        <th>S.No</th>
                        <th>Ref No.</th>
                        <th>Subject</th>
                        <th>Type</th>
                        <th>Issue Date</th>
                        <th>Submittal Requested By</th>
                        <th>Issued By</th>
                        <th>Status</th>
                    </tr>

                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>

        </div>

    `;
}


// ==========================================
// TODAY RESPONSE TABLE
// ==========================================

function createResponseTable(items) {

    if (items.length === 0) {

        return `
            <div class="no-dashboard-data">
                No responses received today.
            </div>
        `;
    }


    let rows = "";


    items.forEach(function(item, index) {

        rows += `

            <tr>

                <td>${index + 1}</td>

                <td>
                    ${showValue(
                        item.refNo ||
                        item.referenceNo
                    )}
                </td>

                <td>
                    ${showValue(item.subject)}
                </td>

                <td>
                    ${showValue(
                        item.actionBy ||
                        item.responseBy
                    )}
                </td>

                <td>
                    ${showValue(
                        item.actionDate ||
                        item.responseDate
                    )}
                </td>

                <td>
                    ${showValue(item.status)}
                </td>

                <td>
                    ${showValue(item.closingStatus)}
                </td>

            </tr>

        `;
    });


    return `

        <div class="dashboard-table-wrapper">

            <table class="dashboard-table">

                <thead>

                    <tr>
                        <th>S.No</th>
                        <th>Ref No.</th>
                        <th>Subject</th>
                        <th>Action By</th>
                        <th>Action Date</th>
                        <th>Status</th>
                        <th>Closing</th>
                    </tr>

                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>

        </div>

    `;
}


// ==========================================
// OPEN TABLE
// ==========================================

function createOpenTable(items) {

    if (items.length === 0) {

        return `
            <div class="no-dashboard-data">
                No open submittals.
            </div>
        `;
    }


    let rows = "";


    items.forEach(function(item, index) {

        rows += `

            <tr>

                <td>${index + 1}</td>

                <td>
                    ${showValue(
                        item.refNo ||
                        item.referenceNo
                    )}
                </td>

                <td>
                    ${showValue(item.subject)}
                </td>

                <td>
                    ${showValue(
                        item.documentType ||
                        item.type
                    )}
                </td>

                <td>
                    ${showValue(item.issueDate)}
                </td>

                <td>
                    ${showValue(
                        item.requestedBy ||
                        item.submittalRequestedBy
                    )}
                </td>

                <td>
                    ${showValue(item.status)}
                </td>

            </tr>

        `;
    });


    return `

        <div class="dashboard-table-wrapper">

            <table class="dashboard-table">

                <thead>

                    <tr>
                        <th>S.No</th>
                        <th>Ref No.</th>
                        <th>Subject</th>
                        <th>Type</th>
                        <th>Issue Date</th>
                        <th>Submittal Requested By</th>
                        <th>Status</th>
                    </tr>

                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>

        </div>

    `;
}


// ==========================================
// CLOSED TABLE
// ==========================================

function createClosedTable(items) {

    if (items.length === 0) {

        return `
            <div class="no-dashboard-data">
                No closed submittals.
            </div>
        `;
    }


    let rows = "";


    items.forEach(function(item, index) {

        rows += `

            <tr>

                <td>${index + 1}</td>

                <td>
                    ${showValue(
                        item.refNo ||
                        item.referenceNo
                    )}
                </td>

                <td>
                    ${showValue(item.subject)}
                </td>

                <td>
                    ${showValue(
                        item.requestedBy ||
                        item.submittalRequestedBy
                    )}
                </td>

                <td>
                    ${showValue(item.status)}
                </td>

                <td>
                    ${showValue(item.closingDate)}
                </td>

                <td>
                    ${showValue(
                        item.actionBy ||
                        item.responseBy
                    )}
                </td>

            </tr>

        `;
    });


    return `

        <div class="dashboard-table-wrapper">

            <table class="dashboard-table">

                <thead>

                    <tr>
                        <th>S.No</th>
                        <th>Ref No.</th>
                        <th>Subject</th>
                        <th>Submittal Requested By</th>
                        <th>Final Status</th>
                        <th>Closing Date</th>
                        <th>Last Action By</th>
                    </tr>

                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>

        </div>

    `;
}
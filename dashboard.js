// ==========================================
// DOCUMENT CONTROLLER - PROJECT DASHBOARD
// ==========================================

const projects =
    JSON.parse(localStorage.getItem("projects")) || [];

const dashboardContainer =
    document.getElementById("projectDashboardContainer");


// ------------------------------------------
// TODAY DATE
// ------------------------------------------

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const todayDate = getTodayDate();


// ------------------------------------------
// DATE CHECK
// ------------------------------------------

function getDateOnly(value) {

    if (!value) {
        return "";
    }

    return String(value).substring(0, 10);
}


// ------------------------------------------
// SAFE VALUE
// ------------------------------------------

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


// ------------------------------------------
// CREATE EACH PROJECT DASHBOARD
// ------------------------------------------

projects.forEach(function(project) {

    const submittals =
        JSON.parse(
            localStorage.getItem(
                "submittals_" + project.id
            )
        ) || [];


    // --------------------------------------
    // PROJECT NAME
    // --------------------------------------

    const projectName =
        project.projectName ||
        project.name ||
        project.title ||
        "Project";

    const projectCode =
        project.projectCode ||
        project.code ||
        "";


    // --------------------------------------
    // TOTAL
    // --------------------------------------

    const totalDocuments = submittals.length;


    // --------------------------------------
    // TODAY ISSUED
    // --------------------------------------

    const todayIssued =
        submittals.filter(function(item) {

            const date =
                item.createdAt ||
                item.issueDate;

            return getDateOnly(date) === todayDate;

        });


    // --------------------------------------
    // TODAY RESPONSES
    // --------------------------------------

    const todayResponses =
        submittals.filter(function(item) {

            const responseDate =
                item.responseUpdatedAt ||
                item.actionDate ||
                item.responseDate;

            return getDateOnly(responseDate) === todayDate;

        });


    // --------------------------------------
    // APPROVED
    // --------------------------------------

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


    // --------------------------------------
    // IN PROGRESS
    // --------------------------------------

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


    // --------------------------------------
    // REVISE & RESUBMIT
    // --------------------------------------

    const revise =
        submittals.filter(function(item) {

            return (
                (item.status || "")
                .trim()
                .toLowerCase()
                === "revise & resubmit"
            );

        }).length;


    // --------------------------------------
    // REJECTED
    // --------------------------------------

    const rejected =
        submittals.filter(function(item) {

            return (
                (item.status || "")
                .trim()
                .toLowerCase()
                === "rejected"
            );

        }).length;


    // --------------------------------------
    // CLOSED
    // --------------------------------------

    const closedItems =
        submittals.filter(function(item) {

            return (
                (item.closingStatus || "")
                .trim()
                .toLowerCase()
                === "closed"
            );

        });

    const closed = closedItems.length;


    // --------------------------------------
    // OPEN ITEMS
    // --------------------------------------

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
    // PROJECT SECTION
    // ======================================

    const section = document.createElement("div");

    section.className = "project-dashboard-section";


    section.innerHTML = `

        <div class="project-dashboard-header">

            <div>
                <h2>${projectName}</h2>
                <p>
                    Project Code:
                    <strong>
                        ${projectCode || "-"}
                    </strong>
                </p>
            </div>

            <div>
                Report Date:
                <strong>${todayDate}</strong>
            </div>

        </div>


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
                <p>${closed}</p>
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

    `;

    dashboardContainer.appendChild(section);

});


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
// RESPONSE TABLE
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


// ==========================================
// NO PROJECTS
// ==========================================

if (projects.length === 0) {

    dashboardContainer.innerHTML = `

        <div class="no-dashboard-data">

            No projects found.

        </div>

    `;
}
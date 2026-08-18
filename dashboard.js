// ==========================================
// MAIN DOCUMENT CONTROL DASHBOARD
// PROJECT OVERVIEW
// ==========================================

const projects =
    JSON.parse(localStorage.getItem("projects")) || [];

const dashboardContainer =
    document.getElementById("projectDashboardContainer");


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
// PROJECT INFORMATION
// ==========================================

function getProjectName(project) {

    return (
        project.projectName ||
        project.name ||
        project.title ||
        "Project"
    );
}


function getProjectCode(project) {

    return (
        project.projectCode ||
        project.code ||
        "-"
    );
}


// ==========================================
// ALL PROJECT TOTALS
// ==========================================

let overallDocuments = 0;
let overallInProgress = 0;
let overallClosed = 0;
let overallTodayIssued = 0;
let overallTodayResponses = 0;


// This will contain all project cards
let projectCardsHTML = "";


// ==========================================
// EACH PROJECT
// ==========================================

projects.forEach(function(project) {

    const submittals =
        JSON.parse(
            localStorage.getItem(
                "submittals_" + project.id
            )
        ) || [];


    const projectName =
        getProjectName(project);

    const projectCode =
        getProjectCode(project);


    // --------------------------------------
    // TOTAL DOCUMENTS
    // --------------------------------------

    const totalDocuments =
        submittals.length;


    // --------------------------------------
    // IN PROGRESS
    // --------------------------------------

    const inProgress =
        submittals.filter(function(item) {

            const closingStatus =
                (item.closingStatus || "")
                .trim()
                .toLowerCase();

            return closingStatus !== "closed";

        }).length;


    // --------------------------------------
    // CLOSED
    // --------------------------------------

    const closed =
        submittals.filter(function(item) {

            const closingStatus =
                (item.closingStatus || "")
                .trim()
                .toLowerCase();

            return closingStatus === "closed";

        }).length;


    // --------------------------------------
    // TODAY ISSUED
    // --------------------------------------

    const todayIssued =
        submittals.filter(function(item) {

            const date =
                item.createdAt ||
                item.issueDate;

            return (
                getDateOnly(date) ===
                todayDate
            );

        }).length;


    // --------------------------------------
    // TODAY RESPONSES
    // --------------------------------------

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

        }).length;


    // --------------------------------------
    // LAST ACTIVITY DATE
    // --------------------------------------

    let lastActivity = "-";

    const activityDates = [];

    submittals.forEach(function(item) {

        const date =
            item.responseUpdatedAt ||
            item.actionDate ||
            item.responseDate ||
            item.createdAt ||
            item.issueDate;

        if (date) {
            activityDates.push(
                getDateOnly(date)
            );
        }

    });


    if (activityDates.length > 0) {

        activityDates.sort();

        lastActivity =
            activityDates[
                activityDates.length - 1
            ];
    }


    // --------------------------------------
    // ADD TO OVERALL TOTALS
    // --------------------------------------

    overallDocuments += totalDocuments;

    overallInProgress += inProgress;

    overallClosed += closed;

    overallTodayIssued += todayIssued;

    overallTodayResponses += todayResponses;


    // --------------------------------------
    // PROJECT CARD
    // --------------------------------------

    projectCardsHTML += `

        <div class="project-overview-card">

            <div class="project-card-heading">

                <h2>${projectName}</h2>

                <span>
                    ${projectCode}
                </span>

            </div>


            <div class="project-card-stats">

                <div>
                    <small data-i18n="totalDocuments">Total Documents</small>
                    <strong>${totalDocuments}</strong>
                </div>

                <div>
                    <small data-i18n="inProgress">In Progress</small>
                    <strong>${inProgress}</strong>
                </div>

                <div>
                    <small data-i18n="closed">Closed</small>
                    <strong>${closed}</strong>
                </div>

                <div>
                    <small data-i18n="todayIssued">Today Issued</small>
                    <strong>${todayIssued}</strong>
                </div>

                <div>
                    <small data-i18n="todayResponses">Today Responses</small>
                    <strong>${todayResponses}</strong>
                </div>

            </div>


            <div class="project-last-activity">

                <span data-i18n="lastActivity">Last Activity:</span>
                <strong>${lastActivity}</strong>

            </div>


            <a
                class="open-project-dashboard-button"
                href="project-dashboard.html?projectId=${encodeURIComponent(project.id)}"
            >
                <span data-i18n="openProject">Open Project</span>
            </a>

        </div>

    `;

});


// ==========================================
// SHOW DASHBOARD
// ==========================================

if (projects.length === 0) {

    dashboardContainer.innerHTML = `

        <div class="no-dashboard-data">
            No projects found.
        </div>

    `;

} else {

    dashboardContainer.innerHTML = `

        <div class="overall-dashboard-summary">

            <h2 data-i18n="overallSummary">Overall Summary</h2>

            <div 
                class="overall-summary-cards">

                <div>
                    <span data-i18n="totalProjects">Total Projects</span>
                    <strong>${projects.length}</strong>
                </div>

                <div>
                    <span data-i18n="totalDocuments">Total Documents</span>
                    <strong>${overallDocuments}</strong>
                </div>

                <div>
                    <span data-i18n="inProgress">In Progress</span>
                    <strong>${overallInProgress}</strong>
                </div>

                <div>
                    <span data-i18n="closed">Closed</span>
                    <strong>${overallClosed}</strong>
                </div>

                <div>
                    <span data-i18n="todayIssued">Today Issued</span>
                    <strong>${overallTodayIssued}</strong>
                </div>

                <div>
                    <span data-i18n="todayResponses">Today Responses</span>
                    <strong>${overallTodayResponses}</strong>
                </div>

            </div>

        </div>


        <h2 class="projects-overview-title">
            Projects
        </h2>


        <div class="project-overview-grid">

            ${projectCardsHTML}

        </div>

    `;
}
// ==========================================
// LOGOUT
// ==========================================

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", function () {

        const confirmLogout =
            confirm("Are you sure you want to logout?");

        if (!confirmLogout) return;

        localStorage.removeItem("currentUser");
        localStorage.removeItem("currentRole");

        window.location.href = "login.html";

    });

}
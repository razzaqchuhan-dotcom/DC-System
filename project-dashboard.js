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
// PDF DATABASE FOR DASHBOARD
// ==========================================

let dashboardPdfDatabase;

const dashboardDbRequest =
    indexedDB.open("DCSystemPDFs", 1);

dashboardDbRequest.onsuccess =
    function(event) {

        dashboardPdfDatabase =
            event.target.result;
    };

dashboardDbRequest.onerror =
    function() {

        console.error(
            "PDF database could not be opened."
        );
    };


// ==========================================
// OPEN PDF FROM DASHBOARD
// ==========================================

function openDashboardPDF(pdfId) {

    if (!pdfId) {
        alert("No PDF attached.");
        return;
    }

    if (!dashboardPdfDatabase) {
        alert("PDF database is not ready.");
        return;
    }

    const transaction =
        dashboardPdfDatabase.transaction(
            ["pdfFiles"],
            "readonly"
        );

    const store =
        transaction.objectStore(
            "pdfFiles"
        );

    const request =
        store.get(pdfId);

    request.onsuccess =
        function() {

            const record =
                request.result;

            if (!record) {
                alert("PDF file not found.");
                return;
            }

            const pdfURL =
                URL.createObjectURL(
                    record.file
                );

            window.open(
                pdfURL,
                "_blank"
            );
        };

    request.onerror =
        function() {

            alert(
                "Could not open PDF."
            );
        };
}

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


            <div class="project-report-actions">

                <div>
                    Report Date:
                    <strong>${todayDate}</strong>
                </div>

                <button
                    type="button"
                    id="downloadProjectPdf"
                    class="download-project-pdf-button"
                >
                    Download PDF
                </button>

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
                <td>
                    ${
                        item.pdfId
                            ? `<button
                                    type="button"
                                    class="open-pdf-btn"
                                    onclick="openDashboardPDF('${item.pdfId}')"
                                >
                                    Open PDF
                                    </button>`
                        : "-"
                    }
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
                        <th>pdf<th>
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
                <td>
                    ${
                        item.pdfId
                            ? `<button
                                type="button"
                                class="open-pdf-btn"
                                onclick="openDashboardPDF('${item.pdfId}')"
                            >
                                Open PDF
                            </button>`
                        : "-"
                    }
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
                        <th>PDF <th>
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
                <td>
                    ${
                        item.pdfId
                            ? `<button
                                type="button"
                                class="open-pdf-btn"
                                onclick="openDashboardPDF('${item.pdfId}')"
                            >
                                Open PDF
                            </button>`
                        : "-"
                    }
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
                        <th>pdf<th>
                    </tr>

                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>

        </div>

    `;
}
function loadLogoBase64(imagePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            const dataURL = canvas.toDataURL("image/png");
            resolve(dataURL);
        };
        img.onerror = reject;
        img.src = imagePath;
    });
}

// ==========================================
// DOWNLOAD PROJECT PDF
// ==========================================

document.addEventListener("click", async function(event) {

    if (event.target.id !== "downloadProjectPdf") {
        return;
    }

    if (!selectedProject) {
        alert("Project not found.");
        return;
    }


    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const logoBase64 = await loadLogoBase64("ALMAS LOGO.jpeg");
    doc.addImage(
        logoBase64,
        "PNG",
        12,
        8,
        38,
        16
    );


    // --------------------------------------
    // PROJECT DETAILS
    // --------------------------------------

    const projectName =
        selectedProject.projectName ||
        selectedProject.name ||
        selectedProject.title ||
        "Project";


    const projectCode =
        selectedProject.projectCode ||
        selectedProject.code ||
        "-";


    const submittals =
        JSON.parse(
            localStorage.getItem(
                "submittals_" + selectedProject.id
            )
        ) || [];


    // --------------------------------------
    // COUNTS
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


    const closedItems =
        submittals.filter(function(item) {

            return (
                (item.closingStatus || "")
                .trim()
                .toLowerCase()
                === "closed"
            );

        });


    const openItems =
        submittals.filter(function(item) {

            return (
                (item.closingStatus || "")
                .trim()
                .toLowerCase()
                !== "closed"
            );

        });


    const todayIssued =
        submittals.filter(function(item) {

            const date =
                item.createdAt ||
                item.issueDate;

            return getDateOnly(date) === todayDate;

        });


    const todayResponses =
        submittals.filter(function(item) {

            const date =
                item.responseUpdatedAt ||
                item.actionDate ||
                item.responseDate;

            return getDateOnly(date) === todayDate;

        });


    // ======================================
    // PDF HEADER
    // ======================================

    doc.setTextColor(35, 35, 35);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    doc.text(
        "DOCUMENT SUBMITTAL DAILY SUMMARY",
        56,
        16,
    );


    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);


    doc.setFillColor(244, 244, 244);

    doc.rect(
        12,
        28,
        273,
        13,
        "F"
    );


    doc.setDrawColor(200, 200, 200);

    doc.rect(
        12,
        28,
        273,
        13
    );


    doc.setFont("helvetica", "bold");

    doc.text("Project:", 15, 36);

    doc.setFont("helvetica", "normal");

    doc.text(
        String(projectName),
        29,
        36
    );


    doc.setFont("helvetica", "bold");

    doc.text("Project Code:", 95, 36);

    doc.setFont("helvetica", "normal");

    doc.text(
        String(projectCode),
        116,
        36
    );


    doc.setFont("helvetica", "bold");

    doc.text("Report Date:", 160, 36);

    doc.setFont("helvetica", "normal");

    doc.text(
        String(todayDate),
        180,
        36
    );


    doc.setFont("helvetica", "bold");

    doc.text("Prepared By:", 220, 36);

    doc.setFont("helvetica", "normal");

    doc.text(
        localStorage.getItem("currentUser") || "Admin",
        241,
        36
    );


    // ======================================
    // SUMMARY TABLE
    // ======================================

    doc.autoTable({

        startY: 46,

        head: [[
            "Total",
            "Today Issued",
            "Today Responses",
            "Approved",
            "In Progress",
            "R&R",
            "Rejected",
            "Closed"
        ]],

        body: [[
            submittals.length,
            todayIssued.length,
            todayResponses.length,
            approved,
            inProgress,
            revise,
            rejected,
            closedItems.length
        ]],

        theme: "grid",

        styles: {
            fontSize: 8,
            halign: "center",
            textColor: [35, 35, 35],
            lineColor: [200, 200, 200],
            lineWidth: 0.2
        },

        headStyles: {
            fillColor: [231, 231, 231],
            textColor: [35, 35, 35],
            fontStyle: "bold"
        }

    });


    // ======================================
    // TABLE HELPER
    // ======================================

    function addSectionTitle(title, y) {

        doc.setFillColor(
            231,
            231,
            231
        );

        doc.setDrawColor(
            200,
            200,
            200
        );

        doc.rect(
            12,
            y,
            273,
            7,
            "FD"
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(9);

        doc.setTextColor(
            35,
            35,
            35
        );

        doc.text(
            title,
            15,
            y + 4.8
        );
    }


    let currentY =
        doc.lastAutoTable.finalY + 7;


    // ======================================
    // TODAY ISSUED
    // ======================================

    addSectionTitle(
        "TODAY ISSUED SUBMITTALS",
        currentY
    );


    const issuedRows =
        todayIssued.map(function(item, index) {

            return [

                index + 1,

                showValue(
                    item.refNo ||
                    item.referenceNo
                ),

                showValue(
                    item.subject
                ),

                showValue(
                    item.documentType ||
                    item.type
                ),

                showValue(
                    item.issueDate
                ),

                showValue(
                    item.requestedBy ||
                    item.submittalRequestedBy
                ),

                showValue(
                    item.issuerName
                ),

                showValue(
                    item.status
                )

            ];

        });


    doc.autoTable({

        startY: currentY + 7,

        head: [[
            "S.No",
            "Ref No.",
            "Subject",
            "Type",
            "Issue Date",
            "Requested By",
            "Issued By",
            "Status"
        ]],

        body:
            issuedRows.length > 0
                ? issuedRows
                : [[
                    "-",
                    "-",
                    "No submittals issued today.",
                    "-",
                    "-",
                    "-",
                    "-",
                    "-"
                ]],

        theme: "grid",

        styles: {
            fontSize: 7,
            textColor: [35, 35, 35],
            lineColor: [205, 205, 205],
            lineWidth: 0.2
        },

        headStyles: {
            fillColor: [231, 231, 231],
            textColor: [35, 35, 35],
            fontStyle: "bold"
        },

        columnStyles: {
            0: { cellWidth: 12 },
            1: { cellWidth: 38 },
            2: { cellWidth: 65 },
            3: { cellWidth: 18 },
            4: { cellWidth: 25 },
            5: { cellWidth: 32 },
            6: { cellWidth: 30 },
            7: { cellWidth: 28 }
        }

    });


    currentY =
        doc.lastAutoTable.finalY + 7;


    // ======================================
    // TODAY RESPONSES
    // ======================================

    addSectionTitle(
        "TODAY RECEIVED RESPONSES",
        currentY
    );


    const responseRows =
        todayResponses.map(function(item, index) {

            return [

                index + 1,

                showValue(
                    item.refNo ||
                    item.referenceNo
                ),

                showValue(
                    item.subject
                ),

                showValue(
                    item.actionBy ||
                    item.responseBy
                ),

                showValue(
                    item.actionDate ||
                    item.responseDate
                ),

                showValue(
                    item.status
                ),

                showValue(
                    item.closingStatus
                )

            ];

        });


    doc.autoTable({

        startY: currentY + 7,

        head: [[
            "S.No",
            "Ref No.",
            "Subject",
            "Action By",
            "Action Date",
            "Status",
            "Closing"
        ]],

        body:
            responseRows.length > 0
                ? responseRows
                : [[
                    "-",
                    "-",
                    "No responses received today.",
                    "-",
                    "-",
                    "-",
                    "-"
                ]],

        theme: "grid",

        styles: {
            fontSize: 7,
            textColor: [35, 35, 35],
            lineColor: [205, 205, 205],
            lineWidth: 0.2
        },

        headStyles: {
            fillColor: [231, 231, 231],
            textColor: [35, 35, 35],
            fontStyle: "bold"
        }

    });


    // ======================================
    // NEW PAGE
    // ======================================

    doc.addPage();


    currentY = 12;


    // ======================================
    // OPEN / IN PROGRESS
    // ======================================

    addSectionTitle(
        "OPEN / IN PROGRESS SUBMITTALS",
        currentY
    );


    const openRows =
        openItems.map(function(item, index) {

            return [

                index + 1,

                showValue(
                    item.refNo ||
                    item.referenceNo
                ),

                showValue(
                    item.subject
                ),

                showValue(
                    item.documentType ||
                    item.type
                ),

                showValue(
                    item.issueDate
                ),

                showValue(
                    item.requestedBy ||
                    item.submittalRequestedBy
                ),

                showValue(
                    item.status
                )

            ];

        });


    doc.autoTable({

        startY: currentY + 7,

        head: [[
            "S.No",
            "Ref No.",
            "Subject",
            "Type",
            "Issue Date",
            "Requested By",
            "Status"
        ]],

        body:
            openRows.length > 0
                ? openRows
                : [[
                    "-",
                    "-",
                    "No open submittals.",
                    "-",
                    "-",
                    "-",
                    "-"
                ]],

        theme: "grid",

        styles: {
            fontSize: 7,
            textColor: [35, 35, 35],
            lineColor: [205, 205, 205],
            lineWidth: 0.2
        },

        headStyles: {
            fillColor: [231, 231, 231],
            textColor: [35, 35, 35],
            fontStyle: "bold"
        }

    });


    currentY =
        doc.lastAutoTable.finalY + 7;


    // ======================================
    // CLOSED
    // ======================================

    addSectionTitle(
        "CLOSED SUBMITTALS",
        currentY
    );


    const closedRows =
        closedItems.map(function(item, index) {

            return [

                index + 1,

                showValue(
                    item.refNo ||
                    item.referenceNo
                ),

                showValue(
                    item.subject
                ),

                showValue(
                    item.requestedBy ||
                    item.submittalRequestedBy
                ),

                showValue(
                    item.status
                ),

                showValue(
                    item.closingDate
                ),

                showValue(
                    item.actionBy ||
                    item.responseBy
                )

            ];

        });


    doc.autoTable({

        startY: currentY + 7,

        head: [[
            "S.No",
            "Ref No.",
            "Subject",
            "Requested By",
            "Final Status",
            "Closing Date",
            "Last Action By"
        ]],

        body:
            closedRows.length > 0
                ? closedRows
                : [[
                    "-",
                    "-",
                    "No closed submittals.",
                    "-",
                    "-",
                    "-",
                    "-"
                ]],

        theme: "grid",

        styles: {
            fontSize: 7,
            textColor: [35, 35, 35],
            lineColor: [205, 205, 205],
            lineWidth: 0.2
        },

        headStyles: {
            fillColor: [231, 231, 231],
            textColor: [35, 35, 35],
            fontStyle: "bold"
        }

    });


    // ======================================
    // DOWNLOAD FILE
    // ======================================

    const safeProjectName =
        projectName
        .replace(/[^a-z0-9]/gi, "_");


    doc.save(
        safeProjectName +
        "_Daily_Summary_" +
        todayDate +
        ".pdf"
    );

});
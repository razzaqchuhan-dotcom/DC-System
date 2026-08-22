const urlParams = new URLSearchParams(window.location.search);
const selectedProjectId = urlParams.get("projectId");

const projects =
    JSON.parse(localStorage.getItem("projects")) || [];

const selectedProject =
    projects.find(function (project) {
        return String(project.id) ===
            String(selectedProjectId);
    });

const dashboardContainer =
    document.getElementById(
        "singleProjectDashboard"
    );

const currentRole =
    (localStorage.getItem("currentRole") || "viewer")
        .trim()
        .toLowerCase();

const currentDiscipline =
    (localStorage.getItem("currentDiscipline") || "none")
        .trim()
        .toLowerCase();


function canViewDiscipline(documentDiscipline) {

    if (
        currentRole === "admin" ||
        currentRole === "document-controller"
    ) {
        return true;
    }

    if (
        currentRole === "viewer" &&
        currentDiscipline === "all"
    ) {
        return true;
    }

    const disciplineMap = {
        civil: "C",
        architectural: "A",
        mechanical: "M",
        electrical: "E",
        c: "C",
        a: "A",
        m: "M",
        e: "E"
    };

    const userCode =
        disciplineMap[currentDiscipline] || "";

    const documentCode =
        String(documentDiscipline || "")
            .trim()
            .toUpperCase();

    return (
        userCode !== "" &&
        userCode === documentCode
    );
}


let dashboardPdfDatabase = null;

const dashboardPdfDatabaseReady =
    new Promise(function (resolve, reject) {

        const request =
            indexedDB.open(
                "DCSystemPDFs",
                1
            );

        request.onupgradeneeded =
            function (event) {

                const db =
                    event.target.result;

                if (
                    !db.objectStoreNames.contains(
                        "pdfFiles"
                    )
                ) {

                    db.createObjectStore(
                        "pdfFiles",
                        {
                            keyPath: "id"
                        }
                    );
                }
            };

        request.onsuccess =
            function (event) {

                dashboardPdfDatabase =
                    event.target.result;

                resolve(
                    dashboardPdfDatabase
                );
            };

        request.onerror =
            function () {

                console.error(
                    "PDF database could not be opened."
                );

                reject(
                    request.error ||
                    new Error(
                        "PDF database could not be opened."
                    )
                );
            };
    });


async function openDashboardPDF(pdfId) {

    if (!pdfId) {

        alert(
            "No PDF attached."
        );

        return;
    }

    let db;

    try {

        db =
            dashboardPdfDatabase ||
            await dashboardPdfDatabaseReady;

    } catch (error) {

        console.error(error);

        alert(
            "PDF database is not ready."
        );

        return;
    }

    const transaction =
        db.transaction(
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
        function () {

            const record =
                request.result;

            if (!record) {

                alert(
                    "PDF file not found."
                );

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

            setTimeout(
                function () {

                    URL.revokeObjectURL(
                        pdfURL
                    );
                },
                60000
            );
        };

    request.onerror =
        function () {

            alert(
                "Could not open PDF."
            );
        };
}


window.openDashboardPDF =
    openDashboardPDF;


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


function escapeHtml(value) {

    return String(
        showValue(value)
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function getTodayDate() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
}


function getDateOnly(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .substring(
            0,
            10
        );
}


const todayDate =
    getTodayDate();
// ==========================================
// DASHBOARD DISCIPLINE TABS
// ==========================================

let selectedDashboardDiscipline = "all";


function normalizeDisciplineCode(value) {

    const discipline =
        String(value || "")
            .trim()
            .toLowerCase();

    const map = {
        c: "C",
        civil: "C",
        str: "C",
        structural: "C",

        a: "A",
        arch: "A",
        architectural: "A",
        architecture: "A",

        m: "M",
        mech: "M",
        mechanical: "M",

        e: "E",
        elec: "E",
        electrical: "E"
    };

    return map[discipline] || "";
}


function getDisciplineLabel(value) {

    const code =
        normalizeDisciplineCode(value) ||
        String(value || "")
            .trim()
            .toUpperCase();

    const labels = {
        C: "CIVIL",
        A: "ARCH",
        M: "MECH",
        E: "ELEC"
    };

    return labels[code] || code;
}


function getAllowedDashboardTabs() {

    const fullAccess =
        currentRole === "admin" ||
        currentRole === "document-controller" ||
        (
            currentRole === "viewer" &&
            currentDiscipline === "all"
        );

    if (fullAccess) {

        return [
            "all",
            "C",
            "A",
            "M",
            "E"
        ];
    }

    const userCode =
        normalizeDisciplineCode(
            currentDiscipline
        );

    return userCode
        ? [userCode]
        : [];
}


function ensureDashboardDisciplineSelection() {

    const allowed =
        getAllowedDashboardTabs();

    if (
        allowed.includes(
            selectedDashboardDiscipline
        )
    ) {
        return;
    }

    if (
        allowed.includes("all")
    ) {

        selectedDashboardDiscipline =
            "all";

        return;
    }

    selectedDashboardDiscipline =
        allowed[0] ||
        "all";
}


function filterByDashboardDiscipline(items) {

    if (
        selectedDashboardDiscipline ===
        "all"
    ) {
        return items;
    }

    return items.filter(
        function (item) {

            return (
                normalizeDisciplineCode(
                    item.discipline
                ) ===
                selectedDashboardDiscipline
            );
        }
    );
}


function createDashboardDisciplineTabs() {

    ensureDashboardDisciplineSelection();

    const allowed =
        getAllowedDashboardTabs();

    const labels = {
        all: "ALL",
        C: "CIVIL",
        A: "ARCH",
        M: "MECH",
        E: "ELEC"
    };

    const buttons =
        allowed.map(
            function (code) {

                const activeClass =
                    selectedDashboardDiscipline ===
                    code
                        ? " active"
                        : "";

                return `
                    <button
                        type="button"
                        class="dashboard-discipline-tab${activeClass}"
                        onclick="setDashboardDiscipline('${code}')"
                    >
                        ${labels[code]}
                    </button>
                `;
            }
        )
        .join("");

    return `
        <div class="dashboard-discipline-tabs">
            ${buttons}
        </div>
    `;
}


function setDashboardDiscipline(code) {

    const allowed =
        getAllowedDashboardTabs();

    if (
        !allowed.includes(code)
    ) {
        return;
    }

    selectedDashboardDiscipline =
        code;

    loadProjectDashboard();
}


window.setDashboardDiscipline =
    setDashboardDiscipline;


function getSelectedDisciplineLabel() {

    if (
        selectedDashboardDiscipline ===
        "all"
    ) {
        return "ALL";
    }

    return getDisciplineLabel(
        selectedDashboardDiscipline
    );
}

function revisionNumber(value) {

    const match =
        String(
            value || "R00"
        )
            .toUpperCase()
            .match(
                /R(\d+)/
            );

    return match
        ? Number(
            match[1]
        )
        : 0;
}


function buildRevisionRows(currentSubmittals) {

    const rows = [];

    currentSubmittals.forEach(
        function (item) {

            const history =
                Array.isArray(
                    item.revisionHistory
                )
                    ? item.revisionHistory
                    : [];

            history.forEach(
                function (revision) {

                    rows.push({

                        ...item,
                        ...revision,

                        sequenceId:
                            item.sequenceId || "",

                        discipline:
                            item.discipline || "",

                        documentType:
                            item.documentType || "",

                        responseHours:
                            item.responseHours || 24,

                        parentId:
                            item.id,

                        isHistory:
                            true
                    });
                }
            );

            rows.push({

                ...item,

                parentId:
                    item.id,

                isHistory:
                    false
            });
        }
    );


    rows.sort(
        function (a, b) {

            const sequenceCompare =
                String(
                    a.sequenceId || ""
                ).localeCompare(
                    String(
                        b.sequenceId || ""
                    )
                );

            if (
                sequenceCompare !== 0
            ) {
                return sequenceCompare;
            }

            return (
                revisionNumber(
                    a.revision
                ) -
                revisionNumber(
                    b.revision
                )
            );
        }
    );


    return rows;
}


function getResponseDate(item) {

    return (
        item.actionDate ||
        item.responseDate ||
        ""
    );
}

// ==========================================
// DASHBOARD SMART SEARCH HELPERS
// ==========================================

function getDisciplineSearchWords(value) {

    const discipline =
        String(value || "")
            .trim()
            .toLowerCase();

    const disciplineWords = {

        c: "c civil str structural",
        civil: "c civil str structural",

        a: "a arch architectural architecture",
        architectural: "a arch architectural architecture",

        m: "m mech mechanical",
        mechanical: "m mech mechanical",

        e: "e elec electrical",
        electrical: "e elec electrical"

    };

    return (
        disciplineWords[discipline] ||
        discipline
    );
}


function getDashboardSearchText(item) {

    return `

        ${item.sequenceId || ""}
        ${item.revision || "R00"}
        ${item.refNo || item.referenceNo || ""}
        ${item.subject || ""}
        ${item.documentType || item.type || ""}
        ${item.issueDate || ""}

        ${item.requestedBy || item.submittalRequestedBy || ""}
        ${item.issuerName || ""}

        ${item.status || ""}
        ${item.closingStatus || ""}
        ${item.closingDate || ""}

        ${item.actionBy || item.responseBy || ""}
        ${item.actionDate || item.responseDate || ""}

        ${getDisciplineSearchWords(
            item.discipline
        )}

    `
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}


function matchesDashboardSearch(
    searchText,
    searchableText
) {

    const terms =
        String(searchText || "")
            .toLowerCase()
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (
        terms.length === 0
    ) {
        return true;
    }

    const source =
        String(searchableText || "")
            .toLowerCase();

    return terms.every(
        function (term) {

            return source.includes(
                term
            );
        }
    );
}

function createFileButtons(item) {

    const buttons = [];

    if (
        item.pdfId
    ) {

        buttons.push(
            `<button
                type="button"
                class="open-pdf-btn"
                onclick="openDashboardPDF('${item.pdfId}')"
            >
                Submitted
            </button>`
        );
    }


    if (
        item.responsePdfId
    ) {

        buttons.push(
            `<button
                type="button"
                class="open-pdf-btn"
                onclick="openDashboardPDF('${item.responsePdfId}')"
            >
                Response
            </button>`
        );
    }


    if (
        buttons.length === 0
    ) {
        return "-";
    }


    return buttons.join(
        "<br>"
    );
}


if (
    !selectedProject
) {

    dashboardContainer.innerHTML = `
        <div class="no-dashboard-data">
            Project not found.
        </div>
    `;

} else {

    loadProjectDashboard();
}


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


    document.getElementById(
        "dashboardProjectName"
    ).textContent =
        projectName;


    document.getElementById(
        "dashboardProjectCode"
    ).textContent =
        "Project Code: " +
        projectCode;


    const allCurrentSubmittals =
        JSON.parse(
            localStorage.getItem(
                "submittals_" +
                selectedProject.id
            )
        ) || [];


    const permissionSubmittals =
    allCurrentSubmittals.filter(
        function (item) {

            return canViewDiscipline(
                item.discipline
            );
        }
    );


    ensureDashboardDisciplineSelection();


    const submittals =
        filterByDashboardDiscipline(
            permissionSubmittals
        );


    const revisionRows =
        buildRevisionRows(
            submittals
        );


    const totalDocuments =
        submittals.length;


    const approved =
        submittals.filter(
            function (item) {

                const status =
                    (item.status || "")
                        .trim()
                        .toLowerCase();

                return (
                    status === "approved" ||
                    status === "approved as noted"
                );
            }
        ).length;


    const inProgress =
        submittals.filter(
            function (item) {

                const status =
                    (item.status || "")
                        .trim()
                        .toLowerCase();

                return (
                    status === "in progress" ||
                    status === "under review"
                );
            }
        ).length;


    const revise =
        submittals.filter(
            function (item) {

                return (
                    (item.status || "")
                        .trim()
                            .toLowerCase()
                    === "revise & resubmit"
                );
            }
        ).length;


    const rejected =
        submittals.filter(
            function (item) {

                return (
                    (item.status || "")
                        .trim()
                        .toLowerCase()
                    === "rejected"
                );
            }
        ).length;


    const todayIssued =
        revisionRows.filter(
            function (item) {

                return (
                    getDateOnly(
                        item.issueDate
                    ) ===
                    todayDate
                );
            }
        );


    const todayResponses =
        revisionRows.filter(
            function (item) {

                return (
                    getDateOnly(
                        getResponseDate(
                            item
                        )
                    ) ===
                    todayDate
                );
            }
        );


    const closedItems =
        submittals.filter(
            function (item) {

                return (
                    (item.closingStatus || "")
                        .trim()
                        .toLowerCase()
                    === "closed"
                );
            }
        );


    const openItems =
        submittals.filter(
            function (item) {

                return (
                    (item.closingStatus || "")
                        .trim()
                        .toLowerCase()
                    !== "closed"
                );
            }
        );


    dashboardContainer.innerHTML = `

        <div class="project-dashboard-section">

            <div class="project-dashboard-header">

                <div>

                    <h2>
                        ${escapeHtml(projectName)}
                    </h2>

                    <p>
                        Project Code:
                        <strong>
                            ${escapeHtml(projectCode)}
                        </strong>
                    </p>

                </div>


                <div class="project-report-actions">

                    <div>
                        Report Date:
                        <strong>
                            ${todayDate}
                        </strong>
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

            ${createDashboardDisciplineTabs()}

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


            <h3 class="dashboard-table-title">
                Today Issued Submittals
            </h3>

            ${createIssuedTable(
                todayIssued
            )}


            <h3 class="dashboard-table-title">
                Today Received Responses
            </h3>

            ${createResponseTable(
                todayResponses
            )}


            <h3 class="dashboard-table-title">
                Open / In Progress Submittals
            </h3>

            ${createOpenTable(
                openItems
            )}


            <h3 class="dashboard-table-title">
                Closed Submittals
            </h3>

            ${createClosedTable(
                closedItems
            )}


            <h3 class="dashboard-table-title">
                Revision Register
            </h3>

            ${createRevisionRegisterTable(
                revisionRows
            )}

        </div>
    `;
}


function createIssuedTable(items) {

    if (
        items.length === 0
    ) {

        return `
            <div class="no-dashboard-data">
                No submittals issued today.
            </div>
        `;
    }


    let rows = "";


    items.forEach(
        function (item, index) {

            rows += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.revision ||
                            "R00"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.refNo ||
                            item.referenceNo
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.subject
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.documentType ||
                            item.type
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.issueDate
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.requestedBy ||
                            item.submittalRequestedBy
                        )}

                        ${
                            item.requestAttachmentId
                                ? `<br>
                                    <button
                                        type="button"
                                        class="open-pdf-btn"
                                        onclick="openDashboardPDF('${item.requestAttachmentId}')"
                                    >
                                        View Request
                                    </button>`
                                : ""
                        }
                    </td>

                    <td>
                        ${escapeHtml(
                            item.issuerName
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.status
                        )}
                    </td>

                    <td>
                        ${createFileButtons(
                            item
                        )}
                    </td>

                </tr>

            `;
        }
    );


    return `

        <div class="dashboard-table-wrapper">

            <table class="dashboard-table">

                <thead>

                    <tr>

                        <th>S.No</th>
                        <th>Revision</th>
                        <th>Ref No.</th>
                        <th>Subject</th>
                        <th>Type</th>
                        <th>Issue Date</th>
                        <th>Submittal Requested By</th>
                        <th>Issued By</th>
                        <th>Status</th>
                        <th>Files</th>

                    </tr>

                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>

        </div>

    `;
}


function createResponseTable(items) {

    if (
        items.length === 0
    ) {

        return `
            <div class="no-dashboard-data">
                No responses received today.
            </div>
        `;
    }


    let rows = "";


    items.forEach(
        function (item, index) {

            rows += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.revision ||
                            "R00"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.refNo ||
                            item.referenceNo
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.subject
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.actionBy ||
                            item.responseBy
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            getResponseDate(
                                item
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.status
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.closingStatus
                        )}
                    </td>

                    <td>
                        ${createFileButtons(
                            item
                        )}
                    </td>

                </tr>

            `;
        }
    );


    return `

        <div class="dashboard-table-wrapper">

            <table class="dashboard-table">

                <thead>

                    <tr>

                        <th>S.No</th>
                        <th>Revision</th>
                        <th>Ref No.</th>
                        <th>Subject</th>
                        <th>Action By</th>
                        <th>Action Date</th>
                        <th>Status</th>
                        <th>Closing</th>
                        <th>Files</th>

                    </tr>

                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>

        </div>

    `;
}


function filterOpenTable() {

    const table =
        document.getElementById(
            "openSubmittalsTable"
        );

    if (
        !table
    ) {
        return;
    }


    const searchInput =
        document.getElementById(
            "openTableSearch"
        );

    const disciplineFilter =
        document.getElementById(
            "openDisciplineFilter"
        );

    const typeFilter =
        document.getElementById(
            "openTypeFilter"
        );


    const searchText =
        (searchInput?.value || "")
            .toLowerCase()
            .trim();


    const selectedDiscipline =
        (disciplineFilter?.value || "")
            .toLowerCase();


    const selectedType =
        (typeFilter?.value || "")
            .toLowerCase();


    const rows =
        table.querySelectorAll(
            "tbody tr"
        );


    rows.forEach(
        function (row) {

            const rowText =
            (
                row.dataset.search ||
                row.textContent ||
                ""
            )
                .toLowerCase();

            const rowDiscipline =
                row.dataset.discipline ||
                    "";

            const rowType =
                row.dataset.type ||
                "";


            const matchesSearch =
                matchesDashboardSearch(
                    searchText,
                    rowText
                );

            const matchesDiscipline =
                selectedDiscipline === "" ||
                rowDiscipline ===
                selectedDiscipline;


            const matchesType =
                selectedType === "" ||
                rowType ===
                selectedType;


            row.style.display =
                (
                    matchesSearch &&
                    matchesDiscipline &&
                    matchesType
                )
                    ? ""
                    : "none";
        }
    );
}


window.filterOpenTable =
    filterOpenTable;


function createOpenTable(items) {

    if (
        items.length === 0
    ) {

        return `
            <div class="no-dashboard-data">
                No open submittals.
            </div>
        `;
    }


    const dashboardDocumentTypes =
        JSON.parse(
            localStorage.getItem(
                "documentTypes"
            )
        ) || [];


    const typeFilterOptions =
        dashboardDocumentTypes
            .map(
                function (type) {

                    return `

                        <option
                            value="${String(type.code || "").toLowerCase()}"
                        >
                            ${escapeHtml(type.code)} -
                            ${escapeHtml(type.name)}
                        </option>

                    `;
                }
            )
            .join("");


    let rows = "";


    items.forEach(
        function (item, index) {

            rows += `

                <tr
                    data-discipline="${String(item.discipline || "").toLowerCase()}"
                    data-type="${String(item.documentType || item.type || "").toLowerCase()}"
                    data-search="${escapeHtml(
                        getDashboardSearchText(item)
                    )}"
                >

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.revision ||
                            "R00"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.refNo ||
                            item.referenceNo
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.subject
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.documentType ||
                            item.type
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.issueDate
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.requestedBy ||
                            item.submittalRequestedBy
                        )}

                        ${
                            item.requestAttachmentId
                                ? `<br>
                                    <button
                                        type="button"
                                        class="open-pdf-btn"
                                        onclick="openDashboardPDF('${item.requestAttachmentId}')"
                                    >
                                        View Request
                                    </button>`
                                : ""
                        }
                    </td>

                    <td>
                        ${escapeHtml(
                            item.status
                        )}
                    </td>

                    <td>
                        ${createFileButtons(
                            item
                        )}
                    </td>

                </tr>

            `;
        }
    );


    return `

        <div class="dashboard-table-wrapper">


            <div class="open-table-search">

                <input
                    type="text"
                    id="openTableSearch"
                    placeholder="Search Open / In Progress..."
                    oninput="filterOpenTable()"
                >

                <select
                    id="openDisciplineFilter"
                    onchange="filterOpenTable()"
                >
                    <option value="">
                        All Disciplines
                    </option>

                    <option value="c">
                        STR - CIVIL
                    </option>

                    <option value="a">
                        ARCH - ARCHITECTURE
                    </option>

                    <option value="m">
                        MECH - MECHANICAL
                    </option>

                    <option value="e">
                        ELEC - ELECTRICAL
                    </option>
                </select>

                <select
                    id="openTypeFilter"
                    onchange="filterOpenTable()"
                >
                    <option value="">
                        All Types
                    </option>

                    ${typeFilterOptions}
                </select>

            </div>

            <table
                class="dashboard-table"
                id="openSubmittalsTable"
            >

                <thead>

                    <tr>

                        <th>S.No</th>
                        <th>Revision</th>
                        <th>Ref No.</th>
                        <th>Subject</th>
                        <th>Type</th>
                        <th>Issue Date</th>
                        <th>Submittal Requested By</th>
                        <th>Status</th>
                        <th>Files</th>

                    </tr>

                </thead>


                <tbody>
                    ${rows}
                </tbody>

            </table>

        </div>

    `;
}


function createClosedTable(items) {

    if (
        items.length === 0
    ) {

        return `
            <div class="no-dashboard-data">
                No closed submittals.
            </div>
        `;
    }


    let rows = "";


    items.forEach(
        function (item, index) {

            rows += `

                <tr
                    data-search="${escapeHtml(
                        getDashboardSearchText(item)
                    )}"
                >

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.revision ||
                            "R00"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.refNo ||
                            item.referenceNo
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.subject
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.requestedBy ||
                            item.submittalRequestedBy
                        )}

                        ${
                            item.requestAttachmentId
                                ? `<br>
                                    <button
                                        type="button"
                                        class="open-pdf-btn"
                                        onclick="openDashboardPDF('${item.requestAttachmentId}')"
                                    >
                                        View Request
                                    </button>`
                                : ""
                        }
                    </td>

                    <td>
                        ${escapeHtml(
                            item.status
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.closingDate
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.actionBy ||
                            item.responseBy
                        )}
                    </td>

                    <td>
                        ${createFileButtons(
                            item
                        )}
                    </td>

                </tr>

            `;
        }
    );


    return `

        <div class="dashboard-table-wrapper">

            <div class="open-table-search">

                <input
                    type="text"
                    id="closedTableSearch"
                    placeholder="Search Closed Submittals..."
                    oninput="filterClosedTable()"
                >

            </div>

            <table
                class="dashboard-table"
                id="closedSubmittalsTable"
            >

                <thead>

                    <tr>
                        <th>S.No</th>
                        <th>Revision</th>
                        <th>Ref No.</th>
                        <th>Subject</th>
                        <th>Submittal Requested By</th>
                        <th>Final Status</th>
                        <th>Closing Date</th>
                        <th>Last Action By</th>
                        <th>Files</th>
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
// CLOSED TABLE SEARCH
// ==========================================

function filterClosedTable() {

    const table =
        document.getElementById(
            "closedSubmittalsTable"
        );

    if (!table) {
        return;
    }

    const searchText =
        (
            document.getElementById(
                "closedTableSearch"
            )?.value ||
            ""
        )
            .toLowerCase()
            .trim();

    const rows =
        table.querySelectorAll(
            "tbody tr"
        );

    rows.forEach(
        function (row) {

            const searchableText =
                row.dataset.search ||
                row.textContent ||
                "";

            row.style.display =
                matchesDashboardSearch(
                    searchText,
                    searchableText
                )
                    ? ""
                    : "none";
        }
    );
}


window.filterClosedTable =
    filterClosedTable;

function createRevisionRegisterTable(items) {

    if (
        items.length === 0
    ) {

        return `
            <div class="no-dashboard-data">
                No revisions available.
            </div>
        `;
    }


    let rows = "";


    items.forEach(
        function (item, index) {

            rows += `

                <tr
                    data-search="${escapeHtml(
                        getDashboardSearchText(item)
                    )}"
                >

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.sequenceId
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.revision ||
                            "R00"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.refNo ||
                            item.referenceNo
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.subject
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.documentType ||
                            item.type
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.issueDate
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.status
                        )}
                    </td>

                    <td>

                        ${createFileButtons(
                            item
                        )}

                        ${
                            item.isHistory
                                ? `<br>
                                    <small>
                                        Previous Revision
                                    </small>`
                                : ""
                        }

                    </td>

                </tr>

            `;
        }
    );


    return `

        <div class="dashboard-table-wrapper">

            <div class="open-table-search">

                <input
                    type="text"
                    id="revisionTableSearch"
                    placeholder="Search Revision Register..."
                    oninput="filterRevisionTable()"
                >

            </div>

            <table
                class="dashboard-table"
                id="revisionRegisterTable"
            >

                <thead>

                    <tr>

                        <th>S.No</th>
                        <th>Sequence ID</th>
                        <th>Revision</th>
                        <th>Ref No.</th>
                        <th>Subject</th>
                        <th>Type</th>
                        <th>Issue Date</th>
                        <th>Status</th>
                        <th>Files</th>

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
// REVISION REGISTER SEARCH
// ==========================================

function filterRevisionTable() {

    const table =
        document.getElementById(
            "revisionRegisterTable"
        );

    if (!table) {
        return;
    }

    const searchText =
        (
            document.getElementById(
                "revisionTableSearch"
            )?.value ||
            ""
        )
            .toLowerCase()
            .trim();

    const rows =
        table.querySelectorAll(
            "tbody tr"
        );

    rows.forEach(
        function (row) {

            const searchableText =
                row.dataset.search ||
                row.textContent ||
                "";

            row.style.display =
                matchesDashboardSearch(
                    searchText,
                    searchableText
                )
                    ? ""
                    : "none";
        }
    );
}


window.filterRevisionTable =
    filterRevisionTable;

// ==========================================
// PDF - GROUP SUBMITTALS BY DISCIPLINE / TYPE
// ==========================================

function addGroupedSubmittalsToPdf(
    doc,
    items,
    startY,
    addSectionTitle,
    tableStyles
) {

    let currentY =
        startY;

    const disciplineOrder =
        ["C", "A", "M", "E"];


    let disciplinesToPrint =
        disciplineOrder.filter(
            function (code) {

                return items.some(
                    function (item) {

                        return (
                            normalizeDisciplineCode(
                                item.discipline
                            ) ===
                            code
                        );
                    }
                );
            }
        );


    if (
        selectedDashboardDiscipline !==
        "all"
    ) {

        disciplinesToPrint =
            disciplinesToPrint.filter(
                function (code) {

                    return (
                        code ===
                        selectedDashboardDiscipline
                    );
                }
            );
    }


    disciplinesToPrint.forEach(
        function (disciplineCode) {

            const disciplineItems =
                items.filter(
                    function (item) {

                        return (
                            normalizeDisciplineCode(
                                item.discipline
                            ) ===
                            disciplineCode
                        );
                    }
                );


            if (
                disciplineItems.length === 0
            ) {
                return;
            }


            if (
                currentY > 160
            ) {

                doc.addPage();

                currentY =
                    12;
            }


            addSectionTitle(
                getDisciplineLabel(
                    disciplineCode
                ) +
                " SUBMITTALS - TOTAL: " +
                disciplineItems.length,
                currentY
            );


            currentY +=
                11;


            const typeGroups = {};


            disciplineItems.forEach(
                function (item) {

                    const type =
                        String(
                            item.documentType ||
                            item.type ||
                            "OTHER"
                        )
                            .trim()
                            .toUpperCase();

                    if (
                        !typeGroups[type]
                    ) {
                        typeGroups[type] = [];
                    }

                    typeGroups[type].push(
                        item
                    );
                }
            );


            const preferredTypes =
                ["WIR", "MIR", "MAR"];


            const typeNames =
                Object.keys(
                    typeGroups
                )
                .sort(
                    function (a, b) {

                        const aIndex =
                            preferredTypes.indexOf(
                                a
                            );

                        const bIndex =
                            preferredTypes.indexOf(
                                b
                            );

                        if (
                            aIndex !== -1 &&
                            bIndex !== -1
                        ) {
                            return (
                                aIndex -
                                bIndex
                            );
                        }

                        if (
                            aIndex !== -1
                        ) {
                            return -1;
                        }

                        if (
                            bIndex !== -1
                        ) {
                            return 1;
                        }

                        return a.localeCompare(
                            b
                        );
                    }
                );


            const countText =
                typeNames
                    .map(
                        function (type) {

                            return (
                                type +
                                ": " +
                                typeGroups[type]
                                    .length
                            );
                        }
                    )
                    .join(
                        "    |    "
                    );


            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(
                9
            );


            const countLines =
                doc.splitTextToSize(
                    countText,
                    265
                );


            doc.text(
                countLines,
                15,
                currentY
            );


            currentY +=
                (
                    countLines.length *
                    4
                ) +
                4;


            typeNames.forEach(
                function (type) {

                    const typeItems =
                        typeGroups[type];


                    if (
                        currentY > 165
                    ) {

                        doc.addPage();

                        currentY =
                            12;
                    }


                    doc.setFont(
                        "helvetica",
                        "bold"
                    );

                    doc.setFontSize(
                        9
                    );

                    doc.text(
                        type +
                        " - " +
                        typeItems.length +
                        " Records",
                        15,
                        currentY
                    );


                    const rows =
                        typeItems.map(
                            function (
                                item,
                                index
                            ) {

                                return [

                                    index + 1,

                                    showValue(
                                        item.revision ||
                                        "R00"
                                    ),

                                    showValue(
                                        item.refNo ||
                                        item.referenceNo
                                    ),

                                    showValue(
                                        item.subject
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
                                    ),

                                    showValue(
                                        item.closingStatus
                                    )

                                ];
                            }
                        );


                    doc.autoTable({

                        startY:
                            currentY + 3,

                        head: [[

                            "S.No",
                            "Rev.",
                            "Ref No.",
                            "Subject",
                            "Issue Date",
                            "Requested By",
                            "Status",
                            "Closing"

                        ]],

                        body:
                            rows,

                        ...tableStyles
                    });


                    currentY =
                        doc.lastAutoTable
                            .finalY +
                        7;
                }
            );


            currentY +=
                3;
        }
    );


    return currentY;
}    

function loadLogoBase64(imagePath) {

    return new Promise(
        function (resolve, reject) {

            const img =
                new Image();

            img.onload =
                function () {
                        const canvas =
                        document.createElement(
                            "canvas"
                        );


                    canvas.width =
                        img.width;


                    canvas.height =
                        img.height;


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    ctx.drawImage(
                        img,
                        0,
                        0
                    );


                    resolve(
                        canvas.toDataURL(
                            "image/png"
                        )
                    );
                };


            img.onerror =
                reject;


            img.src =
                imagePath;
        }
    );
}


document.addEventListener(
    "click",
    async function (event) {


        if (
            event.target.id !==
            "downloadProjectPdf"
        ) {
            return;
        }


        if (
            !selectedProject
        ) {

            alert(
                "Project not found."
            );

            return;
        }


        if (
            !window.jspdf ||
            !window.jspdf.jsPDF
        ) {

            alert(
                "PDF library is not loaded."
            );

            return;
        }


        const {
            jsPDF
        } =
            window.jspdf;


        const doc =
            new jsPDF({

                orientation:
                    "landscape",

                unit:
                    "mm",

                format:
                    "a4"
            });


        if (
            typeof doc.autoTable !==
            "function"
        ) {

            alert(
                "PDF table library is not loaded."
            );

            return;
        }


        try {

            const logoBase64 =
                await loadLogoBase64(
                    "ALMAS LOGO.jpeg"
                );


            doc.addImage(
                logoBase64,
                "PNG",
                12,
                8,
                38,
                16
            );

        } catch (error) {

            console.warn(
                "Logo could not be added to PDF.",
                error
            );
        }


        const projectName =
            selectedProject.projectName ||
            selectedProject.name ||
            selectedProject.title ||
            "Project";


        const projectCode =
            selectedProject.projectCode ||
            selectedProject.code ||
            "-";


        const allCurrentSubmittals =
            JSON.parse(
                localStorage.getItem(
                    "submittals_" +
                    selectedProject.id
                )
            ) || [];


        const permissionSubmittals =
    allCurrentSubmittals.filter(
        function (item) {

            return canViewDiscipline(
                item.discipline
            );
        }
    );


        ensureDashboardDisciplineSelection();


        const submittals =
            filterByDashboardDiscipline(
                permissionSubmittals
            );

        const revisionRows =
            buildRevisionRows(
                submittals
            );

        const approved =
            submittals.filter(
                function (item) {

                    const status =
                        (item.status || "")
                            .trim()
                            .toLowerCase();

                    return (
                        status === "approved" ||
                        status === "approved as noted"
                    );
                }
            ).length;


        const inProgress =
            submittals.filter(
                function (item) {

                    const status =
                        (item.status || "")
                            .trim()
                            .toLowerCase();

                    return (
                        status === "in progress" ||
                        status === "under review"
                    );
                }
            ).length;


        const revise =
            submittals.filter(
                function (item) {

                    return (
                        (item.status || "")
                            .trim()
                            .toLowerCase()
                        === "revise & resubmit"
                    );
                }
            ).length;


        const rejected =
            submittals.filter(
                function (item) {

                    return (
                        (item.status || "")
                            .trim()
                            .toLowerCase()
                        === "rejected"
                    );
                }
            ).length;


        const closedItems =
            submittals.filter(
                function (item) {

                    return (
                        (item.closingStatus || "")
                            .trim()
                            .toLowerCase()
                        === "closed"
                    );
                }
            );


        const openItems =
            submittals.filter(
                function (item) {

                    return (
                        (item.closingStatus || "")
                            .trim()
                            .toLowerCase()
                        !== "closed"
                    );
                }
            );


        const todayIssued =
            revisionRows.filter(
                function (item) {

                    return (
                        getDateOnly(
                            item.issueDate
                        ) ===
                        todayDate
                    );
                }
            );


        const todayResponses =
            revisionRows.filter(
                function (item) {

                    return (
                        getDateOnly(
                            getResponseDate(
                                item
                            )
                        ) ===
                        todayDate
                    );
                }
            );


        doc.setTextColor(
            35,
            35,
            35
        );


        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.setFontSize(
            16
        );


        doc.text(
            "DOCUMENT SUBMITTAL DAILY SUMMARY",
            56,
            16
        );
        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(
            9
        );

        doc.text(
            "Selected Discipline: " +
            getSelectedDisciplineLabel(),
            56,
            22
        );


        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.setFontSize(
            9
        );


        doc.setFillColor(
            244,
            244,
            244
        );


        doc.rect(
            12,
            28,
            273,
            13,
            "F"
        );


        doc.setDrawColor(
            200,
            200,
            200
        );


        doc.rect(
            12,
            28,
            273,
            13
        );


        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.text(
            "Project:",
            15,
            36
        );


        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.text(
            String(projectName),
            29,
            36
        );


        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.text(
            "Project Code:",
            95,
            36
        );


        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.text(
            String(projectCode),
            116,
            36
        );


        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.text(
            "Report Date:",
            160,
            36
        );


        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.text(
            String(todayDate),
            180,
            36
        );


        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.text(
            "Prepared By:",
            220,
            36
        );


        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.text(
            localStorage.getItem(
                "currentUser"
            ) ||
            "Admin",
            241,
            36
        );


        doc.autoTable({

            startY:
                46,


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


            theme:
                "grid",


            styles: {

                fontSize:
                    8,

                halign:
                    "center",

                textColor:
                    [35, 35, 35],

                lineColor:
                    [200, 200, 200],

                lineWidth:
                    0.2
            },


            headStyles: {

                fillColor:
                    [231, 231, 231],

                textColor:
                    [35, 35, 35],

                fontStyle:
                    "bold"
            }

        });


        function addSectionTitle(
            title,
            y
        ) {

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


            doc.setFontSize(
                9
            );


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


        const tableStyles = {

            theme:
                "grid",


            styles: {

                fontSize:
                    7,

                textColor:
                    [35, 35, 35],

                lineColor:
                    [205, 205, 205],

                lineWidth:
                    0.2
            },


            headStyles: {

                fillColor:
                    [231, 231, 231],

                textColor:
                    [35, 35, 35],

                fontStyle:
                    "bold"
            }
        };


        let currentY =
            doc.lastAutoTable.finalY +
            7;
        currentY =
            addGroupedSubmittalsToPdf(
                doc,
                submittals,
                currentY,
                addSectionTitle,
                tableStyles
            );


        if (
            currentY > 165
        ) {

            doc.addPage();

            currentY =
                12;
        }    

        addSectionTitle(
            "TODAY ISSUED SUBMITTALS",
            currentY
        );


        const issuedRows =
            todayIssued.map(
                function (item, index) {

                    return [

                        index + 1,


                        showValue(
                            item.revision ||
                            "R00"
                        ),


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
                }
            );


        doc.autoTable({

            startY:
                currentY + 7,


            head: [[

                "S.No",
                "Rev.",
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
                        "-",
                        "No submittals issued today.",
                        "-",
                        "-",
                        "-",
                        "-",
                        "-"

                    ]],


            ...tableStyles
        });


        currentY =
            doc.lastAutoTable.finalY +
            7;


        addSectionTitle(
            "TODAY RECEIVED RESPONSES",
            currentY
        );


        const responseRows =
            todayResponses.map(
                function (item, index) {

                    return [

                        index + 1,


                        showValue(
                            item.revision ||
                            "R00"
                        ),


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
                            getResponseDate(
                                item
                            )
                        ),


                        showValue(
                            item.status
                        ),


                        showValue(
                            item.closingStatus
                        )

                    ];
                }
            );


        doc.autoTable({

            startY:
                currentY + 7,


            head: [[

                "S.No",
                "Rev.",
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
                        "-",
                        "No responses received today.",
                        "-",
                        "-",
                        "-",
                        "-"

                    ]],


            ...tableStyles
        });


        doc.addPage();


        currentY =
            12;


        addSectionTitle(
            "OPEN / IN PROGRESS SUBMITTALS",
            currentY
        );


        const selectedOpenDiscipline =
            document.getElementById(
                "openDisciplineFilter"
            )?.value || "";


        const selectedOpenType =
            document.getElementById(
                "openTypeFilter"
            )?.value || "";


        const openSearchText =
            (
                document.getElementById(
                    "openTableSearch"
                )?.value ||
                ""
            )
                .toLowerCase()
                .trim();


        const filteredOpenItems =
            openItems.filter(
                function (item) {


                    const itemDiscipline =
                        (item.discipline || "")
                            .toLowerCase();


                    const itemType =
                        (
                            item.documentType ||
                            item.type ||
                            ""
                        )
                            .toLowerCase();


                    const searchableText = `

                        ${item.revision || "R00"}

                        ${item.refNo || item.referenceNo || ""}

                        ${item.subject || ""}

                        ${item.documentType || item.type || ""}

                        ${item.issueDate || ""}

                        ${item.requestedBy || item.submittalRequestedBy || ""}

                        ${item.status || ""}

                    `.toLowerCase();


                    const matchesDiscipline =
                        selectedOpenDiscipline === "" ||
                        itemDiscipline ===
                        selectedOpenDiscipline;


                    const matchesType =
                        selectedOpenType === "" ||
                        itemType ===
                        selectedOpenType;


                    const matchesSearch =
                        openSearchText === "" ||
                        searchableText.includes(
                            openSearchText
                        );


                    return (

                        matchesDiscipline &&
                        matchesType &&
                        matchesSearch

                    );
                }
            );


        const openRows =
            filteredOpenItems.map(
                function (item, index) {

                    return [

                        index + 1,


                        showValue(
                            item.revision ||
                            "R00"
                        ),


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
                }
            );


        doc.autoTable({

            startY:
                currentY + 7,


            head: [[

                "S.No",
                "Rev.",
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
                        "-",
                        "No open submittals.",
                        "-",
                        "-",
                        "-",
                        "-"

                    ]],


            ...tableStyles
        });


        currentY =
            doc.lastAutoTable.finalY +
            7;


        addSectionTitle(
            "CLOSED SUBMITTALS",
            currentY
        );


        const closedRows =
            closedItems.map(
                function (item, index) {

                    return [

                        index + 1,


                        showValue(
                            item.revision ||
                            "R00"
                        ),


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
                }
            );


        doc.autoTable({

            startY:
                currentY + 7,


            head: [[

                "S.No",
                "Rev.",
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
                        "-",
                        "No closed submittals.",
                        "-",
                        "-",
                        "-",
                        "-"

                    ]],


            ...tableStyles
        });
// ======================================
// REVISION REGISTER
// ALL CURRENT + PREVIOUS REVISIONS
// ======================================

            currentY =
                doc.lastAutoTable.finalY +
                7;

            if (currentY > 175) {
                doc.addPage();
                currentY = 12;
            }

            addSectionTitle(
                "REVISION REGISTER",
                currentY
            );

            const revisionRegisterRows =
                revisionRows.map(
                    function (item, index) {

                        return [

                            index + 1,

                            showValue(
                                item.sequenceId
                            ),

                            showValue(
                                item.revision ||
                                "R00"
                            ),

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
                                item.status
                            ),

                            item.isHistory
                                ? "Previous Revision"
                                : "Current Revision"
                        ];
                    }
                );


            doc.autoTable({

                startY:
                    currentY + 7,

                head: [[

                    "S.No",
                    "Sequence ID",
                    "Rev.",
                    "Ref No.",
                    "Subject",
                    "Type",
                    "Issue Date",
                    "Status",
                    "Revision Status"

                ]],

                body:
                    revisionRegisterRows.length > 0
                        ? revisionRegisterRows
                        : [[

                            "-",
                            "-",
                            "-",
                            "-",
                            "No revisions available.",
                            "-",
                            "-",
                            "-",
                            "-"

                        ]],

                ...tableStyles
            });

        const safeProjectName =
            projectName.replace(
                /[^a-z0-9]/gi,
                "_"
            );


        doc.save(

            safeProjectName +
            "_" +
            getSelectedDisciplineLabel() +
            "_Daily_Summary_" +
            todayDate +
            ".pdf"

        );
    }
);
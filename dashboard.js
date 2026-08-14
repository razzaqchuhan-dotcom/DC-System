const projects =
    JSON.parse(localStorage.getItem("projects")) || [];

let allSubmittals = [];

projects.forEach(function(project) {

    const projectSubmittals =
        JSON.parse(
            localStorage.getItem(
                "submittals_" + project.id
            )
        ) || [];

    allSubmittals =
        allSubmittals.concat(projectSubmittals);
});


// TOTAL DOCUMENTS
const totalDocuments =
    allSubmittals.length;


// APPROVED
const approvedDocuments =
    allSubmittals.filter(function(item) {

        const status =
            (item.status || "").trim();

        return (
            status === "Approved" ||
            status === "Approved as Noted"
        );
    }).length;


// REVISE & RESUBMIT
const reviseDocuments =
    allSubmittals.filter(function(item) {

        return (
            (item.status || "").trim() ===
            "Revise & Resubmit"
        );

    }).length;


// REJECTED
const rejectedDocuments =
    allSubmittals.filter(function(item) {

        return (
            (item.status || "").trim() ===
            "Rejected"
        );

    }).length;


// PENDING
const pendingDocuments =
    totalDocuments -
    approvedDocuments -
    reviseDocuments -
    rejectedDocuments;


// SHOW ON DASHBOARD
document.getElementById(
    "totalDocuments"
).textContent = totalDocuments;

document.getElementById(
    "approvedDocuments"
).textContent = approvedDocuments;

document.getElementById(
    "pendingDocuments"
).textContent = pendingDocuments;

document.getElementById(
    "reviseDocuments"
).textContent = reviseDocuments;

document.getElementById(
    "rejectedDocuments"
).textContent = rejectedDocuments;
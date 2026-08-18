const projects = JSON.parse(localStorage.getItem("projects")) || [];

const selectedProjectId = Number(
    localStorage.getItem("selectedProjectId")
);

const selectedProject = projects.find(
    project => project.id === selectedProjectId
);

if (!selectedProject) {
    alert("Project not found.");
    window.location.href = "projects.html";
}
// ===============================
// PDF DATABASE
// ===============================

let pdfDatabase;

const dbRequest =
    indexedDB.open("DCSystemPDFs", 1);

dbRequest.onupgradeneeded =
    function(event) {

        pdfDatabase = event.target.result;

        if (
            !pdfDatabase.objectStoreNames.contains("pdfFiles")
        ) {
            pdfDatabase.createObjectStore(
                "pdfFiles",
                {
                    keyPath: "id"
                }
            );
        }
    };

dbRequest.onsuccess =
    function(event) {
        pdfDatabase = event.target.result;
    };

dbRequest.onerror =
    function() {
        console.error(
            "PDF database could not be opened."
        );
    };

// ===============================
// PROJECT HEADER
// ===============================

document.getElementById("projectTitle").textContent =
    selectedProject.name;

document.getElementById("projectNumberText").textContent =
    selectedProject.number;

document.getElementById("projectCodeText").textContent =
    selectedProject.code || "-";


// ===============================
// CURRENT USER / ROLE
// ===============================

const currentUser =
    localStorage.getItem("currentUser") || "Admin";

const currentRole =
    localStorage.getItem("currentRole") || "admin";


// ===============================
// DOCUMENT TYPES
// ===============================

let documentTypes =
    JSON.parse(localStorage.getItem("documentTypes")) || [];


// default types sirf first time
if (documentTypes.length === 0) {

    documentTypes = [
        {
            code: "WIR",
            name: "Work Inspection Request",
            responseHours: 24
        },
        {
            code: "MIR",
            name: "Material Inspection Request",
            responseHours: 72
        },
        {
            code: "MAR",
            name: "Material Approval Request",
            responseHours: 168
        }
    ];

    saveDocumentTypes();
}


function saveDocumentTypes() {
    localStorage.setItem(
        "documentTypes",
        JSON.stringify(documentTypes)
    );
}


// ===============================
// DOCUMENT TYPE DROPDOWNS
// ===============================

const documentType =
    document.getElementById("documentType");

const documentTypeFilter =
    document.getElementById("documentTypeFilter");


function loadDocumentTypes() {

    documentType.innerHTML =
        `<option value="">Select Document Type</option>`;

    documentTypeFilter.innerHTML =
        `<option value="">All Document Types</option>`;


    documentTypes.forEach(function(type) {

        const option1 =
            document.createElement("option");

        option1.value = type.code;

        option1.textContent =
            type.code + " - " + type.name;

        documentType.appendChild(option1);


        const option2 =
            document.createElement("option");

        option2.value = type.code;

        option2.textContent =
            type.code;

        documentTypeFilter.appendChild(option2);

    });
}

loadDocumentTypes();


// ===============================
// ADMIN ADD DOCUMENT TYPE
// ===============================

const addDocumentTypeBtn =
    document.getElementById("addDocumentTypeBtn");

const documentTypeMenuBtn =
    document.getElementById("documentTypeMenuBtn");

const documentTypeMenu =
    document.getElementById("documentTypeMenu");

const editDocumentTypeBtn =
    document.getElementById("editDocumentTypeBtn");

const deleteDocumentTypeBtn =
    document.getElementById("deleteDocumentTypeBtn");


// NORMAL DOCUMENT TYPE CHANGE
documentType.addEventListener("change", function () {
    generateSequenceId();
});


// ==========================================
// ADD DOCUMENT TYPE
// ==========================================

addDocumentTypeBtn.addEventListener("click", function () {

    const code = prompt(
        "Enter Document Type Code:\nExample: RFI"
    );

    if (!code || code.trim() === "") {
        return;
    }

    const name = prompt(
        "Enter Document Type Name:\nExample: Request for Information"
    );

    if (!name || name.trim() === "") {
        return;
    }

    const cleanCode =
        code.trim().toUpperCase();

    const cleanName =
        name.trim();

    const alreadyExists =
        documentTypes.some(function(item) {

            return (
                item.code.toLowerCase() ===
                cleanCode.toLowerCase()
            );

        });

    if (alreadyExists) {

        alert("This Document Type already exists.");

        return;
    }

    documentTypes.push({
        code: cleanCode,
        name: cleanName
    });

    saveDocumentTypes();

    loadDocumentTypes();

    documentType.value = cleanCode;

    generateSequenceId();
});


// ==========================================
// OPEN / CLOSE 3 DOT MENU
// ==========================================

documentTypeMenuBtn.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        documentTypeMenu.style.display =
            documentTypeMenu.style.display === "block"
                ? "none"
                : "block";
    }
);


// ==========================================
// EDIT DOCUMENT TYPE
// ==========================================

editDocumentTypeBtn.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        const selectedCode =
            documentType.value;

        if (!selectedCode) {

            alert(
                "Please select a Document Type first."
            );

            return;
        }

        const index =
            documentTypes.findIndex(
                function (item) {
                    return item.code === selectedCode;
                }
            );

        if (index === -1) {
            return;
        }

        const oldItem =
            documentTypes[index];

        const newCode =
            prompt(
                "Edit Document Type Code:",
                oldItem.code
            );

        if (!newCode || newCode.trim() === "") {
            return;
        }

        const newName =
            prompt(
                "Edit Document Type Name:",
                oldItem.name
            );

        if (!newName || newName.trim() === "") {
            return;
        }

        const cleanCode =
            newCode.trim().toUpperCase();

        const cleanName =
            newName.trim();

        const duplicate =
            documentTypes.some(
                function (item, itemIndex) {

                    return (
                        itemIndex !== index &&
                        item.code.toLowerCase() ===
                        cleanCode.toLowerCase()
                    );
                }
            );

        if (duplicate) {

            alert(
                "Another Document Type already uses this code."
            );

            return;
        }

        documentTypes[index] = {
            code: cleanCode,
            name: cleanName
        };

        saveDocumentTypes();

        loadDocumentTypes();

        documentType.value =
            cleanCode;

        generateSequenceId();

        documentTypeMenu.style.display =
            "none";
    }
);


// ==========================================
// DELETE DOCUMENT TYPE
// ==========================================

deleteDocumentTypeBtn.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        const selectedCode =
            documentType.value;

        if (!selectedCode) {

            alert(
                "Please select a Document Type first."
            );

            return;
        }

        const selectedItem =
            documentTypes.find(
                function (item) {
                    return item.code === selectedCode;
                }
            );

        if (!selectedItem) {
            return;
        }

        const confirmed =
            confirm(
                "Delete Document Type: " +
                selectedItem.code +
                " - " +
                selectedItem.name +
                " ?"
            );

        if (!confirmed) {
            return;
        }

        documentTypes =
            documentTypes.filter(
                function (item) {
                    return item.code !== selectedCode;
                }
            );

        saveDocumentTypes();

        loadDocumentTypes();

        documentType.value = "";

        generateSequenceId();

        documentTypeMenu.style.display =
            "none";
    }
);


// ==========================================
// CLICK OUTSIDE = CLOSE MENU
// ==========================================

document.addEventListener("click", function () {

    documentTypeMenu.style.display =
        "none";
});


documentTypeMenu.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();
    }
);

// ===============================
// DATE
// ===============================

const today =
    new Date().toISOString().split("T")[0];

const issueDate =
    document.getElementById("issueDate");

issueDate.value = today;
const issuerName =
    document.getElementById("issuerName");
// ===============================
// ISSUER MASTER LIST
// ===============================

let issuerNames =
    JSON.parse(
        localStorage.getItem("issuerNames")
    ) || [];


function saveIssuerNames() {

    localStorage.setItem(
        "issuerNames",
        JSON.stringify(issuerNames)
    );
}


function loadIssuerNames() {

    issuerName.innerHTML =
        '<option value="">Select Issuer</option>';

    issuerNames.forEach(function(name) {

        const option =
            document.createElement("option");

        option.value = name;
        option.textContent = name;
        issuerName.appendChild(option);

    });

}
        loadIssuerNames();

const addIssuerBtn =
    document.getElementById("addIssuerBtn");

const issuerMenuBtn =
    document.getElementById("issuerMenuBtn");

const issuerMenu =
    document.getElementById("issuerMenu");

const editIssuerBtn =
    document.getElementById("editIssuerBtn");

const deleteIssuerBtn =
    document.getElementById("deleteIssuerBtn");


// ADD ISSUER
addIssuerBtn.addEventListener("click", function () {

    const name = prompt("Enter Issuer Name:");

    if (!name || name.trim() === "") {
        return;
    }

    const cleanName = name.trim();

    const alreadyExists =
        issuerNames.some(function(item) {
            return item.toLowerCase() === cleanName.toLowerCase();
        });

    if (alreadyExists) {
        alert("This issuer already exists.");
        issuerName.value = cleanName;
        return;
    }

    issuerNames.push(cleanName);

    saveIssuerNames();
    loadIssuerNames();

    issuerName.value = cleanName;
});


// OPEN / CLOSE 3 DOT MENU
issuerMenuBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    issuerMenu.style.display =
        issuerMenu.style.display === "block"
            ? "none"
            : "block";
});


// EDIT ISSUER
editIssuerBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    const oldName = issuerName.value;

    if (!oldName) {
        alert("Please select an issuer first.");
        return;
    }

    const newName =
        prompt("Edit Issuer Name:", oldName);

    if (!newName || newName.trim() === "") {
        return;
    }

    const cleanName = newName.trim();

    const index =
        issuerNames.findIndex(function(item) {
            return item === oldName;
        });

    if (index === -1) {
        return;
    }

    issuerNames[index] = cleanName;

    saveIssuerNames();
    loadIssuerNames();

    issuerName.value = cleanName;
    issuerMenu.style.display = "none";
});


// DELETE ISSUER
deleteIssuerBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    const selectedName = issuerName.value;

    if (!selectedName) {
        alert("Please select an issuer first.");
        return;
    }

    const confirmed =
        confirm("Delete issuer: " + selectedName + " ?");

    if (!confirmed) {
        return;
    }

    issuerNames =
        issuerNames.filter(function(item) {
            return item !== selectedName;
        });

    saveIssuerNames();
    loadIssuerNames();

    issuerMenu.style.display = "none";
});

// CLICK ANYWHERE OUTSIDE = CLOSE MENU
document.addEventListener("click", function () {

    issuerMenu.style.display = "none";

});


// CLICK INSIDE MENU = DO NOT CLOSE
issuerMenu.addEventListener("click", function (event) {

    event.stopPropagation();

});

const submissionMethod =
    document.getElementById("submissionMethod");

const receiverName =
    document.getElementById("receiverName");

// ==========================================
// REQUESTED BY MASTER LIST
// ==========================================

const requestedBySelect =
    document.getElementById("submittalRequestedBy");

let requestedByNames =
    JSON.parse(
        localStorage.getItem("requestedByNames")
    ) || [];

function saveRequestedByNames() {

    localStorage.setItem(
        "requestedByNames",
        JSON.stringify(requestedByNames)
    );
}

function loadRequestedByNames() {

    requestedBySelect.innerHTML =
        '<option value="">Select Requested By</option>';

    requestedByNames.forEach(function(name) {

        const option =
            document.createElement("option");

        option.value = name;
        option.textContent = name;

        requestedBySelect.appendChild(option);
    });
}

loadRequestedByNames();

const addRequestedByBtn =
    document.getElementById("addRequestedByBtn");

addRequestedByBtn.addEventListener("click", function () {

    const newName =
        prompt("Enter Requested By Name:");

    if (!newName) return;

    const cleanName =
        newName.trim();

    if (!cleanName) return;

    const alreadyExists =
        requestedByNames.some(function(name) {
            return name.toLowerCase() ===
                cleanName.toLowerCase();
        });

    if (alreadyExists) {
        alert("This name already exists.");
        return;
    }

    requestedByNames.push(cleanName);

    saveRequestedByNames();
    loadRequestedByNames();

    requestedBySelect.value = cleanName;
});

const requestedByMenuBtn =
    document.getElementById("requestedByMenuBtn");

const requestedByMenu =
    document.getElementById("requestedByMenu");

requestedByMenuBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    if (requestedByMenu.style.display === "none") {
        requestedByMenu.style.display = "block";
    } else {
        requestedByMenu.style.display = "none";
    }

});

requestedByMenu.addEventListener("click", function (event) {
    event.stopPropagation();
});

document.addEventListener("click", function () {
    requestedByMenu.style.display = "none";
});

const editRequestedByBtn =
    document.getElementById("editRequestedByBtn");

editRequestedByBtn.addEventListener("click", function () {

    const selectedName =
        requestedBySelect.value;

    if (!selectedName) {
        alert("Please select a Requested By name first.");
        return;
    }

    const editedName =
        prompt(
            "Edit Requested By Name:",
            selectedName
        );

    if (!editedName) return;

    const cleanName =
        editedName.trim();

    if (!cleanName) return;

    const alreadyExists =
        requestedByNames.some(function(name) {
            return (
                name.toLowerCase() === cleanName.toLowerCase() &&
                name !== selectedName
            );
        });

    if (alreadyExists) {
        alert("This name already exists.");
        return;
    }

    const index =
        requestedByNames.indexOf(selectedName);

    if (index !== -1) {
        requestedByNames[index] = cleanName;
    }

    saveRequestedByNames();
    loadRequestedByNames();

    requestedBySelect.value = cleanName;
    requestedByMenu.style.display = "none";
});

const deleteRequestedByBtn =
    document.getElementById("deleteRequestedByBtn");

deleteRequestedByBtn.addEventListener("click", function () {

    const selectedName =
        requestedBySelect.value;

    if (!selectedName) {
        alert("Please select a Requested By name first.");
        return;
    }

    const confirmDelete =
        confirm(
            'Are you sure you want to delete "' +
            selectedName +
            '"?'
        );

    if (!confirmDelete) return;

    requestedByNames =
        requestedByNames.filter(function(name) {
            return name !== selectedName;
        });

    saveRequestedByNames();
    loadRequestedByNames();

    requestedByMenu.style.display = "none";

    alert("Requested By name deleted successfully.");
});

// ===============================
// RECEIVER MASTER LIST
// ===============================

let receiverNames =
    JSON.parse(
        localStorage.getItem("receiverNames")
    ) || [];


function saveReceiverNames() {

    localStorage.setItem(
        "receiverNames",
        JSON.stringify(receiverNames)
    );
}


function loadReceiverNames() {

    receiverName.innerHTML =
        '<option value="">Select Receiver</option>';

    receiverNames.forEach(function(name) {

        const option =
            document.createElement("option");

        option.value = name;
        option.textContent = name;

        receiverName.appendChild(option);

    });

}


loadReceiverNames();

const addReceiverBtn =
    document.getElementById("addReceiverBtn");

const receiverMenuBtn =
    document.getElementById("receiverMenuBtn");

const receiverMenu =
    document.getElementById("receiverMenu");

const editReceiverBtn =
    document.getElementById("editReceiverBtn");

const deleteReceiverBtn =
    document.getElementById("deleteReceiverBtn");


// ADD RECEIVER
addReceiverBtn.addEventListener("click", function () {

    const name = prompt("Enter Receiver Name:");

    if (!name || name.trim() === "") {
        return;
    }

    const cleanName = name.trim();

    const alreadyExists =
        receiverNames.some(function(item) {
            return (
                item.toLowerCase() ===
                cleanName.toLowerCase()
            );
        });

    if (alreadyExists) {
        alert("This receiver already exists.");
        receiverName.value = cleanName;
        return;
    }

    receiverNames.push(cleanName);

    saveReceiverNames();
    loadReceiverNames();

    receiverName.value = cleanName;
});


// OPEN / CLOSE 3 DOT MENU
receiverMenuBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    receiverMenu.style.display =
        receiverMenu.style.display === "block"
            ? "none"
            : "block";
});


// EDIT RECEIVER
editReceiverBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    const oldName = receiverName.value;

    if (!oldName) {
        alert("Please select a receiver first.");
        return;
    }

    const newName =
        prompt("Edit Receiver Name:", oldName);

    if (!newName || newName.trim() === "") {
        return;
    }

    const cleanName = newName.trim();

    const index =
        receiverNames.findIndex(function(item) {
            return item === oldName;
        });

    if (index === -1) {
        return;
    }

    receiverNames[index] = cleanName;

    saveReceiverNames();
    loadReceiverNames();

    receiverName.value = cleanName;

    receiverMenu.style.display = "none";
});


// DELETE RECEIVER
deleteReceiverBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    const selectedName = receiverName.value;

    if (!selectedName) {
        alert("Please select a receiver first.");
        return;
    }

    const confirmed =
        confirm(
            "Delete receiver: " +
            selectedName +
            " ?"
        );

    if (!confirmed) {
        return;
    }

    receiverNames =
        receiverNames.filter(function(item) {
            return item !== selectedName;
        });

    saveReceiverNames();
    loadReceiverNames();

    receiverMenu.style.display = "none";
});


// CLICK OUTSIDE = CLOSE
document.addEventListener("click", function () {
    receiverMenu.style.display = "none";
});


// CLICK INSIDE MENU = DO NOT CLOSE
receiverMenu.addEventListener("click", function (event) {
    event.stopPropagation();
});

const receivedDate =
    document.getElementById("receivedDate");

// ===============================
// SUBMITTALS
// ===============================
let submittals =
    JSON.parse(
        localStorage.getItem(
            "submittals_" + selectedProject.id
        )
    ) || [];
let responseStatuses =
    JSON.parse(
        localStorage.getItem("responseStatuses")
    ) || [
        "In Progress",
        "Approved",
        "Approved as Noted",
        "Revise & Resubmit",
        "Rejected",
        "Under Review",
        "No Objection"
    ];


function renderResponseStatuses() {

    responseStatus.innerHTML =
        '<option value="">Select Status</option>';

    responseStatuses.forEach(function(status) {

        const option =
            document.createElement("option");

        option.value = status;
        option.textContent = status;

        responseStatus.appendChild(option);
    });
}


addStatusBtn.addEventListener("click", function() {

    const newStatus =
        prompt("Enter New Status:");

    if (
        !newStatus ||
        newStatus.trim() === ""
    ) {
        return;
    }

    const status =
        newStatus.trim();

    const alreadyExists =
        responseStatuses.some(
            item =>
                item.toLowerCase() ===
                status.toLowerCase()
        );

    if (alreadyExists) {
        alert("This status already exists.");
        return;
    }

    responseStatuses.push(status);

    localStorage.setItem(
        "responseStatuses",
        JSON.stringify(responseStatuses)
    );

    renderResponseStatuses();

    responseStatus.value = status;
});


renderResponseStatuses();

let selectedSubmittalId = null;
let editingSubmittalId = null;

// ===============================
// ELEMENTS
// ===============================

const discipline =
    document.getElementById("discipline");

const sequenceId =
    document.getElementById("sequenceId");

const message =
    document.getElementById("submittalMessage");


// ===============================
// SEQUENCE ID
// ===============================

function generateSequenceId() {

    const disciplineCode =
        discipline.value;

    const typeCode =
        documentType.value;


    if (
        !disciplineCode ||
        !typeCode ||
        typeCode === "__ADD_NEW__"
    ) {

        sequenceId.textContent =
            "AUTO GENERATED";

        return;
    }


    const matching =
        submittals.filter(item =>
            item.discipline === disciplineCode &&
            item.documentType === typeCode
        );


    let highest = 0;


    matching.forEach(function(item) {

        const parts =
            item.sequenceId.split("-");

        const lastPart =
            Number(parts[parts.length - 1]);

        if (lastPart > highest) {
            highest = lastPart;
        }
    });


    const nextNumber =
        highest + 1;


    const sequence =
        String(nextNumber).padStart(4, "0");


    sequenceId.textContent =
        selectedProject.number +
        "-" +
        selectedProject.code +
        "-" +
        disciplineCode +
        "-" +
        typeCode +
        "-" +
        sequence;
}


discipline.addEventListener(
    "change",
    generateSequenceId
);


// ===============================
// NEW SUBMITTAL BUTTON
// ===============================

const newSubmittalButton =
    document.getElementById("newSubmittalButton");

const formCard =
    document.getElementById("newSubmittalForm");

const responseActionSection =
    document.getElementById("responseActionSection");

responseActionSection.style.display = "none";    

newSubmittalButton.addEventListener(
    "click",
    function() {
        
        clearForm(); 
        editingSubmittalId = null;

document.getElementById("saveSubmittal").textContent =
    "Save Submittal";

        formCard.style.display = "block";
        responseActionSection.style.display = "none";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


// ===============================
// CANCEL
// ===============================

document
    .getElementById("cancelSubmittal")
    .addEventListener("click", function() {

        clearForm();

        formCard.style.display = "none";
    });


// ===============================
// SAVE SUBMITTAL
// ===============================

document
    .getElementById("saveSubmittal")
    .addEventListener("click", function() {

        message.textContent = "";


        const referenceNo =
            document
                .getElementById("referenceNo")
                .value
                .trim();


        const subject =
            document
                .getElementById("subject")
                .value
                .trim();


        const description =
            document
                .getElementById("description")
                .value
                .trim();
        const submittalRequestedBy =
            document
                .getElementById("submittalRequestedBy")
                .value
                .trim();


        const requestAttachmentInput =
            document.getElementById("requestAttachment");


        const requestAttachmentFile =
            requestAttachmentInput.files.length > 0
                ? requestAttachmentInput.files[0]
                : null;

        const pdfInput =
            document.getElementById("pdfFile");


        const pdfFile =
            pdfInput.files.length > 0
                ? pdfInput.files[0]
                : null;


        if (!discipline.value) {

            message.textContent =
                "Please select Discipline.";

            return;
        }


        if (
            !documentType.value ||
            documentType.value === "__ADD_NEW__"
        ) {

            message.textContent =
                "Please select Document Type.";

            return;
        }


        if (!referenceNo) {

            message.textContent =
                "Please enter Ref No.";

            return;
        }


        if (!subject) {

            message.textContent =
                "Please enter Subject.";

            return;
        }


        if (!issueDate.value) {

            message.textContent =
                "Please select Issue Date.";

            return;
        }


        if (
            pdfFile &&
            pdfFile.type !== "application/pdf"
        ) {

            message.textContent =
                "Only PDF files are allowed.";

            return;
        }


        const selectedType =
            documentTypes.find(
                type =>
                    type.code === documentType.value
            );
        const pdfId =
            pdfFile
                ? "PDF-" + Date.now()
                : "";
        const requestAttachmentId =
            requestAttachmentFile
                ? "REQUEST-" + Date.now()
                : "";            

        const newSubmittal = {

            issuerName: issuerName.value.trim(),

            submittalRequestedBy: submittalRequestedBy,
            requestAttachmentId: requestAttachmentId,

            requestAttachmentName:
                requestAttachmentFile
                    ? requestAttachmentFile.name
                    : "",

            requestAttachmentType:
                requestAttachmentFile
                    ? requestAttachmentFile.type
                    : "",

            submissionMethod: submissionMethod.value,

            receiverName: receiverName.value.trim(),    

            receivedDate: receivedDate.value,

            id: Date.now(),

            projectId:
                selectedProject.id,

            projectName:
                selectedProject.name,

            projectNumber:
                selectedProject.number,

            projectCode:
                selectedProject.code,

            sequenceId:
                sequenceId.textContent,

            referenceNo:
                referenceNo,

            subject:
                subject,

            description:
                description,

            discipline:
                discipline.value,

            documentType:
                documentType.value,

            issueDate:
                issueDate.value,

            status:
                "In Progress",

            actionBy:
                "",

            actionDate:
                "",

            closed:
                false,

            frozenColor:
                "",

            responseHours:
                selectedType
                    ? selectedType.responseHours
                    : 24,

            pdfName:
                pdfFile
                    ? pdfFile.name
                    : "",

            pdfId: pdfId
        };
if (pdfFile && pdfDatabase) {

    const transaction =
        pdfDatabase.transaction(
            ["pdfFiles"],
            "readwrite"
        );

    const store =
        transaction.objectStore(
            "pdfFiles"
        );

    store.put({
        id: pdfId,
        name: pdfFile.name,
        file: pdfFile
    });
}    

if (requestAttachmentFile && pdfDatabase) {

    const requestTransaction =
        pdfDatabase.transaction(
            ["pdfFiles"],
            "readwrite"
        );

    const requestStore =
        requestTransaction.objectStore(
            "pdfFiles"
        );

    requestStore.put({
        id: requestAttachmentId,
        name: requestAttachmentFile.name,
        file: requestAttachmentFile
    });
}

    if (editingSubmittalId !== null) {

    const existingItem =
        submittals.find(
            item =>
                item.id === editingSubmittalId
        );

    if (existingItem) {

        existingItem.referenceNo =
            document.getElementById("referenceNo").value.trim();

        existingItem.subject =
            document.getElementById("subject").value.trim();

        existingItem.description =
            document.getElementById("description").value.trim();

        existingItem.issueDate =
            issueDate.value;

        existingItem.issuerName =
            issuerName.value;
        
        existingItem.submittalRequestedBy =
            document
                .getElementById("submittalRequestedBy")
                .value
                .trim();    
            // REQUEST ATTACHMENT
            if (requestAttachmentFile) {

                existingItem.requestAttachmentId =
                    requestAttachmentId;

                existingItem.requestAttachmentName =
                    requestAttachmentFile.name;

                existingItem.requestAttachmentType =
                    requestAttachmentFile.type;
            }


        existingItem.submissionMethod =
            submissionMethod.value;

        existingItem.receiverName =
            receiverName.value.trim();

        existingItem.receivedDate =
            receivedDate.value;


        // ACTION 1
        existingItem.action1By =
            document.getElementById("action1By").value.trim();

        existingItem.action1Date =
            document.getElementById("action1Date").value;


        // ACTION 2 - OPTIONAL
        existingItem.action2By =
            document.getElementById("action2By").value.trim();

        existingItem.action2Date =
            document.getElementById("action2Date").value;


        // ACTION 3 - OPTIONAL
        existingItem.action3By =
            document.getElementById("action3By").value.trim();

        existingItem.action3Date =
            document.getElementById("action3Date").value;


        // RESPONSE STATUS
        existingItem.status =
            document.getElementById("responseStatus").value
            || "In Progress";


        // CLOSING
        existingItem.closingStatus =
            document.getElementById("closingStatus").value
            || "Open";

        existingItem.closingDate =
            document.getElementById("closingDate").value;


        // IF NEW PDF SELECTED, REPLACE OLD PDF
        if (pdfFile) {

            existingItem.pdfName =
                pdfFile.name;

            existingItem.pdfId =
                pdfId;
        }
    }

} else {

    submittals.push(
        newSubmittal
    );
}

        saveSubmittals();


        message.textContent =
            "Submittal saved successfully.";


        clearForm();

        renderSubmittals();

        formCard.style.display =
            "none";
    });

// ===============================
// SAVE SUBMITTALS
// ===============================

function saveSubmittals() {

    localStorage.setItem(
        "submittals_" + selectedProject.id,
        JSON.stringify(submittals)
    );

}

// ===============================
// OPEN SAVED PDF
// ===============================

function openSavedPDF(pdfId) {

    if (!pdfDatabase) {
        alert("PDF database is not ready.");
        return;
    }

    const transaction =
        pdfDatabase.transaction(
            ["pdfFiles"],
            "readonly"
        );

    const store =
        transaction.objectStore("pdfFiles");

    const request =
        store.get(pdfId);

    request.onsuccess = function() {

        const record = request.result;

        if (!record) {
            alert("PDF file not found.");
            return;
        }

        const pdfURL =
            URL.createObjectURL(record.file);

        window.open(pdfURL, "_blank");
    };

    request.onerror = function() {
        alert("Could not open PDF.");
    };
}

// ===============================
// CLEAR FORM
// ===============================

function clearForm() {

    discipline.value = "";

    documentType.value = "";

    document
        .getElementById("referenceNo")
        .value = "";

    document
        .getElementById("subject")
        .value = "";

    document
        .getElementById("description")
        .value = "";

    document
        .getElementById("pdfFile")
        .value = "";

    issueDate.value = today;

    sequenceId.textContent =
        "AUTO GENERATED";
}


// ===============================
// DISCIPLINE NAME
// ===============================

function getDisciplineName(code) {

    if (code === "C") {
        return "Civil";
    }

    if (code === "A") {
        return "Architectural";
    }

    if (code === "M") {
        return "Mechanical";
    }

    if (code === "E") {
        return "Electrical";
    }

    return code;
}

// ===============================
// SUBMITTAL TIMING COLOR
// ===============================

function getSubmittalTimingColor(item) {

    // Closed item ka saved/frozen color
    if (item.frozenColor) {
        return item.frozenColor;
    }

    const issuedDate =
        new Date(item.issueDate);

    if (isNaN(issuedDate.getTime())) {
        return "";
    }

    // Closed item ke liye closing date use hogi
    // Open item ke liye current time
    const endDate =
        item.closingStatus === "Closed" &&
        item.closingDate
            ? new Date(item.closingDate)
            : new Date();

    const hoursPassed =
        (endDate - issuedDate) /
        (1000 * 60 * 60);

    const responseHours =
        item.responseHours || 24;

    if (hoursPassed >= responseHours) {
        return "red";
    }

    if (
        hoursPassed >=
        responseHours * 0.5
    ) {
        return "orange";
    }

    return "green";
}
// ===============================
// RENDER REGISTER
// ===============================

function renderSubmittals() {

    const tableBody =
        document.getElementById(
            "submittalTableBody"
        );


    tableBody.innerHTML = "";

// ===============================
// APPLY SEARCH & FILTER
// ===============================

const searchText =
    document.getElementById("searchInput")
        .value
        .trim()
        .toLowerCase();

const selectedDiscipline =
    document.getElementById("disciplineFilter")
        .value;

const selectedDocumentType =
    document.getElementById("documentTypeFilter")
        .value;


const filteredSubmittals = submittals.filter(function(item) {

    const matchesSearch =
        (item.sequenceId || "")
            .toLowerCase()
            .includes(searchText) ||

        (item.referenceNo || "")
            .toLowerCase()
            .includes(searchText) ||

        (item.subject || "")
            .toLowerCase()
            .includes(searchText) ||

        (item.status || "")
            .toLowerCase()
            .includes(searchText) ||

        (item.actionBy || "")
            .toLowerCase()
            .includes(searchText) ||

        (item.issueDate || "")
            .toLowerCase()
            .includes(searchText);


    const matchesDiscipline =
        selectedDiscipline === "" ||
        item.discipline === selectedDiscipline;


    const matchesDocumentType =
        selectedDocumentType === "" ||
        item.documentType === selectedDocumentType;


    return (
        matchesSearch &&
        matchesDiscipline &&
        matchesDocumentType
    );

});



    if (filteredSubmittals.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="11"
                    class="no-data"
                >
                    No submittals found.
                </td>
            </tr>
        `;

        return;
    }


    filteredSubmittals.forEach(
    function(item, index) {

            const row =
                document.createElement("tr");
                
        if (item.status === "In Progress") {
            row.style.fontWeight = "bold";
            row.style.color = "#0056b3";
}        
    row.dataset.id = item.id;

    const timingColor =
    getSubmittalTimingColor(item);

if (timingColor === "green") {
    row.style.backgroundColor = "#e8f5e9";
}

if (timingColor === "orange") {
    row.style.backgroundColor = "#fff3e0";
}

if (timingColor === "red") {
    row.style.backgroundColor = "#ffebee";
}

// Text hamesha black
row.style.color = "#000000";

row.addEventListener("click", function() {

    selectedSubmittalId = item.id;

    document
        .querySelectorAll(".register-table tbody tr")
        .forEach(function(tableRow) {
            tableRow.classList.remove("selected-row");
        });

    row.classList.add("selected-row");

    const editButton =
        document.getElementById("editSelectedButton");

    const deleteButton =
        document.getElementById("deleteSelectedButton");

    if (editButton) {
        editButton.disabled = false;
    }

    if (deleteButton) {
        deleteButton.disabled = false;
    }
});

row.addEventListener("dblclick", function() {

    selectedSubmittalId = item.id;
    editingSubmittalId = item.id;

    document.getElementById("responseSequenceId").textContent =
        item.sequenceId || "-";

    document.getElementById("responseRefNo").textContent =
        item.referenceNo || "-";

    document.getElementById("responseSubject").textContent =
        item.subject || "-";

    document.getElementById("responseDiscipline").textContent =
        getDisciplineName(item.discipline) || "-";

    document.getElementById("responseDocumentType").textContent =
        item.documentType || "-";

    document.getElementById("responseIssueDate").textContent =
        item.issueDate || "-";

    document.getElementById("responseIssuedBy").textContent =
        item.issuerName || "-";

    document.getElementById("responseMethod").textContent =
        item.submissionMethod || "-";

    document.getElementById("responseReceiver").textContent =
        item.receiverName || "-";

    document.getElementById("responseReceivedDate").textContent =
        item.receivedDate || "-";


    // EXISTING RESPONSE DATA
    document.getElementById("action1By").value =
        item.action1By || "";

    document.getElementById("action1Date").value =
        item.action1Date || "";

    document.getElementById("responseStatus").value =
        item.status || "In Progress";

    document.getElementById("closingStatus").value =
        item.closingStatus || "Open";

    document.getElementById("closingDate").value =
        item.closingDate || "";


    formCard.style.display = "none";

    responseActionSection.style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});            


            row.innerHTML = `
                <td>${index + 1}</td>

                <td>
                    ${item.sequenceId}
                </td>

                <td>
                    ${item.referenceNo}
                </td>

                <td>
                    ${item.subject}
                </td>

                <td>
                    ${getDisciplineName(
                        item.discipline
                    )}
                </td>

                <td>
                    ${item.documentType}
                </td>

                <td>
                    ${item.issueDate}
                </td>
                <td>
                    ${item.submittalRequestedBy || "-"}
                    ${
                        item.requestAttachmentId
                            ? `<br>
                                <button
                                    type="button"
                                    class="open-pdf-btn"
                                    onclick="openSavedPDF('${item.requestAttachmentId}')"
                                >
                                    View Request
                                </button>`
                            : ""
                    }
                </td>

                <td>
                    ${item.issuerName || "-"}
                </td>

                <td>
                    ${item.submissionMethod || "-"}
                </td>

                <td>
                    ${item.receiverName || "-"}
                </td>

                <td>
                    ${item.receivedDate || "-"}
                </td>

                <td>
                    ${item.status}
                </td>

                <td>
                    ${item.actionBy || "-"}
                </td>

                <td>
                    ${item.actionDate || "-"}
                </td>

                <td>
                    ${
                        item.pdfId
                            ? `<button
                                type="button"
                                class="open-pdf-btn"
                                onclick="openSavedPDF('${item.pdfId}')"
                            >
                                Open PDF
                            </button>`
                        : "-"
                    }
                </td>
            `;


            tableBody.appendChild(
                row
            );
        }
    );
}
// ===============================
// SEARCH & FILTER
// ===============================

const searchInput =
    document.getElementById("searchInput");

const disciplineFilter =
    document.getElementById("disciplineFilter");


searchInput.addEventListener("input", function() {
    renderSubmittals();
});


disciplineFilter.addEventListener("change", function() {
    renderSubmittals();
});


documentTypeFilter.addEventListener("change", function() {
    renderSubmittals();
});
const editSelectedButton =
    document.getElementById("editSelectedButton");

const deleteSelectedButton =
    document.getElementById("deleteSelectedButton");
 
const saveResponseButton =
    document.getElementById("saveResponseButton");    


editSelectedButton.addEventListener("click", function() {

    if (selectedSubmittalId === null) {
        return;
    }

    const item =
        submittals.find(
            submittal =>
                submittal.id === selectedSubmittalId
        );

    if (!item) {
        return;
    }

    editingSubmittalId = item.id;

document.getElementById("saveSubmittal").textContent =
    "Update Submittal";


    discipline.value = item.discipline;
documentType.value = item.documentType;

sequenceId.textContent = item.sequenceId;

document.getElementById("referenceNo").value =
    item.referenceNo || "";

document.getElementById("subject").value =
    item.subject || "";

document.getElementById("description").value =
    item.description || "";

issueDate.value =
    item.issueDate || "";

issuerName.value =
    item.issuerName || "";

submissionMethod.value =
    item.submissionMethod || "";

receiverName.value =
    item.receiverName || "";

receivedDate.value =
    item.receivedDate || "";

    formCard.style.display = "block";

responseActionSection.style.display = "none";

window.scrollTo({
    top: 0,
    behavior: "smooth"
});
});
saveResponseButton.addEventListener("click", function() {

    if (selectedSubmittalId === null) {
        alert("Please select a submittal first.");
        return;
    }

    const item =
        submittals.find(
            submittal =>
                submittal.id === selectedSubmittalId
        );

    if (!item) {
        alert("Selected submittal not found.");
        return;
    }


    // ACTION 1
    item.action1By =
        document.getElementById("action1By").value.trim();

    item.action1Date =
        document.getElementById("action1Date").value;


    // ACTION 2 - OPTIONAL
    item.action2By =
        document.getElementById("action2By").value.trim();

    item.action2Date =
        document.getElementById("action2Date").value;


    // ACTION 3 - OPTIONAL
    item.action3By =
        document.getElementById("action3By").value.trim();

    item.action3Date =
        document.getElementById("action3Date").value;


    // RESPONSE STATUS
    item.status =
        document.getElementById("responseStatus").value
        || "In Progress";


    // CLOSING
    item.closingStatus =
        document.getElementById("closingStatus").value
        || "Open";

    item.closingDate =
        document.getElementById("closingDate").value;


    // LAST ACTION FOR REGISTER
    if (item.action3By) {

        item.actionBy =
            item.action3By;

        item.actionDate =
            item.action3Date;

    } else if (item.action2By) {

        item.actionBy =
            item.action2By;

        item.actionDate =
            item.action2Date;

    } else if (item.action1By) {

        item.actionBy =
            item.action1By;

        item.actionDate =
            item.action1Date;
    }


    // FREEZE COLOR WHEN CLOSED
    if (
        item.closingStatus === "Closed" &&
        !item.frozenColor
    ) {

        const issued =
            new Date(item.issueDate);

        const now =
            item.closingDate
                ? new Date(item.closingDate)
                : new Date();

        const hoursPassed =
            (now - issued) /
            (1000 * 60 * 60);

        const responseHours =
            item.responseHours || 24;

        if (hoursPassed >= responseHours) {

            item.frozenColor = "red";

        } else if (
            hoursPassed >=
            responseHours * 0.5
        ) {

            item.frozenColor = "orange";

        } else {

            item.frozenColor = "green";
        }

        item.closed = true;
    }


    saveSubmittals();
    renderSubmittals();

    alert("Response saved successfully.");
});

deleteSelectedButton.addEventListener("click", function() {

    if (selectedSubmittalId === null) {
        return;
    }

    const item =
        submittals.find(
            submittal =>
                submittal.id === selectedSubmittalId
        );

    if (!item) {
        return;
    }

    const confirmDelete =
        confirm(
            "Delete " +
            item.sequenceId +
            "?"
        );

    if (!confirmDelete) {
        return;
    }

    submittals =
        submittals.filter(
            submittal =>
                submittal.id !== selectedSubmittalId
        );

    selectedSubmittalId = null;

    saveSubmittals();
    renderSubmittals();

    editSelectedButton.disabled = true;
    deleteSelectedButton.disabled = true;
});
// ==========================================
// DOWNLOAD EXCEL
// ==========================================

const downloadExcelButton =
    document.getElementById("downloadExcelButton");

downloadExcelButton.addEventListener("click", function () {

    if (typeof XLSX === "undefined") {
        alert("Excel library is not loaded.");
        return;
    }

    const searchText =
        searchInput.value.trim().toLowerCase();

    const selectedDiscipline =
        disciplineFilter.value;

    const selectedDocumentType =
        documentTypeFilter.value;

    const exportSubmittals =
        submittals.filter(function (item) {

            const matchesSearch =
                (item.sequenceId || "").toLowerCase().includes(searchText) ||
                (item.referenceNo || "").toLowerCase().includes(searchText) ||
                (item.subject || "").toLowerCase().includes(searchText) ||
                (item.status || "").toLowerCase().includes(searchText) ||
                (item.actionBy || "").toLowerCase().includes(searchText) ||
                (item.issueDate || "").toLowerCase().includes(searchText);

            const matchesDiscipline =
                selectedDiscipline === "" ||
                item.discipline === selectedDiscipline;

            const matchesDocumentType =
                selectedDocumentType === "" ||
                item.documentType === selectedDocumentType;

            return (
                matchesSearch &&
                matchesDiscipline &&
                matchesDocumentType
            );
        });


    if (exportSubmittals.length === 0) {
        alert("No submittals available to export.");
        return;
    }


    const excelData =
        exportSubmittals.map(function (item, index) {

            return {
                "S.No": index + 1,
                "Sequence ID": item.sequenceId || "",
                "Ref No.": item.referenceNo || "",
                "Subject": item.subject || "",
                "Discipline": getDisciplineName(item.discipline) || "",
                "Document Type": item.documentType || "",
                "Issue Date": item.issueDate || "",
                "Submittal Requested By": item.submittalRequestedBy || "",
                "Issued By": item.issuerName || "",
                "Submission Method": item.submissionMethod || "",
                "Receiver Name": item.receiverName || "",
                "Received Date": item.receivedDate || "",
                "Status": item.status || "",
                "Last Action By": item.actionBy || "",
                "Last Action Date": item.actionDate || "",
                "Closing Status": item.closingStatus || "Open",
                "Closing Date": item.closingDate || ""
            };

        });


    const worksheet =
        XLSX.utils.json_to_sheet(excelData);

    // ==========================================
    // EXCEL STYLING
    // ==========================================

const range =
    XLSX.utils.decode_range(worksheet["!ref"]);

// HEADER - LIGHT GREY
for (
    let col = range.s.c;
    col <= range.e.c;
    col++
) {
    const cellAddress =
        XLSX.utils.encode_cell({
            r: 0,
            c: col
        });

    if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
            fill: {
                fgColor: {
                    rgb: "E9ECEF"
                }
            },
            font: {
                bold: true,
                color: {
                    rgb: "000000"
                }
            },
            alignment: {
                horizontal: "center",
                vertical: "center"
            },
            border: {
                top: {
                    style: "thin",
                    color: { rgb: "BFBFBF" }
                },
                bottom: {
                    style: "thin",
                    color: { rgb: "BFBFBF" }
                },
                left: {
                    style: "thin",
                    color: { rgb: "BFBFBF" }
                },
                right: {
                    style: "thin",
                    color: { rgb: "BFBFBF" }
                }
            }
        };
    }
}


// DATA ROW COLORS
exportSubmittals.forEach(
    function (item, index) {

        const timingColor =
            getSubmittalTimingColor(item);

        let fillColor = "";

        if (timingColor === "green") {
            fillColor = "E8F5E9";
        }

        if (timingColor === "orange") {
            fillColor = "FFF3E0";
        }

        if (timingColor === "red") {
            fillColor = "FFEBEE";
        }

        // Excel row 1 = header
        // Data starts from row 2
        const excelRow =
            index + 1;

        for (
            let col = range.s.c;
            col <= range.e.c;
            col++
        ) {
            const cellAddress =
                XLSX.utils.encode_cell({
                    r: excelRow,
                    c: col
                });

            if (!worksheet[cellAddress]) {
                continue;
            }

            worksheet[cellAddress].s = {
                fill: {
                    fgColor: {
                        rgb: fillColor
                    }
                },
                font: {
                    color: {
                        rgb: "000000"
                    }
                },
                border: {
                    top: {
                        style: "thin",
                        color: { rgb: "D9D9D9" }
                    },
                    bottom: {
                        style: "thin",
                        color: { rgb: "D9D9D9" }
                    },
                    left: {
                        style: "thin",
                        color: { rgb: "D9D9D9" }
                    },
                    right: {
                        style: "thin",
                        color: { rgb: "D9D9D9" }
                    }
                }
            };
        }
    }
);

    worksheet["!cols"] = [
        { wch: 7 },
        { wch: 25 },
        { wch: 30 },
        { wch: 50 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 },
        { wch: 24 },
        { wch: 20 },
        { wch: 20 },
        { wch: 22 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 }
    ];


    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Submittal Register"
    );


    const safeProjectName =
        (selectedProject.name || "Project")
            .replace(/[\\/:*?"<>|]/g, "-");

    XLSX.writeFile(
        workbook,
        safeProjectName + "_Submittal_Register.xlsx"
    );

});
// ===============================
// START
// ===============================

renderSubmittals();

formCard.style.display = "block";
responseActionSection.style.display = "none";

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
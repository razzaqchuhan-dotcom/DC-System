const $ = id => document.getElementById(id);

// =====================================================
// PROJECT
// =====================================================
const projects = JSON.parse(localStorage.getItem("projects")) || [];
const selectedProjectId = Number(localStorage.getItem("selectedProjectId"));
const selectedProject = projects.find(
    project => project.id === selectedProjectId
);

if (!selectedProject) {
    alert("Project not found.");
    window.location.href = "projects.html";
    throw new Error("Project not found");
}

$("projectTitle").textContent = selectedProject.name;
$("projectNumberText").textContent = selectedProject.number;
$("projectCodeText").textContent = selectedProject.code || "-";

const today = new Date().toISOString().split("T")[0];

// =====================================================
// CURRENT ROLE / DISCIPLINE
// =====================================================
const currentRole =
    localStorage.getItem("currentRole") || "viewer";

const currentDiscipline =
    localStorage.getItem("currentDiscipline") || "none";

function canViewDiscipline(documentDiscipline) {

    if (
        currentRole === "admin" ||
        currentRole === "document-controller"
    ) {
        return true;
    }

    const raw =
        String(currentDiscipline || "")
            .trim()
            .toLowerCase();

    if (
        currentRole === "viewer" &&
        raw === "all"
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
        disciplineMap[raw] || "";

    const documentCode =
        String(documentDiscipline || "")
            .trim()
            .toUpperCase();

    return (
        userCode !== "" &&
        userCode === documentCode
    );
}

function canManageSubmittalMasters() {
    return (
        can("create-submittal") ||
        can("edit-submittal")
    );
}


// =====================================================
// INDEXEDDB FILE STORAGE
// =====================================================
let pdfDatabase = null;

const pdfDatabaseReady =
    new Promise((resolve, reject) => {

        const request =
            indexedDB.open(
                "DCSystemPDFs",
                1
            );

        request.onupgradeneeded =
            event => {

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
            event => {

                pdfDatabase =
                    event.target.result;

                resolve(pdfDatabase);
            };

        request.onerror =
            () => {

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


async function storeFile(
    file,
    prefix
) {

    if (!file) {
        return {
            id: "",
            name: ""
        };
    }

    const db =
        await pdfDatabaseReady;

    const id =
        `${prefix}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 7)}`;

    await new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    ["pdfFiles"],
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    "pdfFiles"
                );

            store.put({
                id: id,
                name: file.name,
                type: file.type,
                file: file
            });

            transaction.oncomplete =
                resolve;

            transaction.onerror =
                () =>
                    reject(
                        transaction.error
                    );
        }
    );

    return {
        id: id,
        name: file.name
    };
}


async function deleteStoredFile(
    fileId
) {

    if (!fileId) {
        return;
    }

    try {

        const db =
            await pdfDatabaseReady;

        await new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        ["pdfFiles"],
                        "readwrite"
                    );

                transaction
                    .objectStore(
                        "pdfFiles"
                    )
                    .delete(fileId);

                transaction.oncomplete =
                    resolve;

                transaction.onerror =
                    () =>
                        reject(
                            transaction.error
                        );
            }
        );

    } catch (error) {

        console.error(
            "Could not delete stored file:",
            error
        );
    }
}


async function openSavedPDF(
    fileId
) {

    if (!fileId) {
        return;
    }

    try {

        const db =
            await pdfDatabaseReady;

        const record =
            await new Promise(
                (resolve, reject) => {

                    const transaction =
                        db.transaction(
                            ["pdfFiles"],
                            "readonly"
                        );

                    const request =
                        transaction
                            .objectStore(
                                "pdfFiles"
                            )
                            .get(fileId);

                    request.onsuccess =
                        () =>
                            resolve(
                                request.result
                            );

                    request.onerror =
                        () =>
                            reject(
                                request.error
                            );
                }
            );

        if (!record) {

            alert(
                "File not found."
            );

            return;
        }

        const fileURL =
            URL.createObjectURL(
                record.file
            );

        window.open(
            fileURL,
            "_blank"
        );

        setTimeout(
            () =>
                URL.revokeObjectURL(
                    fileURL
                ),
            60000
        );

    } catch (error) {

        console.error(error);

        alert(
            "Could not open file."
        );
    }
}

window.openSavedPDF =
    openSavedPDF;


// =====================================================
// DOCUMENT TYPES
// =====================================================
let documentTypes =
    JSON.parse(
        localStorage.getItem(
            "documentTypes"
        )
    ) || [];


if (
    documentTypes.length === 0
) {

    documentTypes = [

        {
            code: "WIR",
            name:
                "Work Inspection Request",
            responseHours: 24
        },

        {
            code: "MIR",
            name:
                "Material Inspection Request",
            responseHours: 72
        },

        {
            code: "MAR",
            name:
                "Material Approval Request",
            responseHours: 168
        }
    ];

    saveDocumentTypes();
}


const documentType =
    $("documentType");

const documentTypeFilter =
    $("documentTypeFilter");

const documentTypeMenu =
    $("documentTypeMenu");


function saveDocumentTypes() {

    localStorage.setItem(
        "documentTypes",
        JSON.stringify(
            documentTypes
        )
    );
}


function loadDocumentTypes() {

    documentType.innerHTML =
        '<option value="">Select Document Type</option>';

    documentTypeFilter.innerHTML =
        '<option value="">All Document Types</option>';


    documentTypes.forEach(
        type => {

            const formOption =
                document.createElement(
                    "option"
                );

            formOption.value =
                type.code;

            formOption.textContent =
                `${type.code} - ${type.name}`;

            documentType.appendChild(
                formOption
            );


            const filterOption =
                document.createElement(
                    "option"
                );

            filterOption.value =
                type.code;

            filterOption.textContent =
                type.code;

            documentTypeFilter
                .appendChild(
                    filterOption
                );
        }
    );
}


loadDocumentTypes();


documentType.addEventListener(
    "change",
    generateSequenceId
);


$("addDocumentTypeBtn")
    .addEventListener(
        "click",
        () => {

            if (
                !canManageSubmittalMasters()
            ) {
                return;
            }

            const code =
                prompt(
                    "Enter Document Type Code:\nExample: RFI"
                );

            if (
                !code ||
                !code.trim()
            ) {
                return;
            }

            const name =
                prompt(
                    "Enter Document Type Name:\nExample: Request for Information"
                );

            if (
                !name ||
                !name.trim()
            ) {
                return;
            }

            const cleanCode =
                code
                    .trim()
                    .toUpperCase();

            const cleanName =
                name.trim();


            if (
                documentTypes.some(
                    item =>
                        item.code
                            .toLowerCase() ===
                        cleanCode
                            .toLowerCase()
                )
            ) {

                alert(
                    "This Document Type already exists."
                );

                return;
            }


            documentTypes.push({
                code: cleanCode,
                name: cleanName,
                responseHours: 24
            });


            saveDocumentTypes();

            loadDocumentTypes();

            documentType.value =
                cleanCode;

            generateSequenceId();
        }
    );


$("documentTypeMenuBtn")
    .addEventListener(
        "click",
        event => {

            event.stopPropagation();

            documentTypeMenu
                .style
                .display =
                documentTypeMenu
                    .style
                    .display ===
                "block"
                    ? "none"
                    : "block";
        }
    );


$("editDocumentTypeBtn")
    .addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (
                !canManageSubmittalMasters()
            ) {
                return;
            }

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
                    item =>
                        item.code ===
                        selectedCode
                );


            if (
                index === -1
            ) {
                return;
            }


            const oldItem =
                documentTypes[index];


            const newCode =
                prompt(
                    "Edit Document Type Code:",
                    oldItem.code
                );


            if (
                !newCode ||
                !newCode.trim()
            ) {
                return;
            }


            const newName =
                prompt(
                    "Edit Document Type Name:",
                    oldItem.name
                );


            if (
                !newName ||
                !newName.trim()
            ) {
                return;
            }


            const cleanCode =
                newCode
                    .trim()
                    .toUpperCase();

            const cleanName =
                newName.trim();


            const duplicate =
                documentTypes.some(
                    (
                        item,
                        itemIndex
                    ) =>
                        itemIndex !==
                            index &&
                        item.code
                            .toLowerCase() ===
                            cleanCode
                                .toLowerCase()
                );


            if (duplicate) {

                alert(
                    "Another Document Type already uses this code."
                );

                return;
            }


            documentTypes[index] = {

                code: cleanCode,

                name: cleanName,

                responseHours:
                    oldItem
                        .responseHours ||
                    24
            };


            saveDocumentTypes();

            loadDocumentTypes();

            documentType.value =
                cleanCode;

            generateSequenceId();

            documentTypeMenu
                .style
                .display =
                "none";
        }
    );


$("deleteDocumentTypeBtn")
    .addEventListener(
        "click",
        event => {

            event.stopPropagation();


            if (
                !canManageSubmittalMasters()
            ) {
                return;
            }


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
                    item =>
                        item.code ===
                        selectedCode
                );


            if (!selectedItem) {
                return;
            }


            if (
                !confirm(
                    `Delete Document Type: ${selectedItem.code} - ${selectedItem.name}?`
                )
            ) {
                return;
            }


            documentTypes =
                documentTypes.filter(
                    item =>
                        item.code !==
                        selectedCode
                );


            saveDocumentTypes();

            loadDocumentTypes();

            documentType.value =
                "";

            generateSequenceId();

            documentTypeMenu
                .style
                .display =
                "none";
        }
    );


documentTypeMenu
    .addEventListener(
        "click",
        event =>
            event.stopPropagation()
    );


document.addEventListener(
    "click",
    () => {

        documentTypeMenu
            .style
            .display =
            "none";
    }
);


// =====================================================
// SIMPLE MASTER LISTS
// ISSUER / REQUESTED BY / RECEIVER
// =====================================================
function setupNameMaster(
    config
) {

    let names =
        JSON.parse(
            localStorage.getItem(
                config.storageKey
            )
        ) || [];


    const select =
        $(config.selectId);

    const menu =
        $(config.menuId);


    function save() {

        localStorage.setItem(
            config.storageKey,
            JSON.stringify(
                names
            )
        );
    }


    function load() {

        select.innerHTML =
            `<option value="">${config.placeholder}</option>`;


        names.forEach(
            name => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    name;

                option.textContent =
                    name;

                select.appendChild(
                    option
                );
            }
        );
    }


    load();


    $(config.addButtonId)
        .addEventListener(
            "click",
            () => {

                if (
                    !canManageSubmittalMasters()
                ) {
                    return;
                }


                const value =
                    prompt(
                        `Enter ${config.label} Name:`
                    );


                if (
                    !value ||
                    !value.trim()
                ) {
                    return;
                }


                const clean =
                    value.trim();


                if (
                    names.some(
                        item =>
                            item
                                .toLowerCase() ===
                            clean
                                .toLowerCase()
                    )
                ) {

                    alert(
                        `This ${config.label.toLowerCase()} already exists.`
                    );

                    select.value =
                        clean;

                    return;
                }


                names.push(clean);

                save();

                load();

                select.value =
                    clean;
            }
        );


    $(config.menuButtonId)
        .addEventListener(
            "click",
            event => {

                event.stopPropagation();

                menu.style.display =
                    menu.style.display ===
                    "block"
                        ? "none"
                        : "block";
            }
        );


    $(config.editButtonId)
        .addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if (
                    !canManageSubmittalMasters()
                ) {
                    return;
                }


                const oldName =
                    select.value;


                if (!oldName) {

                    alert(
                        `Please select a ${config.label.toLowerCase()} first.`
                    );

                    return;
                }


                const newName =
                    prompt(
                        `Edit ${config.label} Name:`,
                        oldName
                    );


                if (
                    !newName ||
                    !newName.trim()
                ) {
                    return;
                }


                const clean =
                    newName.trim();


                const duplicate =
                    names.some(
                        item =>
                            item !==
                                oldName &&
                            item
                                .toLowerCase() ===
                                clean
                                    .toLowerCase()
                    );


                if (duplicate) {

                    alert(
                        "This name already exists."
                    );

                    return;
                }


                const index =
                    names.indexOf(
                        oldName
                    );


                if (
                    index !== -1
                ) {
                    names[index] =
                        clean;
                }


                save();

                load();

                select.value =
                    clean;

                menu.style.display =
                    "none";
            }
        );


    $(config.deleteButtonId)
        .addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if (
                    !canManageSubmittalMasters()
                ) {
                    return;
                }


                const selectedName =
                    select.value;


                if (
                    !selectedName
                ) {

                    alert(
                        `Please select a ${config.label.toLowerCase()} first.`
                    );

                    return;
                }


                if (
                    !confirm(
                        `Delete ${config.label.toLowerCase()}: ${selectedName}?`
                    )
                ) {
                    return;
                }


                names =
                    names.filter(
                        item =>
                            item !==
                            selectedName
                    );


                save();

                load();

                menu.style.display =
                    "none";
            }
        );


    menu.addEventListener(
        "click",
        event =>
            event.stopPropagation()
    );


    document.addEventListener(
        "click",
        () => {

            menu.style.display =
                "none";
        }
    );


    return {
        select: select,
        load: load
    };
}


// ISSUER
const issuerMaster =
    setupNameMaster({

        storageKey:
            "issuerNames",

        selectId:
            "issuerName",

        placeholder:
            "Select Issuer",

        label:
            "Issuer",

        addButtonId:
            "addIssuerBtn",

        menuButtonId:
            "issuerMenuBtn",

        menuId:
            "issuerMenu",

        editButtonId:
            "editIssuerBtn",

        deleteButtonId:
            "deleteIssuerBtn"
    });


// REQUESTED BY
const requestedByMaster =
    setupNameMaster({

        storageKey:
            "requestedByNames",

        selectId:
            "submittalRequestedBy",

        placeholder:
            "Select Requested By",

        label:
            "Requested By",

        addButtonId:
            "addRequestedByBtn",

        menuButtonId:
            "requestedByMenuBtn",

        menuId:
            "requestedByMenu",

        editButtonId:
            "editRequestedByBtn",

        deleteButtonId:
            "deleteRequestedByBtn"
    });


// RECEIVER
const receiverMaster =
    setupNameMaster({

        storageKey:
            "receiverNames",

        selectId:
            "receiverName",

        placeholder:
            "Select Receiver",

        label:
            "Receiver",

        addButtonId:
            "addReceiverBtn",

        menuButtonId:
            "receiverMenuBtn",

        menuId:
            "receiverMenu",

        editButtonId:
            "editReceiverBtn",

        deleteButtonId:
            "deleteReceiverBtn"
    });


const issuerName =
    issuerMaster.select;

const requestedBySelect =
    requestedByMaster.select;

const receiverName =
    receiverMaster.select;

const submissionMethod =
    $("submissionMethod");

const receivedDate =
    $("receivedDate");


// =====================================================
// RESPONSE STATUS MASTER
// =====================================================
let responseStatuses =
    JSON.parse(
        localStorage.getItem(
            "responseStatuses"
        )
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

    $("responseStatus")
        .innerHTML =
        '<option value="">Select Status</option>';


    responseStatuses.forEach(
        status => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                status;

            option.textContent =
                status;

            $("responseStatus")
                .appendChild(
                    option
                );
        }
    );
}


renderResponseStatuses();


$("addStatusBtn")
    .addEventListener(
        "click",
        () => {

            if (
                !can(
                    "update-response"
                )
            ) {
                return;
            }


            const value =
                prompt(
                    "Enter New Status:"
                );


            if (
                !value ||
                !value.trim()
            ) {
                return;
            }


            const status =
                value.trim();


            if (
                responseStatuses.some(
                    item =>
                        item
                            .toLowerCase() ===
                        status
                            .toLowerCase()
                )
            ) {

                alert(
                    "This status already exists."
                );

                return;
            }


            responseStatuses.push(
                status
            );


            localStorage.setItem(
                "responseStatuses",
                JSON.stringify(
                    responseStatuses
                )
            );


            renderResponseStatuses();

            $("responseStatus")
                .value =
                status;
        }
    );


// =====================================================
// SUBMITTALS / REVISION DATA
// =====================================================
let submittals =
    JSON.parse(
        localStorage.getItem(
            "submittals_" +
            selectedProject.id
        )
    ) || [];


function normalizeRevision(
    value
) {

    const clean =
        String(
            value ||
            "R00"
        )
            .trim()
            .toUpperCase();


    const match =
        clean.match(
            /^R(\d{1,2})$/
        );


    if (!match) {
        return null;
    }


    return (
        "R" +
        String(
            Number(
                match[1]
            )
        ).padStart(
            2,
            "0"
        )
    );
}


function getNextRevision(
    value
) {

    const current =
        normalizeRevision(
            value
        ) || "R00";


    return (
        "R" +
        String(
            Number(
                current.slice(1)
            ) + 1
        ).padStart(
            2,
            "0"
        )
    );
}


function ensureRevisionData(
    item
) {

    item.revision =
        normalizeRevision(
            item.revision
        ) || "R00";


    if (
        !Array.isArray(
            item.revisionHistory
        )
    ) {

        item.revisionHistory =
            [];
    }


    item.responsePdfId =
        item.responsePdfId ||
        "";

    item.responsePdfName =
        item.responsePdfName ||
        "";

    item.action1EvidenceId =
        item.action1EvidenceId ||
        "";

    item.action1EvidenceName =
        item.action1EvidenceName ||
        "";

    item.action2Comment =
        item.action2Comment ||
        "";

    item.action3Comment =
        item.action3Comment ||
        "";

    item.closingStatus =
        item.closingStatus ||
        (
            item.closed
                ? "Closed"
                : "Open"
        );

    item.closingDate =
        item.closingDate ||
        "";


    return item;
}


function makeRevisionSnapshot(
    item
) {

    ensureRevisionData(
        item
    );


    return {

        revision:
            item.revision,

        referenceNo:
            item.referenceNo ||
            "",

        subject:
            item.subject ||
            "",

        description:
            item.description ||
            "",

        issueDate:
            item.issueDate ||
            "",

        issuerName:
            item.issuerName ||
            "",

        submissionMethod:
            item.submissionMethod ||
            "",

        receiverName:
            item.receiverName ||
            "",

        receivedDate:
            item.receivedDate ||
            "",

        submittalRequestedBy:
            item.submittalRequestedBy ||
            "",

        requestAttachmentId:
            item.requestAttachmentId ||
            "",

        requestAttachmentName:
            item.requestAttachmentName ||
            "",

        status:
            item.status ||
            "In Progress",

        closingStatus:
            item.closingStatus ||
            "Open",

        closingDate:
            item.closingDate ||
            "",

        pdfId:
            item.pdfId ||
            "",

        pdfName:
            item.pdfName ||
            "",

        responsePdfId:
            item.responsePdfId ||
            "",

        responsePdfName:
            item.responsePdfName ||
            "",

        action1By:
            item.action1By ||
            "",

        action1Date:
            item.action1Date ||
            "",

        action1EvidenceId:
            item.action1EvidenceId ||
            "",

        action1EvidenceName:
            item.action1EvidenceName ||
            "",

        action2By:
            item.action2By ||
            "",

        action2Date:
            item.action2Date ||
            "",

        action2Comment:
            item.action2Comment ||
            "",

        action3By:
            item.action3By ||
            "",

        action3Date:
            item.action3Date ||
            "",

        action3Comment:
            item.action3Comment ||
            "",

        actionBy:
            item.actionBy ||
            "",

        actionDate:
            item.actionDate ||
            ""
    };
}


submittals =
    submittals.map(
        ensureRevisionData
    );


function saveSubmittals() {

    localStorage.setItem(
        "submittals_" +
        selectedProject.id,

        JSON.stringify(
            submittals
        )
    );
}


saveSubmittals();


let selectedSubmittalId =
    null;

let editingSubmittalId =
    null;

let isCreatingRevision =
    false;

let pendingRevisionSnapshot =
    null;


// =====================================================
// FORM ELEMENTS
// =====================================================
const discipline =
    $("discipline");

const sequenceId =
    $("sequenceId");

const revisionNo =
    $("revisionNo");

const issueDate =
    $("issueDate");

const message =
    $("submittalMessage");

const formCard =
    $("newSubmittalForm");

const responseActionSection =
    $("responseActionSection");

const newSubmittalButton =
    $("newSubmittalButton");

const editSelectedButton =
    $("editSelectedButton");

const newRevisionButton =
    $("newRevisionButton");

const deleteSelectedButton =
    $("deleteSelectedButton");

const saveResponseButton =
    $("saveResponseButton");


issueDate.value =
    today;

responseActionSection
    .style
    .display =
    "none";

revisionNo.value =
    "R00";


// =====================================================
// SEQUENCE ID
// =====================================================
function generateSequenceId() {

    if (
        editingSubmittalId !==
        null
    ) {
        return;
    }


    const disciplineCode =
        discipline.value;

    const typeCode =
        documentType.value;


    if (
        !disciplineCode ||
        !typeCode
    ) {

        sequenceId.textContent =
            "AUTO GENERATED";

        return;
    }


    const matching =
        submittals.filter(
            item =>
                item.discipline ===
                    disciplineCode &&
                item.documentType ===
                    typeCode
        );


    let highest =
        0;


    matching.forEach(
        item => {

            const parts =
                String(
                    item.sequenceId ||
                    ""
                ).split("-");


            const lastPart =
                Number(
                    parts[
                        parts.length -
                        1
                    ]
                );


            if (
                Number.isFinite(
                    lastPart
                ) &&
                lastPart >
                    highest
            ) {

                highest =
                    lastPart;
            }
        }
    );


    const nextNumber =
        String(
            highest + 1
        ).padStart(
            4,
            "0"
        );


    sequenceId.textContent =
        `${selectedProject.number}-${selectedProject.code}-${disciplineCode}-${typeCode}-${nextNumber}`;
}


discipline.addEventListener(
    "change",
    generateSequenceId
);


// =====================================================
// CLEAR RESPONSE
// =====================================================
function clearResponseFields() {

    $("action1By").value =
        "";

    $("action1Date").value =
        "";

    $("action1Evidence").value =
        "";

    $("action2By").value =
        "";

    $("action2Date").value =
        "";

    $("action2Comment").value =
        "";

    $("action3By").value =
        "";

    $("action3Date").value =
        "";

    $("action3Comment").value =
        "";

    $("responseStatus").value =
        "";

    $("closingStatus").value =
        "Open";

    $("closingDate").value =
        "";

    $("responsePdfFile").value =
        "";

    $("currentResponsePdfName")
        .textContent =
        "No response PDF uploaded.";
}


// =====================================================
// CLEAR SUBMITTAL FORM
// =====================================================
function clearForm() {

    discipline.disabled =
        false;

    documentType.disabled =
        false;

    revisionNo.readOnly =
        false;


    discipline.value =
        "";

    documentType.value =
        "";

    revisionNo.value =
        "R00";

    $("referenceNo").value =
        "";

    $("subject").value =
        "";

    $("description").value =
        "";

    issueDate.value =
        today;

    issuerName.value =
        "";

    submissionMethod.value =
        "";

    receiverName.value =
        "";

    receivedDate.value =
        "";

    requestedBySelect.value =
        "";

    $("requestAttachment").value =
        "";

    $("pdfFile").value =
        "";

    sequenceId.textContent =
        "AUTO GENERATED";

    message.textContent =
        "";


    editingSubmittalId =
        null;

    isCreatingRevision =
        false;

    pendingRevisionSnapshot =
        null;


    $("saveSubmittal")
        .textContent =
        "Save Submittal";
}


// =====================================================
// NEW SUBMITTAL
// =====================================================
newSubmittalButton
    .addEventListener(
        "click",
        () => {

            clearForm();

            formCard
                .style
                .display =
                "block";

            responseActionSection
                .style
                .display =
                "none";

            $("revisionHistorySection")
                .style
                .display =
                "none";


            window.scrollTo({
                top: 0,
                behavior:
                    "smooth"
            });
        }
    );


// =====================================================
// CANCEL
// =====================================================
$("cancelSubmittal")
    .addEventListener(
        "click",
        () => {

            clearForm();

            formCard
                .style
                .display =
                "none";
        }
    );


// =====================================================
// SAVE / UPDATE SUBMITTAL
// =====================================================
$("saveSubmittal")
    .addEventListener(
        "click",
        async () => {

            message.textContent =
                "";


            if (
                editingSubmittalId ===
                    null &&
                !can(
                    "create-submittal"
                )
            ) {

                alert(
                    "You do not have permission to create submittals."
                );

                return;
            }


            if (
                editingSubmittalId !==
                    null &&
                !can(
                    "edit-submittal"
                )
            ) {

                alert(
                    "You do not have permission to edit submittals."
                );

                return;
            }


            const referenceNo =
                $("referenceNo")
                    .value
                    .trim();


            const subject =
                $("subject")
                    .value
                    .trim();


            const description =
                $("description")
                    .value
                    .trim();


            const submittalRequestedBy =
                requestedBySelect
                    .value
                    .trim();


            const requestAttachmentFile =
                $("requestAttachment")
                    .files[0] ||
                null;


            const pdfFile =
                $("pdfFile")
                    .files[0] ||
                null;


            const revision =
                normalizeRevision(
                    revisionNo.value
                );


            if (
                !discipline.value
            ) {

                message.textContent =
                    "Please select Discipline.";

                return;
            }


            if (
                !documentType.value
            ) {

                message.textContent =
                    "Please select Document Type.";

                return;
            }


            if (!revision) {

                message.textContent =
                    "Revision must be in format R00, R01, R02...";

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


            if (
                !issueDate.value
            ) {

                message.textContent =
                    "Please select Issue Date.";

                return;
            }


            if (
                pdfFile &&
                pdfFile.type !==
                    "application/pdf"
            ) {

                message.textContent =
                    "Only PDF files are allowed for Submittal PDF.";

                return;
            }


            try {

                const storedPdf =
                    pdfFile
                        ? await storeFile(
                            pdfFile,
                            "PDF"
                        )
                        : {
                            id: "",
                            name: ""
                        };


                const storedRequest =
                    requestAttachmentFile
                        ? await storeFile(
                            requestAttachmentFile,
                            "REQUEST"
                        )
                        : {
                            id: "",
                            name: ""
                        };


                const selectedType =
                    documentTypes.find(
                        type =>
                            type.code ===
                            documentType.value
                    );


                // =====================================
                // UPDATE EXISTING / NEW REVISION
                // =====================================
                if (
                    editingSubmittalId !==
                    null
                ) {

                    const item =
                        submittals.find(
                            submittal =>
                                submittal.id ===
                                editingSubmittalId
                        );


                    if (!item) {

                        message.textContent =
                            "Submittal not found.";

                        return;
                    }


                    ensureRevisionData(
                        item
                    );


                    // =============================
                    // NEW REVISION
                    // =============================
                    if (
                        isCreatingRevision
                    ) {

                        const snapshot =
                            pendingRevisionSnapshot ||
                            makeRevisionSnapshot(
                                item
                            );


                        const alreadySaved =
                            item.revisionHistory
                                .some(
                                    history =>
                                        history.revision ===
                                        snapshot.revision
                                );


                        if (
                            !alreadySaved
                        ) {

                            item.revisionHistory
                                .push(
                                    snapshot
                                );
                        }


                        item.status =
                            "In Progress";

                        item.action1By =
                            "";

                        item.action1Date =
                            "";

                        item.action1EvidenceId =
                            "";

                        item.action1EvidenceName =
                            "";

                        item.action2By =
                            "";

                        item.action2Date =
                            "";

                        item.action2Comment =
                            "";

                        item.action3By =
                            "";

                        item.action3Date =
                            "";

                        item.action3Comment =
                            "";

                        item.actionBy =
                            "";

                        item.actionDate =
                            "";

                        item.responsePdfId =
                            "";

                        item.responsePdfName =
                            "";

                        item.closingStatus =
                            "Open";

                        item.closingDate =
                            "";

                        item.closed =
                            false;

                        item.frozenColor =
                            "";


                        // IMPORTANT:
                        // Previous revision PDF stays in history.
                        // New revision has its own submitted PDF.
                        item.pdfId =
                            storedPdf.id;

                        item.pdfName =
                            storedPdf.name;

                    } else if (
                        storedPdf.id
                    ) {

                        // Normal Edit:
                        // New selected PDF replaces
                        // current revision submitted PDF only.
                        item.pdfId =
                            storedPdf.id;

                        item.pdfName =
                            storedPdf.name;
                    }


                    item.revision =
                        revision;

                    item.referenceNo =
                        referenceNo;

                    item.subject =
                        subject;

                    item.description =
                        description;

                    item.issueDate =
                        issueDate.value;

                    item.issuerName =
                        issuerName
                            .value
                            .trim();

                    item.submittalRequestedBy =
                        submittalRequestedBy;

                    item.submissionMethod =
                        submissionMethod.value;

                    item.receiverName =
                        receiverName
                            .value
                            .trim();

                    item.receivedDate =
                        receivedDate.value;


                    item.responseHours =
                        selectedType
                            ? (
                                selectedType
                                    .responseHours ||
                                24
                            )
                            : (
                                item
                                    .responseHours ||
                                24
                            );


                    if (
                        storedRequest.id
                    ) {

                        item.requestAttachmentId =
                            storedRequest.id;

                        item.requestAttachmentName =
                            storedRequest.name;

                        item.requestAttachmentType =
                            requestAttachmentFile.type;
                    }

                } else {

                    // =================================
                    // NEW SUBMITTAL R00
                    // =================================

                    if (
                        sequenceId.textContent ===
                        "AUTO GENERATED"
                    ) {

                        generateSequenceId();
                    }


                    const newSubmittal =
                        ensureRevisionData({

                            id:
                                Date.now(),

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

                            revision:
                                revision,

                            revisionHistory:
                                [],

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

                            issuerName:
                                issuerName
                                    .value
                                    .trim(),

                            submittalRequestedBy:
                                submittalRequestedBy,

                            requestAttachmentId:
                                storedRequest.id,

                            requestAttachmentName:
                                storedRequest.name,

                            requestAttachmentType:
                                requestAttachmentFile
                                    ? requestAttachmentFile.type
                                    : "",

                            submissionMethod:
                                submissionMethod.value,

                            receiverName:
                                receiverName
                                    .value
                                    .trim(),

                            receivedDate:
                                receivedDate.value,

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
                                    ? (
                                        selectedType
                                            .responseHours ||
                                        24
                                    )
                                    : 24,

                            pdfId:
                                storedPdf.id,

                            pdfName:
                                storedPdf.name,

                            responsePdfId:
                                "",

                            responsePdfName:
                                ""
                        });


                    submittals.push(
                        newSubmittal
                    );
                }


                saveSubmittals();

                renderSubmittals();


                clearForm();

                formCard
                    .style
                    .display =
                    "none";


                alert(
                    "Submittal saved successfully."
                );

            } catch (error) {

                console.error(
                    error
                );

                message.textContent =
                    "Could not save attachment. Please try again.";
            }
        }
    );


// =====================================================
// LOAD SUBMITTAL INTO FORM
// =====================================================
function loadSubmittalIntoForm(
    item,
    newRevision = false
) {

    ensureRevisionData(
        item
    );


    editingSubmittalId =
        item.id;

    isCreatingRevision =
        newRevision;

    pendingRevisionSnapshot =
        newRevision
            ? makeRevisionSnapshot(
                item
            )
            : null;


    discipline.value =
        item.discipline ||
        "";

    documentType.value =
        item.documentType ||
        "";


    discipline.disabled =
        true;

    documentType.disabled =
        true;


    sequenceId.textContent =
        item.sequenceId ||
        "AUTO GENERATED";


    revisionNo.value =
        newRevision
            ? getNextRevision(
                item.revision
            )
            : item.revision;


    revisionNo.readOnly =
        true;


    $("referenceNo").value =
        item.referenceNo ||
        "";

    $("subject").value =
        item.subject ||
        "";

    $("description").value =
        item.description ||
        "";


    issueDate.value =
        newRevision
            ? today
            : (
                item.issueDate ||
                today
            );


    issuerName.value =
        item.issuerName ||
        "";

    requestedBySelect.value =
        item.submittalRequestedBy ||
        "";

    submissionMethod.value =
        item.submissionMethod ||
        "";

    receiverName.value =
        item.receiverName ||
        "";

    receivedDate.value =
        item.receivedDate ||
        "";


    $("requestAttachment").value =
        "";

    $("pdfFile").value =
        "";


    $("saveSubmittal")
        .textContent =
        newRevision
            ? `Save ${revisionNo.value}`
            : "Update Submittal";


    message.textContent =
        newRevision
            ? "Creating new revision. Upload the revised submitted PDF if available."
            : "";


    formCard
        .style
        .display =
        "block";


    responseActionSection
        .style
        .display =
        "none";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =====================================================
// EDIT SELECTED
// =====================================================
editSelectedButton
    .addEventListener(
        "click",
        () => {

            if (
                !can(
                    "edit-submittal"
                )
            ) {
                return;
            }


            if (
                selectedSubmittalId ===
                null
            ) {
                return;
            }


            const item =
                submittals.find(
                    submittal =>
                        submittal.id ===
                        selectedSubmittalId
                );


            if (!item) {
                return;
            }


            loadSubmittalIntoForm(
                item,
                false
            );
        }
    );


// =====================================================
// NEW REVISION
// =====================================================
newRevisionButton
    .addEventListener(
        "click",
        () => {

            if (
                !can(
                    "edit-submittal"
                )
            ) {
                return;
            }


            if (
                selectedSubmittalId ===
                null
            ) {

                alert(
                    "Please select a submittal first."
                );

                return;
            }


            const item =
                submittals.find(
                    submittal =>
                        submittal.id ===
                        selectedSubmittalId
                );


            if (!item) {

                alert(
                    "Selected submittal not found."
                );

                return;
            }


            loadSubmittalIntoForm(
                item,
                true
            );
        }
    );


// =====================================================
// RESPONSE / ACTION SECTION
// =====================================================
function openResponseSection(
    item
) {

    if (
        !can(
            "update-response"
        )
    ) {
        return;
    }


    ensureRevisionData(
        item
    );


    selectedSubmittalId =
        item.id;


    $("responseSequenceId")
        .textContent =
        item.sequenceId ||
        "-";


    $("responseRevision")
        .textContent =
        item.revision ||
        "R00";


    $("responseRefNo")
        .textContent =
        item.referenceNo ||
        "-";


    $("responseSubject")
        .textContent =
        item.subject ||
        "-";


    $("responseDiscipline")
        .textContent =
        getDisciplineName(
            item.discipline
        ) || "-";


    $("responseDocumentType")
        .textContent =
        item.documentType ||
        "-";


    $("responseIssueDate")
        .textContent =
        item.issueDate ||
        "-";


    $("responseIssuedBy")
        .textContent =
        item.issuerName ||
        "-";


    $("responseMethod")
        .textContent =
        item.submissionMethod ||
        "-";


    $("responseReceiver")
        .textContent =
        item.receiverName ||
        "-";


    $("responseReceivedDate")
        .textContent =
        item.receivedDate ||
        "-";


    // ACTION 1
    $("action1By").value =
        item.action1By ||
        "";

    $("action1Date").value =
        item.action1Date ||
        "";

    $("action1Evidence").value =
        "";


    // ACTION 2
    $("action2By").value =
        item.action2By ||
        "";

    $("action2Date").value =
        item.action2Date ||
        "";

    $("action2Comment").value =
        item.action2Comment ||
        "";


    // ACTION 3
    $("action3By").value =
        item.action3By ||
        "";

    $("action3Date").value =
        item.action3Date ||
        "";

    $("action3Comment").value =
        item.action3Comment ||
        "";


    $("responseStatus").value =
        item.status ||
        "In Progress";


    $("closingStatus").value =
        item.closingStatus ||
        "Open";


    $("closingDate").value =
        item.closingDate ||
        "";


    $("responsePdfFile").value =
        "";


    $("currentResponsePdfName")
        .textContent =
        item.responsePdfName
            ? `Current: ${item.responsePdfName}`
            : "No response PDF uploaded.";


    formCard
        .style
        .display =
        "none";


    responseActionSection
        .style
        .display =
        "block";


    renderRevisionHistory(
        item
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =====================================================
// SAVE RESPONSE
// =====================================================
saveResponseButton
    .addEventListener(
        "click",
        async () => {

            if (
                !can(
                    "update-response"
                )
            ) {
                return;
            }


            if (
                selectedSubmittalId ===
                null
            ) {

                alert(
                    "Please select a submittal first."
                );

                return;
            }


            const item =
                submittals.find(
                    submittal =>
                        submittal.id ===
                        selectedSubmittalId
                );


            if (!item) {

                alert(
                    "Selected submittal not found."
                );

                return;
            }


            ensureRevisionData(
                item
            );


            const responsePdfFile =
                $("responsePdfFile")
                    .files[0] ||
                null;


            const action1EvidenceFile =
                $("action1Evidence")
                    .files[0] ||
                null;


            if (
                responsePdfFile &&
                responsePdfFile.type !==
                    "application/pdf"
            ) {

                alert(
                    "Only PDF files are allowed for consultant response."
                );

                return;
            }


            try {

                // =================================
                // RESPONSE / COMMENTED PDF
                // =================================
                if (
                    responsePdfFile
                ) {

                    const oldResponseId =
                        item.responsePdfId;


                    const storedResponse =
                        await storeFile(
                            responsePdfFile,
                            "RESPONSE"
                        );


                    item.responsePdfId =
                        storedResponse.id;

                    item.responsePdfName =
                        storedResponse.name;


                    if (
                        oldResponseId &&
                        oldResponseId !==
                            storedResponse.id
                    ) {

                        await deleteStoredFile(
                            oldResponseId
                        );
                    }
                }


                // =================================
                // ACTION 1 EVIDENCE
                // =================================
                if (
                    action1EvidenceFile
                ) {

                    const oldEvidenceId =
                        item.action1EvidenceId;


                    const storedEvidence =
                        await storeFile(
                            action1EvidenceFile,
                            "ACTION1"
                        );


                    item.action1EvidenceId =
                        storedEvidence.id;

                    item.action1EvidenceName =
                        storedEvidence.name;


                    if (
                        oldEvidenceId &&
                        oldEvidenceId !==
                            storedEvidence.id
                    ) {

                        await deleteStoredFile(
                            oldEvidenceId
                        );
                    }
                }


                // ACTION 1
                item.action1By =
                    $("action1By")
                        .value
                        .trim();

                item.action1Date =
                    $("action1Date")
                        .value;


                // ACTION 2
                item.action2By =
                    $("action2By")
                        .value
                        .trim();

                item.action2Date =
                    $("action2Date")
                        .value;

                item.action2Comment =
                    $("action2Comment")
                        .value
                        .trim();


                // ACTION 3
                item.action3By =
                    $("action3By")
                        .value
                        .trim();

                item.action3Date =
                    $("action3Date")
                        .value;

                item.action3Comment =
                    $("action3Comment")
                        .value
                        .trim();


                // STATUS
                item.status =
                    $("responseStatus")
                        .value ||
                    "In Progress";


                item.closingStatus =
                    $("closingStatus")
                        .value ||
                    "Open";


                item.closingDate =
                    $("closingDate")
                        .value;


                // =================================
                // LAST ACTION FOR REGISTER
                // =================================
                if (
                    item.action3By
                ) {

                    item.actionBy =
                        item.action3By;

                    item.actionDate =
                        item.action3Date;

                } else if (
                    item.action2By
                ) {

                    item.actionBy =
                        item.action2By;

                    item.actionDate =
                        item.action2Date;

                } else if (
                    item.action1By
                ) {

                    item.actionBy =
                        item.action1By;

                    item.actionDate =
                        item.action1Date;

                } else {

                    item.actionBy =
                        "";

                    item.actionDate =
                        "";
                }


                // =================================
                // CLOSE / FREEZE COLOR
                // =================================
                if (
                    item.closingStatus ===
                    "Closed"
                ) {

                    item.closed =
                        true;


                    item.frozenColor =
                        calculateTimingColorAtDate(
                            item,

                            item.closingDate
                                ? new Date(
                                    item.closingDate
                                )
                                : new Date()
                        );

                } else {

                    item.closed =
                        false;

                    item.frozenColor =
                        "";
                }


                saveSubmittals();

                renderSubmittals();

                renderRevisionHistory(
                    item
                );


                $("responsePdfFile")
                    .value =
                    "";

                $("action1Evidence")
                    .value =
                    "";


                $("currentResponsePdfName")
                    .textContent =
                    item.responsePdfName
                        ? `Current: ${item.responsePdfName}`
                        : "No response PDF uploaded.";


                alert(
                    "Response saved successfully."
                );

            } catch (error) {

                console.error(
                    error
                );

                alert(
                    "Could not save response attachment. Please try again."
                );
            }
        }
    );


// =====================================================
// DISCIPLINE NAME
// =====================================================
function getDisciplineName(
    code
) {

    const names = {

        C:
            "Civil",

        A:
            "Architectural",

        M:
            "Mechanical",

        E:
            "Electrical"
    };


    return (
        names[code] ||
        code ||
        "-"
    );
}


// =====================================================
// TIMING COLOR
// =====================================================
function calculateTimingColorAtDate(
    item,
    endDate
) {

    const issuedDate =
        new Date(
            item.issueDate
        );


    if (
        Number.isNaN(
            issuedDate.getTime()
        )
    ) {
        return "";
    }


    const end =
        endDate instanceof Date
            ? endDate
            : new Date(
                endDate
            );


    if (
        Number.isNaN(
            end.getTime()
        )
    ) {
        return "";
    }


    const hoursPassed =
        (
            end -
            issuedDate
        ) /
        (
            1000 *
            60 *
            60
        );


    const responseHours =
        item.responseHours ||
        24;


    if (
        hoursPassed >=
        responseHours
    ) {
        return "red";
    }


    if (
        hoursPassed >=
        responseHours *
        0.5
    ) {
        return "orange";
    }


    return "green";
}


function getSubmittalTimingColor(
    item
) {

    if (
        item.frozenColor
    ) {
        return item.frozenColor;
    }


    const endDate =
        item.closingStatus ===
            "Closed" &&
        item.closingDate
            ? new Date(
                item.closingDate
            )
            : new Date();


    return calculateTimingColorAtDate(
        item,
        endDate
    );
}


// =====================================================
// REVISION HISTORY
// =====================================================
function renderRevisionHistory(
    item
) {

    const section =
        $("revisionHistorySection");

    const body =
        $("revisionHistoryBody");


    if (
        !section ||
        !body ||
        !item
    ) {
        return;
    }


    ensureRevisionData(
        item
    );


    body.innerHTML =
        "";


    if (
        item.revisionHistory
            .length === 0
    ) {

        body.innerHTML =
            `
            <tr>
                <td
                    colspan="5"
                    class="no-data"
                >
                    No previous revisions.
                </td>
            </tr>
            `;

    } else {

        [
            ...item.revisionHistory
        ]
            .reverse()
            .forEach(
                history => {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML =
                        `
                        <td>
                            ${history.revision || "R00"}
                        </td>

                        <td>
                            ${history.issueDate || "-"}
                        </td>

                        <td>
                            ${history.status || "-"}
                        </td>

                        <td>
                            ${
                                history.pdfId

                                    ? `
                                    <button
                                        type="button"
                                        class="open-pdf-btn"
                                        onclick="event.stopPropagation(); openSavedPDF('${history.pdfId}')"
                                    >
                                        Submitted
                                    </button>
                                    `

                                    : "-"
                            }
                        </td>

                        <td>
                            ${
                                history.responsePdfId

                                    ? `
                                    <button
                                        type="button"
                                        class="open-pdf-btn"
                                        onclick="event.stopPropagation(); openSavedPDF('${history.responsePdfId}')"
                                    >
                                        Response
                                    </button>
                                    `

                                    : "-"
                            }
                        </td>
                        `;


                    body.appendChild(
                        row
                    );
                }
            );
    }


    section
        .style
        .display =
        "block";
}


function showRevisionHistory(
    itemId
) {

    const item =
        submittals.find(
            submittal =>
                submittal.id ===
                Number(
                    itemId
                )
        );


    if (!item) {
        return;
    }


    selectedSubmittalId =
        item.id;


    renderRevisionHistory(
        item
    );


    $("revisionHistorySection")
        .scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"
        });
}


window.showRevisionHistory =
    showRevisionHistory;


// =====================================================
// REGISTER / FILTERS
// =====================================================
const searchInput =
    $("searchInput");

const disciplineFilter =
    $("disciplineFilter");


function getFilteredSubmittals() {

    const searchText =
        searchInput
            .value
            .trim()
            .toLowerCase();


    const selectedDiscipline =
        disciplineFilter.value;


    const selectedDocumentType =
        documentTypeFilter.value;


    return submittals

        .filter(
            item =>
                canViewDiscipline(
                    item.discipline
                )
        )

        .filter(
            item => {

                const matchesSearch =
                    [

                        item.sequenceId,

                        item.revision,

                        item.referenceNo,

                        item.subject,

                        item.status,

                        item.actionBy,

                        item.issueDate

                    ].some(
                        value =>
                            String(
                                value ||
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchText
                                )
                    );


                const matchesDiscipline =
                    !selectedDiscipline ||
                    item.discipline ===
                        selectedDiscipline;


                const matchesDocumentType =
                    !selectedDocumentType ||
                    item.documentType ===
                        selectedDocumentType;


                return (
                    matchesSearch &&
                    matchesDiscipline &&
                    matchesDocumentType
                );
            }
        );
}


function resetSelectionButtons() {

    selectedSubmittalId =
        null;


    editSelectedButton
        .disabled =
        true;


    newRevisionButton
        .disabled =
        true;


    deleteSelectedButton
        .disabled =
        true;
}


// =====================================================
// RENDER REGISTER
// =====================================================
function renderSubmittals() {

    const tableBody =
        $("submittalTableBody");

    const currentSubmittals =
        getFilteredSubmittals();

    tableBody.innerHTML = "";

    const displayRows = [];

    currentSubmittals.forEach(item => {

        ensureRevisionData(item);

        // Previous revisions
        item.revisionHistory.forEach(history => {

            displayRows.push({
                ...item,
                ...history,
                parentId: item.id,
                isHistory: true
            });

        });

        // Current revision
        displayRows.push({
            ...item,
            parentId: item.id,
            isHistory: false
        });

    });


    // R00, R01, R02 order
    displayRows.sort((a, b) => {

        const sequenceCompare =
            String(a.sequenceId || "")
                .localeCompare(
                    String(b.sequenceId || "")
                );

        if (sequenceCompare !== 0) {
            return sequenceCompare;
        }

        const revisionA =
            Number(
                String(a.revision || "R00")
                    .replace("R", "")
            ) || 0;

        const revisionB =
            Number(
                String(b.revision || "R00")
                    .replace("R", "")
            ) || 0;

        return revisionA - revisionB;
    });


    if (displayRows.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="17"
                    class="no-data"
                >
                    No submittals found.
                </td>
            </tr>
        `;

        resetSelectionButtons();
        return;
    }


    displayRows.forEach(
        (item, index) => {

            const row =
                document.createElement("tr");


            // Current revision timing color
            if (!item.isHistory) {

                const timingColor =
                    getSubmittalTimingColor(item);

                if (timingColor === "green") {
                    row.style.backgroundColor =
                        "#e8f5e9";
                }

                if (timingColor === "orange") {
                    row.style.backgroundColor =
                        "#fff3e0";
                }

                if (timingColor === "red") {
                    row.style.backgroundColor =
                        "#ffebee";
                }

            } else {

                // Old revision
                row.style.backgroundColor =
                    "#f5f5f5";
            }


            row.style.color = "#000000";


            row.innerHTML = `
                <td>${index + 1}</td>

                <td>
                    ${item.sequenceId || "-"}
                </td>

                <td>
                    ${item.revision || "R00"}
                </td>

                <td>
                    ${item.referenceNo || "-"}
                </td>

                <td>
                    ${item.subject || "-"}
                </td>

                <td>
                    ${getDisciplineName(item.discipline)}
                </td>

                <td>
                    ${item.documentType || "-"}
                </td>

                <td>
                    ${item.issueDate || "-"}
                </td>

                <td>
                    ${item.submittalRequestedBy || "-"}

                    ${
                        item.requestAttachmentId
                            ? `
                            <br>
                            <button
                                type="button"
                                class="open-pdf-btn"
                                onclick="event.stopPropagation(); openSavedPDF('${item.requestAttachmentId}')"
                            >
                                View Request
                            </button>
                            `
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
                    ${item.status || "In Progress"}
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
                            ? `
                            <button
                                type="button"
                                class="open-pdf-btn"
                                onclick="event.stopPropagation(); openSavedPDF('${item.pdfId}')"
                            >
                                Submitted
                            </button>
                            `
                            : "-"
                    }

                    ${
                        item.responsePdfId
                            ? `
                            <br>
                            <button
                                type="button"
                                class="open-pdf-btn"
                                onclick="event.stopPropagation(); openSavedPDF('${item.responsePdfId}')"
                            >
                                Response
                            </button>
                            `
                            : ""
                    }

                    ${
                        item.isHistory
                            ? `
                            <br>
                            <small>Previous Revision</small>
                            `
                            : ""
                    }

                </td>
            `;


            // Only CURRENT revision can be selected/edit/delete
            row.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".register-table tbody tr"
                        )
                        .forEach(tableRow => {
                            tableRow.classList.remove(
                                "selected-row"
                            );
                        });


                    row.classList.add(
                        "selected-row"
                    );


                    if (item.isHistory) {

                        selectedSubmittalId = null;

                        editSelectedButton.disabled =
                            true;

                        newRevisionButton.disabled =
                            true;

                        deleteSelectedButton.disabled =
                            true;

                        return;
                    }


                    selectedSubmittalId =
                        item.parentId;


                    editSelectedButton.disabled =
                        false;

                    newRevisionButton.disabled =
                        false;

                    deleteSelectedButton.disabled =
                        false;


                    const currentItem =
                        submittals.find(
                            submittal =>
                                submittal.id ===
                                item.parentId
                        );


                    if (currentItem) {

                        renderRevisionHistory(
                            currentItem
                        );
                    }
                }
            );


            // Response only current revision
            if (!item.isHistory) {

                row.addEventListener(
                    "dblclick",
                    () => {

                        const currentItem =
                            submittals.find(
                                submittal =>
                                    submittal.id ===
                                    item.parentId
                            );

                        if (currentItem) {

                            openResponseSection(
                                currentItem
                            );
                        }
                    }
                );
            }


            tableBody.appendChild(row);
        }
    );
}

// SEARCH
searchInput.addEventListener(
    "input",
    renderSubmittals
);


// DISCIPLINE FILTER
disciplineFilter
    .addEventListener(
        "change",
        renderSubmittals
    );


// DOCUMENT TYPE FILTER
documentTypeFilter
    .addEventListener(
        "change",
        renderSubmittals
    );


// =====================================================
// DELETE SUBMITTAL FILES
// =====================================================
async function deleteFilesForSubmittal(
    item
) {

    const ids =
        new Set(

            [

                item.pdfId,

                item.responsePdfId,

                item.requestAttachmentId,

                item.action1EvidenceId

            ].filter(
                Boolean
            )
        );


    (
        item.revisionHistory ||
        []
    ).forEach(
        history => {

            [

                history.pdfId,

                history.responsePdfId,

                history.requestAttachmentId,

                history.action1EvidenceId

            ]
                .filter(
                    Boolean
                )
                .forEach(
                    id =>
                        ids.add(
                            id
                        )
                );
        }
    );


    for (
        const id of ids
    ) {

        await deleteStoredFile(
            id
        );
    }
}


// =====================================================
// DELETE SELECTED SUBMITTAL
// =====================================================
deleteSelectedButton
    .addEventListener(
        "click",
        async () => {

            if (
                !can(
                    "delete-submittal"
                )
            ) {
                return;
            }


            if (
                selectedSubmittalId ===
                null
            ) {
                return;
            }


            const item =
                submittals.find(
                    submittal =>
                        submittal.id ===
                        selectedSubmittalId
                );


            if (!item) {
                return;
            }


            const confirmed =
                confirm(
                    `Delete ${item.sequenceId}?\n\nThis will also delete its saved local attachments.`
                );


            if (
                !confirmed
            ) {
                return;
            }


            await deleteFilesForSubmittal(
                item
            );


            submittals =
                submittals.filter(
                    submittal =>
                        submittal.id !==
                        selectedSubmittalId
                );


            saveSubmittals();


            resetSelectionButtons();


            $("revisionHistorySection")
                .style
                .display =
                "none";


            renderSubmittals();
        }
    );


// =====================================================
// EXCEL LIBRARY
// =====================================================
let excelLibraryPromise =
    null;


function ensureExcelLibrary() {

    if (
        typeof XLSX !==
        "undefined"
    ) {
        return Promise.resolve();
    }


    if (
        excelLibraryPromise
    ) {
        return excelLibraryPromise;
    }


    excelLibraryPromise =
        new Promise(
            (
                resolve,
                reject
            ) => {

                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    "https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js";


                script.onload =
                    resolve;


                script.onerror =
                    () => {

                        excelLibraryPromise =
                            null;

                        reject(
                            new Error(
                                "Excel library could not be loaded."
                            )
                        );
                    };


                document.head.appendChild(
                    script
                );
            }
        );


    return excelLibraryPromise;
}

// =====================================================
// DOWNLOAD EXCEL
// =====================================================
$("downloadExcelButton")
    .addEventListener(
        "click",
        async () => {

            try {

                await ensureExcelLibrary();

            } catch (error) {

                console.error(error);

                alert(
                    "Excel library could not be loaded. Please check your internet connection."
                );

                return;
            }


            // Current filtered submittals
            const currentSubmittals =
                getFilteredSubmittals();


            if (
                currentSubmittals.length === 0
            ) {

                alert(
                    "No submittals available to export."
                );

                return;
            }


            // =================================================
            // CURRENT + ALL PREVIOUS REVISIONS
            // =================================================
            const exportSubmittals = [];


            currentSubmittals.forEach(
                item => {

                    ensureRevisionData(item);


                    // -----------------------------------------
                    // PREVIOUS REVISION HISTORY
                    // R00, R01 etc.
                    // -----------------------------------------
                    item.revisionHistory.forEach(
                        history => {

                            exportSubmittals.push({

                                ...item,

                                ...history,

                                // These values belong to
                                // the main document
                                sequenceId:
                                    item.sequenceId,

                                discipline:
                                    item.discipline,

                                documentType:
                                    item.documentType,

                                responseHours:
                                    item.responseHours,

                                // Historical revision marker
                                isHistory:
                                    true
                            });
                        }
                    );


                    // -----------------------------------------
                    // CURRENT REVISION
                    // -----------------------------------------
                    exportSubmittals.push({

                        ...item,

                        isHistory:
                            false
                    });
                }
            );


            // =================================================
            // SORT:
            // Sequence ID first, then R00, R01, R02...
            // =================================================
            exportSubmittals.sort(
                (a, b) => {

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


                    const revisionA =
                        Number(
                            String(
                                a.revision || "R00"
                            ).replace(
                                "R",
                                ""
                            )
                        ) || 0;


                    const revisionB =
                        Number(
                            String(
                                b.revision || "R00"
                            ).replace(
                                "R",
                                ""
                            )
                        ) || 0;


                    return (
                        revisionA -
                        revisionB
                    );
                }
            );


            // =================================================
            // EXCEL DATA
            // =================================================
            const excelData =
                exportSubmittals.map(
                    (
                        item,
                        index
                    ) => ({

                        "S.No":
                            index + 1,

                        "Sequence ID":
                            item.sequenceId || "",

                        "Revision":
                            item.revision || "R00",

                        "Ref No.":
                            item.referenceNo || "",

                        "Subject":
                            item.subject || "",

                        "Discipline":
                            getDisciplineName(
                                item.discipline
                            ) || "",

                        "Document Type":
                            item.documentType || "",

                        "Issue Date":
                            item.issueDate || "",

                        "Submittal Requested By":
                            item.submittalRequestedBy || "",

                        "Issued By":
                            item.issuerName || "",

                        "Submission Method":
                            item.submissionMethod || "",

                        "Receiver Name":
                            item.receiverName || "",

                        "Received Date":
                            item.receivedDate || "",

                        "Status":
                            item.status || "",

                        "Last Action By":
                            item.actionBy || "",

                        "Last Action Date":
                            item.actionDate || "",

                        "Closing Status":
                            item.closingStatus || "Open",

                        "Closing Date":
                            item.closingDate || ""

                    })
                );


            const worksheet =
                XLSX.utils
                    .json_to_sheet(
                        excelData
                    );


            const range =
                XLSX.utils
                    .decode_range(
                        worksheet["!ref"]
                    );
    
            // =================================================
            // HEADER STYLE
            // =================================================
            for (
                let col = range.s.c;
                col <= range.e.c;
                col++
            ) {

                const address =
                    XLSX.utils
                        .encode_cell({
                            r: 0,
                            c: col
                        });

                if (!worksheet[address]) {
                    continue;
                }

                worksheet[address].s = {

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


            // =================================================
            // ROW COLORS
            // =================================================
            exportSubmittals.forEach(
                (item, index) => {

                    let fillColor =
                        "FFFFFF";

                    if (!item.isHistory) {

                        const timingColor =
                            getSubmittalTimingColor(
                                item
                            );

                        if (timingColor === "green") {
                            fillColor = "E8F5E9";
                        }

                        if (timingColor === "orange") {
                            fillColor = "FFF3E0";
                        }

                        if (timingColor === "red") {
                            fillColor = "FFEBEE";
                        }
                    }

                    const excelRow =
                        index + 1;

                    for (
                        let col = range.s.c;
                        col <= range.e.c;
                        col++
                    ) {

                        const address =
                            XLSX.utils
                                .encode_cell({
                                    r: excelRow,
                                    c: col
                                });

                        if (!worksheet[address]) {
                            continue;
                        }

                        worksheet[address].s = {

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
                                    color: {
                                        rgb: "D9D9D9"
                                    }
                                },

                                bottom: {
                                    style: "thin",
                                    color: {
                                        rgb: "D9D9D9"
                                    }
                                },

                                left: {
                                    style: "thin",
                                    color: {
                                        rgb: "D9D9D9"
                                    }
                                },

                                right: {
                                    style: "thin",
                                    color: {
                                        rgb: "D9D9D9"
                                    }
                                }
                            }
                        };
                    }
                }
            );


            // =================================================
            // COLUMN WIDTHS
            // =================================================
            worksheet["!cols"] = [
                { wch: 7 },
                { wch: 25 },
                { wch: 10 },
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
                XLSX.utils
                    .book_new();


            XLSX.utils
                .book_append_sheet(
                    workbook,
                    worksheet,
                    "Submittal Register"
                );


            const safeProjectName =
                (
                    selectedProject.name ||
                    "Project"
                )
                    .replace(
                        /[\\/:*?"<>|]/g,
                        "-"
                    );


            XLSX.writeFile(
                workbook,
                `${safeProjectName}_Submittal_Register.xlsx`
            );
        }
    );


// =====================================================
// START
// =====================================================
renderSubmittals();


formCard.style.display =
    can("create-submittal")
        ? "block"
        : "none";


responseActionSection
    .style
    .display =
    "none";


// Logout is handled centrally by auth.js.        
// =====================================================
// START
// =====================================================
renderSubmittals();

formCard.style.display =
    can("create-submittal")
        ? "block"
        : "none";

responseActionSection
    .style
    .display =
    "none";


// Logout is handled centrally by auth.js.

let projects = JSON.parse(localStorage.getItem("projects")) || [];

let editProjectId = null;

const projectName = document.getElementById("projectName");
const projectCode = document.getElementById("projectCode");
const projectNumber = document.getElementById("projectNumber");
const projectMessage = document.getElementById("projectMessage");
const projectList = document.getElementById("projectList");

const saveProjectButton = document.getElementById("saveProject");
const generateButton = document.getElementById("generateProjectNo");


function saveProjects() {
    localStorage.setItem("projects", JSON.stringify(projects));
}


function generateProjectNumber() {
    let number;

    do {
        number = Math.floor(1000 + Math.random() * 9000).toString();
    }
    while (projects.some(project => project.number === number));

    projectNumber.value = number;
}


generateButton.addEventListener("click", generateProjectNumber);


saveProjectButton.addEventListener("click", function() {

    const name = projectName.value.trim();
    const code = projectCode.value.trim().toUpperCase();
    const number = projectNumber.value.trim();

    projectMessage.textContent = "";

    if (name === "") {
        projectMessage.textContent = "Please enter Project Name.";
        return;
    }

    if (code === "") {
        projectMessage.textContent = "Please enter Project Code / Initial.";
        return;
    }

    if (!/^[A-Z0-9]{1,5}$/.test(code)) {
        projectMessage.textContent =
            "Project Code must contain only letters/numbers and maximum 5 characters.";
        return;
    }

    if (!/^\d{4}$/.test(number)) {
        projectMessage.textContent =
            "Project No. must be exactly 4 digits.";
        return;
    }


    const duplicateNumber = projects.some(project =>
        project.number === number &&
        project.id !== editProjectId
    );

    if (duplicateNumber) {
        projectMessage.textContent =
            "This Project No. already exists.";
        return;
    }


    const duplicateCode = projects.some(project =>
        project.code === code &&
        project.id !== editProjectId
    );

    if (duplicateCode) {
        projectMessage.textContent =
            "This Project Code already exists.";
        return;
    }


    if (editProjectId !== null) {

        const project = projects.find(
            project => project.id === editProjectId
        );

        project.name = name;
        project.code = code;
        project.number = number;

        editProjectId = null;

        saveProjectButton.textContent = "Save Project";

    } else {

        const newProject = {
            id: Date.now(),
            name: name,
            code: code,
            number: number
        };

        projects.push(newProject);
    }


    saveProjects();
    renderProjects();

    projectName.value = "";
    projectCode.value = "";
    projectNumber.value = "";

    projectMessage.textContent =
        "Project saved successfully.";
});


function renderProjects() {

    projectList.innerHTML = "";

    if (projects.length === 0) {

        projectList.innerHTML =
            "<p>No projects added yet.</p>";

        return;
    }


    projects.forEach(function(project) {

        const card = document.createElement("div");

        card.className = "project-card";

        card.innerHTML = `
            <h3>${project.name}</h3>

            <p>
                Project No:
                <strong>${project.number}</strong>
            </p>

            <p>
                Project Code:
                <strong>${project.code || "-"}</strong>
            </p>

            <button onclick="openProject(${project.id})">
                Open
            </button>

            <button onclick="editProject(${project.id})">
                Edit
            </button>

            <button onclick="deleteProject(${project.id})">
                Delete
            </button>
        `;

        projectList.appendChild(card);
    });
}


function editProject(id) {

    const project = projects.find(
        project => project.id === id
    );

    projectName.value = project.name;
    projectCode.value = project.code || "";
    projectNumber.value = project.number;

    editProjectId = id;

    saveProjectButton.textContent = "Update Project";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function deleteProject(id) {

    const project = projects.find(
        project => project.id === id
    );

    const confirmation = confirm(
        "Delete " + project.name + "?"
    );

    if (!confirmation) {
        return;
    }

    projects = projects.filter(
        project => project.id !== id
    );

    saveProjects();
    renderProjects();
}


function openProject(id) {

    localStorage.setItem(
        "selectedProjectId",
        id
    );

    window.location.href = "project.html";
}


renderProjects();
// ==========================================
// SHOW / HIDE CREATE PROJECT FORM
// ==========================================

const showCreateProjectButton =
    document.getElementById("showCreateProject");

const projectFormBox =
    document.getElementById("projectFormBox");


showCreateProjectButton.addEventListener(
    "click",
    function () {

        if (projectFormBox.style.display === "none") {

            projectFormBox.style.display = "block";

            showCreateProjectButton.textContent =
                "× Close";

        } else {

            projectFormBox.style.display = "none";

            showCreateProjectButton.textContent =
                "+ Create Project";
        }

    }
);
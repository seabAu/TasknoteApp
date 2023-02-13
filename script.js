const task_form = document.querySelector("#new-task-form");
const task_input = document.querySelector("#new-task-input");
const tasks_list = document.querySelector("#tasks-list");
let TASK_DATA =
    localStorage.getItem("tasks") !== null
        ? JSON.parse(localStorage.getItem("tasks"))
        : [];
window.addEventListener("load", () => {
    task_form.addEventListener("submit", (e) => {
        e.preventDefault();
        const task = task_input.value;

        if (!task) {
            alert("Please fill in some text.");
            return;
        }

        // Else fill out the new element and append it to the list.
        const taskdata = {
            index: TASK_DATA.length,
            label: task_input.value,
            priority: "",
            category: "",
            context: "Blablablabal",
            notes: [],
            status: "inprogress",
        };
        createTask(taskdata);
        TASK_DATA.push(taskdata);
        saveTasks();
        task_input.value = "";
    });
});

function updateTaskIndexes() {
    // This simply runs through the TASK_DATA list and makes sure the indexes are contiguous.
    let num_tasks = TASK_DATA.length;
    for (var i = 0; i < num_tasks; i++) {
        if (TASK_DATA[i]) {
            TASK_DATA[i].index = i;
        }
    }
}
function moveTask(task_index, new_index) {
    let num_tasks = TASK_DATA.length;
    if (
        new_index > num_tasks ||
        new_index < 0 ||
        new_index == undefined ||
        task_index == undefined
    ) {
        return;
    }
    if (TASK_DATA[task_index] && TASK_DATA[new_index]) {
        // Just swap the indexes for now and re-sort the list, then re-load the DOM UI.
        var temp = TASK_DATA[task_index];
        TASK_DATA[task_index] = TASK_DATA[new_index];
        TASK_DATA[new_index] = temp;
        updateTaskIndexes();
        localStorage.setItem("tasks", JSON.stringify(TASK_DATA));
        loadTasks();
    }
}

function createTask(input) {
    var index = input.index;
    var label = input.label;
    var context = input.context;
    var notes = input.notes;

    let closed = notes.length > 0 ? "" : "closed";
    var status = input.status;
    if (status == undefined || status == "") status = "inprogress";

    const task_element = document.createElement("div");
    task_element.classList = `task-item ${
        status == "complete" ? "strikethrough" : ""
    }`;
    task_element.id = `task_${index}`;
    task_element.innerHTML = `
            <div class="task-item-content">
                <span class="move-grip task-item-index">${index}</span>
                <button class="button task-item-dropdown-button ${closed}">${
        closed == "closed" ? "▶" : "▼"
    }</button>
                <input type="text" class="task-item-label" value="${label}" readonly>
                <div class="button-group task-actions">
                    <div class="button-group button-column">
                        <button class="button up-button">▲</button>
                        <button class="button down-button">▼</button>
                    </div>
                    <button class="button edit-button">Edit</button>
                    <button class="button delete-button">Del</button>
                </div>
                <div class="status-container">
                    <input type="checkbox" class="checkbox check-completion" ${
                        status == "complete" ? "checked" : ""
                    } />
                </div>
            </div>
            <div class="task-item-dropdown ${closed}">
                <div class="task-item-notes-container">
                    <button class="button append-note-button">+</button>
                    <ul class="task-item-notes">
                    </ul>
                </div>
            </div>
            `;

    const status_box =
        task_element.getElementsByClassName("check-completion")[0];
    status_box.addEventListener("click", (e) => {
        if (status_box.checked == true) {
            // Change text to be struckthrough.
            task_element.classList.add("strikethrough");
            TASK_DATA[index].status = "complete";
        } else {
            task_element.classList.remove("strikethrough");
            TASK_DATA[index].status = "inprogress";
        }
        saveTasks();
    });

    const index_up_btn = task_element.getElementsByClassName("up-button")[0];
    const index_down_btn =
        task_element.getElementsByClassName("down-button")[0];
    index_up_btn.addEventListener("click", (e) => {
        moveTask(index, index - 1);
    });
    index_down_btn.addEventListener("click", (e) => {
        moveTask(index, index + 1);
    });

    const notes_dropdown_btn = task_element.getElementsByClassName(
        "task-item-dropdown-button",
    )[0];
    const notes_dropdown_container =
        task_element.getElementsByClassName("task-item-dropdown")[0];
    const notes_list =
        task_element.getElementsByClassName("task-item-notes")[0];

    // Run through the list of notes and create a new element for each, including a delete button and setting up each's edit event listeners and handlers.
    for (var n = 0; n < notes.length; n++) {
        const note_content = notes[n];
        createTaskNote(task_element, note_content);
    }
    // Add functionality to the add-note button.
    const append_note_button =
        task_element.getElementsByClassName("append-note-button")[0];
    append_note_button.addEventListener("click", (e) => {
        createTaskNote(task_element, [""]);
    });

    notes_dropdown_btn.addEventListener("click", (e) => {
        if (notes_dropdown_btn.classList.contains("closed")) {
            notes_dropdown_btn.classList.remove("closed");
            notes_dropdown_container.classList.remove("closed");
            notes_dropdown_btn.innerText = "▼";
        } else {
            notes_dropdown_btn.classList.add("closed");
            notes_dropdown_container.classList.add("closed");
            notes_dropdown_btn.innerText = "▶";
        }
    });

    const task_element_input =
        task_element.getElementsByClassName("task-item-label")[0];
    const task_element_edit_btn =
        task_element.getElementsByClassName("edit-button")[0];
    const task_element_del_btn =
        task_element.getElementsByClassName("delete-button")[0];
    task_element_edit_btn.addEventListener("click", (e) => {
        if (task_element_edit_btn.innerText.toLowerCase() == "edit") {
            // Currently readonly, switch to editable.
            task_element_edit_btn.innerText = "Save";
            task_element_input.removeAttribute("readonly");
            task_element_input.focus();
        } else {
            // Currently editable, switch to readonly.
            task_element_edit_btn.innerText = "Edit";
            task_element_input.setAttribute("readonly", "readonly");
            saveTasks();
        }
    });
    task_element_del_btn.addEventListener("click", (e) => {
        tasks_list.removeChild(task_element);
        // Update indexes to keep them contiguous.
        updateTaskIndexes();
        // Save the data.
        saveTasks();
        // Refresh the UI.
        loadTasks();
    });
    tasks_list.appendChild(task_element);
}

function createTaskNote(task_element, note_content = [""]) {
    const notes_list =
        task_element.getElementsByClassName("task-item-notes")[0];
    const note = document.createElement("li");
    note.classList.add("task-item-note");
    note.innerHTML = `
    <ul class="task-item-note-text" contenteditable="true">
        ${note_content
            .map((line) => {
                return `<li class="task-item-note-text-line">${line}</li>`;
            })
            .join("")}
    </ul>`;

    // Make it save the notes data when we leave focus after editing a note field.
    note.addEventListener("focusout", (e) => {
        saveTasks();
    });

    // Create delete button for this note.
    const delbtn = document.createElement("button");
    delbtn.classList = "button del-note-button";
    delbtn.innerText = "-";
    delbtn.addEventListener("click", (e) => {
        notes_list.removeChild(note);
    });
    note.appendChild(delbtn);

    notes_list.appendChild(note);
}

// This runs through the task list and updates TASK_DATA based on the DOM elements it sees.
function scanDOM() {
    let tasks = [];
    const tasks_list = document.querySelector("#tasks-list");
    const task_item_elements = tasks_list.getElementsByClassName("task-item");
    for (var i = 0; i < task_item_elements.length; i++) {
        if (task_item_elements[i]) {
            const task_element = task_item_elements[i];
            const task_element_input =
                task_element.getElementsByClassName("task-item-label")[0];
            const task_element_index =
                task_element.getElementsByClassName("task-item-index")[0];
            const task_element_checkbox =
                task_element.getElementsByClassName("check-completion")[0];
            var label = task_element_input.value;
            var context = "";
            var index = task_element_index.value;
            var status =
                task_element_checkbox.checked == true
                    ? "complete"
                    : "inprogress";
            // Get the list of notes.
            var notes = [];
            const notes_list =
                task_element.getElementsByClassName("task-item-notes")[0];

            // This will be a UL element, which has LI child elements.
            const note_elements = notes_list.getElementsByClassName(
                "task-item-note-text",
            );
            for (var j = 0; j < note_elements.length; j++) {
                if (note_elements[j]) {
                    const note_element = note_elements[j];
                    if (note_element.innerText != "") {
                        var note_text = note_element.innerText;
                        const noteHTML = note_element.innerHTML;
                        const noteHTMLListElements =
                            note_element.getElementsByTagName("li");
                        let notelines = [];
                        for (var n = 0; n < noteHTMLListElements.length; n++) {
                            if (noteHTMLListElements[n]) {
                                const noteHTMLelement = noteHTMLListElements[n];
                                notelines.push(noteHTMLelement.innerText);
                            }
                        }

                        notes.push(notelines);
                    }
                }
            }

            // console.log( i, label, context, notes );
            tasks.push({
                index: index, // i,
                label: label,
                priority: "",
                category: "",
                context: context,
                notes: notes,
                status: status,
            });
        }
    }

    if (tasks.length > 0) {
        TASK_DATA = tasks;
    }
}

// Store task data in local storage.
function saveTasks() {
    // // console.log("Saving data:", TASK_DATA);
    scanDOM();
    localStorage.setItem("tasks", JSON.stringify(TASK_DATA));
}

// Load task data from local storage and rebuild the list on load.
function loadTasks() {
    var task_count = TASK_DATA.length;
    updateTaskIndexes();
    tasks_list.innerHTML = "";
    TASK_DATA.forEach((index, value) => {
        var task = index;
        createTask(task);
    });
}

loadTasks();

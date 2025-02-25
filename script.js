
// Define the headline function at the top level
function headline(listName) {
    const h1 = document.getElementById('headline');
    h1.innerText = listName;
    h1.contentEditable = true;

    h1.addEventListener('blur', function () {
        const newListName = h1.innerText.trim();
        if (newListName !== listName && newListName !== '') {
            renameList(listName, newListName);
        } else {
            h1.innerText = listName; // Revert to the original list name if the new name is empty
        }
    });

    h1.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            h1.blur();
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('task');

    document.getElementById('add').addEventListener('click', addTask);

    taskInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
    });

    document.getElementById('clear-all').addEventListener('click', function () {
        document.getElementById('tasks').innerHTML = '';
        saveTasks();
        saveCurrentList();
    });

    document.getElementById('save-list').addEventListener('click', saveCurrentList);

    document.getElementById('create-list').addEventListener('click', createNewList);

    loadSavedLists();
    loadArchivedLists();
    // Load the current list name from localStorage
    const currentListName = localStorage.getItem('currentListName') || 'Default List';
    if (!localStorage.getItem('savedLists')) {
        createNewList('Default List');
    } else {
        loadList(currentListName);
        headline(currentListName);
    }
});

function addTask() {
    const taskInput = document.getElementById('task');
    const taskText = taskInput.value.trim();
    if (taskText !== "") {
        createTaskElement(taskText, new Date().toLocaleDateString('en-GB'), false);
        taskInput.value = '';
        saveTasks();
        saveCurrentList(); // Automatically save the current list
    }
}

function createTaskElement(text, date, completed) {
    const taskList = document.getElementById('tasks');
    const li = document.createElement('li');

    const leftSection = document.createElement('div');
    leftSection.className = 'left-section';

    const textContainer = document.createElement('div');
    textContainer.className = 'text-container';

    const dateSpan = document.createElement('span');
    dateSpan.className = 'date-span';
    dateSpan.innerText = date;

    const taskSpan = document.createElement('span');
    taskSpan.className = 'spanner';
    taskSpan.innerText = text;

    if (completed) {
        leftSection.classList.add('completed');
        textContainer.classList.add('completed');
        taskSpan.classList.add('completed');
        dateSpan.classList.add('completed');
    }

    leftSection.appendChild(dateSpan);
    textContainer.appendChild(taskSpan);
    leftSection.appendChild(textContainer);
    li.appendChild(leftSection);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    const completeButton = createButton('✅', 'complete', function () {
        toggleCompleted(leftSection, textContainer, taskSpan, dateSpan);
        saveTasks();
        saveCurrentList(); // Automatically save the current list
    });
    buttonContainer.appendChild(completeButton);

    const removeButton = createButton('❌', 'remove', function () {
        li.remove();
        saveTasks();
        saveCurrentList(); // Automatically save the current list
    });
    buttonContainer.appendChild(removeButton);

    const editButton = createButton('✏️', 'edit', function () {
        taskSpan.contentEditable = true;
        taskSpan.focus();
        taskSpan.classList.add('editing');
    });
    buttonContainer.appendChild(editButton);

    taskSpan.addEventListener('blur', function () {
        taskSpan.contentEditable = false;
        taskSpan.classList.remove('editing');
        saveTasks();
        saveCurrentList(); // Automatically save the current list
    });

    taskSpan.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            taskSpan.blur();
        }
    });

    li.appendChild(buttonContainer);
    taskList.appendChild(li);

    // Add event listener to toggle completed class for the entire list item
    leftSection.addEventListener('click', function () {
        toggleCompleted(leftSection, textContainer, taskSpan, dateSpan);
        saveTasks();
        saveCurrentList(); // Automatically save the current list
    });
}

function createButton(text, className, onClick) {
    const button = document.createElement('span');
    button.innerText = text;
    button.className = className;
    button.addEventListener('click', onClick);
    return button;
}

function toggleCompleted(leftSection, textContainer, taskSpan, dateSpan) {
    leftSection.classList.toggle('completed');
    textContainer.classList.toggle('completed');
    taskSpan.classList.toggle('completed');
    dateSpan.classList.toggle('completed');
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#tasks li').forEach(li => {
        const taskSpan = li.querySelector('.spanner');
        const dateSpan = li.querySelector('.date-span');
        tasks.push({
            text: taskSpan.innerText,
            date: dateSpan.innerText,
            completed: taskSpan.classList.contains('completed')
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        createTaskElement(task.text, task.date, task.completed);
    });
}

function saveCurrentList() {
    const listName = document.getElementById('headline').innerText.replace('Current List: ', '') || 'Default List';
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const savedLists = JSON.parse(localStorage.getItem('savedLists')) || {};
    savedLists[listName] = tasks;
    localStorage.setItem('savedLists', JSON.stringify(savedLists));
    localStorage.setItem('currentListName', listName); // Save the current list name
}

function loadSavedLists() {
    const savedLists = JSON.parse(localStorage.getItem('savedLists')) || {};
    for (const listName in savedLists) {
        addListToggle(listName);
    }
}

function loadArchivedLists() {
    const archivedLists = JSON.parse(localStorage.getItem('archivedLists')) || {};
    for (const listName in archivedLists) {
        addArchivedListToggle(listName);
    }
}

function addListToggle(listName) {
    const listToggles = document.getElementById('list-toggles');
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = "#";
    a.innerText = listName;
    a.addEventListener('click', function () {
        saveCurrentList(); // Save the current list before switching
        loadList(listName);
        headline(listName); // Update the headline with the selected list name
    });
    li.appendChild(a);

    // Create a delete button for the list
    const deleteButton = createButton('🗑️', 'delete', function (e) {
        e.stopPropagation(); // Prevent the click event from triggering the list load
        deleteList(listName);
        li.remove();
    });
    li.appendChild(deleteButton);

    // Create an archive button for the list
    const archiveButton = createButton('📦', 'archive', function (e) {
        e.stopPropagation(); // Prevent the click event from triggering the list load
        archiveList(listName);
        li.remove();
    });
    li.appendChild(archiveButton);

    listToggles.appendChild(li);
}

function addArchivedListToggle(listName) {
    const archivedListToggles = document.getElementById('archived-list-toggles');
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = "#";
    a.innerText = listName;
    a.addEventListener('click', function () {
        saveCurrentList(); // Save the current list before switching
        loadList(listName);
        headline(listName); // Update the headline with the selected list name
    });
    li.appendChild(a);

    // Create a delete button for the archived list
    const deleteButton = createButton('🗑️', 'delete', function (e) {
        e.stopPropagation(); // Prevent the click event from triggering the list load
        deleteList(listName, true);
        li.remove();
    });
    li.appendChild(deleteButton);

    // Create a revert button for the archived list
    const revertButton = createButton('🔙', 'revert', function (e) {
        e.stopPropagation(); // Prevent the click event from triggering the list load
        revertList(listName);
        li.remove();
    });
    li.appendChild(revertButton);

    archivedListToggles.appendChild(li);
}

function revertList(listName) {
    const archivedLists = JSON.parse(localStorage.getItem('archivedLists')) || {};
    const savedLists = JSON.parse(localStorage.getItem('savedLists')) || {};
    if (archivedLists[listName]) {
        savedLists[listName] = archivedLists[listName];
        delete archivedLists[listName];
        localStorage.setItem('archivedLists', JSON.stringify(archivedLists));
        localStorage.setItem('savedLists', JSON.stringify(savedLists));
        addListToggle(listName);
    }
}

function archiveList(listName) {
    const savedLists = JSON.parse(localStorage.getItem('savedLists')) || {};
    const archivedLists = JSON.parse(localStorage.getItem('archivedLists')) || {};
    if (savedLists[listName]) {
        archivedLists[listName] = savedLists[listName];
        delete savedLists[listName];
        localStorage.setItem('savedLists', JSON.stringify(savedLists));
        localStorage.setItem('archivedLists', JSON.stringify(archivedLists));
        addArchivedListToggle(listName);
    }
}

function deleteList(listName, isArchived = false) {
    const savedLists = JSON.parse(localStorage.getItem(isArchived ? 'archivedLists' : 'savedLists')) || {};
    delete savedLists[listName];
    localStorage.setItem(isArchived ? 'archivedLists' : 'savedLists', JSON.stringify(savedLists));
    // If the deleted list is the current list, switch to the default list
    const currentListName = localStorage.getItem('currentListName');
    if (currentListName === listName) {
        const defaultListName = 'Default List';
        if (Object.keys(savedLists).length === 0) {
            createNewList('Default List');
        } else {
            loadList(defaultListName);
            headline(defaultListName);
            localStorage.setItem('currentListName', defaultListName);
        }
    }
}

function loadList(listName) {
    const savedLists = JSON.parse(localStorage.getItem('savedLists')) || {};
    const tasks = savedLists[listName] || [];
    document.getElementById('tasks').innerHTML = '';
    tasks.forEach(task => {
        createTaskElement(task.text, task.date, task.completed);
    });
    saveTasks();
    headline(listName); // Update the headline with the selected list name
    localStorage.setItem('currentListName', listName); // Save the current list name
}

function createNewList(listName = 'New List') {
    saveCurrentList(); // Save the current list before creating a new one
    document.getElementById('tasks').innerHTML = '';
    saveTasks();
    headline(listName); // Update the headline with a default name for the new list
    localStorage.setItem('currentListName', listName); // Save the new list name
    addListToggle(listName);
    saveCurrentList(); // Save the new list
}

function renameList(oldName, newName) {
    const savedLists = JSON.parse(localStorage.getItem('savedLists')) || {};
    if (savedLists[oldName]) {
        savedLists[newName] = savedLists[oldName];
        delete savedLists[oldName];
        localStorage.setItem('savedLists', JSON.stringify(savedLists));
        localStorage.setItem('currentListName', newName);
        updateListToggle(oldName, newName);
    }
}

function updateListToggle(oldName, newName) {
    const listToggles = document.getElementById('list-toggles');
    const links = listToggles.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
        if (links[i].innerText === oldName) {
            links[i].innerText = newName;
            break;
        }
    }
}
var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countActive = document.getElementById("count-active");
var countAll = document.getElementById("count-all");
var countCompleted = document.getElementById("count-completed");
var filterAll = document.getElementById("filterAll");
var filterActive =  document.getElementById("filterActive");
var filterCompleted = document.getElementById("filterCompleted");

filterAll.onclick = setFilter();
filterActive.onclick = setFilter("active");
filterCompleted.onclick = setFilter("completed");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function doEdit() {
    var editForm = document.getElementById("edit-form");
    var editTodo = document.getElementById("edit-todo");
    var id = editForm.parentElement.parentElement.getAttribute("data-id");
    if (editForm) {
        editForm.onsubmit = function(event) {
            var title = editTodo.value;
            updateTodo(title, id, function() {
                reloadTodoList();
            });
            todoTitle.value = "";
            event.preventDefault();
        };
    }
}

function getTodoList(callback) {
    fetch("/api/todo")
        .then(function(response) {
            if (response.status === 200) {
                return response.json();
            } else {
                error.textContent = "Failed to get list. Server returned " + response.status +
                    " - " + response.statusText;
            }
        })
        .then(function(json) {
            callback(json);
        });
}

function createTodo(title, callback) {
    fetch("/api/todo", {
        method: "post",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({title: title})
    })
    .then(function(response) {
        if (response.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + response.status +
                " - " + response.statusText;
        }
    });
}

function updateTodo(title, id, callback) {
    fetch("/api/todo/" + id, {
        method: "put",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({"title": title}),
    })
    .then(function (response) {
        if (response.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + response.status +
                " - " + response.statusText;
        }
    });
}

function markDone(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("data-id") ||
            event.target.parentElement.getAttribute("data-id");
        fetch("/api/todo/" + id, {
            method: "put",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({isComplete: true})
        })
        .then(function (response) {
            if (response.status === 200) {
                reloadTodoList();
            } else {
                error.textContent = "Failed to update item. Server returned " + this.status +
                    " - " + this.responseText;
            }
        });
    }
}

function markNotDone(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("data-id") ||
            event.target.parentElement.getAttribute("data-id");
        fetch("/api/todo/" + id, {
            method: "put",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({isComplete: false})
        })
            .then(function (response) {
                if (response.status === 200) {
                    reloadTodoList();
                } else {
                    error.textContent = "Failed to update item. Server returned " + this.status +
                        " - " + this.responseText;
                }
            });
    }
}

function deleteTodoEvent(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("data-id")  ||
            event.target.parentElement.getAttribute("data-id");
        if (id) {
            deleteTodo(id, reloadTodoList);
        }
    }
}

function deleteTodo(id, callback) {
    fetch("/api/todo/" + id, {
        method: "delete"
    })
    .then(function (response) {
        if (response.status === 200) {
            if (callback) {
                callback();
            }
        } else {
            error.textContent = "Failed to Delete. Server returned " + response.status +
                " - " + response.statusText;
        }
    });
}

function clearAll(todos) {
    return function() {
        todos.forEach(function (todo) {
            if (todo.isComplete) {
                deleteTodo(todo.id);
            }
        });
        reloadTodoList();
    };
}

function setFilter(filter) {
    return function() {
        switch (filter) {
            case "active":
                reloadTodoList("active");
                break;
            case "completed":
                reloadTodoList("completed");
                break;
            default :
                reloadTodoList();
        }
    };
}

function reloadTodoList(filter) {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        var itemsNotDone = 0;
        var completedItems = 0;
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            listItem.textContent = todo.title;
            var deleteButton = document.createElement("button");
            deleteButton.innerHTML = "<i class=\"fa fa-trash-o\"></i>";
            deleteButton.className = "delete button";
            deleteButton.setAttribute("data-id", todo.id);
            deleteButton.onclick = deleteTodoEvent;
            var editButton =  document.createElement("button");
            editButton.innerHTML = "<i class=\"fa fa-pencil\"></i>";
            editButton.className = "edit";
            editButton.setAttribute("data-id", todo.id);
            editButton.onclick = function() {
                var cancelbutton = document.createElement("button");
                cancelbutton.innerHTML = "<i class=\"fa fa-ban\"></i>";
                cancelbutton.className = "cancel button";
                cancelbutton.onclick = function(){reloadTodoList()};
                listItem.innerHTML = "<div id=\"editFormDiv\"><form id=\"edit-form\">" +
                    "<input id=\"edit-todo\" placeholder=\"" + todo.title + "\"></form></div>";
                listItem.setAttribute("data-id", todo.id);
                listItem.firstElementChild.firstElementChild.firstElementChild.focus();
                document.getElementById("editFormDiv").appendChild(cancelbutton);
                doEdit();
            };
            var deleteDone = document.getElementById("delete-done");
            deleteDone.style.display = "none";
            if (todo.isComplete) {
                listItem.className = "isDone";
                completedItems++;
                if (filter === "active") {
                    listItem.style.display = "none";
                }
                var undoButton = document.createElement("button");
                undoButton.innerHTML = "<i class=\"fa fa-undo icon-spin\"></i>";
                undoButton.className = "undo button";
                undoButton.setAttribute("data-id", todo.id);
                undoButton.onclick = markNotDone;
                listItem.insertBefore (undoButton, listItem.childNodes[0]);
            }
            else {
                itemsNotDone++;
                if (filter === "completed") {
                    listItem.style.display = "none";
                }
                var doneButton = document.createElement("button");
                doneButton.innerHTML = "<i class=\"fa fa- fa-check\"></i>";
                doneButton.className = "done button";
                doneButton.setAttribute("data-id", todo.id);
                doneButton.onclick = markDone;
                listItem.insertBefore (doneButton, listItem.childNodes[0]);
            }
            var totalTasks = completedItems + itemsNotDone;
            filterAll.textContent = (totalTasks === 1 ? totalTasks + " task" :
            totalTasks + " total tasks");
            filterCompleted.textContent = (completedItems === 1 ? completedItems + " Completed task" :
            completedItems + " Completed tasks");
            filterActive.textContent = (itemsNotDone === 1 ? itemsNotDone + " active task" :
            itemsNotDone + " active tasks");
            filterCompleted.textContent = (completedItems === 1 ? completedItems + " Completed task" :
            completedItems + " Completed tasks");
            if (completedItems > 0) {
                deleteDone.style.display = "block";
                deleteDone.onclick = clearAll(todos);
            }
            listItem.appendChild(deleteButton);
            listItem.appendChild(editButton);
            todoList.appendChild (listItem);
        });
    });
}

reloadTodoList();
//setInterval (reloadTodoList(), 10000);

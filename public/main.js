var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var counter = document.getElementById("count-label");
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

function updateTodo(id, title, callback) {
    fetch("/api/todo" + id, {
        method: "put",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({title: title})
    })
    .then(function(response) {
        if (response.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to update item. Server returned " + this.status +
                " - " + this.responseText;
        }
    });
}

function markDone(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("data-id");
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

function deleteTodoEvent(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("data-id");
        if (id) {
            deleteTodo(id);
        }
    }
}

function deleteTodo(id) {
    fetch("/api/todo/" + id, {
        method: "delete"
    })
    .then(function (response) {
        if (response.status === 200) {
            reloadTodoList();
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
            deleteButton.textContent = ("Delete");
            deleteButton.className = "delete button";
            deleteButton.setAttribute("data-id", todo.id);
            deleteButton.onclick = deleteTodoEvent;
            if (todo.isComplete) {
                listItem.className = "isDone";
                completedItems++;
                if (filter === "active") {
                    listItem.style.display = "none";
                }
            }
            else {
                itemsNotDone++;
                if (filter === "completed") {
                    listItem.style.display = "none";
                }
                var doneButton = document.createElement("button");
                doneButton.textContent = ("Mark as Done");
                doneButton.className = "markDone button";
                doneButton.setAttribute("data-id", todo.id);
                doneButton.onclick = markDone;
                listItem.appendChild(doneButton);
            }
            counter.textContent = (itemsNotDone === 1 ? "There is " +
                itemsNotDone + " task remaining" : "There are " +
                itemsNotDone + " tasks remaining");
            if (completedItems > 0) {
                var deleteDone = document.createElement("button");
                deleteDone.textContent = "Delete All Completed";
                deleteDone.className = "button";
                deleteDone.onclick = clearAll(todos);
                counter.appendChild(deleteDone);
            }
            listItem.appendChild(deleteButton);
            todoList.appendChild(listItem);
        });
    });
}

reloadTodoList();
setInterval (reloadTodoList(), 10000);

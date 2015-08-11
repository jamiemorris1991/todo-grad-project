var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var counter = document.getElementById("count-label");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}
function updateTodo(id, title, callback) {
    var updateRequest = new XMLHttpRequest();
    updateRequest.open("PUT", "/api/todo" + id);
    updateRequest.setRequestHeader("Content-type", "application/json");
    updateRequest.send(JSON.stringify({
        title: title
    }));
    updateRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to update item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function deleteTodoEvent(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("data-id");
        if (id) {
            deleteTodo(id);
            reloadTodoList();
        }
    }
}

function deleteTodo(id, callback) {
    var deleteRequest = new XMLHttpRequest();
    deleteRequest.open("DELETE", "/api/todo/" + id);
    deleteRequest.onload = function() {
        if (this.status !== 200) {
            error.textContent = "Failed to Delete. Server returned " + this.status + " - " + this.responseText;
        }else {
            if (callback) {
                callback();
            }
        }
    };
    deleteRequest.send();
}

function markDone(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("data-id");
        var updateRequest = new XMLHttpRequest();
        updateRequest.open("PUT", "/api/todo/" + id);
        updateRequest.setRequestHeader("Content-type", "application/json");
        updateRequest.send(JSON.stringify({
            isComplete: true
        }));
        updateRequest.onload = function() {
            if (this.status === 200) {
                reloadTodoList();
            } else {
                error.textContent = "Failed to update item. Server returned " + this.status + " - " + this.responseText;
            }
        };
    }
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

function reloadTodoList() {
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
            }
            else {
                itemsNotDone++;
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

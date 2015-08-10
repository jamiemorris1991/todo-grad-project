var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

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

function deleteTodo(event) {
    if (event && event.target) {
        var id = event.target.getAttribute("data-id");
        var deleteRequest = new XMLHttpRequest();
        deleteRequest.open("DELETE", "/api/todo/" + id);
        deleteRequest.onload = function() {
            if (this.status !== 200) {
                error.textContent = "Failed to Delete. Server returned " + this.status + " - " + this.responseText;
            }
        };
        deleteRequest.send();
        reloadTodoList();
    }
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            listItem.textContent = todo.title;
            var deleteButton = document.createElement("button");
            deleteButton.textContent = ("Delete");
            deleteButton.setAttribute("data-id", todo.id);
            deleteButton.onclick = deleteTodo;
            todoList.appendChild(listItem);
            listItem.appendChild(deleteButton);
        });
    });
}

reloadTodoList();

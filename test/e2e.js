var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./e2eHelpers");

testing.describe("end to end", function() {
    this.timeout(20000);
    testing.before(helpers.setupDriver);
    testing.beforeEach(helpers.setupServer);
    testing.afterEach(helpers.teardownServer);
    testing.after(function() {
        helpers.teardownDriver();
        helpers.reportCoverage();
    });

    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.navigateToSite();
            helpers.getTitleText().then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
        testing.it("displays empty TODO list", function() {
            helpers.navigateToSite();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("get", "/api/todo");
            helpers.navigateToSite();
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to get list. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function () {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getInputText().then(function (value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function () {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getTodoList().then(function (elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function () {
            helpers.setupErrorRoute("post", "/api/todo");
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getErrorText().then(function (text) {
                assert.equal(text, "Failed to create item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function () {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("Another new todo item");
            helpers.getTodoList().then(function (elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
    testing.describe("on delete", function() {
        testing.it("item is deleted", function () {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.deleteTodo(0);
            helpers.getTodoList().then(function (elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("can delete multiple items", function () {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("2nd todo item");
            helpers.deleteTodo(1);
            helpers.navigateToSite();
            helpers.deleteTodo(0);
            helpers.getTodoList().then(function (elements) {
                assert.equal(elements.length, 0);
            });
        });
    });
});


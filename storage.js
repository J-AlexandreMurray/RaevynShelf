
let books = JSON.parse(localStorage.getItem("books") || "[]");

function saveBooks() {
localStorage.setItem("books", JSON.stringify(books));
}

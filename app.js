fetch(`/.netlify/functions/fetch-ao3?url=${encodeURIComponent(url)}`)


function addBook(){

if(!title.value) return;

const book = {
id: crypto.randomUUID(),
title: title.value,
author: author.value,
status: status.value,
rating: Number(rating.value) || 0,
tags: tags.value || "",
notes: notes.value || "",
dateFinished: new Date().toISOString()
};

books.push(book);

saveBooks();

clearForm();

render();

}



function deleteBook(id){

books = books.filter(b => b.id !== id);

saveBooks();

render();

}

function clearForm(){

title.value = "";
author.value = "";
rating.value = "";
tags.value = "";
notes.value = "";

}

function render(){

const searchText = search.value ? search.value.toLowerCase() : "";

const filtered = books.filter(b =>
b.title.toLowerCase().includes(searchText) ||
b.author.toLowerCase().includes(searchText) ||
(b.tags && b.tags.toLowerCase().includes(searchText))
);

library.innerHTML = filtered.map(b => `
<div class="book">
<strong>${b.title}</strong> — ${b.author}<br/>
Status: ${b.status} | Rating: ${b.rating}<br/>
Tags: ${b.tags}<br/>
Notes: ${b.notes}<br/>
<button onclick="deleteBook('${b.id}')">Delete</button>
</div>
`).join("");

updateStats();

renderCharts();

}

function updateStats(){

const total = books.length;

const read = books.filter(b => b.status === "read").length;

const avgRating = books.length
? (books.reduce((sum,b)=>sum+b.rating,0)/books.length).toFixed(2)
: 0;

document.getElementById("totalBooks").innerText = total;
document.getElementById("booksRead").innerText = read;
document.getElementById("avgRating").innerText = avgRating;

}

render();

let books = loadBooksFromStorage();

const $ = (id) => document.getElementById(id);

const title = $("title");
const author = $("author");
const status = $("status");
const rating = $("rating");
const tags = $("tags");
const notes = $("notes");
const wordcount = $("wordcount");
const ao3url = $("ao3url");
const library = $("library");
const search = $("search");
const bookForm = $("bookForm");
const importButton = $("importButton");
const exportButton = $("exportButton");
const importFile = $("importFile");

function setButtonState(button, label, disabled = false){
  button.textContent = label;
  button.disabled = disabled;
}

function trackEvent(name, params = {}){
  if(typeof gtag === "function"){
    gtag("event", name, params);
  }
}

async function importAO3(button){
  const url = ao3url.value.trim();

  if(!url){
    alert("Paste your AO3 link");
    return;
  }

  setButtonState(button, "Importing...", true);

  try{
    const response = await fetch(`/.netlify/functions/fetch-ao3?url=${encodeURIComponent(url)}`);
    if(!response.ok){
      throw new Error("Import failed");
    }

    const data = await response.json();

    title.value = data.title || "";
    author.value = data.author || "";
    wordcount.value = data.words || "";
    tags.value = Array.isArray(data.tags) ? data.tags.join(", ") : "";

    setButtonState(button, "Imported ✓", true);
    trackEvent("ao3_import_success");
  }catch(error){
    console.error(error);
    setButtonState(button, "Failed", true);
    trackEvent("ao3_import_failed");
  }

  setTimeout(() => setButtonState(button, "Import AO3", false), 1800);
}

function clearForm(){
  title.value = "";
  author.value = "";
  status.value = "reading";
  rating.value = "";
  tags.value = "";
  notes.value = "";
  wordcount.value = "";
}

function addBook(){
  if(!title.value.trim()) return;

  const book = {
    id: crypto.randomUUID(),
    title: title.value.trim(),
    author: author.value.trim(),
    status: status.value,
    rating: Number(rating.value) || 0,
    tags: tags.value.trim(),
    notes: notes.value.trim(),
    wordCount: parseInt(String(wordcount.value).replace(/,/g, ""), 10) || 0,
    dateFinished: status.value === "read" ? new Date().toISOString() : ""
  };

  books.unshift(book);
  saveBooks(books);
  clearForm();
  render();
  trackEvent("add_book");
}

function deleteBook(id){
  books = books.filter(b => b.id !== id);
  saveBooks(books);
  render();
  trackEvent("delete_book");
}

function exportLibrary(){
  const blob = new Blob([JSON.stringify(books, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "ravenshelf_library.json";
  a.click();
  URL.revokeObjectURL(a.href);
  trackEvent("export_library");
}

function importLibraryFromFile(file){
  const reader = new FileReader();

  reader.onload = function(e){
    try{
      const parsed = JSON.parse(e.target.result);
      if(!Array.isArray(parsed)){
        throw new Error("Invalid library file");
      }
      books = parsed;
      saveBooks(books);
      render();
      trackEvent("import_library");
    }catch(error){
      console.error(error);
      alert("That file could not be imported.");
    }
  };

  reader.readAsText(file);
}

function updateStats(){
  const total = books.length;
  const read = books.filter(b => b.status === "read").length;
  const avgRating = books.length
    ? (books.reduce((sum,b) => sum + (Number(b.rating) || 0), 0) / books.length).toFixed(2)
    : 0;
  const totalWords = books.reduce((sum,b) => sum + (Number(b.wordCount) || 0), 0);

  $("totalBooks").innerText = total;
  $("booksRead").innerText = read;
  $("avgRating").innerText = avgRating;
  $("totalWords").innerText = totalWords.toLocaleString();
}

function renderLibrary(){
  const searchText = search.value.trim().toLowerCase();

  const filtered = books.filter(b => {
    return (
      (b.title || "").toLowerCase().includes(searchText) ||
      (b.author || "").toLowerCase().includes(searchText) ||
      (b.tags || "").toLowerCase().includes(searchText)
    );
  });

  library.innerHTML = filtered.map(b => `
    <div class="book">
      <div class="book-title">${b.title || ""} — ${b.author || ""}</div>
      <div class="book-meta">
        Status: ${b.status || ""} |
        Rating: ${b.rating || 0} |
        Words: ${(Number(b.wordCount) || 0).toLocaleString()}
      </div>
      <div class="book-tags">Tags: ${b.tags || ""}</div>
      <div class="book-notes">Notes: ${b.notes || ""}</div>
      <div class="book-actions">
        <button type="button" onclick="deleteBook('${b.id}')">Delete</button>
      </div>
    </div>
  `).join("");

  if(!filtered.length){
    library.innerHTML = '<div class="book"><div class="book-notes">No entries yet.</div></div>';
  }
}

function render(){
  updateStats();
  renderLibrary();
  renderCharts(books);
}

bookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addBook();
});

importButton.addEventListener("click", function(){
  importAO3(this);
});

search.addEventListener("input", render);
exportButton.addEventListener("click", exportLibrary);
importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if(file){
    importLibraryFromFile(file);
    e.target.value = "";
  }
});

render();

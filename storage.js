const STORAGE_KEY = "ravenshelf_books";

function saveBooks(books){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function loadBooksFromStorage(){
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

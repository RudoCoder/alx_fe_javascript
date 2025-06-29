// script.js

let quotes = [];
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"

functionQuotesFromServer() {
  return fetchServerQuotes();
}

// Fetch server quotes and sync
async function fetchServerQuotes() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    let updated = false;
    for (let sq of serverQuotes) {
      if (!quotes.some(q => q.text === sq.text)) {
        quotes.push(sq);
        updated = true;
      }
    }

    if (updated) {
      saveQuotes();
      populateCategories();
      filterQuotes();
      notifyUser("Quotes synced with server. Conflicts resolved using server-first strategy.");
    }
  } catch (error) {
    console.error("Failed to sync with server:", error);
  }
}

function notifyUser(message) {
  const notifyDiv = document.createElement("div");
  notifyDiv.style.background = "#fffae6";
  notifyDiv.style.border = "1px solid #ffe58f";
  notifyDiv.style.padding = "10px";
  notifyDiv.style.margin = "10px 0";
  notifyDiv.innerText = message;
  document.body.insertBefore(notifyDiv, document.body.firstChild);

  setTimeout(() => notifyDiv.remove(), 5000);
}

function startSyncing() {
  fetchQuotesFromServer();
  setInterval(fetchQuotesFromServer, 30000);
}

window.onload = function () {
  const storedQuotes = localStorage.getItem("quotes");
  const storedCategory = localStorage.getItem("selectedCategory");

  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "Work" },
      { text: "Success is not in what you have, but who you are.", category: "Success" },
      { text: "Be yourself; everyone else is already taken.", category: "Inspiration" }
    ];
    saveQuotes();
  }

  populateCategories();

  if (storedCategory) {
    document.getElementById("categoryFilter").value = storedCategory;
    filterQuotes();
  } else {
    showRandomQuote();
  }

  startSyncing();
  createAddQuoteForm();
};

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const categorySelect = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];

  categorySelect.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    quoteDisplay.innerText = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerText = `"${quote.text}" - [${quote.category}]`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  const quoteDisplay = document.getElementById("quoteDisplay");

  let filteredQuotes = quotes;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteDisplay.innerText = `"${quote.text}" - [${quote.category}]`;
  } else {
    quoteDisplay.innerText = "No quotes available for this category.";
  }
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newQuoteText = textInput.value.trim();
  const newQuoteCategory = categoryInput.value.trim();

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes();
    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added successfully!");
    populateCategories();
  } else {
    alert("Please enter both quote text and category.");
  }
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
        populateCategories();
        filterQuotes();
      } else {
        alert("Invalid JSON format.");
      }
    } catch (e) {
      alert("Error parsing JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to dynamically create the form for adding a new quote
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

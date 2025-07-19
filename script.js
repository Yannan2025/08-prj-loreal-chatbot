const chatForm = document.getElementById("chatForm");
const userInputField = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const lastQuestionDisplay = document.getElementById("lastQuestion");

const productGrid = document.getElementById("productGrid");
const selectedList = document.querySelector(".selected-list");
const generateRoutineBtn = document.getElementById("generateRoutineBtn");
const productSearch = document.getElementById("productSearch");

const workerEndpoint = "https://icy-shadow-4043.yhe55.workers.dev/";

// Track selected products
let selectedProducts = JSON.parse(localStorage.getItem("selectedProducts")) || [];

// Initial greeting
chatWindow.innerHTML = `<div class="bot-message">👋 Hello! How can I help you with L’Oréal products today?</div>`;

let chatHistory = [
  {
    role: "system",
    content:
      "You are a helpful expert on L’Oréal products. Only answer questions related to skincare, beauty, or hair care from L’Oréal."
  }
];

// Display product selection
function updateSelectedList() {
  selectedList.innerHTML = "";
  selectedProducts.forEach((name) => {
    const item = document.createElement("li");
    item.textContent = name;
    selectedList.appendChild(item);
  });
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

// Handle product card interaction
productGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".product-card");
  if (!card) return;

  const productName = card.querySelector("h3").textContent;

  if (e.target.classList.contains("select-btn")) {
    card.classList.toggle("selected");

    if (selectedProducts.includes(productName)) {
      selectedProducts = selectedProducts.filter((p) => p !== productName);
    } else {
      selectedProducts.push(productName);
    }

    updateSelectedList();
  }

  if (e.target.classList.contains("desc-toggle")) {
    const desc = card.querySelector(".product-desc");
    desc.classList.toggle("hidden");
  }
});

// Routine generation
generateRoutineBtn.addEventListener("click", async () => {
  if (selectedProducts.length === 0) {
    displayMessage("⚠️ Please select at least one product before generating a routine.", "bot");
    return;
  }

  chatHistory.push({
    role: "user",
    content: `Create a routine using these products: ${selectedProducts.join(", ")}`
  });

  try {
    const response = await fetch(workerEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a routine.";
    displayMessage(reply, "bot");

    chatHistory.push({ role: "assistant", content: reply });
  } catch (error) {
    displayMessage("⚠️ Error generating routine. Please try again later.", "bot");
    console.error(error);
  }
});

// Chat bubble display
function displayMessage(text, sender = "bot") {
  const bubble = document.createElement("div");
  bubble.className = sender === "user" ? "user-message" : "bot-message";
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Chat submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInputField.value.trim();
  if (!userMessage) return;

  displayMessage(userMessage, "user");
  lastQuestionDisplay.textContent = `You asked: "${userMessage}"`;
  userInputField.value = "";

  const keywords = ["l'oréal", "makeup", "foundation", "skincare", "hair", "serum", "moisturizer"];
  const isRelevant = keywords.some((word) => userMessage.toLowerCase().includes(word));

  if (!isRelevant) {
    displayMessage("I'm here to help with L’Oréal beauty and skincare only. Try asking about a product or routine!", "bot");
    return;
  }

  chatHistory.push({ role: "user", content: userMessage });

  try {
    const response = await fetch(workerEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't find a matching product answer.";
    displayMessage(reply, "bot");

    chatHistory.push({ role: "assistant", content: reply });
  } catch (error) {
    displayMessage("⚠️ There was an error connecting to the server. Please try again later.", "bot");
    console.error(error);
  }
});

// Product search filtering
productSearch.addEventListener("input", () => {
  const query = productSearch.value.toLowerCase();
  document.querySelectorAll(".product-card").forEach((card) => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = name.includes(query) ? "block" : "none";
  });
});

// Apply stored selections on page load
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".product-card").forEach((card) => {
    const name = card.querySelector("h3").textContent;
    if (selectedProducts.includes(name)) {
      card.classList.add("selected");
    }
  });
  updateSelectedList();
});

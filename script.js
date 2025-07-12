const chatForm = document.getElementById("chatForm");
const userInputField = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const lastQuestionDisplay = document.getElementById("lastQuestion");

const workerEndpoint = "https://icy-shadow-4043.yhe55.workers.dev/"; // Replace with actual Cloudflare Worker URL

// Initial greeting
chatWindow.innerHTML = `<div class="bot-message">👋 Hello! How can I help you with L’Oréal products today?</div>`;

// Store conversation history
let chatHistory = [
  {
    role: "system",
    content:
      "You are a helpful expert on L’Oréal products. Only answer questions related to skincare, beauty, or hair care from L’Oréal."
  }
];

// Relevance filter
function isRelevant(message) {
  const keywords = ["l'oréal", "makeup", "foundation", "skincare", "hair", "serum", "moisturizer"];
  return keywords.some((word) => message.toLowerCase().includes(word));
}

// Bubble display
function displayMessage(text, sender = "bot") {
  const bubble = document.createElement("div");
  bubble.className = sender === "user" ? "user-message" : "bot-message";
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Handle submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInputField.value.trim();
  if (!userMessage) return;

  displayMessage(userMessage, "user");
  lastQuestionDisplay.textContent = `You asked: "${userMessage}"`;
  userInputField.value = "";

  if (!isRelevant(userMessage)) {
    displayMessage("I'm here to help with L’Oréal beauty and skincare only. Try asking about a product or routine!", "bot");
    return;
  }

  // Append message to chat history
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

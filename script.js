// Make sure the compat libraries are loaded via the script tags in your HTML

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPTUGb4ujn0ds92E8ki1pXssK3VLUvvMQ",
  authDomain: "budget-a42bb.firebaseapp.com",
  databaseURL: "https://budget-a42bb-default-rtdb.firebaseio.com", // Added the database URL
  projectId: "budget-a42bb",
  storageBucket: "budget-a42bb.firebasestorage.app",
  messagingSenderId: "1046457337246",
  appId: "1:1046457337246:web:6e3a45ac0ad43b4d37428f",
};

// Initialize Firebase using the compat library
firebase.initializeApp(firebaseConfig);

// Create a reference to the Realtime Database
const db = firebase.database();

// Get DOM elements
const addTransactionForm = document.getElementById("addTransactionForm");
const transactionTableBody = document.querySelector("#transactionTable tbody");

// Variable to check if we are editing a transaction
let editingKey = null;

// Handle form submission for add/update
addTransactionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Debug log to ensure the event fires
  console.log("Submit event triggered");

  // Get form values
  const type = document.getElementById("type").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;

  const transaction = { type, amount, date, category, description };

  if (editingKey) {
    // Update existing transaction
    db.ref("transactions/" + editingKey)
      .update(transaction)
      .then(() => {
        alert("Transaction updated successfully!");
        editingKey = null;
        addTransactionForm.reset();
      })
      .catch((error) => console.error("Error updating transaction:", error));
  } else {
    // Add new transaction
    const newTransactionRef = db.ref("transactions").push();
    newTransactionRef
      .set(transaction)
      .then(() => {
        alert("Transaction added successfully!");
        addTransactionForm.reset();
      })
      .catch((error) => console.error("Error adding transaction:", error));
  }
});

// Function to render a single transaction into the table
function renderTransaction(key, transaction) {
  const tr = document.createElement("tr");
  tr.setAttribute("id", key);
  tr.innerHTML = `
    <td>${transaction.type}</td>
    <td>${transaction.amount.toFixed(2)}</td>
    <td>${transaction.date}</td>
    <td>${transaction.category}</td>
    <td>${transaction.description}</td>
    <td>
      <button onclick="editTransaction('${key}')">Edit</button>
      <button onclick="deleteTransaction('${key}')">Delete</button>
    </td>
  `;
  transactionTableBody.appendChild(tr);
}

// Real-time listener: fetch and display transactions
db.ref("transactions").on("value", (snapshot) => {
  transactionTableBody.innerHTML = ""; // Clear existing entries
  snapshot.forEach((childSnapshot) => {
    const key = childSnapshot.key;
    const transaction = childSnapshot.val();
    renderTransaction(key, transaction);
  });
});

// Delete a transaction
function deleteTransaction(key) {
  console.log("Delete button clicked for key:", key);
  if (confirm("Are you sure you want to delete this transaction?")) {
    db.ref("transactions/" + key)
      .remove()
      .then(() => alert("Transaction deleted successfully!"))
      .catch((error) => console.error("Error deleting transaction:", error));
  }
}

// Edit a transaction: pre-fill the form with existing values
function editTransaction(key) {
  db.ref("transactions/" + key)
    .once("value")
    .then((snapshot) => {
      const transaction = snapshot.val();
      document.getElementById("type").value = transaction.type;
      document.getElementById("amount").value = transaction.amount;
      document.getElementById("date").value = transaction.date;
      document.getElementById("category").value = transaction.category;
      document.getElementById("description").value = transaction.description;
      editingKey = key;
    })
    .catch((error) => console.error("Error fetching transaction:", error));
}

// Chatbot Integration (Fixed API Call)
const endpointUrl =
  "https://us-central1-budget-a42bb.cloudfunctions.net/dialogflow"; // Ensure this is correct

// Async function to send a message to the chatbot and get a response
async function sendChatMessage(query, sessionId = "unique-session-id") {
  try {
    console.log("Sending message to chatbot:", query); // Debugging log

    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query, // Ensure proper JSON structure
        sessionId: sessionId, // Unique session for continuity
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Chatbot response received:", data);

    return data.response || "No response from server.";
  } catch (error) {
    console.error("Error fetching chatbot response:", error);
    return "Sorry, something went wrong. Please try again.";
  }
}

// Event listener for Send button
document.getElementById("send-btn").addEventListener("click", async () => {
  const inputField = document.getElementById("chat-input");
  const message = inputField.value.trim();
  if (!message) return;

  addMessageToChat("User", message);
  inputField.value = "";

  // Get chatbot response and display it
  const botResponse = await sendChatMessage(message);
  addMessageToChat("Bot", botResponse);
});

// Allow sending messages with Enter key
document.getElementById("chat-input").addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("send-btn").click();
  }
});

// Helper function to add messages to chat UI
function addMessageToChat(sender, message) {
  const chatLog = document.getElementById("chat-log");
  const messageElem = document.createElement("div");
  messageElem.textContent = `${sender}: ${message}`;
  messageElem.style.marginBottom = "0.5rem";
  chatLog.appendChild(messageElem);
  chatLog.scrollTop = chatLog.scrollHeight; // Auto-scroll to latest message
}

// Biometric Registration Function
async function registerBiometric() {
  const publicKeyOptions = {
    challenge: Uint8Array.from(
      window.crypto.getRandomValues(new Uint8Array(32))
    ), // Generate a random challenge
    rp: { name: "Budget Planner", id: window.location.hostname }, // Ensure correct relying party ID
    user: {
      id: new Uint8Array(16), // A unique user ID (can come from Firebase)
      name: "user@example.com", // Replace with the actual user email/username
      displayName: "User",
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }], // Use ES256 algorithm
    authenticatorSelection: {
      authenticatorAttachment: "platform", // Use built-in biometric sensor
      userVerification: "required",
    },
    timeout: 60000,
    attestation: "none", // Change to "direct" if attestation is needed
  };

  try {
    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions,
    });

    console.log("Biometric registration successful:", credential);
    alert("Biometric registration successful!");

    // TODO: Send `credential` to your backend for verification and storage
  } catch (err) {
    console.error("Biometric registration failed:", err);
    alert("Biometric registration failed. See console for details.");
  }
}

// Biometric Login Function
async function loginBiometric() {
  const publicKeyRequestOptions = {
    challenge: Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32))), // Generate a challenge
    allowCredentials: [], // Let the browser choose the stored credential
    timeout: 60000,
    userVerification: "required",
  };

  try {
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyRequestOptions,
    });

    console.log("Biometric login successful:", assertion);
    alert("Biometric login successful!");

    // TODO: Send `assertion.response` to your backend for verification
  } catch (err) {
    console.error("Biometric login failed:", err);
    alert("Biometric login failed. See console for details.");
  }
}

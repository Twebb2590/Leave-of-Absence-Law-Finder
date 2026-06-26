// -------------------------------
// Load Knowledge Base
// -------------------------------
let knowledgeBase = null;

async function loadKnowledgeBase() {
    const res = await fetch("knowledgeBase.json");
    knowledgeBase = await res.json();
}

await loadKnowledgeBase();

// When chat opens, show welcome message once
chatButton.addEventListener("click", () => {
    chatPopup.style.display = "flex";

    // Only show welcome message if chat is empty
    if (chatWindow.children.length === 0) {
        const welcome = document.createElement("div");
        welcome.className = "bot-message welcome-message";
        welcome.textContent = "Hi there, I’m here to help you understand your leave options. What would you like to explore today?";
        chatWindow.appendChild(welcome);
    }
});

// -------------------------------
// Main Search Function
// -------------------------------
function findAnswer(message, kb, userEmail = null) {
    message = message.toLowerCase();

    // 1. Private user data (if logged in)
    if (userEmail && kb.private.users[userEmail]) {
        const userData = kb.private.users[userEmail];
        for (const [key, value] of Object.entries(userData)) {
            if (message.includes(key.replace(/_/g, " "))) {
                return `${key.replace(/_/g, " ")}: ${value}`;
            }
        }
    }

    // 2. Federal laws
    for (const [key, value] of Object.entries(kb.public.federal)) {
        if (message.includes(key)) return value;
    }

    // 3. State laws
    for (const [state, laws] of Object.entries(kb.public.states)) {
        if (message.includes(state.toLowerCase())) {
            return Object.values(laws).join(" ");
        }
    }

    // 4. Eligibility
    for (const [law, rules] of Object.entries(kb.public.eligibility)) {
        if (message.includes(law)) {
            return Object.values(rules).join(" ");
        }
    }

    // 5. Documentation
    for (const [doc, text] of Object.entries(kb.public.documentation)) {
        if (message.includes(doc.replace(/_/g, " "))) {
            return text;
        }
    }

    // 6. FAQ
    for (const [topic, text] of Object.entries(kb.public.faq)) {
        if (message.includes(topic.replace(/_/g, " "))) {
            return text;
        }
    }

    return "I’m not sure yet, but I’m learning more every day.";
}


// -------------------------------
// Chat UI Handler
// -------------------------------
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const chatWindow = document.getElementById("chatWindow");

function addMessage(text, sender = "bot") {
    const div = document.createElement("div");
    div.className = sender === "bot" ? "bot-message" : "user-message";
    div.textContent = text;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

chatSend.addEventListener("click", handleChat);
chatInput.addEventListener("keypress", e => {
    if (e.key === "Enter") handleChat();
});

function handleChat() {
    const msg = chatInput.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    chatInput.value = "";

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const email = loggedInUser?.email || null;

    const answer = findAnswer(msg, knowledgeBase, email);
    addMessage(answer, "bot");
}

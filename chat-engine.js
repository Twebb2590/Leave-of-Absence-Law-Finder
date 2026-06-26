let convoMemory = {
    lastState: null,
    lastLeaveType: null,
    lastTopic: null,
    lastQuestion: null
};


document.addEventListener("DOMContentLoaded", async () => {

    
    // -------------------------------
    // Load Knowledge Base
    // -------------------------------
    let knowledgeBase = null;

    async function loadKnowledgeBase() {
        const res = await fetch("knowledgeBase.json");
        knowledgeBase = await res.json();
        console.log("Knowledge Base Loaded");
    }

    await loadKnowledgeBase();

    // -------------------------------
    // UI Elements
    // -------------------------------
    const chatInput = document.getElementById("chatInput");
    const chatSend = document.getElementById("chatSend");
    const chatWindow = document.getElementById("chatWindow");
    const typingIndicator = document.getElementById("typingIndicator");
    const chatButton = document.getElementById("chatButton");
    const chatPopup = document.getElementById("chatPopup");
    const closeChat = document.getElementById("closeChat");
    
    // -------------------------------
    // Typing Indicator Helpers
    // -------------------------------
function showTyping() {
    typingIndicator.style.display = "flex";
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function hideTyping() {
    typingIndicator.style.display = "none";
}
  function showSuggestions(list) {
    const container = document.getElementById("suggestions");
    container.innerHTML = "";

    list.forEach(text => {
        const chip = document.createElement("div");
        chip.className = "suggestion-chip";
        chip.textContent = text;
        chip.addEventListener("click", () => {
            chatInput.value = text;
            handleChat();
        });
        container.appendChild(chip);
    });
}  
    // -------------------------------
    // Welcome Message
    // -------------------------------
    chatButton.addEventListener("click", () => {
        chatPopup.style.display = "flex";

        if (chatWindow.children.length === 0) {
            const welcome = document.createElement("div");
            welcome.className = "bot-message welcome-message";
            welcome.textContent =
                "Hi there, I’m here to help you understand your leave options. What would you like to explore today?";
            chatWindow.appendChild(welcome);
        }
    });

    closeChat.addEventListener("click", () => {
        chatPopup.style.display = "none";
    });

function detectState(message) {
    const states = Object.keys(knowledgeBase.public.states);
    message = message.toLowerCase();

    for (const state of states) {
        if (message.includes(state.toLowerCase())) {
            convoMemory.lastState = state;
            return state;
        }
    }
    return convoMemory.lastState; // fallback to memory
}

function detectLeaveType(message) {
    const types = ["fmla", "pfml", "paid family leave", "pregnancy leave", "sick leave", "disability"];
    message = message.toLowerCase();

    for (const type of types) {
        if (message.includes(type)) {
            convoMemory.lastLeaveType = type;
            return type;
        }
    }
    return convoMemory.lastLeaveType; // fallback to memory
}

    
    // -------------------------------
    // Main Search Function
    // -------------------------------
   function findAnswer(message, kb, userEmail = null) {
    if (!kb) return "Still loading my knowledge… try again in a moment.";

    message = message.toLowerCase();
    convoMemory.lastQuestion = message;

    // 1. Detect state + leave type
    const state = detectState(message);
    const leaveType = detectLeaveType(message);

    // 2. Private user data
    if (userEmail && kb.private?.users?.[userEmail]) {
        const userData = kb.private.users[userEmail];
        for (const [key, value] of Object.entries(userData)) {
            if (message.includes(key.replace(/_/g, " "))) {
                convoMemory.lastTopic = "private";
                return `${key.replace(/_/g, " ")}: ${value}`;
            }
        }
    }

    // 3. If user asks about state leave
    if (state && kb.public.states[state]) {
        convoMemory.lastTopic = "state";
        return Object.values(kb.public.states[state]).join(" ");
    }

    // 4. If user asks about eligibility
    if (leaveType && kb.public.eligibility[leaveType]) {
        convoMemory.lastTopic = "eligibility";
        return Object.values(kb.public.eligibility[leaveType]).join(" ");
    }

    // 5. Federal laws
    for (const [key, value] of Object.entries(kb.public.federal)) {
        if (message.includes(key)) {
            convoMemory.lastTopic = "federal";
            return value;
        }
    }

    // 6. Documentation
    for (const [doc, text] of Object.entries(kb.public.documentation)) {
        if (message.includes(doc.replace(/_/g, " "))) {
            convoMemory.lastTopic = "documentation";
            return text;
        }
    }

    // 7. FAQ
    for (const [topic, text] of Object.entries(kb.public.faq)) {
        if (message.includes(topic.replace(/_/g, " "))) {
            convoMemory.lastTopic = "faq";
            return text;
        }
    }

    // 8. If we have memory, use it
    if (convoMemory.lastTopic === "state" && state) {
        return Object.values(kb.public.states[state]).join(" ");
    }

    if (convoMemory.lastTopic === "eligibility" && leaveType) {
        return Object.values(kb.public.eligibility[leaveType]).join(" ");
    }

    // 9. Fallback
    return "I’m not sure yet, but I’m learning more every day. You can ask about eligibility, state laws, documentation, or federal rules.";
}



    // -------------------------------
    // Add Message to UI
    // -------------------------------
    function addMessage(text, sender = "bot") {
        const div = document.createElement("div");
        div.className = sender === "bot" ? "bot-message" : "user-message";
        div.textContent = text;
        chatWindow.appendChild(div);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

showSuggestions([
    "Eligibility requirements",
    "State leave laws",
    "Required documentation",
    "How much time can I take?",
    "Does my job protect me?"
]);

    // -------------------------------
    // Handle Chat Input
    // -------------------------------
    async function handleChat() {
    const msg = chatInput.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    chatInput.value = "";

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const email = loggedInUser?.email || null;

    showTyping();

    // Natural delay (randomized)
    const delay = 600 + Math.random() * 600;
    await new Promise(resolve => setTimeout(resolve, delay));

    hideTyping();

    const answer = findAnswer(msg, knowledgeBase, email);
    addMessage(answer, "bot");
}


    chatSend.addEventListener("click", handleChat);
    chatInput.addEventListener("keypress", e => {
        if (e.key === "Enter") handleChat();
    });

});

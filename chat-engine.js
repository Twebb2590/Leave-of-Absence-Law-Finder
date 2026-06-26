document.addEventListener("DOMContentLoaded", async () => {

function showTyping() {
    typingIndicator.style.display = "flex";
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function hideTyping() {
    typingIndicator.style.display = "none";
}

    
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
    const chatButton = document.getElementById("chatButton");
    const chatPopup = document.getElementById("chatPopup");
    const closeChat = document.getElementById("closeChat");


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
            return state;
        }
    }
    return null;
}

function detectLeaveType(message) {
    const types = ["fmla", "pfml", "paid family leave", "pregnancy leave", "sick leave", "disability"];
    message = message.toLowerCase();

    for (const type of types) {
        if (message.includes(type)) return type;
    }
    return null;
}

    // -------------------------------
    // Main Search Function
    // -------------------------------
   function findAnswer(message, kb, userEmail = null) {
    if (!kb) return "Still loading my knowledge… try again in a moment.";

    message = message.toLowerCase();

    // Auto-detect state
    const detectedState = detectState(message);
    if (detectedState) {
        return Object.values(kb.public.states[detectedState]).join(" ");
    }

    // Auto-detect leave type
    const detectedLeave = detectLeaveType(message);
    if (detectedLeave && kb.public.eligibility[detectedLeave]) {
        return Object.values(kb.public.eligibility[detectedLeave]).join(" ");
    }


        // 1. Private user data
        if (userEmail && kb.private?.users?.[userEmail]) {
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
    // Add Message to UI
    // -------------------------------
    function addMessage(text, sender = "bot") {
        const div = document.createElement("div");
        div.className = sender === "bot" ? "bot-message" : "user-message";
        div.textContent = text;
        chatWindow.appendChild(div);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }


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

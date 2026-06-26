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
    const resetChat = document.getElementById("resetChat");
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

       // 2A. Leave balance questions
const balanceKeywords = [
    "balance", "hours left", "time left", "how much leave",
    "how many hours", "remaining leave", "leave left",
    "pto balance", "vacation balance", "sick balance"
];

if (balanceKeywords.some(k => message.includes(k))) {
    if (userEmail && kb.private?.users?.[userEmail]) {
        const u = kb.private.users[userEmail];

        let response = "Here’s what I found about your leave balances:\n\n";

        if (u.leave_balance_hours !== undefined)
            response += `• Available hours: ${u.leave_balance_hours}\n`;

        if (u.leave_balance_days !== undefined)
            response += `• Available days: ${u.leave_balance_days}\n`;

        if (u.fmla_remaining)
            response += `• FMLA remaining: ${u.fmla_remaining}\n`;

        if (u.state_pfml_remaining)
            response += `• State PFML remaining: ${u.state_pfml_remaining}\n`;

        convoMemory.lastTopic = "leave_balance";
        return response.trim();
    }

    return "I can check your leave balance once you're logged in.";
}

       if (convoMemory.lastTopic === "leave_balance") {
    const u = kb.private?.users?.[userEmail];
    if (u) {
        return `You currently have ${u.leave_balance_hours} hours (${u.leave_balance_days} days) remaining.`;
    }
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
// GENERATE FOLLOW UPS
// -------------------------------
    
function generateFollowUps() {
    const followUps = [];

    // If we know the state
    if (convoMemory.lastState) {
        followUps.push(
            `What are the eligibility rules in ${convoMemory.lastState}?`,
            `Does ${convoMemory.lastState} offer paid leave?`
        );
    }

    // If we know the leave type
    if (convoMemory.lastLeaveType) {
        followUps.push(
            `How much time can I take under ${convoMemory.lastLeaveType}?`,
            `What documentation is required for ${convoMemory.lastLeaveType}?`
        );
    }

    // If the last topic was eligibility
    if (convoMemory.lastTopic === "eligibility") {
        followUps.push(
            "Does my job protect me while I'm on leave?",
            "What happens if I'm not eligible?"
        );
    }

    // If the last topic was documentation
    if (convoMemory.lastTopic === "documentation") {
        followUps.push(
            "How do I submit my paperwork?",
            "What happens if my doctor delays the forms?"
        );
    }

    // If the last topic was federal
    if (convoMemory.lastTopic === "federal") {
        followUps.push(
            "How does FMLA interact with state leave?",
            "Does FMLA protect my job?"
        );
    }

    // If the last topic was state
    if (convoMemory.lastTopic === "state") {
        followUps.push(
            "Does my state offer paid leave?",
            "How does my state leave interact with FMLA?"
        );
    }

    // If the last topic was hours 
if (convoMemory.lastTopic === "leave_balance") {
    followUps.push(
        "How much FMLA have I used?",
        "How much PFML do I have left?",
        "What types of leave can I use?",
        "Does my job protect me while I'm on leave?"
    );
}

    
    // Always include general options
    followUps.push(
        "What else should I know?",
        "Can you summarize my situation?"
    );

    // Remove duplicates
    return [...new Set(followUps)];
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

    const followUpList = generateFollowUps();
    showSuggestions(followUpList);
    }

    chatSend.addEventListener("click", handleChat);
    chatInput.addEventListener("keypress", e => {
        if (e.key === "Enter") handleChat();
    });
   
    // -------------------------------
    // RESET BUTTON
    // -------------------------------
resetChat.addEventListener("click", () => {
    // Clear chat window
    chatWindow.innerHTML = "";

    // Clear suggestions
    const suggestions = document.getElementById("suggestions");
    if (suggestions) suggestions.innerHTML = "";

    // Hide typing indicator
    typingIndicator.style.display = "none";

    // Clear input
    chatInput.value = "";

    // Reset memory
    convoMemory.lastState = null;
    convoMemory.lastLeaveType = null;
    convoMemory.lastTopic = null;
    convoMemory.lastQuestion = null;

    // Replay welcome message
    const welcome = document.createElement("div");
    welcome.className = "bot-message welcome-message";
    welcome.textContent =
        "Let's start fresh. What would you like to explore today?";
    chatWindow.appendChild(welcome);

    chatWindow.scrollTop = chatWindow.scrollHeight;
});

    
});

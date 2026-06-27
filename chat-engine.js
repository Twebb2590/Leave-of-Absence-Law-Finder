let convoMemory = {
    state: null,
    leaveType: null,
    lastTopic: null
};

// Only store memory when the user explicitly mentions something
function updateMemory({ state, leaveType, topic }) {
    if (state) convoMemory.state = state;
    if (leaveType) convoMemory.leaveType = leaveType;
    if (topic) convoMemory.lastTopic = topic;
}

// Only detect state when the user actually types a state
function detectState(message, kb) {
    const states = Object.keys(kb.public.states);
    const msg = message.toLowerCase();

    for (const st of states) {
        if (msg.includes(st.toLowerCase())) {
            updateMemory({ state: st });
            return st;
        }
    }
    return null;
}

// Only detect leave type when explicitly mentioned
function detectLeaveType(message) {
    const types = ["fmla", "pfml", "pregnancy", "sick", "disability"];
    const msg = message.toLowerCase();

    for (const t of types) {
        if (msg.includes(t)) {
            updateMemory({ leaveType: t });
            return t;
        }
    }
    return null;
}



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
    container.style.maxHeight = "48px";


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

    // Normalize email
    const email = userEmail?.trim()?.toLowerCase() || null;
    const userRecord = kb?.private?.users?.[email] || null;

    // Detect state + leave type
    const state = detectState(message);
    const leaveType = detectLeaveType(message);

    // -----------------------------------------
    // 1. PRIVATE USER DATA (direct field lookup)
    // -----------------------------------------
    if (userRecord) {
        for (const [key, value] of Object.entries(userRecord)) {
            const cleanedKey = key.replace(/_/g, " ");
            if (message.includes(cleanedKey)) {
                convoMemory.lastTopic = "private";
                return `${cleanedKey}: ${value}`;
            }
        }
    }

    // -----------------------------------------
    // 2. "HOW MUCH TIME CAN I TAKE?"
    // -----------------------------------------
    if (message.includes("how much time can i take")) {

        // If user has a leave type
        if (userRecord?.leave_type) {
            convoMemory.lastTopic = "duration";

            const lt = userRecord.leave_type.toLowerCase();

            if (lt.includes("fmla")) {
                return "Under FMLA, eligible employees can take up to 12 weeks of job‑protected leave in a 12‑month period.";
            }

            if (lt.includes("ada")) {
                return "ADA leave has no fixed duration. It must be reasonable and based on medical need.";
            }
        }

        // If leave type detected from message
        if (leaveType && kb.public.eligibility[leaveType]) {
            convoMemory.lastTopic = "duration";
            return `Most employees can take up to 12 weeks under ${leaveType.toUpperCase()}.`;
        }

        // If state detected
        if (state && kb.public.states[state]) {
            convoMemory.lastTopic = "duration";
            return `In ${state}, leave duration depends on the program:\n\n${Object.values(kb.public.states[state]).join(" ")}`;
        }

        // Default general answer
        return "Most employees can take up to 12 weeks of job‑protected leave under FMLA. Some states offer additional paid leave depending on where you live.";
    }

    // -----------------------------------------
    // 3. LEAVE BALANCE QUESTIONS
    // -----------------------------------------
    const balanceKeywords = [
        "balance", "hours left", "time left", "how many hours",
        "remaining leave", "leave left", "pto balance",
        "vacation balance", "sick balance"
    ];

    if (balanceKeywords.some(k => message.includes(k))) {
        if (userRecord) {
            let response = "Here’s what I found about your leave balances:\n\n";

            if (userRecord.leave_balance_hours !== undefined)
                response += `• Available hours: ${userRecord.leave_balance_hours}\n`;

            if (userRecord.leave_balance_days !== undefined)
                response += `• Available days: ${userRecord.leave_balance_days}\n`;

            if (userRecord.fmla_remaining)
                response += `• FMLA remaining: ${userRecord.fmla_remaining}\n`;

            if (userRecord.state_pfml_remaining)
                response += `• State PFML remaining: ${userRecord.state_pfml_remaining}\n`;

            convoMemory.lastTopic = "leave_balance";
            return response.trim();
        }

        return "I can check your leave balance once you're logged in.";
    }

    // Fallback for follow‑ups like “How much is left?”
    if (convoMemory.lastTopic === "leave_balance" && userRecord) {
        return `You currently have ${userRecord.leave_balance_hours} hours (${userRecord.leave_balance_days} days) remaining.`;
    }

    // -----------------------------------------
    // 4. STATE LEAVE
    // -----------------------------------------
 // if (convoMemory.lastTopic === "state" && state) {
//     return Object.values(kb.public.states[state]).join(" ");
// }

    // -----------------------------------------
    // 5. ELIGIBILITY
    // -----------------------------------------
   // if (convoMemory.lastTopic === "eligibility" && leaveType) {
//     return Object.values(kb.public.eligibility[leaveType]).join(" ");
// }

    // -----------------------------------------
    // 6. FEDERAL LAWS
    // -----------------------------------------
    for (const [key, value] of Object.entries(kb.public.federal)) {
        if (message.includes(key)) {
            convoMemory.lastTopic = "federal";
            return value;
        }
    }

    // -----------------------------------------
    // 7. DOCUMENTATION
    // -----------------------------------------
    for (const [doc, text] of Object.entries(kb.public.documentation)) {
        if (message.includes(doc.replace(/_/g, " "))) {
            convoMemory.lastTopic = "documentation";
            return text;
        }
    }

    // -----------------------------------------
    // 8. FAQ
    // -----------------------------------------
    for (const [topic, text] of Object.entries(kb.public.faq)) {
        if (message.includes(topic.replace(/_/g, " "))) {
            convoMemory.lastTopic = "faq";
            return text;
        }
    }

    // -----------------------------------------
    // 9. MEMORY FALLBACKS
    // -----------------------------------------
    if (convoMemory.lastTopic === "state" && state) {
        return Object.values(kb.public.states[state]).join(" ");
    }

    if (convoMemory.lastTopic === "eligibility" && leaveType) {
        return Object.values(kb.public.eligibility[leaveType]).join(" ");
    }

    // -----------------------------------------
    // 10. FINAL FALLBACK
    // -----------------------------------------
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
    const email = loggedInUser?.email?.trim().toLowerCase() || null;


    showTyping();

    // Natural delay (randomized)
    const delay = 600 + Math.random() * 600;
    await new Promise(resolve => setTimeout(resolve, delay));

    hideTyping();

// -----------------------------------------
// SUGGESTION CHIP ROUTER (explicit answers)
// -----------------------------------------
let answerOverride = null;

switch (msg.toLowerCase()) {
    case "eligibility requirements":
        answerOverride = Object.values(knowledgeBase.public.eligibility.fmla).join(" ");
        break;

    case "state leave laws":
        answerOverride = "Tell me your state (like PA, CA, NY) and I’ll explain your state leave programs.";
        break;

    case "required documentation":
        answerOverride = Object.values(knowledgeBase.public.documentation).join(" ");
        break;

    case "how much time can i take?":
        answerOverride = "Most employees can take up to 12 weeks of job‑protected leave under FMLA. Some states offer additional paid leave depending on where you live.";
        break;

    case "does my job protect me?":
        answerOverride = knowledgeBase.public.faq.job_protection;
        break;
}

// If a chip matched, skip findAnswer
if (answerOverride) {
    addMessage(answerOverride, "bot");
    const followUpList = generateFollowUps();
    showSuggestions(followUpList);
    return;
}

        
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

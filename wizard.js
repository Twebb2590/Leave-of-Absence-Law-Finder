// -----------------------------
// Chat Rendering Helpers
// -----------------------------

function addBotMessage(text) {
    const chat = document.getElementById("chat");
    const msg = document.createElement("div");
    msg.className = "message bot-message";
    msg.textContent = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

function addUserMessage(text) {
    const chat = document.getElementById("chat");
    const msg = document.createElement("div");
    msg.className = "message user-message";
    msg.textContent = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

// Natural-sounding bot phrasing
function naturalize(text) {
    const variants = [
        text,
        `Got it — ${text}`,
        `Okay, let’s walk through that. ${text}`,
        `Thanks for sharing. ${text}`,
        `Alright, here’s what that means. ${text}`
    ];
    return variants[Math.floor(Math.random() * variants.length)];
}

// Delay to simulate typing
function botSay(text, delay = 350) {
    setTimeout(() => addBotMessage(naturalize(text)), delay);
}

// -----------------------------
// Wizard Logic
// -----------------------------

let currentStep = 0;

const steps = [
    {
        id: "reason",
        question: "What’s the main reason you're looking into leave right now?",
        options: [
            "My own health condition",
            "A family member’s health condition",
            "Bonding with a new child",
            "Military-related leave",
            "Something else"
        ]
    },
    {
        id: "employment",
        question: "Got it. What’s your employment situation?",
        options: [
            "Full-time",
            "Part-time",
            "Seasonal",
            "I’m not sure"
        ]
    },
    {
        id: "location",
        question: "Which state do you work in?",
        options: [
            "California",
            "New York",
            "Pennsylvania",
            "Other"
        ]
    }
];

// Render a step
function renderStep(stepIndex) {
    const step = steps[stepIndex];
    const container = document.getElementById("wizard");

    container.innerHTML = "";

    addBotMessage(step.question);

    step.options.forEach(option => {
        const btn = document.createElement("button");
        btn.className = "wizard-btn";
        btn.textContent = option;

        btn.onclick = () => {
            addUserMessage(option);     // <-- user answer appears in chat
            nextStep();
        };

        container.appendChild(btn);
    });
}

function nextStep() {
    currentStep++;

    if (currentStep < steps.length) {
        renderStep(currentStep);
    } else {
        finishWizard();
    }
}

function finishWizard() {
    botSay("Thanks — based on what you shared, here are the leave laws that may apply to you.");
    // Your existing results logic stays here
}

// Start wizard
document.addEventListener("DOMContentLoaded", () => {
    renderStep(0);
});

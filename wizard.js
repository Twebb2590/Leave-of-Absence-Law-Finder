// ------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------
const chatContainer = document.getElementById("chatContainer");
const quickRepliesContainer = document.getElementById("quickRepliesContainer");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// ------------------------------------------------------
// WIZARD STATE
// ------------------------------------------------------
const wizardState = {
  reason: null,
  state: null,
  employmentStatus: null,
};

// ------------------------------------------------------
// CHAT HELPERS
// ------------------------------------------------------
function scrollChat() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function userReply(text) {
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble user";
  bubble.textContent = text;
  chatContainer.appendChild(bubble);
  scrollChat();
}

async function assistantReply(text) {
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble assistant";

  // typing effect
  let i = 0;
  const speed = 12 + Math.random() * 20;

  function type() {
    if (i < text.length) {
      bubble.textContent += text.charAt(i);
      i++;
      scrollChat();
      setTimeout(type, speed);
    }
  }

  chatContainer.appendChild(bubble);
  type();
}

// ------------------------------------------------------
// QUICK REPLIES
// ------------------------------------------------------
function clearQuickReplies() {
  quickRepliesContainer.innerHTML = "";
}

function setQuickReplies(list) {
  clearQuickReplies();

  list.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "quick-reply";
    btn.textContent = item.label;

    btn.addEventListener("click", () => {
      clearQuickReplies();
      userReply(item.label);
      handleUserTypedMessage(item.value);
    });

    quickRepliesContainer.appendChild(btn);
  });
}

// ------------------------------------------------------
// LAW RENDERING
// ------------------------------------------------------
function lawToChatText(law) {
  return `
📘 ${law.title}
Level: ${law.level}
State: ${law.state}
Tags: ${(law.tags || []).join(", ")}

${law.description}

Source: ${law.link}
  `;
}

function sendLawsToChat(laws) {
  laws.forEach((law) => assistantReply(lawToChatText(law)));
}

// ------------------------------------------------------
// LOAD LAWS
// ------------------------------------------------------
async function loadFederalLaws() {
  try {
    const res = await fetch(`./federal/laws.json`);
    if (!res.ok) throw new Error("Failed to load federal laws");
    const data = await res.json();

    return data.map((law) => ({
      id: law.id,
      title: law.name,
      level: "Federal",
      state: "US",
      description: law.description,
      link: law.official_url,
      tags: law.tags || [],
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function loadStateLaws(stateCode) {
  if (!stateCode) return [];
  try {
    const res = await fetch(`./states/${stateCode}/laws.json`);
    if (!res.ok) throw new Error("Failed to load state laws");
    const data = await res.json();

    return data.map((law) => ({
      id: law.id,
      title: law.name,
      level: "State",
      state: stateCode,
      description: law.description,
      link: law.official_url,
      tags: law.tags || [],
    }));
  } catch (e) {
    console.error(`State law load failed for ${stateCode}:`, e);
    return [];
  }
}

// ------------------------------------------------------
// ELIGIBILITY CHECK
// ------------------------------------------------------
function checkEligibility(law, state) {
  return true; // placeholder — your logic can go here
}

// ------------------------------------------------------
// MAIN WIZARD LOGIC
// ------------------------------------------------------
async function handleUserTypedMessage(text) {
  userReply(text);

  // STEP 1 — REASON
  if (!wizardState.reason) {
    wizardState.reason = text;
    await assistantReply("Got it. What state do you work in?");
    return;
  }

  // STEP 2 — STATE
  if (!wizardState.state) {
    wizardState.state = text.toUpperCase();
    await assistantReply("Thanks. Are you full‑time or part‑time?");
    return;
  }

  // STEP 3 — EMPLOYMENT STATUS
  if (!wizardState.employmentStatus) {
    wizardState.employmentStatus = text;
    await runLawSearch();
    return;
  }
}

// ------------------------------------------------------
// SEARCH + DISPLAY LAWS
// ------------------------------------------------------
async function runLawSearch() {
  const { reason, state } = wizardState;

  const federal = await loadFederalLaws();
  const stateLaws = await loadStateLaws(state);

  const all = [...federal, ...stateLaws];

  const filtered = all.filter((law) => {
    const tags = law.tags.map((t) => t.toLowerCase());

    if (reason === "sick")
      return tags.some((t) => t.includes("sick") || t.includes("medical"));

    if (reason === "pregnancy")
      return tags.some((t) => t.includes("pregnancy") || t.includes("birth"));

    if (reason === "family_care")
      return tags.some((t) => t.includes("family") || t.includes("care"));

    if (reason === "bereavement")
      return tags.some((t) => t.includes("bereavement") || t.includes("funeral"));

    if (reason === "military")
      return tags.some((t) => t.includes("military") || t.includes("service"));

    if (reason === "court")
      return tags.some((t) => t.includes("jury") || t.includes("court"));

    return true;
  });

  if (!filtered.length) {
    await assistantReply(
      "I wasn’t able to find specific laws that match your situation. You can still explore more using the filters below."
    );
    return;
  }

  await assistantReply(
    `I found ${filtered.length} laws that may apply. Here are the top results:`
  );

  sendLawsToChat(filtered.slice(0, 3));

  // Dispatch event for UI
  const event = new CustomEvent("wizardResults", {
    detail: { laws: filtered, wizardState: { ...wizardState } },
  });
  window.dispatchEvent(event);
}

// ------------------------------------------------------
// RESET
// ------------------------------------------------------
function resetWizard() {
  chatContainer.innerHTML = "";
  clearQuickReplies();
  wizardState.reason = null;
  wizardState.state = null;
  wizardState.employmentStatus = null;
  startWizard();
}

// ------------------------------------------------------
// START WIZARD
// ------------------------------------------------------
async function startWizard() {
  chatContainer.innerHTML = "";
  clearQuickReplies();

  await assistantReply(
    "Hi. I’m here to help you understand your leave options. What’s the main reason you’re looking into leave right now?"
  );

  setQuickReplies([
    { label: "I'm sick or injured", value: "sick" },
    { label: "Pregnancy or birth", value: "pregnancy" },
    { label: "Caring for a family member", value: "family_care" },
    { label: "Bereavement or loss", value: "bereavement" },
    { label: "Military service", value: "military" },
    { label: "Court or jury duty", value: "court" },
    { label: "Something else", value: "other" },
  ]);
}

// ------------------------------------------------------
// DOM LISTENERS
// ------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  startWizard();

  if (sendBtn && userInput) {
    sendBtn.addEventListener("click", () => {
      const text = userInput.value.trim();
      if (!text) return;
      handleUserTypedMessage(text);
      userInput.value = "";
    });

    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendBtn.click();
      }
    });
  }
});

document.getElementById("startOverBtn")?.addEventListener("click", resetWizard);

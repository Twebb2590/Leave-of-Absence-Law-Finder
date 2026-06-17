// wizard.js
import { createChatBubble } from './components/ChatBubble.js';
import { createQuickReply } from './components/QuickReply.js';
import { loadFederalLaws, loadStateLaws } from './data-loader.js';
import { states } from "./states/state-list.js";

// ------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------
const chatContainer = document.getElementById('chatContainer');
const quickRepliesContainer = document.getElementById('quickRepliesContainer');
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// ------------------------------------------------------
// WIZARD STATE
// ------------------------------------------------------
let wizardState = {
  reason: null,
  state: null,
  employmentStatus: null,
};

// Add a message to the chat
function addMessage(text, from = 'assistant') {
  const bubble = createChatBubble({ text, from });
  chatContainer.appendChild(bubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Quick reply buttons
function setQuickReplies(options) {
  quickRepliesContainer.innerHTML = '';
  options.forEach((opt) => {
    const btn = createQuickReply(opt.label, opt.value, handleQuickReply);
    quickRepliesContainer.appendChild(btn);
  });
}

// ------------------------------------------------------
// LAW RENDERING
// ------------------------------------------------------
function lawToChatText(law) {
  return `
📘 ${law.title || "Untitled Law"}
Level: ${law.level || "N/A"}
State: ${law.state || "N/A"}
Tags: ${(law.tags || []).join(", ")}

${law.description || ""}

Source: ${law.link || "N/A"}
  `;
}

// Send multiple laws to chat
async function sendLawsToChat(laws) {
  for (const law of laws) {
    await assistantReply(lawToChatText(law));
  }
}

// Typed‑input mapping
function mapTypedReason(text) {
  text = text.toLowerCase();
  if (text.includes("sick") || text.includes("ill")) return "sick";
  if (text.includes("preg")) return "pregnancy";
  if (text.includes("family")) return "family_care";
  if (text.includes("military")) return "military";
  if (text.includes("court") || text.includes("jury")) return "court";
  if (text.includes("bereav")) return "bereavement";
  return "other";
}

function mapTypedState(text) {
  const lower = text.toLowerCase();
  const match = states.find(
    s =>
      lower.includes(s.name.toLowerCase()) ||
      lower.includes(s.code.toLowerCase())
  );
  return match ? match.code : "unknown";
}

function mapTypedEmployment(text) {
  text = text.toLowerCase();
  if (text.includes("full")) return "Full-time";
  if (text.includes("part")) return "Part-time";
  if (text.includes("self")) return "Self-employed";
  return "I'm in between jobs right now.";
}

function addUserMessage(text) {
  const bubble = createChatBubble({ text, from: "user" });
  chatContainer.appendChild(bubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Typing indicator
function showTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.id = "typingIndicator";
  indicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  chatContainer.appendChild(indicator);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}
function clearChat() {
  const chat = document.getElementById("chatContainer");
  if (chat) chat.innerHTML = "";
}

// Assistant reply with randomized delay
async function assistantReply(text, min = 400, max = 1600) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  showTypingIndicator();
  await new Promise(resolve => setTimeout(resolve, delay));
  hideTypingIndicator();
  addMessage(text, 'assistant');
}

// Assistant reply in chunks
async function assistantReplyChunks(chunks, min = 400, max = 1200) {
  for (const chunk of chunks) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    showTypingIndicator();
    await new Promise(resolve => setTimeout(resolve, delay));
    hideTypingIndicator();
    addMessage(chunk, 'assistant');
  }
}

// Handle quick replies
async function handleQuickReply(value) {
  if (!wizardState.reason) {
    wizardState.reason = value;
    addMessage(value, 'user');
    return askState();
  }

  if (!wizardState.state) {
    wizardState.state = value;
    addMessage(value, 'user');
    return askEmploymentStatus();
  }

  if (!wizardState.employmentStatus) {
    wizardState.employmentStatus = value;
    addMessage(value, 'user');
    return showResultsSummary();
  }
}

// Handle typed messages
async function handleUserTypedMessage(text) {
  addUserMessage(text);

  if (!wizardState.reason) {
    wizardState.reason = mapTypedReason(text);
    return askState();
  }

  if (!wizardState.state) {
    wizardState.state = mapTypedState(text);
    return askEmploymentStatus();
  }

  if (!wizardState.employmentStatus) {
    wizardState.employmentStatus = mapTypedEmployment(text);
    return showResultsSummary();
  }

  return answerGeneralQuestion(text);
}

// General fallback answers
async function answerGeneralQuestion(text) {
  const lower = text.toLowerCase();

  if (lower.includes("eligible") || lower.includes("qualify")) {
    return assistantReply(
      "Eligibility depends on your reason for leave, your state, and your employment status. You can restart the wizard anytime to check again."
    );
  }

  if (lower.includes("restart")) {
    startWizard();
    return;
  }

  return assistantReply(
    "I’m here to help with leave laws. You can ask things like:\n• Do I qualify for FMLA?\n• What leave laws apply in California?\n• Is pregnancy leave paid?"
  );
}
function resetWizard() {
  // Reset state
  wizardState = {
    step: "state",
    state: null,
    reason: null,
    employmentStatus: null,
    employerSize: null,
    tenure: null
  };

  // Clear UI
  clearChat();
  clearQuickReplies();

  function clearQuickReplies() {
  const container = document.getElementById("quickRepliesContainer");
  if (container) container.innerHTML = "";
}

  // Restart wizard
  startWizard();
}

// Start wizard
async function startWizard() {
  chatContainer.innerHTML = '';
  quickRepliesContainer.innerHTML = '';
  wizardState.reason = null;
  wizardState.state = null;
  wizardState.employmentStatus = null;

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
    { label: "Something else", value: "other" }
  ]);
}

// STEP 1 — REASON
async function askState() {
  await assistantReply(
    "Thank you for sharing that. Which state do you work in? This helps me find the right laws."
  );

  setQuickReplies(
    states.map((s) => ({ label: s.name, value: s.code })).concat([
      { label: "I’m not sure", value: "unknown" },
    ])
  );
}

// STEP 3 — EMPLOYMENT STATUS
async function askEmploymentStatus() {
  await assistantReply(
    "Got it. One more thing—are you working full-time or part-time?"
  );

  setQuickReplies([
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Part-time', value: 'Part-time' },
    { label: "I'm not sure", value: "I'm between jobs." },
  ]);
}

// ------------------------------------------------------
// ELIGIBILITY CHECK
// ------------------------------------------------------
function checkEligibility(law, wizardState) {
  const result = { eligible: true, reasons: [] };
  const e = law.eligibility || {};

  if (e.employer_size && e.employer_size.includes("50+") && wizardState.employmentStatus === "Part-time") {
    result.eligible = false;
    result.reasons.push("Employer must have 50+ employees within 75 miles.");
  }

  if (e.employee_tenure && e.employee_tenure.includes("12 months")) {
    result.reasons.push("Requires 12 months of employment.");
  }

  if (e.hours_worked && e.hours_worked.includes("1,250")) {
    result.reasons.push("Requires 1,250 hours worked in the past 12 months.");
  }

  if (e.relationship_requirement) {
    result.reasons.push(e.relationship_requirement);
  }

  return result;
}
function autoTagLaw(law) {
  const text = (
    law.name + " " +
    law.description + " " +
    JSON.stringify(law.leave_types || [])
  ).toLowerCase();

  const tags = new Set();

  // Pregnancy / birth
  if (text.includes("pregnan") || text.includes("childbirth") || text.includes("maternity"))
    tags.add("pregnancy");

  // Medical / health
  if (text.includes("medical") || text.includes("health") || text.includes("illness") || text.includes("injury"))
    tags.add("medical");

  // Family / caregiving
  if (text.includes("family") || text.includes("care") || text.includes("parent") || text.includes("spouse"))
    tags.add("family").add("caregiving");

  // Military
  if (text.includes("military") || text.includes("active duty") || text.includes("deployment"))
    tags.add("military");

  // Domestic violence / safe leave
  if (text.includes("domestic") || text.includes("violence") || text.includes("assault") || text.includes("stalking"))
    tags.add("domestic_violence").add("safe_leave");

  // Bereavement
  if (text.includes("bereav") || text.includes("death"))
    tags.add("bereavement");

  // Jury duty
  if (text.includes("jury") || text.includes("court"))
    tags.add("jury");

  // Voting
  if (text.includes("vot") || text.includes("election"))
    tags.add("voting");

  // Organ donation
  if (text.includes("organ") || text.includes("bone marrow"))
    tags.add("organ_donation");

  // Public employees
  if (text.includes("public employee") || text.includes("state employee"))
    tags.add("public_employees");

  return Array.from(tags);
}

// Show results summary
async function showResultsSummary() {
  await assistantReplyChunks([
    "Thank you.",
    "I’m pulling together federal and state leave laws that may apply.",
    "One moment while I check your state and situation."
  ]);
  
  const stateCode = wizardState.state === 'unknown' ? null : wizardState.state;
 
  // ⭐ Load federal laws
  const federalLaws = await loadFederalLaws();
  
   // ⭐ Load state laws
  const stateLaws = await loadStateLaws(stateCode);
  
  // Combine federal + state laws
  const combined = [...federalLaws, ...stateLaws];

  // Auto-tag every law
  combined.forEach(law => {
    law.tags = autoTagLaw(law);
  });

const reasonTag = wizardState.reason.toLowerCase();

  // Filter using auto-generated tags
  let filtered = combined.filter(law =>
    law.tags.some(tag => tag.includes(reasonTag))
  );

// If nothing matches, fallback to all laws
  if (!filtered.length) {
    await assistantReply("I didn’t find a perfect match, but here are the closest laws.");
    filtered = combined;
  }

  await assistantReply(`I found ${filtered.length} leave laws that may apply to your situation. Here are the most relevant ones:`);

   // Show top 3
  await sendLawsToChat(filtered.slice(0, 3));

  // Dispatch event for UI
  const event = new CustomEvent("wizardComplete", { detail: { laws: filtered } });
  window.dispatchEvent(event);
}

// DOM listeners
document.addEventListener("DOMContentLoaded", () => {
  startWizard();

  if (sendBtn && userInput) {
    sendBtn.addEventListener("click", () => {
      const text = userInput.value.trim();
      if (!text) return;
      handleUserTypedMessage(text);
      userInput.value = "";
    });
// ⭐ Send message when pressing Enter
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendBtn.click();
      }
    });
  }
});
// ------------------------------------------------------
// Start Over Button
// ------------------------------------------------------
document.getElementById("startOverBtn")?.addEventListener("click", () => {
  resetWizard();
});

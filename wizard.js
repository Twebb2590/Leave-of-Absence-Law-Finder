// wizard.js
import { createQuickReply } from './components/QuickReply.js';
import { createChatLawCard } from './components/ChatLawCard.js';
import { loadFederalLaws, loadStateLaws } from './data-loader.js';
import { states } from "./states/state-list.js";

// ------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const quickRepliesContainer = document.getElementById('quickRepliesContainer');

// ------------------------------------------------------
// NEW COPILOT‑STYLE UI HELPERS
// ------------------------------------------------------
function scrollToBottom() {
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth"
  });
}

function createBubbleElement(text, from = "assistant") {
  const bubble = document.createElement("div");
  bubble.className = `msg-bubble ${from}`;
  bubble.innerHTML = text;
  return bubble;
}

function createBubbleWithElement(element, from = "assistant") {
  const wrapper = document.createElement("div");
  wrapper.className = `msg-bubble ${from}`;
  wrapper.appendChild(element);
  return wrapper;
}

function addMessage(text, from = "assistant") {
  const bubble = createBubbleElement(text, from);
  chatContainer.appendChild(bubble);
  scrollToBottom();
}

function addUserMessage(text) {
  const bubble = createBubbleElement(text, "user");
  chatContainer.appendChild(bubble);
  scrollToBottom();
}

// ------------------------------------------------------
// TYPING INDICATOR
// ------------------------------------------------------
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
  scrollToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

// ------------------------------------------------------
// ASSISTANT REPLIES
// ------------------------------------------------------
async function assistantReply(text, min = 600, max = 2600) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  showTypingIndicator();
  await new Promise(resolve => setTimeout(resolve, delay));
  hideTypingIndicator();
  addMessage(text, 'assistant');
}

async function assistantReplyChunks(chunks, min = 1000, max = 2200) {
  for (const chunk of chunks) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    showTypingIndicator();
    await new Promise(resolve => setTimeout(resolve, delay));
    hideTypingIndicator();
    addMessage(chunk, 'assistant');
  }
}

// ------------------------------------------------------
// QUICK REPLIES
// ------------------------------------------------------
function setQuickReplies(options) {
  quickRepliesContainer.innerHTML = '';
  options.forEach((opt) => {
    const btn = createQuickReply(opt.label, opt.value, handleQuickReply);
    quickRepliesContainer.appendChild(btn);
  });
}

// ------------------------------------------------------
// WIZARD STATE
// ------------------------------------------------------
let wizardState = {
  reason: null,
  state: null,
  employmentStatus: null,
  awaitingEmail: false
};

// ------------------------------------------------------
// MAPPING FUNCTIONS
// ------------------------------------------------------
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

// ------------------------------------------------------
// MAIN WIZARD FLOW
// ------------------------------------------------------
async function advanceWizard(value, fromUser = true) {
  if (fromUser) addUserMessage(value);

  if (!wizardState.reason) {
    wizardState.reason = mapTypedReason(value);
    return askState();
  }

  if (!wizardState.state) {
    wizardState.state = mapTypedState(value);
    return askEmploymentStatus();
  }

  if (!wizardState.employmentStatus) {
    wizardState.employmentStatus = mapTypedEmployment(value);
    return showResultsSummary();
  }

  if (wizardState.awaitingEmail) {
    wizardState.awaitingEmail = false;
    assistantReply(`Perfect — sending your PDF to ${value}.`);
    sendChatToEmail(value);
    return;
  }

  if (value.toLowerCase().includes("yes")) {
    wizardState.awaitingEmail = true;
    return assistantReply("Great! What email address should I send it to?");
  }

  if (value.toLowerCase().includes("no")) {
    return assistantReply("Okay! Let me know if you need anything else.");
  }

  quickRepliesContainer.innerHTML = "";
  return answerGeneralQuestion(value);
}

function handleQuickReply(value) {
  advanceWizard(value, true);
}

function handleUserTypedMessage(text) {
  advanceWizard(text, true);
}

// ------------------------------------------------------
// GENERAL Q&A
// ------------------------------------------------------
async function answerGeneralQuestion(text) {
  const lower = text.toLowerCase();

  if (lower.includes("eligible") || lower.includes("qualify")) {
    return assistantReply(
      "Eligibility depends on your reason for leave, your state, and your employment status. You can restart the chat anytime to check again."
    );
  }

  if (lower.includes("restart")) {
    startWizard();
    return;
  }

  return assistantReplyChunks([
    "I’m here to help with leave laws. You can ask things like:",
    "\n• Do I qualify for FMLA?",
    "\n• What leave laws apply in California?",
    "\n• Is pregnancy leave paid?"
  ]);
}

// ------------------------------------------------------
// EMAIL SENDING
// ------------------------------------------------------
async function sendChatToEmail(email) {
  const chatHtml = chatContainer.innerHTML;

  try {
    const response = await fetch("https://leave-of-absence-law-finder.onrender.com/send-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, chatHtml })
    });

    if (!response.ok) throw new Error("Server error");

    await assistantReply("Your PDF is on the way!");
  } catch (err) {
    console.error(err);
    await assistantReply("Hmm… I couldn’t send the email. Try again in a moment.");
  }
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

// ------------------------------------------------------
// AUTO‑TAGGER
// ------------------------------------------------------
function autoTagLaw(law) {
  const text = (
    (law.title || "") + " " +
    (law.description || "") + " " +
    JSON.stringify(law.leave_types || [])
  ).toLowerCase();

  const tags = new Set();

  if (text.includes("pregnan") || text.includes("childbirth") || text.includes("maternity") || text.includes("birth"))
    tags.add("pregnancy");

  if (text.includes("sick leave") || text.includes("medical leave") || text.includes("illness"))
    tags.add("medical");

  if (text.includes("family leave") || text.includes("care for") || text.includes("family member"))
    tags.add("family_care");

  if (text.includes("military") || text.includes("active duty"))
    tags.add("military");

  if (text.includes("domestic violence") || text.includes("sexual assault"))
    tags.add("domestic_violence");

  if (text.includes("bereav"))
    tags.add("bereavement");

  if (text.includes("jury"))
    tags.add("jury");

  if (text.includes("voting"))
    tags.add("voting");

  if (text.includes("organ donation"))
    tags.add("organ_donation");

  return Array.from(tags);
}

// ------------------------------------------------------
// TAG MATCHING
// ------------------------------------------------------
function getMatchingTagsForReason(reason) {
  switch (reason) {
    case "sick": return ["medical"];
    case "pregnancy": return ["pregnancy", "medical"];
    case "family_care": return ["family_care"];
    case "military": return ["military"];
    case "court": return ["jury"];
    case "bereavement": return ["bereavement"];
    default: return [];
  }
}

// ------------------------------------------------------
// SEND LAWS TO CHAT (COPILOT BUBBLES)
// ------------------------------------------------------
async function sendLawsToChat(laws) {
  for (const law of laws) {
    const eligibility = checkEligibility(law, wizardState);
    const card = createChatLawCard(law, eligibility);

    const bubble = createBubbleWithElement(card, "assistant");
    chatContainer.appendChild(bubble);
    scrollToBottom();

    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

// ------------------------------------------------------
// RESULTS SUMMARY
// ------------------------------------------------------
async function showResultsSummary() {
  await assistantReplyChunks([
    "Thank you.",
    "I’m pulling together federal and state leave laws that may apply.",
    "One moment while I check your state and situation."
  ]);

  const stateCode = wizardState.state === 'unknown' ? null : wizardState.state;

  const federalLaws = await loadFederalLaws();
  const stateLaws = await loadStateLaws(stateCode);

  const combined = [...federalLaws, ...stateLaws];

  combined.forEach(law => {
    law.tags = autoTagLaw(law);
  });

  const matchingTags = getMatchingTagsForReason(wizardState.reason);

  let filtered = combined.filter(law =>
    law.tags.some(tag => matchingTags.includes(tag))
  );

  if (!filtered.length) {
    await assistantReply("I didn’t find a perfect match, but here are the closest laws.");
    filtered = combined;
  }

  await assistantReply(`I found ${filtered.length} leave laws that may apply to your situation. Here are the most relevant ones:`);

  await sendLawsToChat(filtered.slice(0, 6));

  await assistantReply("Would you like a PDF copy of this conversation emailed to you?");

  setQuickReplies([
    { label: "Yes, email it to me", value: "email_yes" },
    { label: "No, thanks", value: "email_no" }
  ]);

  const event = new CustomEvent("wizardComplete", { detail: { laws: filtered } });
  window.dispatchEvent(event);
}

// ------------------------------------------------------
// START WIZARD
// ------------------------------------------------------
async function startWizard() {
  chatContainer.innerHTML = '';
  quickRepliesContainer.innerHTML = '';
  wizardState = { reason: null, state: null, employmentStatus: null, awaitingEmail: false };

  await assistantReplyChunks([
    "Hi. I’m here to help you understand your leave options.",
    "What’s the main reason you’re looking into leave right now?"
  ]);

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

async function askState() {
  await assistantReplyChunks([
    "Thank you for sharing that.",
    "Which state do you work in? This helps me find the right laws."
  ]);
}

async function askEmploymentStatus() {
  await assistantReplyChunks([
    "Got it. One more thing:",
    "Are you working full-time or part-time?"
  ]);

  setQuickReplies([
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Part-time', value: 'Part-time' },
    { label: "I'm not sure", value: "I'm between jobs." },
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

// ------------------------------------------------------
// START OVER BUTTON
// ------------------------------------------------------
document.getElementById("startOverBtn")?.addEventListener("click", () => {
  startWizard();
});

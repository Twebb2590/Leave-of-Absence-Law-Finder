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

// ------------------------------------------------------
// UI HELPERS
// ------------------------------------------------------
function addMessage(text, from = 'assistant') {
  const bubble = createChatBubble({ text, from });
  chatContainer.appendChild(bubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addUserMessage(text) {
  const bubble = createChatBubble({ text, from: "user" });
  chatContainer.appendChild(bubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function setQuickReplies(options) {
  quickRepliesContainer.innerHTML = '';
  options.forEach((opt) => {
    const btn = createQuickReply(opt.label, opt.value, handleQuickReply);
    quickRepliesContainer.appendChild(btn);
  });
}

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

async function assistantReply(text, min = 400, max = 1600) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  showTypingIndicator();
  await new Promise(resolve => setTimeout(resolve, delay));
  hideTypingIndicator();
  addMessage(text, 'assistant');
}

async function assistantReplyChunks(chunks, min = 400, max = 1200) {
  for (const chunk of chunks) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    showTypingIndicator();
    await new Promise(resolve => setTimeout(resolve, delay));
    hideTypingIndicator();
    addMessage(chunk, 'assistant');
  }
}

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
// UNIFIED WIZARD FLOW
// ------------------------------------------------------
async function advanceWizard(value, fromUser = true) {
  if (fromUser) addUserMessage(value);

  // STEP 1 — REASON
  if (!wizardState.reason) {
    wizardState.reason = mapTypedReason(value);
    return askState();
  }

  // STEP 2 — STATE
  if (!wizardState.state) {
    wizardState.state = mapTypedState(value);
    return askEmploymentStatus();
  }

  // STEP 3 — EMPLOYMENT STATUS
  if (!wizardState.employmentStatus) {
    wizardState.employmentStatus = mapTypedEmployment(value);
    return showResultsSummary();
  }

  if (value === "email_yes") {
  await assistantReply("Great! What email address should I send it to?");
  wizardState.awaitingEmail = true;
  return;
}

if (value === "email_no") {
  await assistantReply("Okay! Let me know if you need anything else.");
  return;
}

  // AFTER WIZARD — general Q&A
  return answerGeneralQuestion(value);
}

function handleQuickReply(value) {
  advanceWizard(value, true);
}

function handleUserTypedMessage(text) {
  if (wizardState.awaitingEmail) {
  const email = text.trim();
  wizardState.awaitingEmail = false;

  assistantReply(`Perfect — sending your PDF to ${email}.`);

  sendChatToEmail(email); // we’ll create this next
  return;
}

  // Otherwise continue the wizard normally
  advanceWizard(text, true);
}

// ------------------------------------------------------
// GENERAL ANSWERS AFTER WIZARD
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

  return assistantReply(
    "I’m here to help with leave laws. You can ask things like:\n• Do I qualify for FMLA?\n• What leave laws apply in California?\n• Is pregnancy leave paid?"
  );
}
async function sendChatToEmail(email) {
  const chatHtml = document.getElementById("chatContainer").innerHTML;

  await fetch("https://YOUR_BACKEND_URL/send-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, chatHtml })
  });
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
// BULLETPROOF AUTO-TAGGER (NO FALSE POSITIVES)
// ------------------------------------------------------
function autoTagLaw(law) {
  const text = (
    (law.title || "") + " " +
    (law.description || "") + " " +
    JSON.stringify(law.leave_types || [])
  ).toLowerCase();

  const tags = new Set();

  // Pregnancy
  if (
    text.includes("pregnan") ||
    text.includes("childbirth") ||
    text.includes("maternity") ||
    text.includes("birth")
  ) {
    tags.add("pregnancy");
  }

  // Medical (safe version)
  if (
    text.includes("sick leave") ||
    text.includes("sick time") ||
    text.includes("medical leave") ||
    text.includes("illness") ||
    text.includes("health condition") ||
    text.includes("serious health condition")
  ) {
    tags.add("medical");
  }

  // Family care
  if (
    text.includes("family leave") ||
    text.includes("care for") ||
    text.includes("caregiving") ||
    text.includes("family member") ||
    text.includes("parent") ||
    text.includes("spouse") ||
    text.includes("child")
  ) {
    tags.add("family_care");
  }

  // Military
  if (
    text.includes("military") ||
    text.includes("active duty") ||
    text.includes("deployment") ||
    text.includes("servicemember")
  ) {
    tags.add("military");
  }

  // Domestic violence
  if (
    text.includes("domestic violence") ||
    text.includes("sexual assault") ||
    text.includes("stalking") ||
    text.includes("safe leave")
  ) {
    tags.add("domestic_violence");
  }

  // Bereavement
  if (
    text.includes("bereav") ||
    text.includes("funeral") ||
    text.includes("death of")
  ) {
    tags.add("bereavement");
  }

  // Jury duty
  if (
    text.includes("jury duty") ||
    text.includes("jury service") ||
    text.includes("court leave") ||
    text.includes("court appearance")
  ) {
    tags.add("jury");
  }

  // Voting
  if (
    text.includes("voting leave") ||
    text.includes("election leave") ||
    text.includes("time to vote")
  ) {
    tags.add("voting");
  }

  // Organ donation
  if (
    text.includes("organ donation") ||
    text.includes("bone marrow")
  ) {
    tags.add("organ_donation");
  }

  // Public employees
  if (
    text.includes("public employee") ||
    text.includes("state employee")
  ) {
    tags.add("public_employees");
  }

  return Array.from(tags);
}

// ------------------------------------------------------
// SMART TAG MATCHING (OPTION B)
// ------------------------------------------------------
function getMatchingTagsForReason(reason) {
  switch (reason) {
    case "sick":
      return ["medical"];
    case "pregnancy":
      return ["pregnancy", "medical"];
    case "family_care":
      return ["family_care"];
    case "military":
      return ["military"];
    case "court":
      return ["jury"];
    case "bereavement":
      return ["bereavement"];
    default:
      return [];
  }
}

import { createChatLawCard } from './components/ChatLawCard.js';

async function sendLawsToChat(laws) {
  for (const law of laws) {
    const eligibility = checkEligibility(law, wizardState);

    const card = createChatLawCard(law, eligibility);

    const bubble = createChatBubble({
      htmlElement: card,
      from: "assistant"
    });

    chatContainer.appendChild(bubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;

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

// ⭐ FIX: remove leftover quick reply buttons
quickRepliesContainer.innerHTML = "";
  
  const event = new CustomEvent("wizardComplete", { detail: { laws: filtered } });
  window.dispatchEvent(event);
}

// ------------------------------------------------------
// START WIZARD
// ------------------------------------------------------
async function startWizard() {
  chatContainer.innerHTML = '';
  quickRepliesContainer.innerHTML = '';
  wizardState = { reason: null, state: null, employmentStatus: null };

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

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

function clearQuickReplies() {
  quickRepliesContainer.innerHTML = "";
}

// ------------------------------------------------------
// WIZARD STEPS
// ------------------------------------------------------
const WIZARD_STEPS = {
  REASON: "reason",
  STATE: "state",
  EMPLOYMENT: "employment",
  TENURE: "tenure",
  WEEKLY_HOURS: "weekly_hours",
  RESULTS: "results",
  COMPLETE: "complete"
};

let currentStep = WIZARD_STEPS.REASON;

// ------------------------------------------------------
// WIZARD STATE
// ------------------------------------------------------
let wizardState = {
  reason: null,
  state: null,
  employmentStatus: null,
  tenureMonths: null,
  hoursPerWeek: null,
  annualHours: null,
  meets1250Hours: null,
  awaitingEmail: false
};

// ------------------------------------------------------
// MAPPING FUNCTIONS
// ------------------------------------------------------
function mapTypedReason(text) {
  const lower = text.toLowerCase();

  if (
    lower.includes("bonding") ||
    lower.includes("parental") ||
    lower.includes("childbirth") ||
    lower.includes("new baby") ||
    lower.includes("newborn")
  ) {
    return "pregnancy";
  }

  if (lower.includes("sick") || lower.includes("ill")) return "sick";
  if (lower.includes("preg")) return "pregnancy";
  if (lower.includes("family")) return "family_care";
  if (lower.includes("military")) return "military";
  if (lower.includes("court") || lower.includes("jury")) return "court";
  if (lower.includes("bereav") || lower.includes("loss") || lower.includes("passed")) return "bereavement";

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
  const lower = text.toLowerCase();

  if (lower.includes("full")) return "Full-time";
  if (lower.includes("part")) return "Part-time";
  if (lower.includes("self")) return "Self-employed";

  if (
    lower.includes("unemployed") ||
    lower.includes("between jobs") ||
    lower.includes("laid off") ||
    lower.includes("not working")
  ) {
    return "Unemployed";
  }

  return "I'm in between jobs right now.";
}

function mapTenureFromQuickReply(value) {
  switch (value) {
    case "tenure_lt_12": return "<12";
    case "tenure_ge_12": return ">=12";
    case "tenure_unknown": return "unknown";
    default: return "unknown";
  }
}

function mapWeeklyHoursFromQuickReply(value) {
  switch (value) {
    case "hours_lt_20": return 15;
    case "hours_20_29": return 24;
    case "hours_30_39": return 35;
    case "hours_ge_40": return 40;
    case "hours_unknown": return "unknown";
    default: return "unknown";
  }
}

function parseWeeklyHoursFromText(text) {
  const match = text.match(/(\d+(\.\d+)?)/);
  if (!match) return "unknown";
  const num = parseFloat(match[1]);
  if (isNaN(num) || num <= 0) return "unknown";
  return num;
}

// ------------------------------------------------------
// STEP TRANSITIONS
// ------------------------------------------------------
function nextStep() {
  switch (currentStep) {
    case WIZARD_STEPS.REASON:
      currentStep = WIZARD_STEPS.STATE;
      return askState();

    case WIZARD_STEPS.STATE:
      currentStep = WIZARD_STEPS.EMPLOYMENT;
      return askEmploymentStatus();

    case WIZARD_STEPS.EMPLOYMENT:
      currentStep = WIZARD_STEPS.TENURE;
      return askTenure();

    case WIZARD_STEPS.TENURE:
      currentStep = WIZARD_STEPS.WEEKLY_HOURS;
      return askWeeklyHours();

    case WIZARD_STEPS.WEEKLY_HOURS:
      currentStep = WIZARD_STEPS.RESULTS;
      return showResultsSummary();

    case WIZARD_STEPS.RESULTS:
      currentStep = WIZARD_STEPS.COMPLETE;
      return askForEmail();

    case WIZARD_STEPS.COMPLETE:
      return;
  }
}

// ------------------------------------------------------
// MAIN WIZARD ROUTER (WITH UNIVERSAL Q&A)
// ------------------------------------------------------
async function advanceWizard(value) {
  addUserMessage(value);

  if (wizardState.awaitingEmail) {
    return handleEmailFlow(value);
  }

  // ⭐ UNIVERSAL Q&A HANDLER — works at ANY step
  const lower = value.toLowerCase();
  if (
    lower.includes("eligible") ||
    lower.includes("qualify") ||
    lower.includes("fmla") ||
    lower.includes("leave") ||
    lower.includes("law") ||
    lower.includes("benefit") ||
    lower.includes("rights") ||
    lower.includes("what is") ||
    lower.includes("how does")
  ) {
    return answerGeneralQuestion(value);
  }

  switch (currentStep) {

    case WIZARD_STEPS.REASON:
      wizardState.reason = mapTypedReason(value);

      if (wizardState.reason === "bereavement") {
        await assistantReply("I’m so sorry for your loss. I’ll help you understand what leave options may support you right now.");
      }

      if (wizardState.reason === "pregnancy") {
        await assistantReply("Congratulations on the new addition to your family. Let’s take a look at the leave options that may support you during this time.");
      }

      return nextStep();

    case WIZARD_STEPS.STATE:
      wizardState.state = mapTypedState(value);
      return nextStep();

    case WIZARD_STEPS.EMPLOYMENT:
      wizardState.employmentStatus = mapTypedEmployment(value);

      if (wizardState.employmentStatus === "Unemployed") {
        await assistantReply("Thank you for sharing that. Your next opportunity is on its way — and I’ll still help you understand what leave protections may apply.");
      }

      return nextStep();

    case WIZARD_STEPS.TENURE:
      wizardState.tenureMonths = interpretTenureFromText(value);
      return nextStep();

    case WIZARD_STEPS.WEEKLY_HOURS:
      wizardState.hoursPerWeek = interpretWeeklyHoursFromText(value);
      computeAnnualHours();
      return nextStep();

    case WIZARD_STEPS.RESULTS:
      return handlePostResultsFlow(value);

    case WIZARD_STEPS.COMPLETE:
      return answerGeneralQuestion(value);
  }
}

// ------------------------------------------------------
// TENURE & WEEKLY HOURS INTERPRETATION
// ------------------------------------------------------
function interpretTenureFromText(text) {
  const lower = text.toLowerCase();
  if (lower.includes("less") || lower.includes("<") || lower.includes("under")) {
    return "<12";
  }
  if (lower.includes("more") || lower.includes(">") || lower.includes("over")) {
    return ">=12";
  }
  if (lower.includes("year") || lower.includes("12")) {
    return ">=12";
  }
  if (lower.includes("not sure") || lower.includes("unsure") || lower.includes("don't know")) {
    return "unknown";
  }
  return "unknown";
}

function interpretWeeklyHoursFromText(text) {
  const lower = text.toLowerCase();
  if (lower.includes("not sure") || lower.includes("unsure") || lower.includes("don't know")) {
    return "unknown";
  }
  return parseWeeklyHoursFromText(text);
}

function computeAnnualHours() {
  if (wizardState.hoursPerWeek === "unknown") {
    wizardState.annualHours = "unknown";
    wizardState.meets1250Hours = null;
    return;
  }
  wizardState.annualHours = wizardState.hoursPerWeek * 52;
  wizardState.meets1250Hours = wizardState.annualHours >= 1250;
}

// ------------------------------------------------------
// POST-RESULTS FLOW
// ------------------------------------------------------
async function handlePostResultsFlow(value) {
  const lower = value.toLowerCase();

  if (lower.includes("yes")) {
    wizardState.awaitingEmail = true;
    return assistantReply("Great! What email address should I send it to?");
  }

  if (lower.includes("no")) {
    return assistantReply("Okay! Let me know if you need anything else.");
  }

  return answerGeneralQuestion(value);
}

async function handleEmailFlow(email) {
  wizardState.awaitingEmail = false;
  await assistantReply(`Perfect — sending your PDF to ${email}.`);
  return sendChatToEmail(email);
}

// ------------------------------------------------------
// QUICK REPLY HANDLER
// ------------------------------------------------------
function handleQuickReply(value) {
  clearQuickReplies();

  switch (currentStep) {

    case WIZARD_STEPS.REASON:
      wizardState.reason = value;
      addUserMessage(value);

      if (value === "bereavement") {
        assistantReply("I’m so sorry for your loss. I’ll help you understand what leave options may support you right now.");
      }
      if (value === "pregnancy") {
        assistantReply("Congratulations on the new addition to your family. Let’s take a look at the leave options that may support you during this time.");
      }

      return nextStep();

    case WIZARD_STEPS.EMPLOYMENT:
      wizardState.employmentStatus = value;
      addUserMessage(value);

      if (value === "I'm between jobs." || value === "Unemployed") {
        assistantReply("Thank you for sharing that. Your next opportunity is on its way — and I’ll still help you understand what leave protections may apply.");
      }

      return nextStep();

    case WIZARD_STEPS.TENURE:
      wizardState.tenureMonths = mapTenureFromQuickReply(value);
      addUserMessage(
        value === "tenure_lt_12" ? "Less than 12 months" :
        value === "tenure_ge_12" ? "More than 12 months" :
        "I'm not sure"
      );
      return nextStep();

    case WIZARD_STEPS.WEEKLY_HOURS:
      wizardState.hoursPerWeek = mapWeeklyHoursFromQuickReply(value);
      addUserMessage(
        value === "hours_lt_20" ? "Less than 20 hours per week" :
        value === "hours_20_29" ? "20–29 hours per week" :
        value === "hours_30_39" ? "30–39 hours per week" :
        value === "hours_ge_40" ? "40 or more hours per week" :
        "I'm not sure"
      );
      computeAnnualHours();
      return nextStep();

    case WIZARD_STEPS.RESULTS:
    case WIZARD_STEPS.COMPLETE:
      if (value === "email_yes") {
        wizardState.awaitingEmail = true;
        addUserMessage("Yes, email it to me");
        return assistantReply("Great! What email address should I send it to?");
      }
      if (value === "email_no") {
        addUserMessage("No, thanks");
        return assistantReply("Okay! Let me know if you need anything else.");
      }
      return;
  }
}

// ------------------------------------------------------
// USER TYPED MESSAGE
// ------------------------------------------------------
function handleUserTypedMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  clearQuickReplies();
  advanceWizard(trimmed);
}

// ------------------------------------------------------
// GENERAL Q&A
// ------------------------------------------------------
async function answerGeneralQuestion(text) {
  const lower = text.toLowerCase();

  if (lower.includes("eligible") || lower.includes("qualify")) {
    return assistantReply(
      "Eligibility depends on your reason for leave, your state, your employment status, and how long you've worked and how many hours you typically work. You can restart the chat anytime to check again."
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

  if (e.employee_tenure && e.employee_tenure.includes("12 months")) {
    if (wizardState.tenureMonths === "<12") {
      result.eligible = false;
      result.reasons.push("Requires about 12 months of employment; you indicated less than 12 months.");
    } else if (wizardState.tenureMonths === "unknown") {
      result.reasons.push("Requires about 12 months of employment; your tenure is marked as not sure.");
    } else {
      result.reasons.push("Requires about 12 months of employment; you may meet this requirement.");
    }
  }

  if (e.hours_worked && e.hours_worked.includes("1,250")) {
    if (wizardState.meets1250Hours === false) {
      result.eligible = false;
      result.reasons.push("Requires about 1,250 hours worked in the past 12 months; based on your weekly hours, you may not meet this.");
    } else if (wizardState.meets1250Hours === null) {
      result.reasons.push("Requires about 1,250 hours worked in the past 12 months; your weekly hours are marked as not sure.");
    } else if (wizardState.meets1250Hours === true) {
      result.reasons.push("Requires about 1,250 hours worked in the past 12 months; based on your weekly hours, you may meet this.");
    }
  }

  if (e.relationship_requirement) {
    result.reasons.push(e.relationship_requirement);
  }

  return result;
}

// ------------------------------------------------------
// AUTO-TAGGER
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

  if (
    text.includes("sick leave") ||
    text.includes("sick time") ||
    text.includes("medical leave") ||
    text.includes("illness") ||
    text.includes("health condition") ||
    text.includes("serious health condition")
  )
    tags.add("medical");

  if (
    text.includes("family leave") ||
    text.includes("care for") ||
    text.includes("caregiving") ||
    text.includes("family member") ||
    text.includes("parent") ||
    text.includes("spouse") ||
    text.includes("child")
  )
    tags.add("family_care");

  if (text.includes("military") || text.includes("active duty") || text.includes("deployment") || text.includes("servicemember"))
    tags.add("military");

  if (text.includes("domestic violence") || text.includes("sexual assault") || text.includes("stalking") || text.includes("safe leave"))
    tags.add("domestic_violence");

  if (text.includes("bereav") || text.includes("funeral") || text.includes("death of"))
    tags.add("bereavement");

  if (text.includes("jury duty") || text.includes("jury service") || text.includes("court leave") || text.includes("court appearance"))
    tags.add("jury");

  if (text.includes("voting leave") || text.includes("election leave") || text.includes("time to vote"))
    tags.add("voting");

  if (text.includes("organ donation") || text.includes("bone marrow"))
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
// SEND LAWS TO CHAT
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
    "One moment while I check your state, situation, and basic eligibility."
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

  currentStep = WIZARD_STEPS.RESULTS;

  await assistantReply("Would you like a PDF copy of this conversation emailed to you?");

  setQuickReplies([
    { label: "Yes, email it to me", value: "email_yes" },
    { label: "No, thanks", value: "email_no" }
  ]);

  const event = new CustomEvent("wizardComplete", { detail: { laws: filtered } });
  window.dispatchEvent(event);
}

// ------------------------------------------------------
// ASK FOR EMAIL
// ------------------------------------------------------
async function askForEmail() {
  await assistantReply("Would you like a PDF copy of this conversation emailed to you?");
  setQuickReplies([
    { label: "Yes, email it to me", value: "email_yes" },
    { label: "No, thanks", value: "email_no" }
  ]);
}

// ------------------------------------------------------
// START WIZARD
// ------------------------------------------------------
async function startWizard() {
  chatContainer.innerHTML = '';
  quickRepliesContainer.innerHTML = '';
  wizardState = {
    reason: null,
    state: null,
    employmentStatus: null,
    tenureMonths: null,
    hoursPerWeek: null,
    annualHours: null,
    meets1250Hours: null,
    awaitingEmail: false
  };

  // ⭐ Q&A INTRO
  await assistantReplyChunks([
    "Before we begin, feel free to ask any questions about leave laws.",
    "When you're ready, I’ll walk you through a quick eligibility check."
  ]);

  currentStep = WIZARD_STEPS.REASON;

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

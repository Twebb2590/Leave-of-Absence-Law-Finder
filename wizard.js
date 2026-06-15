// ------------------------------------------------------
// CLEAN, COMPLETE, ONE-FILE WIZARD FLOW
// ------------------------------------------------------

import { states } from "./states/state-list.js";
import { loadFederalLaws, loadStateLaws } from "./data-loader.js";

// Wizard state
let wizardState = {
  step: "state",
  state: null,
  reason: null,
  employmentStatus: null,
  employerSize: null,
  tenure: null
};

// Wizard steps in order
const WIZARD_STEPS = [
  "state",
  "reason",
  "employment_status",
  "employer_size",
  "tenure",
  "summary"
];

// ------------------------------------------------------
// Move to next step
// ------------------------------------------------------
function nextStep() {
  const index = WIZARD_STEPS.indexOf(wizardState.step);
  wizardState.step = WIZARD_STEPS[index + 1] || "summary";
  askCurrentStep();
}

// ------------------------------------------------------
// Ask the question for the current step
// ------------------------------------------------------
function askCurrentStep() {
  clearQuickReplies();

  switch (wizardState.step) {

    case "state":
      assistantReply("What state do you work in?");
      setQuickReplies(states.map(s => ({
        label: s.name,
        value: s.code
      })));
      break;

    case "reason":
      assistantReply("What type of leave do you need?");
      setQuickReplies([
        { label: "Medical / Sick", value: "medical" },
        { label: "Pregnancy / Birth", value: "pregnancy" },
        { label: "Family Care", value: "family" },
        { label: "Bereavement", value: "bereavement" },
        { label: "Military", value: "military" },
        { label: "Jury Duty", value: "jury" }
      ]);
      break;

    case "employment_status":
      assistantReply("Are you full‑time or part‑time?");
      setQuickReplies([
        { label: "Full‑time", value: "full_time" },
        { label: "Part‑time", value: "part_time" }
      ]);
      break;

    case "employer_size":
      assistantReply("How many employees does your employer have?");
      setQuickReplies([
        { label: "1–14", value: "small" },
        { label: "15–49", value: "medium" },
        { label: "50+", value: "large" }
      ]);
      break;

    case "tenure":
      assistantReply("How long have you worked for your employer?");
      setQuickReplies([
        { label: "Less than 6 months", value: "<6" },
        { label: "6–12 months", value: "6-12" },
        { label: "1+ year", value: "1+" }
      ]);
      break;

    case "summary":
      showResultsSummary();
      break;
  }
}

// ------------------------------------------------------
// Handle quick replies
// ------------------------------------------------------
export function handleQuickReply(value) {
  saveAnswer(value);
  nextStep();
}

// ------------------------------------------------------
// Handle typed input
// ------------------------------------------------------
export function handleUserTypedMessage(text) {
  const value = mapTypedValue(text);
  saveAnswer(value);
  nextStep();
}

// ------------------------------------------------------
// Save answers
// ------------------------------------------------------
function saveAnswer(value) {
  switch (wizardState.step) {
    case "state":
      wizardState.state = value;
      break;
    case "reason":
      wizardState.reason = value;
      break;
    case "employment_status":
      wizardState.employmentStatus = value;
      break;
    case "employer_size":
      wizardState.employerSize = value;
      break;
    case "tenure":
      wizardState.tenure = value;
      break;
  }
}

// ------------------------------------------------------
// Typed input mapping
// ------------------------------------------------------
function mapTypedValue(text) {
  const lower = text.toLowerCase();

  // State detection
  const stateMatch = states.find(
    s =>
      lower.includes(s.name.toLowerCase()) ||
      lower.includes(s.code.toLowerCase())
  );
  if (stateMatch) return stateMatch.code;

  // Reason detection
  if (lower.includes("preg")) return "pregnancy";
  if (lower.includes("birth")) return "pregnancy";
  if (lower.includes("sick")) return "medical";
  if (lower.includes("medical")) return "medical";
  if (lower.includes("family")) return "family";
  if (lower.includes("bereav")) return "bereavement";
  if (lower.includes("milit")) return "military";
  if (lower.includes("jury")) return "jury";

  return text;
}

// ------------------------------------------------------
// Final summary + law loading
// ------------------------------------------------------
async function showResultsSummary() {
  assistantReply("Thanks. Let me check which federal and state leave laws apply.");

  const stateCode = wizardState.state;
  const reason = wizardState.reason;

  const federal = await loadFederalLaws();
  const state = stateCode ? await loadStateLaws(stateCode) : [];

  const combined = [...federal, ...state];

  const filtered = combined.filter(law =>
    law.leave_types?.some(t => t.type === reason)
  );

  dispatchWizardResults(filtered);
}

// ------------------------------------------------------
// Start wizard
// ------------------------------------------------------
export function startWizard() {
  wizardState.step = "state";
  askCurrentStep();
}

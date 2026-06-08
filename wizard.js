// wizard.js
import { createChatBubble } from './components/ChatBubble.js';
import { createQuickReply } from './components/QuickReply.js';
import { loadFederalLaws, loadStateLaws } from './data-loader.js';

const chatContainer = document.getElementById('chatContainer');
const quickReplyContainer = document.getElementById('quickReplyContainer');

const wizardState = {
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
  quickReplyContainer.innerHTML = '';
  options.forEach((opt) => {
    const btn = createQuickReply(opt.label, opt.value, handleQuickReply);
    quickReplyContainer.appendChild(btn);
  });
}

// Format law text for chat
function lawToChatText(law) {
  const elig = law.eligibility_result;
  
  return `
<b>${law.title}</b>

${law.description}

<b>Job Protection:</b> ${law.job_protection ? "Yes" : "No"}

<b>Eligibility:</b>
${elig.eligible ? "You likely qualify." : "You may not qualify."}

<b>You can read the official details here:</b>
<a href="${law.link}" target="_blank">${law.link}</a>
  `;
}

// Send multiple laws to chat
function sendLawsToChat(laws) {
  laws.forEach((law) => {
    const bubble = createChatBubble({
      text: lawToChatText(law),
      from: 'assistant',
    });
    chatContainer.appendChild(bubble);
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Typing indicator
function showTypingIndicator() {
  const chat = document.getElementById("chatContainer");
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.id = "typingIndicator";
  indicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  chat.appendChild(indicator);
  chat.scrollTop = chat.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

// Assistant reply with randomized delay
async function assistantReply(text, min = 600, max = 1400) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  showTypingIndicator();
  await new Promise(resolve => setTimeout(resolve, delay));
  hideTypingIndicator();
  addMessage(text, 'assistant');
}

// Assistant reply in chunks (mid‑reply pauses)
async function assistantReplyChunks(chunks, min = 400, max = 1200) {
  for (const chunk of chunks) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;

    showTypingIndicator();
    await new Promise(resolve => setTimeout(resolve, delay));
    hideTypingIndicator();

    addMessage(chunk, 'assistant');
  }
}

// Handle user quick replies
async function handleQuickReply(value) {
  if (!wizardState.reason) {
    wizardState.reason = value;
    addMessage(value, 'user');
    await askState();
    return;
  }

  if (!wizardState.state) {
    wizardState.state = value;
    addMessage(value, 'user');
    await askEmploymentStatus();
    return;
  }

  if (!wizardState.employmentStatus) {
    wizardState.employmentStatus = value;
    addMessage(value, 'user');
    await showResultsSummary();
    return;
  }
}async function handleUserTypedMessage(text) {
    // Show the user's message in the chat
    addUserMessage(text);

    // If the wizard is still collecting required info, treat typed text as answers
    if (!wizardState.reason) {
        wizardState.reason = mapTypedReason(text);
        return askForState();
    }

    if (!wizardState.state) {
        wizardState.state = mapTypedState(text);
        return askForEmploymentStatus();
    }

    if (!wizardState.employmentStatus) {
        wizardState.employmentStatus = mapTypedEmployment(text);
        return showResultsSummary();
    }

    // Otherwise, treat it as a general question
    return answerGeneralQuestion(text);
}

// Start wizard
async function startWizard() {
  chatContainer.innerHTML = '';
  quickReplyContainer.innerHTML = '';
  wizardState.reason = null;
  wizardState.state = null;
  wizardState.employmentStatus = null;

  await assistantReply(
    "Hi. I’m here to help you understand your leave options. What’s the main reason you’re looking into leave right now?"
  );

  setQuickReplies([
    { label: 'I’m sick or injured', value: 'sick' },
    { label: 'Pregnancy or birth', value: 'pregnancy' },
    { label: 'Caring for a family member', value: 'family_care' },
    { label: 'Bereavement or loss', value: 'bereavement' },
    { label: 'Military service', value: 'military' },
    { label: 'Court or jury duty', value: 'court' },
    { label: 'Something else', value: 'other' },
  ]);
}

// Ask for state
async function askState() {
  await assistantReply(
    "Thank you for sharing that. Which state do you work in? This helps me find the right laws."
  );

  const states = [
    { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
    { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
    { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }
  ];

  setQuickReplies(
    states.map((s) => ({ label: s.name, value: s.code })).concat([
      { label: 'I’m not sure', value: 'unknown' },
    ])
  );
}

// Ask employment status
async function askEmploymentStatus() {
  await assistantReply(
    "Got it. One more thing—are you working full-time or part-time?"
  );

  setQuickReplies([
    { label: 'Full-time', value: 'full_time' },
    { label: 'Part-time', value: 'part_time' },
    { label: 'I’m not sure', value: 'unknown' },
  ]);
}

function checkEligibility(law, wizardState) {
  const result = {
    eligible: true,
    reasons: []
  };

  const e = law.eligibility || {};

  // Employer size
  if (e.employer_size && e.employer_size.includes("50+") && wizardState.employmentStatus === "part_time") {
    result.eligible = false;
    result.reasons.push("Employer must have 50+ employees within 75 miles.");
  }

  // Tenure requirement
  if (e.employee_tenure && e.employee_tenure.includes("12 months")) {
    // You can expand this later when you ask for tenure
    result.reasons.push("Requires 12 months of employment.");
  }

  // Hours worked
  if (e.hours_worked && e.hours_worked.includes("1,250")) {
    result.reasons.push("Requires 1,250 hours worked in the past 12 months.");
  }

  // Relationship requirement (military caregiver)
  if (e.relationship_requirement) {
    result.reasons.push(e.relationship_requirement);
  }

  return result;
}

// Show results summary
async function showResultsSummary() {
  await assistantReplyChunks([
    "Thank you.",
    "I’m pulling together federal and state leave laws that may apply.",
    "One moment while I check your state and situation."
  ]);

  const stateCode = wizardState.state === 'unknown' ? null : wizardState.state;

  const federal = await loadFederalLaws();
  const state = stateCode ? await loadStateLaws(stateCode) : [];
  const combined = [...federal, ...state];
  
  const filtered = combined
    .filter((law) => {
    const tags = (law.tags || []).map((t) => t.toLowerCase());
    const reason = wizardState.reason;

    if (reason === 'sick') return tags.some((t) => t.includes('sick') || t.includes('medical'));
    if (reason === 'pregnancy') return tags.some((t) => t.includes('pregnancy') || t.includes('birth'));
    if (reason === 'family_care') return tags.some((t) => t.includes('family') || t.includes('care'));
    if (reason === 'bereavement') return tags.some((t) => t.includes('bereavement') || t.includes('funeral'));
    if (reason === 'military') return tags.some((t) => t.includes('military') || t.includes('service'));
    if (reason === 'court') return tags.some((t) => t.includes('jury') || t.includes('court'));

    return true;
  })

.map(law => {
  // Apply eligibility to each law
    law.eligibility_result = checkEligibility(law, wizardState);
    return law;
  });
  
   // No matching laws
    if (!filtered.length) {
        await assistantReply(
            "I wasn’t able to find specific laws that match your situation from the data I have. " +
            "You can still use the search and filters below to explore more."
        );
  } else {
    await assistantReply(
      `I found ${filtered.length} leave laws that may be relevant. Here are the most relevant ones:`
    );

      // Show top 3
    sendLawsToChat(filtered.slice(0, 3));
  }

  // Dispatch event for UI
  const event = new CustomEvent('wizardResults', {
    detail: {
      laws: filtered,
      wizardState: { ...wizardState },
    },
  });
  window.dispatchEvent(event);

  // Restart option
  setQuickReplies([
    { label: 'Start over', value: 'restart' },
  ]);

  quickReplyContainer.querySelectorAll('button').forEach((btn) => {
    if (btn.dataset.value === 'restart') {
      btn.addEventListener('click', () => startWizard());
    }
  });
  const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", () => {
    const text = userInput.value.trim();
    if (!text) return;
    handleUserTypedMessage(text);
    userInput.value = "";
});

}

// Start wizard on page load
document.addEventListener('DOMContentLoaded', () => {
  startWizard();
});

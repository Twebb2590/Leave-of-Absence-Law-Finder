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

function addMessage(text, from = 'assistant') {
  const bubble = createChatBubble({ text, from });
  chatContainer.appendChild(bubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function setQuickReplies(options) {
  quickReplyContainer.innerHTML = '';
  options.forEach((opt) => {
    const btn = createQuickReply(opt.label, opt.value, handleQuickReply);
    quickReplyContainer.appendChild(btn);
  });
}

function lawToChatText(law) {
  return `
<b>${law.title}<b>

${law.description}

<b>Job Protection:<b> ${law.job_protection ? "Yes" : "No"}

<b>You can read the official details here: <b>
<a href="${law.link}" target="_blank">${law.link}</a>
  `;
}

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

async function handleQuickReply(value) {
  // Determine which step we’re in based on missing fields
  if (!wizardState.reason) {
    wizardState.reason = value;
    addMessage(value, 'user');
    askState();
    return;
  }

  if (!wizardState.state) {
    wizardState.state = value;
    addMessage(value, 'user');
    askEmploymentStatus();
    return;
  }

  if (!wizardState.employmentStatus) {
    wizardState.employmentStatus = value;
    addMessage(value, 'user');
    await showResultsSummary();
    return;
  }
}

function startWizard() {
  chatContainer.innerHTML = '';
  quickReplyContainer.innerHTML = '';
  wizardState.reason = null;
  wizardState.state = null;
  wizardState.employmentStatus = null;

  addMessage(
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

function askState() {
  addMessage(
    "Thank you for sharing that. Which state do you work in? This helps me find the right laws."
  );

  const states = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" }
    // Add more as needed
  ];

  setQuickReplies(
    states.map((s) => ({ label: s.name, value: s.code })).concat([
      { label: 'I’m not sure', value: 'unknown' },
    ])
  );
}

function askEmploymentStatus() {
  addMessage(
    "Got it. One more thing—are you working full-time or part-time?"
  );

  setQuickReplies([
    { label: 'Full-time', value: 'full_time' },
    { label: 'Part-time', value: 'part_time' },
    { label: 'I’m not sure', value: 'unknown' },
  ]);
}

async function showResultsSummary() {
  addMessage(
    "Thank you. I’ll pull together federal and state leave laws that may apply to your situation."
  );

  const stateCode = wizardState.state === 'unknown' ? null : wizardState.state;

  const federal = await loadFederalLaws();
  const state = stateCode ? await loadStateLaws(stateCode) : [];

  const combined = [...federal, ...state];

  const filtered = combined.filter((law) => {
    // Simple heuristic based on tags and reason
    const tags = (law.tags || []).map((t) => t.toLowerCase());
    const reason = wizardState.reason;

    if (reason === 'sick') {
      return tags.some((t) => t.includes('sick') || t.includes('medical'));
    }
    if (reason === 'pregnancy') {
      return tags.some((t) => t.includes('pregnancy') || t.includes('birth'));
    }
    if (reason === 'family_care') {
      return tags.some((t) => t.includes('family') || t.includes('care'));
    }
    if (reason === 'bereavement') {
      return tags.some((t) => t.includes('bereavement') || t.includes('funeral'));
    }
    if (reason === 'military') {
      return tags.some((t) => t.includes('military') || t.includes('service'));
    }
    if (reason === 'court') {
      return tags.some((t) => t.includes('jury') || t.includes('court'));
    }
    return true;
  });

 if (!filtered.length) {
  addMessage(
    "I wasn’t able to find specific laws that match your situation from the data I have. You can still use the search and filters below to explore more."
  );
} else {
  addMessage(
    `I found ${filtered.length} leave laws that may be relevant. Here are the most relevant ones:`
  );

  // Show top 3 laws in chat
  sendLawsToChat(filtered.slice(0, 3));
}

  const event = new CustomEvent('wizardResults', {
    detail: {
      laws: filtered,
      wizardState: { ...wizardState },
    },
  });
  window.dispatchEvent(event);

  setQuickReplies([
    {
      label: 'Start over',
      value: 'restart',
    },
  ]);

  // Special handling for restart
  quickReplyContainer.querySelectorAll('button').forEach((btn) => {
    if (btn.dataset.value === 'restart') {
      btn.addEventListener('click', () => startWizard());
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  startWizard();
});

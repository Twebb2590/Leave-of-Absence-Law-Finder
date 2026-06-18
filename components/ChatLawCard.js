// components/ChatLawCard.js

export function createChatLawCard(law, eligibility) {
  const card = document.createElement("div");
  card.className = "chat-law-card";

  card.innerHTML = `
    <div class="chat-law-card-header">
      <span class="chat-law-card-icon">📘</span>
      <span class="chat-law-card-title">${law.title || "Untitled Law"}</span>
    </div>

    <div class="chat-law-card-meta">
      <span><strong>Level:</strong> ${law.level || "N/A"}</span>
      <span><strong>State:</strong> ${law.state || "N/A"}</span>
    </div>

    <div class="chat-law-card-section">
      <div class="chat-law-card-section-title">Description</div>
      <div class="chat-law-card-section-body">
        ${law.description || "No description available."}
      </div>
    </div>

    <div class="chat-law-card-section">
      <div class="chat-law-card-section-title">Eligibility</div>
      <div class="chat-law-card-section-body">
        ${eligibility.eligible ? "You may qualify" : "You may not qualify"}
      </div>
    </div>

    <div class="chat-law-card-section">
      <div class="chat-law-card-section-title">Why</div>
      <div class="chat-law-card-section-body">
        ${
          eligibility.reasons.length
            ? eligibility.reasons.map(r => `<div class="chat-law-card-bullet">• ${r}</div>`).join("")
            : `<div class="chat-law-card-bullet">• No specific restrictions based on what you shared.</div>`
        }
      </div>
    </div>

    <div class="chat-law-card-section">
      <div class="chat-law-card-section-title">Source</div>
      <div class="chat-law-card-section-body">
        <a href="${law.link}" target="_blank">${law.link || "N/A"}</a>
      </div>
    </div>
  `;

  return card;
}

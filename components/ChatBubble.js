// components/ChatBubble.js
export function createChatBubble({ text, from = 'assistant' }) {
  const wrapper = document.createElement('div');
  wrapper.className = `chat-row ${from}`;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${from}`;

  // 1. Convert URLs to safe <a> tags
  const htmlWithLinks = linkify(text);

  // 2. Escape everything else to prevent HTML injection
  const safeHtml = htmlWithLinks
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // restore <a> tags only
    .replace(/&lt;a /g, "<a ")
    .replace(/&lt;\/a&gt;/g, "</a>");

  bubble.innerHTML = safeHtml;

  wrapper.appendChild(bubble);
  return wrapper;
}

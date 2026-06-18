// components/ChatBubble.js

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`);
}

export function createChatBubble({ text, html, htmlElement, from = 'assistant' }) {
  const wrapper = document.createElement('div');
  wrapper.className = `chat-row ${from}`;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${from}`;

  // If a DOM element is provided, append it directly
  if (htmlElement) {
    bubble.appendChild(htmlElement);
    wrapper.appendChild(bubble);
    return wrapper;
  }

  // If raw HTML is provided, insert it safely
  if (html) {
    bubble.innerHTML = html;
    wrapper.appendChild(bubble);
    return wrapper;
  }

  // Otherwise treat it as text and run linkify
  if (typeof text === "string") {
    const htmlWithLinks = linkify(text);

    const safeHtml = htmlWithLinks
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/&lt;a /g, "<a ")
      .replace(/&lt;\/a&gt;/g, "</a>");

    bubble.innerHTML = safeHtml;
  } else {
    bubble.textContent = "";
  }

  wrapper.appendChild(bubble);
  return wrapper;
}


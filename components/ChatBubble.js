// components/ChatBubble.js
export function createChatBubble({ text, from = 'assistant' }) {
  const wrapper = document.createElement('div');
  wrapper.className = `chat-row ${from}`;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${from}`;
  bubble.innerHTML = text;

  wrapper.appendChild(bubble);
  return wrapper;
}

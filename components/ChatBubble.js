// components/ChatBubble.js
export function createChatBubble({ text, from = 'assistant' }) {
  const wrapper = document.createElement('div');
  wrapper.className = `flex ${from === 'assistant' ? 'justify-start' : 'justify-end'}`;

  const bubble = document.createElement('div');
  bubble.className =
    from === 'assistant'
      ? 'max-w-[80%] rounded-2xl bg-slate-100 px-3 py-2 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-100'
      : 'max-w-[80%] rounded-2xl bg-indigo-600 px-3 py-2 text-xs text-white shadow-sm';

  bubble.textContent = text;
  wrapper.appendChild(bubble);
  return wrapper;
}

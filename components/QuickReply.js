// components/QuickReply.js
export function createQuickReply(label, value, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'quick-reply-btn';
  btn.textContent = label;
  btn.dataset.value = value;

  btn.addEventListener('click', () => onClick(value));
  return btn;
}

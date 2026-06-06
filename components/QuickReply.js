// components/QuickReply.js
export function createQuickReply(label, value, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className =
    'inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200';
  btn.textContent = label;
  btn.dataset.value = value;

  btn.addEventListener('click', () => onClick(value));
  return btn;
}

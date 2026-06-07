// components/LawCard.js
export function createLawCard(law, {
  const card = document.createElement('article');
  card.className =
    'rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm hover:border-indigo-400 hover:shadow-md transition dark:border-slate-700 dark:bg-slate-900';

  const header = document.createElement('div');
  header.className = 'flex justify-between items-start gap-2 mb-1';

  const title = document.createElement('h3');
  title.className = 'text-xs font-semibold text-slate-900 dark:text-slate-100';
  title.textContent = law.title || law.name || 'Untitled law';

  const badge = document.createElement('span');
  badge.className =
    'inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  badge.textContent = `${law.level || 'Unknown'} • ${law.state || 'N/A'}`;

  header.appendChild(title);
  header.appendChild(badge);

  const desc = document.createElement('p');
  desc.className = 'text-[11px] text-slate-600 dark:text-slate-300 mb-1';
  desc.textContent = law.description || '';

  const meta = document.createElement('div');
  meta.className = 'flex flex-wrap gap-1 mb-2';

  (law.tags || []).forEach((tag) => {
    const chip = document.createElement('span');
    chip.className =
      'inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    chip.textContent = tag;
    meta.appendChild(chip);
  });

  const footer = document.createElement('div');
  footer.className = 'flex justify-between items-center mt-1';

  const link = document.createElement('a');
  link.href = law.link || '#';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className =
    'text-[11px] font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300';
  link.textContent = 'View source';

  footer.appendChild(link);

  card.appendChild(header);
  card.appendChild(desc);
  card.appendChild(meta);
  card.appendChild(footer);

  return card;
}

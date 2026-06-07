// components/FilterPanel.js
export function renderFilterPanel(container, { states, leaveTypes, onChange }) {
  container.innerHTML = '';

  const form = document.createElement('div');
  form.className = 'space-y-3 text-xs text-slate-700 dark:text-slate-200';

  // State select
  const stateGroup = document.createElement('div');
  const stateLabel = document.createElement('label');
  stateLabel.className = 'block text-[11px] font-medium mb-1';
  stateLabel.textContent = 'State';

  const stateSelect = document.createElement('select');
  stateSelect.className =
    'w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900';
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = 'All states';
  stateSelect.appendChild(defaultOpt);

  states.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.code;
    opt.textContent = s.name;
    stateSelect.appendChild(opt);
  });

  stateGroup.appendChild(stateLabel);
  stateGroup.appendChild(stateSelect);

<select id="stateFilter" multiple>
  const stateSelect = document.getElementById("stateFilter");
const selectedStates = Array.from(stateSelect.selectedOptions).map(o => o.value);

filters.states = selectedStates;

  
  // Leave type select
  const typeGroup = document.createElement('div');
  const typeLabel = document.createElement('label');
  typeLabel.className = 'block text-[11px] font-medium mb-1';
  typeLabel.textContent = 'Leave type';

  const typeSelect = document.createElement('select');
  typeSelect.className =
    'w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900';
  const defaultType = document.createElement('option');
  defaultType.value = '';
  defaultType.textContent = 'All types';
  typeSelect.appendChild(defaultType);

  leaveTypes.forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.label;
    typeSelect.appendChild(opt);
  });

  typeGroup.appendChild(typeLabel);
  typeGroup.appendChild(typeSelect);

  // Federal / state toggle
  const levelGroup = document.createElement('div');
  levelGroup.className = 'flex flex-wrap gap-2 items-center';

  const levelLabel = document.createElement('span');
  levelLabel.className = 'text-[11px] font-medium';
  levelLabel.textContent = 'Scope';

  const federalCheckbox = document.createElement('input');
  federalCheckbox.type = 'checkbox';
  federalCheckbox.id = 'filterFederal';
  federalCheckbox.checked = true;

  const federalLabel = document.createElement('label');
  federalLabel.htmlFor = 'filterFederal';
  federalLabel.className = 'text-[11px]';
  federalLabel.textContent = 'Federal';

  const stateCheckbox = document.createElement('input');
  stateCheckbox.type = 'checkbox';
  stateCheckbox.id = 'filterState';
  stateCheckbox.checked = true;

  const stateLabel2 = document.createElement('label');
  stateLabel2.htmlFor = 'filterState';
  stateLabel2.className = 'text-[11px]';
  stateLabel2.textContent = 'State';

  levelGroup.appendChild(levelLabel);
  levelGroup.appendChild(federalCheckbox);
  levelGroup.appendChild(federalLabel);
  levelGroup.appendChild(stateCheckbox);
  levelGroup.appendChild(stateLabel2);

  form.appendChild(stateGroup);
  form.appendChild(typeGroup);
  form.appendChild(levelGroup);

  container.appendChild(form);

  const emitChange = () => {
    onChange({
      state: stateSelect.value || null,
      leaveType: typeSelect.value || null,
      includeFederal: federalCheckbox.checked,
      includeState: stateCheckbox.checked,
    });
  };

  stateSelect.addEventListener('change', emitChange);
  typeSelect.addEventListener('change', emitChange);
  federalCheckbox.addEventListener('change', emitChange);
  stateCheckbox.addEventListener('change', emitChange);

  emitChange();
}

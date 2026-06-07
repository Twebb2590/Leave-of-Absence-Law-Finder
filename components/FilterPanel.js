// components/FilterPanel.js

export function renderFilterPanel(container, { states, leaveTypes, onChange }) {
  container.innerHTML = '';

  const form = document.createElement('div');
  form.className = 'space-y-3 text-xs text-slate-700';

  // -------------------------
  // STATE MULTI-SELECT
  // -------------------------
  const stateGroup = document.createElement('div');

  const stateLabel = document.createElement('label');
  stateLabel.className = 'block text-[11px] font-medium mb-1';
  stateLabel.textContent = 'States (select multiple)';
  stateGroup.appendChild(stateLabel);

  const stateSelect = document.createElement('select');
  stateSelect.multiple = true;          // <-- MULTI-SELECT ENABLED
  stateSelect.size = 5;                 // optional: shows 5 rows
  stateSelect.className =
    'w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs';

  states.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.code;
    opt.textContent = s.name;
    stateSelect.appendChild(opt);
  });

  stateGroup.appendChild(stateSelect);

  // -------------------------
  // LEAVE TYPE SELECT
  // -------------------------
  const typeGroup = document.createElement('div');

  const typeLabel = document.createElement('label');
  typeLabel.className = 'block text-[11px] font-medium mb-1';
  typeLabel.textContent = 'Leave type';
  typeGroup.appendChild(typeLabel);

  const typeSelect = document.createElement('select');
  typeSelect.className =
    'w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs';

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

  typeGroup.appendChild(typeSelect);

  // -------------------------
  // FEDERAL / STATE CHECKBOXES
  // -------------------------
  const levelGroup = document.createElement('div');
  levelGroup.className = 'flex flex-wrap gap-2 items-center';

  const levelLabel = document.createElement('span');
  levelLabel.className = 'text-[11px] font-medium';
  levelLabel.textContent = 'Scope';
  levelGroup.appendChild(levelLabel);

  const federalCheckbox = document.createElement('input');
  federalCheckbox.type = 'checkbox';
  federalCheckbox.checked = true;

  const federalLabel = document.createElement('label');
  federalLabel.textContent = 'Federal';
  levelGroup.appendChild(federalCheckbox);
  levelGroup.appendChild(federalLabel);

  const stateCheckbox = document.createElement('input');
  stateCheckbox.type = 'checkbox';
  stateCheckbox.checked = true;

  const stateLabel2 = document.createElement('label');
  stateLabel2.textContent = 'State';
  levelGroup.appendChild(stateCheckbox);
  levelGroup.appendChild(stateLabel2);

  // Add groups to form
  form.appendChild(stateGroup);
  form.appendChild(typeGroup);
  form.appendChild(levelGroup);

  container.appendChild(form);

  // -------------------------
  // EMIT FILTER CHANGES
  // -------------------------
  const emitChange = () => {
    const selectedStates = Array.from(stateSelect.selectedOptions).map(
      (o) => o.value
    );

    onChange({
      states: selectedStates,                 // <-- MULTIPLE STATES SENT OUT
      leaveType: typeSelect.value || null,
      includeFederal: federalCheckbox.checked,
      includeState: stateCheckbox.checked,
    });
  };

  stateSelect.addEventListener('change', emitChange);
  typeSelect.addEventListener('change', emitChange);
  federalCheckbox.addEventListener('change', emitChange);
  stateCheckbox.addEventListener('change', emitChange);

  emitChange(); // initialize filters
}

export function renderFilterPanel(container, { states, leaveTypes, onChange }) {
  container.innerHTML = '';

  function updateFiltersBadge(filters) {
  const badge = document.getElementById("filtersAppliedBadge");
  const countEl = document.getElementById("filtersAppliedCount");

  let count = 0;

  if (filters.states && filters.states.length > 0) count++;
  if (filters.leaveType) count++;
  if (filters.includeFederal === false) count++;
  if (filters.includeState === false) count++;

  if (count > 0) {
    countEl.textContent = count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

  // Create a flex row for all filter controls
  const row = document.createElement('div');
  row.className = 'filter-row'; // You will style this in CSS

  // -------------------------
  // STATE MULTI-SELECT
  // -------------------------
  const stateSelect = document.createElement('select');
  stateSelect.multiple = true;
  stateSelect.size = 5;
  stateSelect.className = 'filter-select';

  states.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.code;
    opt.textContent = s.name;
    stateSelect.appendChild(opt);
  });

  // -------------------------
  // LEAVE TYPE SELECT
  // -------------------------
  const typeSelect = document.createElement('select');
  typeSelect.className = 'filter-select';

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

  // -------------------------
  // CLEAR FILTERS BUTTON
  // -------------------------
  const clearBtn = document.createElement('button');
  clearBtn.id = 'clearAllFiltersBtn';
  clearBtn.textContent = 'Clear Filters';
  clearBtn.className = 'clear-btn';

  clearBtn.addEventListener('click', () => {
    stateSelect.selectedIndex = -1;
    typeSelect.value = '';
    onChange({
      states: [],
      leaveType: null,
      includeFederal: true,
      includeState: true
    });
  });

  // Add everything to the row
  row.appendChild(stateSelect);
  row.appendChild(typeSelect);
  row.appendChild(clearBtn);

  // Add row to container
  container.appendChild(row);

  // Emit changes
const emitChange = () => {
  const selectedStates = Array.from(stateSelect.selectedOptions).map(o => o.value);

  const filters = {
    states: selectedStates,
    leaveType: typeSelect.value || null,
    includeFederal: true,
    includeState: true
  };

  onChange(filters);
  updateFiltersBadge(filters);
};

  stateSelect.addEventListener('change', emitChange);
  typeSelect.addEventListener('change', emitChange);

  emitChange();
}

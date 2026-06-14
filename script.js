// -----------------------------
// Multi‑Page Safe Script.js
// -----------------------------

// Detect elements safely
const filterPanelContainer = document.getElementById("filterPanelContainer");
const currentFiltersSummary = document.getElementById("currentFiltersSummary");
const searchInput = document.getElementById("searchInput");
const clearAllFiltersBtn = document.getElementById("clearAllFiltersBtn");
const compareStatesBtn = document.getElementById("compareStatesBtn");
const resultsContainer = document.getElementById("resultsContainer");

// Track filters
let currentFilters = {
  state: null,
  leaveType: null,
  includeFederal: true,
  includeState: true,
};

if (!document.body.classList.contains("wizard-page")) {
    // put ALL your search logic inside here
}

// Master list of all laws loaded into the system
let allLaws = [];


// -----------------------------
// Only run FILTER PANEL if it exists
// -----------------------------
if (filterPanelContainer) {
  const STATES = [
    { code: "CA", name: "California" },
    { code: "NY", name: "New York" },
    { code: "PA", name: "Pennsylvania" },
  ];

  const LEAVE_TYPES = [
    { id: "medical", label: "Medical / Sick" },
    { id: "pregnancy", label: "Pregnancy / Birth" },
    { id: "family", label: "Family Care" },
    { id: "bereavement", label: "Bereavement" },
    { id: "military", label: "Military" },
    { id: "jury", label: "Court / Jury Duty" },
  ];

function renderFilterPanel(container, { states, leaveTypes, onChange }) {
  container.innerHTML = `
    <label>State:</label>
    <select id="stateFilter">
      <option value="">All</option>
      ${states.map(s => `<option value="${s.code}">${s.name}</option>`).join("")}
    </select>

    <label>Leave Type:</label>
    <select id="leaveTypeFilter">
      <option value="">All</option>
      ${leaveTypes.map(t => `<option value="${t.id}">${t.label}</option>`).join("")}
    </select>
  `;

  document.getElementById("stateFilter").addEventListener("change", (e) => {
    onChange({ state: e.target.value || null });
  });

  document.getElementById("leaveTypeFilter").addEventListener("change", (e) => {
    onChange({ leaveType: e.target.value || null });
  });
}
  
  renderFilterPanel(filterPanelContainer, {
    states: STATES,
    leaveTypes: LEAVE_TYPES,
    onChange: (filters) => {
      currentFilters = { ...currentFilters, ...filters };
      applyFiltersAndRender();
    },
  });
}

// -----------------------------
// Only run SEARCH if searchInput exists
// -----------------------------
if (searchInput) {
  let searchDebounce;

  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => applyFiltersAndRender(), 200);
  });
}

// -----------------------------
// Only run CLEAR FILTERS if button exists
// -----------------------------
if (clearAllFiltersBtn) {
  clearAllFiltersBtn.addEventListener("click", () => {
    currentFilters = {
      state: null,
      leaveType: null,
      includeFederal: true,
      includeState: true,
    };

    if (searchInput) searchInput.value = "";
    applyFiltersAndRender();
  });
}

// -----------------------------
// Only run COMPARE STATES button if it exists
// -----------------------------
if (compareStatesBtn) {
  compareStatesBtn.addEventListener("click", () => {
    window.location.href = "compare.html";
  });
}

// -----------------------------
// Only run RESULTS RENDERING if resultsContainer exists
// -----------------------------
function applyFiltersAndRender() {
  if (!resultsContainer) return;

  resultsContainer.innerHTML = "";

  const filtered = allLaws.filter((law) => {
    if (currentFilters.state && law.state !== currentFilters.state) return false;
    if (currentFilters.leaveType && law.type !== currentFilters.leaveType) return false;
    return true;
  });

  filtered.forEach((law) => {
    const card = document.createElement("div");
    card.className = "law-card";
    card.innerHTML = `
      <h3>${law.title}</h3>
      <p>${law.description}</p>
      <p><strong>State:</strong> ${law.state}</p>
      <p><strong>Type:</strong> ${law.type}</p>
    `;
    resultsContainer.appendChild(card);
  });
}

// -----------------------------
// Wizard → Search integration (safe)
// -----------------------------
window.addEventListener("wizardResults", (event) => {
  const { laws, wizardState } = event.detail;

  laws.forEach((law) => {
    if (!allLaws.some((l) => (l.id || l.title) === (law.id || law.title))) {
      allLaws.push(law);
    }
  });

  if (wizardState.state && wizardState.state !== "unknown") {
    currentFilters.state = wizardState.state;
  }

  applyFiltersAndRender();
});

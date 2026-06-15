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
  const states = [
    { code: "AL", name: "Alabama" },
    { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    { code: "DE", name: "Delaware" },
    { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" },
    { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" },
    { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" },
    { code: "DC", name: "District of Columbia" }
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
    states: states,
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
// Populate Compare States dropdowns if they exist
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const stateA = document.getElementById("stateA");
  const stateB = document.getElementById("stateB"); // if you have a second dropdown

  if (stateA) {
    const states = [
      { code: "AL", name: "Alabama" },
      { code: "AK", name: "Alaska" },
      { code: "AZ", name: "Arizona" },
      { code: "AR", name: "Arkansas" },
      { code: "CA", name: "California" },
      { code: "CO", name: "Colorado" },
      { code: "CT", name: "Connecticut" },
      { code: "DE", name: "Delaware" },
      { code: "FL", name: "Florida" },
      { code: "GA", name: "Georgia" },
      { code: "HI", name: "Hawaii" },
      { code: "ID", name: "Idaho" },
      { code: "IL", name: "Illinois" },
      { code: "IN", name: "Indiana" },
      { code: "IA", name: "Iowa" },
      { code: "KS", name: "Kansas" },
      { code: "KY", name: "Kentucky" },
      { code: "LA", name: "Louisiana" },
      { code: "ME", name: "Maine" },
      { code: "MD", name: "Maryland" },
      { code: "MA", name: "Massachusetts" },
      { code: "MI", name: "Michigan" },
      { code: "MN", name: "Minnesota" },
      { code: "MS", name: "Mississippi" },
      { code: "MO", name: "Missouri" },
      { code: "MT", name: "Montana" },
      { code: "NE", name: "Nebraska" },
      { code: "NV", name: "Nevada" },
      { code: "NH", name: "New Hampshire" },
      { code: "NJ", name: "New Jersey" },
      { code: "NM", name: "New Mexico" },
      { code: "NY", name: "New York" },
      { code: "NC", name: "North Carolina" },
      { code: "ND", name: "North Dakota" },
      { code: "OH", name: "Ohio" },
      { code: "OK", name: "Oklahoma" },
      { code: "OR", name: "Oregon" },
      { code: "PA", name: "Pennsylvania" },
      { code: "RI", name: "Rhode Island" },
      { code: "SC", name: "South Carolina" },
      { code: "SD", name: "South Dakota" },
      { code: "TN", name: "Tennessee" },
      { code: "TX", name: "Texas" },
      { code: "UT", name: "Utah" },
      { code: "VT", name: "Vermont" },
      { code: "VA", name: "Virginia" },
      { code: "WA", name: "Washington" },
      { code: "WV", name: "West Virginia" },
      { code: "WI", name: "Wisconsin" },
      { code: "WY", name: "Wyoming" },
      { code: "DC", name: "District of Columbia" }
    ];

    states.forEach(s => {
      const optA = document.createElement("option");
      optA.value = s.code;
      optA.textContent = s.name;
      stateA.appendChild(optA);

      if (stateB) {
        const optB = document.createElement("option");
        optB.value = s.code;
        optB.textContent = s.name;
        stateB.appendChild(optB);
      }
    });
  }
});

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

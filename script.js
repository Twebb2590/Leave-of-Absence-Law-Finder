// script.js
import { renderFilterPanel } from './components/FilterPanel.js';
import { createLawCard } from './components/LawCard.js';
import { loadFederalLaws, loadStateLaws } from './data-loader.js';

// DOM refs
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const resultsCount = document.getElementById('resultsCount');
const activeFiltersSummary = document.getElementById('activeFiltersSummary');
const filterPanelContainer = document.getElementById('filterPanelContainer');
const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
const showBookmarksBtn = document.getElementById('showBookmarksBtn');
const compareStatesBtn = document.getElementById('compareStatesBtn');
const appBody = document.getElementById('app-body');

let allLaws = [];
let filteredLaws = [];
let currentFilters = {
  state: null,
  leaveType: null,
  includeFederal: true,
  includeState: true,
};
let bookmarks = new Set();
let showingBookmarks = false;

// Bookmarks
function loadBookmarks() {
  try {
    const raw = localStorage.getItem('loa_bookmarks');
    if (!raw) return;
    const arr = JSON.parse(raw);
    bookmarks = new Set(arr);
  } catch {
    bookmarks = new Set();
  }
}

function saveBookmarks() {
  localStorage.setItem('loa_bookmarks', JSON.stringify(Array.from(bookmarks)));
}

function isBookmarked(law) {
  return bookmarks.has(law.id || law.title);
}

function toggleBookmark(law) {
  const key = law.id || law.title;
  if (!key) return;
  if (bookmarks.has(key)) {
    bookmarks.delete(key);
  } else {
    bookmarks.add(key);
  }
  saveBookmarks();
  applyFiltersAndRender();
}

// Data loading
async function loadAllLaws(initialStateCode = null) {
  const federal = await loadFederalLaws();
  const state = initialStateCode ? await loadStateLaws(initialStateCode) : [];

  allLaws = [...federal, ...state];
  applyFiltersAndRender();
}

// Filters + search
function applyFiltersAndRender() {
  const query = (searchInput.value || '').toLowerCase().trim();

  filteredLaws = allLaws.filter((law) => {
    // Scope
    const level = (law.level || '').toLowerCase();
    if (level === 'federal' && !currentFilters.includeFederal) return false;
    if (level === 'state' && !currentFilters.includeState) return false;

    // State
    if (currentFilters.state && law.state && law.state !== currentFilters.state) {
      return false;
    }

    // Leave type (simple tag match)
    if (currentFilters.leaveType) {
      const tags = (law.tags || []).map((t) => t.toLowerCase());
      if (!tags.some((t) => t.includes(currentFilters.leaveType.toLowerCase()))) {
        return false;
      }
    }

    // Bookmarks view
    if (showingBookmarks && !isBookmarked(law)) {
      return false;
    }

    // Search
    if (query) {
      const haystack = [
        law.title || '',
        law.description || '',
        ...(law.tags || []),
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  renderResults();
}

function renderResults() {
  resultsContainer.innerHTML = '';

  resultsCount.textContent = `${filteredLaws.length} law${filteredLaws.length === 1 ? '' : 's'} found`;

  const parts = [];
  if (currentFilters.state) parts.push(`State: ${currentFilters.state}`);
  if (currentFilters.leaveType) parts.push(`Type: ${currentFilters.leaveType}`);
  if (!currentFilters.includeFederal) parts.push('Federal excluded');
  if (!currentFilters.includeState) parts.push('State excluded');
  if (showingBookmarks) parts.push('Showing bookmarks only');

  activeFiltersSummary.textContent = parts.length ? parts.join(' • ') : 'No filters applied';

  if (!filteredLaws.length) {
    const empty = document.createElement('p');
    empty.className = 'text-[11px] text-slate-500 dark:text-slate-400';
    empty.textContent =
      'No laws match your current search and filters. Try adjusting your keywords or filter options.';
    resultsContainer.appendChild(empty);
    return;
  }

  filteredLaws.forEach((law) => {
    const card = createLawCard(law, {
      onBookmarkToggle: toggleBookmark,
      isBookmarked: isBookmarked(law),
    });
    resultsContainer.appendChild(card);
  });
}

// Filter panel setup
const STATES = [
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'PA', name: 'Pennsylvania' },
  // Add more as needed
];

const LEAVE_TYPES = [
  { id: 'medical', label: 'Medical / Sick' },
  { id: 'pregnancy', label: 'Pregnancy / Birth' },
  { id: 'family', label: 'Family Care' },
  { id: 'bereavement', label: 'Bereavement' },
  { id: 'military', label: 'Military' },
  { id: 'jury', label: 'Court / Jury Duty' },
];

renderFilterPanel(filterPanelContainer, {
  states: STATES,
  leaveTypes: LEAVE_TYPES,
  onChange: (filters) => {
    currentFilters = { ...currentFilters, ...filters };
    applyFiltersAndRender();
  },
});

// Events
let searchDebounce;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => applyFiltersAndRender(), 200);
});

clearAllFiltersBtn.addEventListener('click', () => {
  currentFilters = {
    state: null,
    leaveType: null,
    includeFederal: true,
    includeState: true,
  };
  showingBookmarks = false;
  searchInput.value = '';
  applyFiltersAndRender();
});

showBookmarksBtn.addEventListener('click', () => {
  showingBookmarks = !showingBookmarks;
  applyFiltersAndRender();
});

compareStatesBtn.addEventListener('click', () => {
  alert(
    'Compare states feature: in a full build, this would show side-by-side differences. For now, adjust the state filter to explore.'
  );
});

// Listen for wizard results
window.addEventListener('wizardResults', (event) => {
  const { laws, wizardState } = event.detail;
  // Merge wizard-highlighted laws into allLaws if not already present
  laws.forEach((law) => {
    if (!allLaws.some((l) => (l.id || l.title) === (law.id || law.title))) {
      allLaws.push(law);
    }
  });

  // Optionally set state filter based on wizard
  if (wizardState.state && wizardState.state !== 'unknown') {
    currentFilters.state = wizardState.state;
  }

  applyFiltersAndRender();
});

// Init
document.addEventListener('DOMContentLoaded', async () => {
  loadBookmarks();
  await loadAllLaws(null); // or pass a default state code if you want
});

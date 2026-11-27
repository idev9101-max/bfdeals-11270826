const shapes = {
  Audio: '<circle cx="24" cy="24" r="5"/><path d="M15 15a13 13 0 0 0 0 18M33 15a13 13 0 0 1 0 18M9 9a21 21 0 0 0 0 30M39 9a21 21 0 0 1 0 30"/>',
  Accessories: '<rect x="14" y="7" width="20" height="15" rx="3"/><path d="M19 22v8M29 22v8M17 30h14v3a7 7 0 0 1-14 0zM24 7V3"/>',
  Phones: '<rect x="15" y="5" width="18" height="38" rx="4"/><path d="M21 10h6M22 37h4"/>',
  'TV & Displays': '<rect x="5" y="9" width="38" height="26" rx="3"/><path d="M18 41h12M24 35v6M12 17l6 6-6 6M36 17l-6 6 6 6"/>',
  Wearables: '<rect x="15" y="14" width="18" height="20" rx="5"/><path d="M19 14V7h10v7M19 34v7h10v-7M24 21v5l3 2"/>',
  Computers: '<rect x="9" y="10" width="30" height="22" rx="2"/><path d="M4 36h40M18 37h12M14 16h20"/>',
  'Home & Cleaning': '<path d="M11 36c2-11 6-18 13-26 7 8 11 15 13 26z"/><path d="M11 36h26M17 26h14M24 4v6M17 31h14"/>',
  'Home & Kitchen': '<path d="M9 15h23v17a8 8 0 0 1-8 8h-7a8 8 0 0 1-8-8z"/><path d="M32 20h4a5 5 0 0 1 0 10h-4M16 8c2 2 2 4 0 6M24 8c2 2 2 4 0 6"/>',
};

export function categoryIcon(category) {
  return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[category] ?? '<path d="M24 5 43 24 24 43 5 24zM24 14 34 24 24 34 14 24z"/>'}</svg>`;
}

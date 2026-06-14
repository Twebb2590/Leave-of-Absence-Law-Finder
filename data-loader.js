const BASE = `${window.location.origin}${window.location.pathname.split("?")[0].replace(/\/$/, "")}/`;

export async function loadFederalLaws() {
  try {
    const res = await fetch(`${BASE}federal/laws.json`);
    if (!res.ok) throw new Error('Failed to load federal laws');
    const data = await res.json();

    return data.map(law => ({
      id: law.id,
      title: law.name,
      level: "Federal",
      state: "US",
      description: law.description,
      link: law.official_url,
      tags: law.tags || []
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function loadStateLaws(stateCode) {
  if (!stateCode) return [];
  try {
    const res = await fetch(`${BASE}states/${stateCode}/laws.json`);
    if (!res.ok) throw new Error('Failed to load state laws');

    const data = await res.json();
    const laws = data.laws || [];

    return laws.map(law => ({
      id: law.id,
      title: law.name,
      level: "State",
      state: stateCode,
      description: law.description,
      link: law.official_url,
      tags: law.tags || []
    }));
  } catch (e) {
    console.error(`State law load failed for ${stateCode}:`, e);
    return [];
  }
export async function allLaws() {
  const federal = await loadFederalLaws();
  const states = await Promise.all(
    STATE_CODES.map(code => loadStateLaws(code))
  );

  return [...federal, ...states.flat()];
}

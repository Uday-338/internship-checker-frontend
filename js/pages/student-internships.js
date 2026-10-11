if (initLayout()) (async () => {
  let all = [];
  const render = () => {
    const q = $("search").value.toLowerCase(), loc = $("locFilter").value;
    const rows = all.filter((i) =>
      (!loc || i.location === loc) &&
      [i.company, i.title, ...UI.list(i.requiredSkills)].join(" ").toLowerCase().includes(q));
    $("list").innerHTML = rows.length ? rows.map((i) => `
      <article class="card internship-card">
        <div><h2>${UI.esc(i.title)}</h2><div class="co">${UI.esc(i.company)}</div></div>
        ${UI.internshipMeta(i)}
        <div><span class="small muted">Eligible branches</span><br>${UI.chips(i.eligibleBranches)}</div>
        <div><span class="small muted">Required skills</span><br>${UI.chips(i.requiredSkills)}</div>
        <div><a class="btn sm" href="internship-details.html?id=${encodeURIComponent(i.id)}">View details</a></div>
      </article>`).join("") : `<div style="grid-column:1/-1">${UI.empty("No internships match your search.")}</div>`;
  };
  try {
    all = await InternshipService.getAll();
    [...new Set(all.map((i) => i.location).filter(Boolean))].forEach((l) => $("locFilter").insertAdjacentHTML("beforeend", `<option>${UI.esc(l)}</option>`));
    render();
  } catch (e) { $("list").innerHTML = `<div style="grid-column:1/-1">${UI.empty(UI.esc(e.message))}</div>`; }
  $("search").oninput = render; $("locFilter").onchange = render;
})();
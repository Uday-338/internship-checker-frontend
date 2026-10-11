if (initLayout()) (async () => {
  let all = [];
  const render = () => {
    const q = $("search").value.toLowerCase();
    const rows = all.filter((s) => [s.name, s.email, s.branch].join(" ").toLowerCase().includes(q));
    $("table").innerHTML = rows.length
      ? `<div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Branch</th><th>Year</th><th>CGPA</th><th>Skills</th><th></th></tr></thead><tbody>${
          rows.map((s) => `<tr><td>${UI.esc(s.name)}</td><td>${UI.esc(s.email)}</td><td>${UI.esc(s.branch)}</td><td>${UI.esc(s.year)}</td><td>${UI.esc(s.cgpa)}</td>
            <td>${UI.chips(s.skills)}</td><td><button class="btn sm outline" data-view="${UI.esc(s.id)}">View</button></td></tr>`).join("")
        }</tbody></table></div>`
      : UI.empty("No students found.");
  };
  try { all = await StudentService.getAll(); render(); } catch (e) { $("table").innerHTML = UI.empty(UI.esc(e.message)); }

  $("search").oninput = render;
  $("closeModal").onclick = () => UI.closeModal("viewModal");
  $("table").onclick = (e) => {
    const b = e.target.closest("[data-view]"); if (!b) return;
    const s = all.find((x) => String(x.id) === b.dataset.view);
    const link = /^https?:\/\//i.test(s.resumeLink || "") ? `<a href="${UI.esc(s.resumeLink)}" target="_blank" rel="noopener">Open resume</a>` : "Not provided";
    $("profileBody").innerHTML = `<dl class="detail-list">
      <div><dt>Name</dt><dd>${UI.esc(s.name)}</dd></div><div><dt>Email</dt><dd>${UI.esc(s.email)}</dd></div>
      <div><dt>Phone</dt><dd>${UI.esc(s.phone)}</dd></div><div><dt>Branch / Year</dt><dd>${UI.esc(s.branch)} / ${UI.esc(s.year)}</dd></div>
      <div><dt>CGPA</dt><dd>${UI.esc(s.cgpa)}</dd></div><div><dt>Resume</dt><dd>${link}</dd></div>
      <div style="grid-column:1/-1"><dt>Skills</dt><dd>${UI.chips(s.skills)}</dd></div>
      <div style="grid-column:1/-1"><dt>Certifications</dt><dd>${UI.chips(s.certifications)}</dd></div></dl>`;
    UI.openModal("viewModal");
  };
})();

if (initLayout()) (async () => {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) { $("detail").innerHTML = UI.empty("No internship selected."); return; }
  let internship, alreadyApplied = false;

  try { internship = await InternshipService.getById(id); }
  catch (e) { $("detail").innerHTML = UI.empty(UI.esc(e.message)); return; }
  // Only a convenience badge: if this lookup fails the page still works, and the backend (409) remains the real duplicate check.
  try {
    const mine = await ApplicationService.getMine();
    alreadyApplied = mine.some((a) => String(a.internship?.id) === String(id));
  } catch { /* ignore */ }

  const i = internship;
  $("detail").innerHTML = `
    <div class="row-between"><div><h1>${UI.esc(i.title)}</h1><div class="muted">${UI.esc(i.company)}</div></div>
      ${alreadyApplied ? '<span class="badge b-applied">Already applied</span>' : ""}</div>
    <dl class="detail-list">
      <div><dt>Location</dt><dd>${UI.esc(i.location)}</dd></div><div><dt>Duration</dt><dd>${UI.esc(i.duration)}</dd></div>
      <div><dt>Stipend</dt><dd>${UI.stipend(i.stipend)}</dd></div><div><dt>Minimum CGPA</dt><dd>${UI.esc(i.minCgpa)}</dd></div>
      <div><dt>Eligible branches</dt><dd>${UI.chips(i.eligibleBranches)}</dd></div>
      <div><dt>Required skills</dt><dd>${UI.chips(i.requiredSkills)}</dd></div>
    </dl>
    ${i.description ? `<p style="margin-bottom:14px">${UI.esc(i.description)}</p>` : ""}
    <button class="btn" id="checkBtn">Check eligibility</button>`;

  $("checkBtn").onclick = async (e) => {
    try {
      const r = await UI.busy(e.target, "Checking...", () => InternshipService.checkEligibility(id));
      showResult(r);
    } catch (ex) { UI.toast(ex.message, "error"); }
  };

  function showResult(r) {
    const pct = Math.max(0, Math.min(100, Math.round(r.skillMatchPercentage ?? 0)));
    const reasons = UI.list(r.reasons), tips = UI.list(r.suggestions), missing = UI.list(r.missingSkills);
    $("result").innerHTML = `
      <section class="result ${r.eligible ? "ok" : "no"}" aria-live="polite">
        <div class="verdict">${r.eligible ? "✅ Eligible" : "❌ Not eligible"}</div>
        <p style="margin-top:6px">${r.eligible ? "You meet all the requirements for this internship." : "You do not meet every requirement yet."}</p>
        <h3 style="margin-top:16px">Skill match: ${pct}%</h3>
        <div class="bar"><i style="width:${pct}%"></i></div>
        ${missing.length ? `<h3>Missing skills</h3><div>${UI.chips(missing, "bad")}</div>` : ""}
        ${!r.eligible ? `<h3>Why you are not eligible</h3>${reasons.length ? `<ul>${reasons.map((x) => `<li>${UI.esc(x)}</li>`).join("")}</ul>` : '<p class="muted">The server did not give a specific reason.</p>'}` : ""}
        ${tips.length ? `<h3>How to improve</h3><ul>${tips.map((x) => `<li>${UI.esc(x)}</li>`).join("")}</ul>` : ""}
        ${r.eligible ? `<div style="margin-top:16px"><button class="btn" id="applyBtn" ${alreadyApplied ? "disabled" : ""}>${alreadyApplied ? "Already applied" : "Apply now"}</button></div>` : ""}
      </section>`;
    $("result").scrollIntoView({ behavior: "smooth", block: "nearest" });

    const apply = $("applyBtn");
    if (apply && !alreadyApplied) apply.onclick = async () => {
      try {
        await UI.busy(apply, "Applying...", () => ApplicationService.apply(id));
        alreadyApplied = true; apply.disabled = true; apply.textContent = "Already applied";
        UI.toast("Application submitted", "success");
      } catch (ex) {
        if (ex.status === 409) { alreadyApplied = true; apply.disabled = true; apply.textContent = "Already applied"; }
        UI.toast(ex.message, "error");
      }
    };
  }
})();

if (initLayout()) (async () => {
  let all = [];
  $("statusFilter").insertAdjacentHTML("beforeend", CONFIG.STATUSES.map((s) => `<option>${s}</option>`).join(""));

  const render = () => {
    const q = $("search").value.toLowerCase(), st = $("statusFilter").value;
    const rows = all.filter((a) => (!st || String(a.status).toUpperCase() === st) &&
      [a.student?.name, a.internship?.company, a.internship?.title].join(" ").toLowerCase().includes(q));
    $("table").innerHTML = rows.length
      ? `<div class="table-wrap"><table><thead><tr><th>Student</th><th>Branch / CGPA</th><th>Company</th><th>Internship</th><th>Applied on</th><th>Status</th><th>Update</th></tr></thead><tbody>${
          rows.map((a) => `<tr><td>${UI.esc(a.student?.name)}<br><span class="small muted">${UI.esc(a.student?.email)}</span></td>
            <td>${UI.esc(a.student?.branch)} / ${UI.esc(a.student?.cgpa)}</td><td>${UI.esc(a.internship?.company)}</td><td>${UI.esc(a.internship?.title)}</td>
            <td>${UI.date(a.appliedDate)}</td><td>${UI.statusBadge(a.status)}</td>
            <td><div class="actions"><select aria-label="New status" data-sel="${UI.esc(a.id)}">${CONFIG.STATUSES.map((s) => `<option ${s === String(a.status).toUpperCase() ? "selected" : ""}>${s}</option>`).join("")}</select>
            <button class="btn sm" data-save="${UI.esc(a.id)}">Update</button></div></td></tr>`).join("")
        }</tbody></table></div>`
      : UI.empty("No applications match.");
  };
  try { all = await ApplicationService.getAll(); render(); } catch (e) { $("table").innerHTML = UI.empty(UI.esc(e.message)); }

  $("search").oninput = render; $("statusFilter").onchange = render;
  $("table").onclick = async (e) => {
    const b = e.target.closest("[data-save]"); if (!b) return;
    const status = $("table").querySelector(`[data-sel="${b.dataset.save}"]`).value;
    try {
      await UI.busy(b, "Saving...", () => ApplicationService.updateStatus(b.dataset.save, status));
      const a = all.find((x) => String(x.id) === b.dataset.save); a.status = status;
      UI.toast("Status updated", "success"); render();
    } catch (ex) { UI.toast(ex.message, "error"); }
  };
})();

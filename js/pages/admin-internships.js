if (initLayout()) (async () => {
  let all = [], editingId = null;
  const fields = ["company", "title", "location", "duration", "stipend", "minCgpa", "eligibleBranches", "requiredSkills", "description"];

  const render = () => {
    const q = $("search").value.toLowerCase();
    const rows = all.filter((i) => (i.company + " " + i.title).toLowerCase().includes(q));
    $("table").innerHTML = rows.length
      ? `<div class="table-wrap"><table><thead><tr><th>Company</th><th>Title</th><th>Location</th><th>Duration</th><th>Stipend</th><th>Min CGPA</th><th>Branches</th><th>Skills</th><th>Actions</th></tr></thead><tbody>${
          rows.map((i) => `<tr><td>${UI.esc(i.company)}</td><td>${UI.esc(i.title)}</td><td>${UI.esc(i.location)}</td><td>${UI.esc(i.duration)}</td>
            <td>${UI.stipend(i.stipend)}</td><td>${UI.esc(i.minCgpa)}</td><td>${UI.chips(i.eligibleBranches)}</td><td>${UI.chips(i.requiredSkills)}</td>
            <td><div class="actions"><button class="btn sm outline" data-edit="${UI.esc(i.id)}">Edit</button><button class="btn sm danger" data-del="${UI.esc(i.id)}">Delete</button></div></td></tr>`).join("")
        }</tbody></table></div>`
      : UI.empty("No internships found. Use “Add internship” to create one.");
  };
  const load = async () => {
    try { all = await InternshipService.getAll(); render(); }
    catch (e) { $("table").innerHTML = UI.empty(UI.esc(e.message)); }
  };

  const openForm = (i) => {
    editingId = i ? i.id : null;
    $("modalTitle").textContent = i ? "Edit internship" : "Add internship";
    $("internForm").reset();
    if (i) fields.forEach((f) => ($(f).value = Array.isArray(i[f]) ? i[f].join(", ") : i[f] ?? ""));
    UI.openModal("formModal");
  };
  const close = () => UI.closeModal("formModal");

  $("addBtn").onclick = () => openForm(null);
  $("closeModal").onclick = close; $("cancelBtn").onclick = close;
  $("search").oninput = render;

  $("table").onclick = async (e) => {
    const edit = e.target.closest("[data-edit]"), del = e.target.closest("[data-del]");
    if (edit) openForm(all.find((i) => String(i.id) === edit.dataset.edit));
    if (del && confirm("Delete this internship? Related applications may also be affected.")) {
      try { await InternshipService.remove(del.dataset.del); UI.toast("Internship deleted", "success"); load(); }
      catch (ex) { UI.toast(ex.message, "error"); }
    }
  };

  $("internForm").onsubmit = async (e) => {
    e.preventDefault();
    const data = {
      company: $("company").value.trim(), title: $("title").value.trim(), location: $("location").value.trim(),
      duration: $("duration").value.trim(), stipend: Number($("stipend").value), minCgpa: Number($("minCgpa").value),
      eligibleBranches: UI.list($("eligibleBranches").value), requiredSkills: UI.list($("requiredSkills").value),
      description: $("description").value.trim(),
    };
    try {
      await UI.busy($("saveBtn"), "Saving...", () => editingId ? InternshipService.update(editingId, data) : InternshipService.create(data));
      UI.toast(editingId ? "Internship updated" : "Internship added", "success");
      close(); load();
    } catch (ex) { UI.toast(ex.message, "error"); }
  };
  load();
})();

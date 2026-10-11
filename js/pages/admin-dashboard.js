if (initLayout()) (async () => {
  try {
    const [internships, students, apps] = await Promise.all([InternshipService.getAll(), StudentService.getAll(), ApplicationService.getAll()]);
    $("sInternships").textContent = internships.length;
    $("sStudents").textContent = students.length;
    $("sApps").textContent = apps.length;
    $("sPending").textContent = apps.filter((a) => String(a.status).toUpperCase() === "APPLIED").length;
    $("recent").innerHTML = apps.length
      ? `<div class="table-wrap"><table><thead><tr><th>Student</th><th>Company</th><th>Internship</th><th>Applied on</th><th>Status</th></tr></thead><tbody>${
          apps.slice(0, 6).map((a) => `<tr><td>${UI.esc(a.student?.name)}</td><td>${UI.esc(a.internship?.company)}</td><td>${UI.esc(a.internship?.title)}</td><td>${UI.date(a.appliedDate)}</td><td>${UI.statusBadge(a.status)}</td></tr>`).join("")
        }</tbody></table></div>`
      : UI.empty("No applications received yet.");
  } catch (e) { UI.toast(e.message, "error"); $("recent").innerHTML = UI.empty(UI.esc(e.message)); }
})();

if (initLayout()) (async () => {
  $("welcome").textContent = `Welcome back, ${Session.getUser().name || "student"}!`;
  try {
    const [internships, apps, profile] = await Promise.all([
      InternshipService.getAll(), ApplicationService.getMine(), StudentService.getProfile(),
    ]);
    const count = (s) => apps.filter((a) => String(a.status).toUpperCase() === s).length;
    $("sInternships").textContent = internships.length;
    $("sApplied").textContent = apps.length;
    $("sShort").textContent = count("SHORTLISTED");
    $("sSel").textContent = count("SELECTED");
    if (!profile.cgpa || !UI.list(profile.skills).length) $("profileAlert").classList.remove("hidden");

    $("recent").innerHTML = apps.length
      ? `<div class="table-wrap"><table><thead><tr><th>Company</th><th>Internship</th><th>Applied on</th><th>Status</th></tr></thead><tbody>${
          apps.slice(0, 5).map((a) => `<tr><td>${UI.esc(a.internship?.company)}</td><td>${UI.esc(a.internship?.title)}</td><td>${UI.date(a.appliedDate)}</td><td>${UI.statusBadge(a.status)}</td></tr>`).join("")
        }</tbody></table></div>`
      : UI.empty('You have not applied yet. <a href="internships.html">Find an internship</a> and check your eligibility.');
  } catch (e) { UI.toast(e.message, "error"); $("recent").innerHTML = UI.empty(UI.esc(e.message)); }
})();

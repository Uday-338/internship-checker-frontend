if (initLayout()) (async () => {
  try {
    const apps = await ApplicationService.getMine();
    $("appTable").innerHTML = apps.length
      ? `<div class="table-wrap"><table><thead><tr><th>Company</th><th>Internship</th><th>Location</th><th>Applied on</th><th>Status</th></tr></thead><tbody>${
          apps.map((a) => `<tr><td>${UI.esc(a.internship?.company)}</td>
            <td><a href="internship-details.html?id=${encodeURIComponent(a.internship?.id)}">${UI.esc(a.internship?.title)}</a></td>
            <td>${UI.esc(a.internship?.location)}</td><td>${UI.date(a.appliedDate)}</td><td>${UI.statusBadge(a.status)}</td></tr>`).join("")
        }</tbody></table></div>`
      : UI.empty('No applications yet. <a href="internships.html">Browse internships</a>.');
  } catch (e) { $("appTable").innerHTML = UI.empty(UI.esc(e.message)); }
})();

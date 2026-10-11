if (initLayout()) (async () => {
  $("branch").innerHTML = CONFIG.BRANCHES.map((b) => `<option>${b}</option>`).join("");
  const showChips = () => ($("skillChips").innerHTML = UI.chips($("skills").value));
  $("skills").addEventListener("input", showChips);

  try {
    const p = await StudentService.getProfile();
    $("name").value = p.name ?? ""; $("email").value = p.email ?? ""; $("phone").value = p.phone ?? "";
    $("branch").value = p.branch ?? ""; $("year").value = p.year ?? 1; $("cgpa").value = p.cgpa ?? "";
    $("skills").value = UI.list(p.skills).join(", ");
    $("certifications").value = UI.list(p.certifications).join(", ");
    $("resumeLink").value = p.resumeLink ?? "";
    showChips();
  } catch (e) { UI.toast(e.message, "error"); }

  $("profileForm").onsubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await UI.busy($("saveBtn"), "Saving...", () => StudentService.updateProfile({
        name: $("name").value.trim(), phone: $("phone").value.trim(), branch: $("branch").value,
        year: Number($("year").value), cgpa: Number($("cgpa").value),
        skills: UI.list($("skills").value), certifications: UI.list($("certifications").value),
        resumeLink: $("resumeLink").value.trim(),
      }));
      const u = Session.getUser(); u.name = $("name").value.trim(); Session.save(Session.getToken(), u);
      UI.toast("Profile saved", "success");
    } catch (ex) { UI.toast(ex.message, "error"); }
  };
})();

(() => {
  const err = $("error");
  const showErr = (m) => { err.textContent = m; err.classList.remove("hidden"); };
  $("branch").innerHTML = '<option value="">Select</option>' + CONFIG.BRANCHES.map((b) => `<option>${b}</option>`).join("");

  $("regForm").onsubmit = async (e) => {
    e.preventDefault();
    err.classList.add("hidden");
    if ($("password").value !== $("confirm").value) return showErr("Passwords do not match.");
    const cgpa = Number($("cgpa").value);
    if (cgpa < 0 || cgpa > 10) return showErr("CGPA must be between 0 and 10.");
    try {
      await UI.busy($("submitBtn"), "Creating account...", () => AuthService.register({
        name: $("name").value.trim(), email: $("email").value.trim(), phone: $("phone").value.trim(),
        branch: $("branch").value, year: Number($("year").value), cgpa, password: $("password").value,
      }));
      UI.toast("Account created. Please log in.", "success");
      setTimeout(() => (location.href = "login.html"), 1000);
    } catch (ex) { showErr(ex.message); }
  };
})();

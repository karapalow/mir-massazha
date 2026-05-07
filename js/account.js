document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-dashboard]");
  if (!root) return;

  const u = window.MIR_AUTH?.currentUser?.();
  if (!u) {
    window.location.href = "./auth.html";
    return;
  }

  const hello = root.querySelector("[data-hello]");
  const profile = root.querySelector("[data-profile]");
  const appts = root.querySelector("[data-appointments]");
  const logoutBtn = root.querySelector("[data-logout]");
  const editBtn = root.querySelector("[data-edit-profile]");
  const seminarsPanel = root.querySelector("[data-seminars]");

  if (hello) hello.textContent = `Здравствуйте, ${u.name}`;

  const readJson = (k, fallback) => {
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };
  const writeJson = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  const LS_BOOKINGS = "mir_bookings";

  const renderProfile = () => {
    if (!profile) return;
    profile.innerHTML = `
      <div class="mir-kv"><span>Имя</span><strong>${escapeHtml(u.name)}</strong></div>
      <div class="mir-kv"><span>Email</span><strong>${escapeHtml(u.email)}</strong></div>
      <div class="mir-kv"><span>Тип</span><strong>${escapeHtml(u.type)}</strong></div>
      <div class="mir-kv"><span>Email подтверждён</span><strong>${u.verifiedEmail ? "Да" : "Нет (MVP)"}</strong></div>
    `;
  };

  const renderAppointments = () => {
    if (!appts) return;
    const bookings = readJson(LS_BOOKINGS, []).filter((b) => b.userId === u.id);
    if (!bookings.length) {
      appts.innerHTML = `<div class="mir-empty">Пока нет записей. Создайте запись через онлайн‑бронь.</div>`;
      return;
    }

    appts.innerHTML = bookings
      .slice()
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .map((b) => `
        <div class="mir-appointment">
          <div class="mir-appointment__top">
            <div class="mir-appointment__title">${escapeHtml(b.serviceTitle || "Запись")}</div>
            <div class="mir-appointment__badge">${escapeHtml(b.status || "Создана")}</div>
          </div>
          <div class="mir-appointment__meta">
            <div><strong>Филиал:</strong> ${escapeHtml(b.branchText || "—")}</div>
            <div><strong>Специалист:</strong> ${escapeHtml(b.specialistName || "—")}</div>
            <div><strong>Дата/время:</strong> ${escapeHtml(b.slotText || "—")}</div>
            <div><strong>Предоплата:</strong> ${escapeHtml(b.prepayText || "—")}</div>
            <div><strong>ID:</strong> ${escapeHtml(b.id)}</div>
          </div>
        </div>
      `)
      .join("");
  };

  const renderSuperAdminPanel = () => {
    if (!seminarsPanel) return;
    if (!u.superAdmin) return;
    seminarsPanel.innerHTML = `
      <div class="mir-bodymap__method">
        <div class="mir-bodymap__card-title">Супер‑админ режим</div>
        <div style="font-size:14px; color:#334155;">
          Полные права активированы для этого email.
        </div>
        <div style="display:grid; gap:8px; margin-top:10px;">
          <button class="btn btn--secondary" type="button">Управление семинарами (плейсхолдер)</button>
          <button class="btn btn--secondary" type="button">Управление записями (плейсхолдер)</button>
          <button class="btn btn--secondary" type="button">QR Check‑in панель (плейсхолдер)</button>
          <button class="btn btn--secondary" type="button">Сертификаты и переводы (плейсхолдер)</button>
        </div>
      </div>
    `;
  };

  const escapeHtml = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const openEdit = () => {
    const name = prompt("Имя", u.name);
    if (name === null) return;
    const email = prompt("Email", u.email);
    if (email === null) return;

    const users = window.MIR_AUTH.getUsers();
    const idx = users.findIndex((x) => x.id === u.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], name: String(name || "").trim() || users[idx].name, email: String(email || "").trim() || users[idx].email };
      writeJson("mir_users", users);
    }

    // refresh in-memory user
    window.location.reload();
  };

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.MIR_AUTH.logout();
      window.location.href = "./auth.html";
    });
  }
  if (editBtn) editBtn.addEventListener("click", openEdit);

  renderProfile();
  renderAppointments();
  renderSuperAdminPanel();
});


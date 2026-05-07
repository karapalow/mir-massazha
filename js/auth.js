/*
  MIR Auth (MVP for static site)
  - Users are stored in localStorage (mir_users)
  - Current session stored in localStorage (mir_session)
  This is a UX/feature scaffold. For production: Next.js + Auth.js + PostgreSQL.
*/

(() => {
  const LS_USERS = "mir_users";
  const LS_SESSION = "mir_session";
  const LS_SUPER_ADMINS = "mir_super_admin_emails";
  // Main super-admin email(s). You can override via localStorage key mir_super_admin_emails.
  const SUPER_ADMIN_EMAILS_DEFAULT = ["admin@mir.uz"];

  const nowIso = () => new Date().toISOString();
  const uid = () => `mir_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

  const readJson = (k, fallback) => {
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const writeJson = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  const getUsers = () => readJson(LS_USERS, []);
  const setUsers = (u) => writeJson(LS_USERS, u);

  const getSuperAdminEmails = () => {
    const fromLs = readJson(LS_SUPER_ADMINS, null);
    const list = Array.isArray(fromLs) && fromLs.length ? fromLs : SUPER_ADMIN_EMAILS_DEFAULT;
    return list.map((x) => String(x).trim().toLowerCase());
  };

  const isSuperAdminEmail = (email) => getSuperAdminEmails().includes(String(email || "").trim().toLowerCase());

  const getSession = () => readJson(LS_SESSION, null);
  const setSession = (s) => writeJson(LS_SESSION, s);

  const findUserByEmail = (email) => {
    const users = getUsers();
    return users.find((u) => String(u.email).toLowerCase() === String(email).toLowerCase()) || null;
  };

  const normalizePhone = (phone) => String(phone || "").replace(/[^\d+]/g, "").trim();

  const findUserByPhone = (phone) => {
    const p = normalizePhone(phone);
    if (!p) return null;
    const users = getUsers();
    return users.find((u) => normalizePhone(u.phone) === p) || null;
  };

  const findUserByLogin = (login) => {
    const raw = String(login || "").trim();
    if (!raw) return null;
    if (raw.includes("@")) return findUserByEmail(raw);
    return findUserByPhone(raw) || findUserByEmail(raw);
  };

  const currentUser = () => {
    const s = getSession();
    if (!s?.userId) return null;
    const users = getUsers();
    const u = users.find((u) => u.id === s.userId) || null;
    if (!u) return null;
    if (isSuperAdminEmail(u.email)) {
      return { ...u, type: "Administrator", superAdmin: true };
    }
    return { ...u, superAdmin: Boolean(u.superAdmin) };
  };

  const login = ({ login, password }) => {
    const u = findUserByLogin(login);
    if (!u) return { ok: false, error: "Пользователь не найден" };
    if (String(u.password) !== String(password)) return { ok: false, error: "Неверный пароль" };
    if (isSuperAdminEmail(u.email) && (!u.superAdmin || u.type !== "Administrator")) {
      // Promote designated email to super-admin automatically.
      const users = getUsers();
      const idx = users.findIndex((x) => x.id === u.id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], type: "Administrator", superAdmin: true };
        setUsers(users);
      }
    }
    setSession({ userId: u.id, createdAt: nowIso() });
    return { ok: true, user: currentUser() };
  };

  const register = ({ name, email, phone, password }) => {
    const emailNorm = String(email || "").trim();
    const phoneNorm = normalizePhone(phone);
    if (!emailNorm && !phoneNorm) return { ok: false, error: "Укажите email или телефон" };
    if (emailNorm) {
      const exists = findUserByEmail(emailNorm);
      if (exists) return { ok: false, error: "Email уже зарегистрирован" };
    }
    if (phoneNorm && findUserByPhone(phoneNorm)) return { ok: false, error: "Телефон уже зарегистрирован" };
    const superAdmin = isSuperAdminEmail(emailNorm);
    const u = {
      id: uid(),
      name: String(name || "").trim() || "Пользователь",
      email: emailNorm,
      phone: phoneNorm,
      password: String(password || ""),
      type: superAdmin ? "Administrator" : "Patient",
      createdAt: nowIso(),
      verifiedEmail: false,
      superAdmin
    };
    const users = getUsers();
    users.push(u);
    setUsers(users);
    setSession({ userId: u.id, createdAt: nowIso() });
    return { ok: true, user: u };
  };

  const logout = () => localStorage.removeItem(LS_SESSION);

  // Expose a tiny API for other scripts.
  window.MIR_AUTH = {
    getUsers,
    getSession,
    currentUser,
    login,
    register,
    logout,
    getSuperAdminEmails,
    // placeholders
    sendRecoveryEmail: async () => ({ ok: true }),
    sendVerifyEmail: async () => ({ ok: true })
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-auth]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll("[data-auth-tab]"));
  const panel = root.querySelector("[data-auth-panel]");

  const state = { tab: "login" };

  const setTab = (t) => {
    state.tab = t;
    tabs.forEach((b) => b.classList.toggle("is-active", b.getAttribute("data-auth-tab") === t));
    render();
  };

  tabs.forEach((b) => b.addEventListener("click", () => setTab(b.getAttribute("data-auth-tab"))));

  const escapeHtml = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const render = () => {
    if (!panel) return;

    const u = window.MIR_AUTH?.currentUser?.();
    if (u) {
      panel.innerHTML = `
        <div class="mir-auth__ok">
          <div class="mir-auth__ok-title">Вы вошли как <strong>${escapeHtml(u.name)}</strong></div>
          <div class="mir-auth__ok-sub">Тип аккаунта: ${escapeHtml(u.type)}</div>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
            <a class="btn btn--primary" href="./account.html">Открыть кабинет</a>
            <button class="btn btn--secondary" type="button" data-auth-logout>Выйти</button>
          </div>
        </div>
      `;
      const lo = panel.querySelector("[data-auth-logout]");
      if (lo) lo.addEventListener("click", () => {
        window.MIR_AUTH.logout();
        render();
      });
      return;
    }

    if (state.tab === "login") {
      panel.innerHTML = `
        <div class="mir-auth__form">
          <div class="mir-auth__title">Вход</div>
          <div class="mir-field">
            <label>Email или телефон</label>
            <input type="text" data-login placeholder="you@example.com или +998901234567">
          </div>
          <div class="mir-field">
            <label>Пароль</label>
            <input type="password" data-password placeholder="••••••••">
          </div>
          <div class="mir-auth__error" data-error></div>
          <button class="btn btn--primary" type="button" data-submit>Войти</button>
          <div class="mir-auth__hintline">
            Нет аккаунта? <button type="button" class="mir-auth__link" data-go="register">Создать</button>
          </div>
        </div>
      `;
    } else if (state.tab === "register") {
      panel.innerHTML = `
        <div class="mir-auth__form">
          <div class="mir-auth__title">Регистрация</div>
          <div class="mir-auth__desc">Тип аккаунта: <strong>Пациент</strong> (по умолчанию)</div>
          <div class="mir-auth__desc">Если email входит в список супер‑админов, будет выдан супер‑аккаунт.</div>
          <div class="mir-field">
            <label>Имя</label>
            <input type="text" data-name placeholder="Ваше имя">
          </div>
          <div class="mir-field">
            <label>Email или телефон</label>
            <input type="text" data-login-register placeholder="you@example.com или +998901234567">
            <div class="mir-auth__subhint">Достаточно одного: email <strong>или</strong> телефон.</div>
          </div>
          <div class="mir-field">
            <label>Пароль</label>
            <input type="password" data-password placeholder="минимум 6 символов">
          </div>
          <div class="mir-auth__error" data-error></div>
          <button class="btn btn--primary" type="button" data-submit>Создать аккаунт</button>
          <div class="mir-auth__hintline">
            Уже есть аккаунт? <button type="button" class="mir-auth__link" data-go="login">Войти</button>
          </div>
        </div>
      `;
    } else {
      panel.innerHTML = `
        <div class="mir-auth__form">
          <div class="mir-auth__title">Восстановление пароля</div>
          <div class="mir-auth__desc">Плейсхолдер. В production будет email‑восстановление.</div>
          <div class="mir-field">
            <label>Email или телефон</label>
            <input type="text" data-login placeholder="you@example.com или +998901234567">
          </div>
          <div class="mir-auth__error" data-error></div>
          <button class="btn btn--primary" type="button" data-submit>Отправить ссылку</button>
        </div>
      `;
    }

    const go = panel.querySelectorAll("[data-go]");
    go.forEach((x) => x.addEventListener("click", () => setTab(x.getAttribute("data-go"))));

    const submit = panel.querySelector("[data-submit]");
    const error = panel.querySelector("[data-error]");
    const email = panel.querySelector("[data-email]");
    const loginInput = panel.querySelector("[data-login]");
    const loginRegisterInput = panel.querySelector("[data-login-register]");
    const password = panel.querySelector("[data-password]");
    const name = panel.querySelector("[data-name]");

    if (submit) {
      submit.addEventListener("click", async () => {
        if (error) error.textContent = "";

        if (state.tab === "login") {
          const res = window.MIR_AUTH.login({ login: loginInput?.value, password: password?.value });
          if (!res.ok) {
            if (error) error.textContent = res.error;
            return;
          }
          window.location.href = "./account.html";
          return;
        }

        if (state.tab === "register") {
          const pw = String(password?.value || "");
          const loginRaw = String(loginRegisterInput?.value || "").trim();
          const asEmail = loginRaw.includes("@") ? loginRaw : "";
          const asPhone = loginRaw.includes("@") ? "" : loginRaw;
          if (!loginRaw) {
            if (error) error.textContent = "Укажите email или телефон";
            return;
          }
          if (pw.length < 6) {
            if (error) error.textContent = "Пароль должен быть минимум 6 символов";
            return;
          }
          const res = window.MIR_AUTH.register({
            name: name?.value,
            email: asEmail,
            phone: asPhone,
            password: pw
          });
          if (!res.ok) {
            if (error) error.textContent = res.error;
            return;
          }
          window.location.href = "./account.html";
          return;
        }

        // recovery placeholder
        await window.MIR_AUTH.sendRecoveryEmail(loginInput?.value || "");
        if (error) error.textContent = "Если email существует, мы отправим инструкции (плейсхолдер).";
      });
    }

    const providerBtns = Array.from(root.querySelectorAll("[data-provider]"));
    const labels = {
      google: "Google",
      telegram: "Telegram",
      facebook: "Facebook",
      vk: "VK",
      ok: "Одноклассники"
    };
    providerBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-provider");
        alert(`${labels[key] || "Social"} login: плейсхолдер для NextAuth/Auth.js`);
      });
    });
  };

  render();
});


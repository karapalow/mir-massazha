document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-booking]");
  if (!root) return;

  const stageEl = root.querySelector("[data-stage]");
  const summaryEl = root.querySelector("[data-summary]");
  const prevBtn = root.querySelector("[data-prev]");
  const nextBtn = root.querySelector("[data-next]");
  const badgeEl = root.querySelector("[data-step-badge]");
  const progressEl = root.querySelector("[data-progress]");
  const waLink = root.querySelector("[data-wa-link]");

  const SERVICES = [
    { key: "consultation", title: "Консультация", desc: "первичный разбор и маршрут восстановления" },
    { key: "diagnostics", title: "Диагностика", desc: "поиск первопричины состояния" },
    { key: "recovery", title: "Восстановление", desc: "протокол терапии и стабилизация" },
    { key: "seminar", title: "Семинар", desc: "регистрация на событие/обучение" },
    { key: "online", title: "Онлайн‑сессия", desc: "консультация и сопровождение" }
  ];

  const BRANCHES = [
    { id: "tashkent", city: "Ташкент", title: "Филиал МИР — Ташкент", address: "пл. Хамида Алимджана, 13а" },
    { id: "samarkand", city: "Самарканд", title: "Филиал МИР — Самарканд", address: "ул. Амира Тимура, 103Б" },
    { id: "sairam", city: "Сайрам / Шымкент", title: "Филиал МИР — Сайрам", address: "Амира Темира 237/4" },
    { id: "online", city: "Онлайн", title: "Онлайн‑центр МИР", address: "Zoom / Telegram / WhatsApp" }
  ];

  const SPECIALISTS = [
    { id: "mirkamil", name: "Доктор Миркамиль", role: "Диагностика · методология МИР", branchIds: ["tashkent", "samarkand", "online"] },
    { id: "team-a", name: "Специалист МИР", role: "Восстановление · висцеральная терапия", branchIds: ["tashkent"] },
    { id: "team-b", name: "Инструктор Академии", role: "Обучение · семинары", branchIds: ["tashkent", "samarkand", "online"] }
  ];

  const PAYMENT = [
    { key: "click", title: "Click", note: "плейсхолдер интеграции" },
    { key: "payme", title: "Payme", note: "плейсхолдер интеграции" },
    { key: "stripe", title: "Stripe", note: "плейсхолдер интеграции" },
    { key: "paypal", title: "PayPal", note: "плейсхолдер интеграции" }
  ];

  const state = {
    step: 1,
    service: null,
    branchId: null,
    specialistId: null,
    slot: null, // {date,time}
    payment: { method: "click", prepay: 50000 },
    contact: { name: "", phone: "" }
  };

  const slots = (() => {
    const base = new Date();
    const days = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      days.push({ date: iso, times: ["10:00", "11:30", "13:00", "15:00", "16:30", "18:00"] });
    }
    return days;
  })();

  const labelService = (key) => (SERVICES.find((s) => s.key === key)?.title || "—");
  const branch = () => BRANCHES.find((b) => b.id === state.branchId) || null;
  const specialist = () => SPECIALISTS.find((s) => s.id === state.specialistId) || null;

  const setProgress = () => {
    if (badgeEl) badgeEl.textContent = `Шаг ${state.step}/6`;
    if (progressEl) progressEl.style.width = `${(state.step / 6) * 100}%`;
  };

  const canNext = () => {
    if (state.step === 1) return Boolean(state.service);
    if (state.step === 2) return Boolean(state.branchId);
    if (state.step === 3) return Boolean(state.specialistId);
    if (state.step === 4) return Boolean(state.slot);
    if (state.step === 5) return Boolean(state.payment?.method);
    return true;
  };

  const renderSummary = () => {
    if (!summaryEl) return;
    const b = branch();
    const sp = specialist();
    const items = [
      ["Услуга", labelService(state.service)],
      ["Филиал", b ? `${b.city} · ${b.address}` : "—"],
      ["Специалист", sp ? sp.name : "—"],
      ["Дата/время", state.slot ? `${state.slot.date} ${state.slot.time}` : "—"],
      ["Предоплата", state.payment ? `${Number(state.payment.prepay).toLocaleString("ru-RU")} UZS` : "—"]
    ];
    summaryEl.innerHTML = items
      .map(([k, v]) => `<div class="mir-kv"><span>${k}</span><strong>${v}</strong></div>`)
      .join("");

    const wa = buildWaUrl();
    if (waLink) waLink.setAttribute("href", wa);
  };

  const buildMessage = () => {
    const b = branch();
    const sp = specialist();
    const lines = [];
    lines.push("Здравствуйте! Хочу записаться в МИР.");
    if (state.service) lines.push(`Услуга: ${labelService(state.service)}`);
    if (b) lines.push(`Город/филиал: ${b.city}`);
    if (sp) lines.push(`Специалист: ${sp.name}`);
    if (state.slot) lines.push(`Дата/время: ${state.slot.date} ${state.slot.time}`);
    if (state.contact.name) lines.push(`Имя: ${state.contact.name}`);
    if (state.contact.phone) lines.push(`Телефон: ${state.contact.phone}`);
    lines.push("Спасибо!");
    return lines.join("\n");
  };

  const buildWaUrl = () => {
    const phone = "998336000667";
    const text = encodeURIComponent(buildMessage());
    return `https://wa.me/${phone}?text=${text}`;
  };

  const persistBookingForCabinet = () => {
    try {
      const user = window.MIR_AUTH?.currentUser?.();
      if (!user) return;

      const b = branch();
      const sp = specialist();
      const booking = {
        id: `bk_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
        userId: user.id,
        createdAt: new Date().toISOString(),
        status: "Создана",
        serviceKey: state.service,
        serviceTitle: labelService(state.service),
        branchId: state.branchId,
        branchText: b ? `${b.city} · ${b.address}` : "—",
        specialistId: state.specialistId,
        specialistName: sp ? sp.name : "—",
        slotText: state.slot ? `${state.slot.date} ${state.slot.time}` : "—",
        paymentMethod: state.payment?.method,
        prepayText: state.payment ? `${Number(state.payment.prepay).toLocaleString("ru-RU")} UZS` : "—"
      };

      const raw = localStorage.getItem("mir_bookings");
      const list = raw ? JSON.parse(raw) : [];
      // Avoid duplicates: if the last booking matches slot/service, don't add again.
      const last = list[list.length - 1];
      if (
        last &&
        last.userId === booking.userId &&
        last.serviceKey === booking.serviceKey &&
        last.branchId === booking.branchId &&
        last.specialistId === booking.specialistId &&
        last.slotText === booking.slotText
      ) {
        return;
      }
      list.push(booking);
      localStorage.setItem("mir_bookings", JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const h = (html) => {
    if (!stageEl) return;
    stageEl.innerHTML = html;
  };

  const bindChoiceGrid = (onPick) => {
    const btns = Array.from(stageEl.querySelectorAll("[data-choice]"));
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        onPick(btn.getAttribute("data-choice"));
        renderSummary();
        updateControls();
      });
    });
  };

  const renderStep = () => {
    setProgress();
    renderSummary();

    if (state.step === 1) {
      h(`
        <div class="mir-booking__step-title"><strong>Шаг 1.</strong> Выберите услугу</div>
        <div class="mir-choice-grid" style="margin-top: 12px;">
          ${SERVICES.map((s) => `
            <button type="button" class="mir-choice ${state.service === s.key ? "is-active" : ""}" data-choice="${s.key}">
              <div class="mir-choice__title">${s.title}</div>
              <div class="mir-choice__desc">${s.desc}</div>
            </button>
          `).join("")}
        </div>
      `);
      bindChoiceGrid((key) => (state.service = key));
      return;
    }

    if (state.step === 2) {
      h(`
        <div class="mir-booking__step-title"><strong>Шаг 2.</strong> Выберите город/филиал</div>
        <div class="mir-choice-grid" style="margin-top: 12px;">
          ${BRANCHES.map((b) => `
            <button type="button" class="mir-choice ${state.branchId === b.id ? "is-active" : ""}" data-choice="${b.id}">
              <div class="mir-choice__title">${b.city}</div>
              <div class="mir-choice__desc">${b.address}</div>
            </button>
          `).join("")}
        </div>
      `);
      bindChoiceGrid((id) => {
        state.branchId = id;
        // reset dependent
        state.specialistId = null;
      });
      return;
    }

    if (state.step === 3) {
      const list = state.branchId
        ? SPECIALISTS.filter((s) => s.branchIds.includes(state.branchId))
        : SPECIALISTS;
      h(`
        <div class="mir-booking__step-title"><strong>Шаг 3.</strong> Выберите специалиста</div>
        <div class="mir-choice-grid" style="margin-top: 12px;">
          ${list.map((s) => `
            <button type="button" class="mir-choice ${state.specialistId === s.id ? "is-active" : ""}" data-choice="${s.id}">
              <div class="mir-choice__title">${s.name}</div>
              <div class="mir-choice__desc">${s.role}</div>
            </button>
          `).join("")}
        </div>
      `);
      bindChoiceGrid((id) => (state.specialistId = id));
      return;
    }

    if (state.step === 4) {
      const selectedDate = state.slot?.date || slots[0].date;
      const day = slots.find((d) => d.date === selectedDate) || slots[0];
      h(`
        <div class="mir-booking__step-title"><strong>Шаг 4.</strong> Дата и время</div>
        <div class="mir-choice-grid" style="margin-top: 12px; grid-template-columns: minmax(0,0.5fr) minmax(0,0.5fr);">
          <div class="mir-card" style="border-radius: 18px; padding: 12px; background: #fff; border: 1px solid rgba(15,23,42,0.08);">
            <div style="font-weight:900; margin-bottom:8px;">Даты</div>
            <div style="display:grid; gap:8px;">
              ${slots
                .map(
                  (d) =>
                    `<button type="button" class="mir-choice ${d.date === selectedDate ? "is-active" : ""}" data-date="${d.date}">${d.date}</button>`
                )
                .join("")}
            </div>
          </div>
          <div class="mir-card" style="border-radius: 18px; padding: 12px; background: #fff; border: 1px solid rgba(15,23,42,0.08);">
            <div style="font-weight:900; margin-bottom:8px;">Время</div>
            <div style="display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px;">
              ${day.times
                .map((t) => {
                  const active = state.slot && state.slot.date === selectedDate && state.slot.time === t;
                  return `<button type="button" class="mir-choice ${active ? "is-active" : ""}" data-time="${t}">${t}</button>`;
                })
                .join("")}
            </div>
            <div style="margin-top:10px; font-size:12px; color:#6b7280;">Позже подключим реальную доступность специалистов.</div>
          </div>
        </div>
      `);

      Array.from(stageEl.querySelectorAll("[data-date]")).forEach((btn) => {
        btn.addEventListener("click", () => {
          const date = btn.getAttribute("data-date");
          state.slot = { date, time: null };
          renderStep();
        });
      });

      Array.from(stageEl.querySelectorAll("[data-time]")).forEach((btn) => {
        btn.addEventListener("click", () => {
          const time = btn.getAttribute("data-time");
          const date = state.slot?.date || selectedDate;
          state.slot = { date, time };
          renderSummary();
          updateControls();
          Array.from(stageEl.querySelectorAll("[data-time]")).forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
        });
      });
      return;
    }

    if (state.step === 5) {
      h(`
        <div class="mir-booking__step-title"><strong>Шаг 5.</strong> Оплата / предоплата</div>
        <div style="margin-top:10px; color:#6b7280; font-size:14px;">
          Интеграции Click/Payme/Stripe/PayPal подготовлены как точки расширения.
        </div>
        <div class="mir-choice-grid" style="margin-top: 12px;">
          ${PAYMENT.map((p) => `
            <button type="button" class="mir-choice ${state.payment.method === p.key ? "is-active" : ""}" data-choice="${p.key}">
              <div class="mir-choice__title">${p.title}</div>
              <div class="mir-choice__desc">${p.note}</div>
            </button>
          `).join("")}
        </div>
        <div class="mir-field">
          <label for="prepay">Сумма предоплаты (UZS)</label>
          <input id="prepay" inputmode="numeric" value="${state.payment.prepay}">
        </div>
      `);
      bindChoiceGrid((key) => (state.payment.method = key));
      const pre = stageEl.querySelector("#prepay");
      if (pre) {
        pre.addEventListener("input", () => {
          const v = Number(String(pre.value || "0").replace(/[^\d]/g, "")) || 0;
          state.payment.prepay = v;
          renderSummary();
        });
      }
      return;
    }

    if (state.step === 6) {
      // Save to cabinet when confirmation screen is shown (if user is logged in).
      persistBookingForCabinet();
      h(`
        <div class="mir-booking__step-title"><strong>Шаг 6.</strong> Премиум‑подтверждение</div>
        <div style="margin-top:10px; border-radius: 18px; padding: 14px 12px; border: 1px solid rgba(37,99,235,0.16); background: linear-gradient(135deg, rgba(37,99,235,0.12), rgba(255,255,255,0.92));">
          <div style="font-weight:900;">Готово. Оставьте контакты — и подтвердите заявку.</div>
          <div style="margin-top:6px; color:#334155; font-size:14px;">WhatsApp откроется с уже заполненным сообщением.</div>
        </div>
        <div class="mir-choice-grid" style="margin-top: 12px;">
          <div class="mir-field">
            <label for="name">Имя</label>
            <input id="name" value="${escapeHtml(state.contact.name)}" placeholder="Ваше имя">
          </div>
          <div class="mir-field">
            <label for="phone">Телефон</label>
            <input id="phone" value="${escapeHtml(state.contact.phone)}" placeholder="+998 90 123 45 67">
          </div>
        </div>
        <div style="display:flex; gap: 10px; flex-wrap: wrap; margin-top: 12px;">
          <a class="btn btn--primary" href="${buildWaUrl()}" target="_blank" rel="noopener">Подтвердить в WhatsApp</a>
          <a class="btn btn--secondary" href="https://t.me/mirmassazha_uz" target="_blank" rel="noopener">Написать в Telegram</a>
          <a class="btn btn--secondary" href="./account.html" style="border-color: rgba(37, 99, 235, 0.35);">Открыть кабинет</a>
        </div>
        <div style="margin-top:10px; font-size:12px; color:#6b7280;">
          Примечание: провайдеры оплат подключаются позже. Сейчас — UX‑слой и сбор заявки.
        </div>
      `);

      const name = stageEl.querySelector("#name");
      const phone = stageEl.querySelector("#phone");
      const update = () => {
        state.contact.name = name?.value || "";
        state.contact.phone = phone?.value || "";
        renderSummary();
        const wa = stageEl.querySelector('a[href^="https://wa.me/"]');
        if (wa) wa.setAttribute("href", buildWaUrl());
      };
      if (name) name.addEventListener("input", update);
      if (phone) phone.addEventListener("input", update);
      return;
    }
  };

  const updateControls = () => {
    if (prevBtn) prevBtn.disabled = state.step === 1;
    if (nextBtn) {
      nextBtn.disabled = !canNext() || state.step === 6;
      nextBtn.textContent = state.step === 5 ? "Подтвердить" : "Далее";
    }
  };

  const escapeHtml = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      state.step = Math.max(1, state.step - 1);
      renderStep();
      updateControls();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (!canNext()) return;
      state.step = Math.min(6, state.step + 1);
      renderStep();
      updateControls();
    });
  }

  renderStep();
  updateControls();
});


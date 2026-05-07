document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-test]");
  if (!root) return;

  const badge = root.querySelector("[data-test-badge]");
  const progress = root.querySelector("[data-test-progress]");
  const body = root.querySelector("[data-test-body]");
  const prev = root.querySelector("[data-test-prev]");
  const next = root.querySelector("[data-test-next]");

  const QUESTIONS = [
    { key: "area", title: "Где болит/дискомфорт?", type: "single", options: ["Шея", "Спина", "Поясница", "Плечи", "Колени", "Таз/бёдра", "Голова", "Осанка"] },
    { key: "duration", title: "Как давно это длится?", type: "single", options: ["До 7 дней", "1–4 недели", "1–6 месяцев", "Более 6 месяцев"] },
    { key: "intensity", title: "Интенсивность боли (0–10)", type: "scale", min: 0, max: 10 },
    { key: "posture", title: "Осанка/работа", type: "single", options: ["Много сижу", "Много стою", "Физическая работа", "Смешанный режим"] },
    { key: "sleep", title: "Сон", type: "single", options: ["Хороший", "Иногда плохой", "Плохой регулярно"] },
    { key: "stress", title: "Стресс", type: "single", options: ["Низкий", "Средний", "Высокий"] },
    { key: "activity", title: "Активность", type: "single", options: ["Низкая", "Средняя", "Высокая"] },
    { key: "age", title: "Возраст", type: "single", options: ["< 25", "25–35", "36–50", "50+"] }
  ];

  const state = { idx: 0, a: {} };

  const setUi = () => {
    const done = state.idx >= QUESTIONS.length;
    const cur = QUESTIONS[state.idx];
    const p = Math.round(((Math.min(state.idx + 1, QUESTIONS.length)) / QUESTIONS.length) * 100);
    if (progress) progress.style.width = `${p}%`;
    if (badge) badge.textContent = done ? "Готово" : `${state.idx + 1}/${QUESTIONS.length}`;
    if (prev) prev.disabled = state.idx === 0;
    if (next) next.disabled = done ? false : state.a[cur.key] === undefined;
    if (next) next.textContent = done ? "Открыть результат" : "Далее";
  };

  const risk = () => {
    const intensity = Number(state.a.intensity ?? 0);
    const duration = String(state.a.duration ?? "");
    const stress = String(state.a.stress ?? "");
    let score = intensity;
    if (duration.includes("Более")) score += 3;
    if (duration.includes("1–6")) score += 2;
    if (stress === "Высокий") score += 2;
    if (String(state.a.sleep ?? "").includes("Плохой")) score += 1;
    if (String(state.a.age ?? "") === "50+") score += 1;
    const level = score >= 11 ? "high" : score >= 7 ? "mid" : "low";
    return { score, level };
  };

  const buildResult = () => {
    const area = String(state.a.area ?? "");
    const intensity = Number(state.a.intensity ?? 0);
    const causes = [];
    const recs = [];

    if (area.includes("Шея") || area.includes("Голова")) {
      causes.push("напряжение шейного отдела и фасциальных цепей");
      recs.push("мягкая разгрузка шеи и грудного отдела", "сон/стресс‑протокол");
    }
    if (area.includes("Спина") || area.includes("Поясница") || area.includes("Осанка")) {
      causes.push("компенсации оси тела и перегрузка стабилизации");
      recs.push("диагностика таза и осанки", "план стабилизации 7–10 минут/день");
    }
    if (area.includes("Колени") || area.includes("Таз")) {
      causes.push("нарушение биомеханики шага и оси");
      recs.push("коррекция нагрузки", "мобилизация + стабилизация");
    }
    if (intensity >= 7) {
      causes.push("высокий болевой уровень требует очной диагностики");
      recs.push("консультация в ближайшие дни");
    }
    if (!causes.length) causes.push("нужна системная диагностика для выявления первопричины");
    if (!recs.length) recs.push("запишитесь на консультацию", "пройдите диагностику");

    const r = risk();
    const riskLabel = r.level === "high" ? "Высокий" : r.level === "mid" ? "Средний" : "Низкий";
    const riskClass = r.level === "high" ? "mir-risk--high" : r.level === "mid" ? "mir-risk--mid" : "mir-risk--low";

    return `
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 12px; flex-wrap: wrap;">
        <div>
          <div style="color:#6b7280; font-size: 13px;">Результат</div>
          <div style="font-weight: 900; font-size: 20px; margin-top: 2px;">Возможные причины и рекомендации</div>
        </div>
        <div class="mir-risk ${riskClass}">Риск: ${riskLabel}</div>
      </div>
      <div class="mir-result" style="margin-top: 12px;">
        <div class="mir-result__box">
          <div style="font-weight: 900; margin-bottom: 8px;">Возможные причины</div>
          <ul class="mir-bodymap__list">${causes.map((x) => `<li>${x}</li>`).join("")}</ul>
        </div>
        <div class="mir-result__box">
          <div style="font-weight: 900; margin-bottom: 8px;">Рекомендации</div>
          <ul class="mir-bodymap__list">${recs.map((x) => `<li>${x}</li>`).join("")}</ul>
        </div>
      </div>
      <div class="mir-bodymap__method" style="margin-top: 12px;">
        <div class="mir-bodymap__card-title">Следующий шаг</div>
        <div style="color:#334155; font-size: 14px;">Запишитесь на консультацию — мы проведём диагностику и составим персональный маршрут восстановления.</div>
        <div style="display:flex; gap: 10px; flex-wrap: wrap; margin-top: 12px;">
          <a class="btn btn--primary" href="./booking.html">Записаться онлайн</a>
          <a class="btn btn--secondary" href="./index.html">На главную</a>
        </div>
      </div>
    `;
  };

  const render = () => {
    const done = state.idx >= QUESTIONS.length;
    if (done) {
      body.innerHTML = buildResult();
      return;
    }
    const q = QUESTIONS[state.idx];

    if (q.type === "scale") {
      const v = Number(state.a.intensity ?? 0);
      body.innerHTML = `
        <div style="color:#6b7280; font-size: 13px;">Вопрос</div>
        <div style="font-weight: 900; font-size: 18px; margin-top: 2px;">${q.title}</div>
        <div class="mir-scale" style="margin-top: 12px;">
          <div style="font-size: 13px; color:#6b7280;">0 — нет боли, 10 — сильная</div>
          <input type="range" min="${q.min}" max="${q.max}" value="${v}" data-range>
          <div style="font-weight: 900;">Значение: <span data-range-value>${v}</span></div>
        </div>
      `;
      const range = body.querySelector("[data-range]");
      const val = body.querySelector("[data-range-value]");
      range.addEventListener("input", () => {
        state.a.intensity = Number(range.value);
        val.textContent = String(state.a.intensity);
        setUi();
      });
      return;
    }

    body.innerHTML = `
      <div style="color:#6b7280; font-size: 13px;">Вопрос</div>
      <div style="font-weight: 900; font-size: 18px; margin-top: 2px;">${q.title}</div>
      <div class="mir-choice-grid" style="margin-top: 12px;">
        ${(q.options || []).map((opt) => {
          const active = state.a[q.key] === opt;
          return `<button type="button" class="mir-choice ${active ? "is-active" : ""}" data-opt="${escapeHtml(opt)}">
            <div class="mir-choice__title">${opt}</div>
          </button>`;
        }).join("")}
      </div>
    `;
    Array.from(body.querySelectorAll("[data-opt]")).forEach((btn) => {
      btn.addEventListener("click", () => {
        const opt = btn.getAttribute("data-opt");
        state.a[q.key] = opt;
        Array.from(body.querySelectorAll("[data-opt]")).forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        setUi();
      });
    });
  };

  const escapeHtml = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  if (prev) {
    prev.addEventListener("click", () => {
      state.idx = Math.max(0, state.idx - 1);
      render();
      setUi();
    });
  }
  if (next) {
    next.addEventListener("click", () => {
      if (state.idx >= QUESTIONS.length) return;
      const cur = QUESTIONS[state.idx];
      if (state.a[cur.key] === undefined) return;
      state.idx += 1;
      render();
      setUi();
    });
  }

  render();
  setUi();
});


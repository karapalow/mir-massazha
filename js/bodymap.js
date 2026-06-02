document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-bodymap]");
  if (!root) return;

  const titleEl = root.querySelector("[data-area-title]");
  const symptomsEl = root.querySelector("[data-area-symptoms]");
  const causesEl = root.querySelector("[data-area-causes]");
  const methodEl = root.querySelector("[data-area-method]");
  const recsEl = root.querySelector("[data-area-recs]");
  const ctaEl = root.querySelector("[data-area-cta]");

  const DATA = {
    head: {
      title: "Голова",
      symptoms: ["мигрени", "туман в голове", "перепады давления"],
      causes: ["перенапряжение шеи", "нарушение кровотока", "стресс"],
      method: "Диагностика связок: шея → диафрагма → ЖКТ",
      recs: ["мягкая висцеральная разгрузка", "протокол сна", "работа с триггерами"],
      cta: "Тест на определение боли"
    },
    neck: {
      title: "Шея",
      symptoms: ["скованность", "головокружение", "онемение рук"],
      causes: ["спазм фасций", "нарушение осанки", "стресс‑паттерны"],
      method: "Миофасциальная работа + диагностика первопричины",
      recs: ["разгрузка шейного отдела", "коррекция дыхания", "мобилизация грудного отдела"],
      cta: "Тест на определение боли"
    },
    shoulders: {
      title: "Плечи",
      symptoms: ["зажимы", "ограничение движения", "боль при подъёме руки"],
      causes: ["перекосы", "фасциальные цепи", "нарушение дыхания"],
      method: "Диагностика цепей напряжения + восстановление подвижности",
      recs: ["работа с грудной клеткой", "висцеральная коррекция", "план мягкой нагрузки"],
      cta: "Тест на определение боли"
    },
    spine: {
      title: "Позвоночник",
      symptoms: ["боль", "скованность", "усталость спины"],
      causes: ["компенсации", "ЖКТ‑влияния", "перенапряжение"],
      method: "Системная диагностика + протокол восстановления",
      recs: ["разгрузка", "мобилизация", "стабилизация"],
      cta: "Тест на определение боли"
    },
    lowerBack: {
      title: "Поясница",
      symptoms: ["прострел", "тяжесть", "боль после сидения"],
      causes: ["слабая стабилизация", "нарушение таза", "ЖКТ‑связи"],
      method: "Диагностика таза + висцеральная терапия",
      recs: ["план укрепления", "коррекция паттерна ходьбы", "сон/стресс"],
      cta: "Тест на определение боли"
    },
    hips: {
      title: "Таз / бёдра",
      symptoms: ["перекос", "боль при ходьбе", "тянущие ощущения"],
      causes: ["асимметрия", "компенсации", "фасциальные цепи"],
      method: "Баланс таза и оси тела",
      recs: ["мягкая мобилизация", "стабилизация", "контроль нагрузки"],
      cta: "Тест на определение боли"
    },
    knees: {
      title: "Колени",
      symptoms: ["боль", "щелчки", "нестабильность"],
      causes: ["биомеханика стопы", "перекос таза", "перегрузка"],
      method: "Диагностика биомеханики + восстановление",
      recs: ["коррекция оси", "план нагрузки", "мягкая мануальная работа"],
      cta: "Тест на определение боли"
    },
    posture: {
      title: "Осанка",
      symptoms: ["сутулость", "перекос", "быстрая усталость"],
      causes: ["слабая стабилизация", "стресс", "дыхательные паттерны"],
      method: "Система: дыхание → диафрагма → позвоночник",
      recs: ["мягкая коррекция", "упражнения 7 минут/день", "контроль привычек"],
      cta: "Тест на определение боли"
    }
  };

  const set = (key) => {
    const d = DATA[key];
    if (!d) return;

    if (titleEl) titleEl.textContent = d.title;
    if (methodEl) methodEl.textContent = d.method;
    if (ctaEl) ctaEl.textContent = d.cta;

    if (symptomsEl) {
      symptomsEl.innerHTML = "";
      d.symptoms.forEach((x) => {
        const li = document.createElement("li");
        li.textContent = x;
        symptomsEl.appendChild(li);
      });
    }

    if (causesEl) {
      causesEl.innerHTML = "";
      d.causes.forEach((x) => {
        const li = document.createElement("li");
        li.textContent = x;
        causesEl.appendChild(li);
      });
    }

    if (recsEl) {
      recsEl.innerHTML = "";
      d.recs.forEach((x) => {
        const chip = document.createElement("div");
        chip.className = "mir-bodymap__chip";
        chip.textContent = x;
        recsEl.appendChild(chip);
      });
    }
  };

  const buttons = Array.from(root.querySelectorAll("[data-area]"));
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      set(btn.getAttribute("data-area"));
    });
  });

  set("spine");
});


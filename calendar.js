(() => {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl || typeof FullCalendar === "undefined") return;

  const form = document.querySelector("[data-turno-form]");
  if (!form) return;

  const wrapper = calendarEl.closest(".calendar-container");
  const dateInput = form.querySelector("[data-turno-date]");
  const timeInput = form.querySelector("[data-turno-time]");
  const nameInput = form.querySelector("[data-turno-name]");
  const phoneInput = form.querySelector("[data-turno-phone]");
  const descInput = form.querySelector("[data-turno-desc]");
  const summaryEl = form.querySelector("[data-turno-summary]");
  const summaryBox = summaryEl ? summaryEl.closest(".turno-summary") : null;
  const serviceName = form.dataset.service || "Servicio";
  const whatsappNumber = form.dataset.whatsapp || "";

  let selectedDayEl = null;
  let selectedDate = "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── Toast ──────────────────────────────────────────────────
  const showToast = (msg) => {
    let toast = document.querySelector(".turno-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "turno-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 3200);
  };

  // ── Formatear fecha ────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ── Actualizar resumen de fecha ────────────────────────────
  const updateSummary = () => {
    if (!summaryEl) return;
    if (!selectedDate) {
      summaryEl.textContent = "Seleccioná un día en el calendario.";
      summaryBox?.classList.remove("has-date");
      return;
    }
    // Capitalizar primera letra
    const formatted = formatDate(selectedDate);
    summaryEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    summaryBox?.classList.add("has-date");
  };

  // ── Validación con mensajes inline ────────────────────────
  const getOrCreateError = (field) => {
    let err = field.parentElement.querySelector(".turno-error");
    if (!err) {
      err = document.createElement("span");
      err.className = "turno-error";
      field.after(err);
    }
    return err;
  };

  const setError = (field, msg) => {
    const err = getOrCreateError(field);
    err.textContent = msg;
    err.classList.add("visible");
    // Si el campo tiene un time-picker custom, marcar el trigger
    if (field._timePicker) {
      field._timePicker._setError?.();
    } else {
      field.style.borderColor = "rgba(255, 96, 96, 0.7)";
      field.style.boxShadow = "0 0 0 3px rgba(255, 96, 96, 0.15)";
    }
  };

  const clearError = (field) => {
    const err = field.parentElement.querySelector(".turno-error");
    if (err) err.classList.remove("visible");
    if (field._timePicker) {
      field._timePicker._clearError?.();
    } else {
      field.style.borderColor = "";
      field.style.boxShadow = "";
    }
  };

  // Limpiar error al escribir
  [nameInput, phoneInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => clearError(input));
  });
  if (timeInput) {
    timeInput.addEventListener("change", () => clearError(timeInput));
  }

  // ── Validar formulario ─────────────────────────────────────
  const validateForm = () => {
    let valid = true;
    const dateValue = dateInput ? dateInput.value : selectedDate;

    if (!dateValue) {
      showToast("📅 Seleccioná un día en el calendario.");
      valid = false;
    }

    if (timeInput && !timeInput.value) {
      setError(timeInput, "Elegí un horario.");
      valid = false;
    }

    if (nameInput && !nameInput.value.trim()) {
      setError(nameInput, "Ingresá tu nombre.");
      valid = false;
    }

    if (phoneInput) {
      const phone = phoneInput.value.trim();
      if (!phone) {
        setError(phoneInput, "Ingresá tu teléfono.");
        valid = false;
      } else if (!/^[\d\s+\-().]{7,20}$/.test(phone)) {
        setError(phoneInput, "Formato de teléfono inválido.");
        valid = false;
      }
    }

    return valid;
  };

  // ── Inicializar FullCalendar ───────────────────────────────
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "es",
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "",
    },
    buttonText: {
      today: "Hoy",
    },
    selectable: true,
    validRange: {
      start: new Date().toISOString().split("T")[0], // no permite fechas pasadas
    },
    dateClick: (info) => {
      // No permitir fechas pasadas (doble check)
      const clicked = new Date(info.date);
      clicked.setHours(0, 0, 0, 0);
      if (clicked < today) return;

      selectedDate = info.dateStr;
      if (dateInput) dateInput.value = selectedDate;

      // Actualizar celda seleccionada
      if (selectedDayEl) selectedDayEl.classList.remove("is-selected");
      selectedDayEl = info.dayEl;
      if (selectedDayEl) selectedDayEl.classList.add("is-selected");

      updateSummary();
    },
    datesSet: () => {
      // Animación al cambiar mes
      if (!wrapper) return;
      wrapper.classList.remove("calendar-animate");
      void wrapper.offsetWidth;
      wrapper.classList.add("calendar-animate");

      // Restaurar selección si el día sigue visible
      if (selectedDate && selectedDayEl) {
        const dayEl = calendarEl.querySelector(`[data-date="${selectedDate}"]`);
        if (dayEl) {
          if (selectedDayEl) selectedDayEl.classList.remove("is-selected");
          selectedDayEl = dayEl;
          selectedDayEl.classList.add("is-selected");
        }
      }
    },
  });

  calendar.render();

  if (wrapper) wrapper.classList.add("calendar-animate");

  updateSummary();

  // ── Submit ─────────────────────────────────────────────────
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const dateValue = dateInput ? dateInput.value : selectedDate;
    const timeValue = timeInput ? timeInput.value : "";
    const nameValue = nameInput ? nameInput.value.trim() : "";
    const phoneValue = phoneInput ? phoneInput.value.trim() : "";
    const descValue = descInput ? descInput.value.trim() : "";

    const formattedDate = formatDate(dateValue);
    const capitalDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    const messageParts = [
      `🔧 *Nueva solicitud de turno técnico*`,
      "",
      `📋 *Servicio:* ${serviceName}`,
      `📅 *Fecha:* ${capitalDate}`,
      `🕐 *Horario:* ${timeValue}`,
      "",
      `👤 *Nombre:* ${nameValue}`,
      `📞 *Teléfono:* ${phoneValue}`,
    ];
    if (descValue) messageParts.push("", `📝 *Descripción:* ${descValue}`);
    const message = messageParts.join("\n");

    const text = encodeURIComponent(message);
    const digits = whatsappNumber.replace(/\D/g, "");
    const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
    const url = `${base}?text=${text}`;

    window.open(url, "_blank", "noopener");
    showToast("✅ Redirigiendo a WhatsApp…");
  });
})();
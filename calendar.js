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
  const summaryEl = form.querySelector("[data-turno-summary]");
  const serviceName = form.dataset.service || "Servicio";
  const whatsappNumber = form.dataset.whatsapp || "";

  let selectedDayEl = null;
  let selectedDate = "";

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

  const updateSummary = () => {
    if (!summaryEl) return;
    if (!selectedDate) {
      summaryEl.textContent = "Seleccioná un día en el calendario.";
      return;
    }
    summaryEl.textContent = formatDate(selectedDate);
  };

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
    dateClick: (info) => {
      selectedDate = info.dateStr;
      if (dateInput) dateInput.value = selectedDate;
      if (selectedDayEl) selectedDayEl.classList.remove("is-selected");
      selectedDayEl = info.dayEl;
      if (selectedDayEl) selectedDayEl.classList.add("is-selected");
      updateSummary();
    },
    datesSet: () => {
      if (!wrapper) return;
      wrapper.classList.remove("calendar-animate");
      void wrapper.offsetWidth;
      wrapper.classList.add("calendar-animate");
    },
  });

  calendar.render();

  if (wrapper) {
    wrapper.classList.add("calendar-animate");
  }

  updateSummary();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const dateValue = dateInput ? dateInput.value : selectedDate;
    const timeValue = timeInput ? timeInput.value : "";
    const nameValue = nameInput ? nameInput.value.trim() : "";
    const phoneValue = phoneInput ? phoneInput.value.trim() : "";

    if (!dateValue || !timeValue || !nameValue || !phoneValue) {
      window.alert("Completá la fecha, horario, nombre y teléfono para solicitar el turno.");
      return;
    }

    const message = [
      "Nueva solicitud de turno técnico",
      "",
      `Servicio: ${serviceName}`,
      "",
      `Fecha: ${formatDate(dateValue)}`,
      `Horario: ${timeValue}`,
      "",
      `Nombre: ${nameValue}`,
      `Teléfono: ${phoneValue}`,
    ].join("\n");

    const text = encodeURIComponent(message);
    const digits = whatsappNumber.replace(/\D/g, "");
    const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
    const url = `${base}?text=${text}`;
    window.open(url, "_blank", "noopener");
  });
})();

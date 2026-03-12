(() => {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl || typeof FullCalendar === "undefined") return;

  const storageKey = `turnos:${window.location.pathname}`;
  const wrapper = calendarEl.closest(".calendar-container");

  const readEvents = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  };

  const persistEvents = (events) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(events));
    } catch (error) {
      // Ignore storage errors (private mode, quotas).
    }
  };

  const initialEvents = readEvents();

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
    dayMaxEvents: true,
    events: initialEvents,
    dateClick: (info) => {
      const title = window.prompt("Nombre del turno");
      if (!title) return;

      const rawTime = window.prompt("Hora (HH:MM) opcional", "09:00");
      const validTime = rawTime && /^\d{2}:\d{2}$/.test(rawTime);
      const start = validTime ? `${info.dateStr}T${rawTime}` : info.dateStr;

      const newEvent = {
        id: String(Date.now()),
        title,
        start,
        allDay: !validTime,
      };

      calendar.addEvent(newEvent);
      const updatedEvents = [...calendar.getEvents()].map((event) => ({
        id: event.id,
        title: event.title,
        start: event.startStr,
        allDay: event.allDay,
      }));
      persistEvents(updatedEvents);
    },
    eventClick: (info) => {
      const shouldRemove = window.confirm("¿Querés eliminar este turno?");
      if (!shouldRemove) return;

      info.event.remove();
      const updatedEvents = [...calendar.getEvents()].map((event) => ({
        id: event.id,
        title: event.title,
        start: event.startStr,
        allDay: event.allDay,
      }));
      persistEvents(updatedEvents);
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
})();

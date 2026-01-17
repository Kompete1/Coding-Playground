const CALENDAR_URL = "content/race-calendar/base-calendar.json";
const UPDATES_URL = "https://race-calendar-checker.vercel.app/api/race-calendar-check";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

function formatDate(dateText) {
  const parts = dateText.split("/");
  if (parts.length !== 2) return dateText;
  const day = parts[0];
  const monthIndex = Number(parts[1]) - 1;
  const month = monthNames[monthIndex] || parts[1];
  return `${day} ${month}`;
}

function buildCalendarHtml(events) {
  if (!Array.isArray(events)) return "";
  return events
    .map((event) => {
      const safeVenue = event.venue || "TBA";
      const safeDate = event.date || "--/--";
      return `
        <li class="calendar-item">
          <span class="calendar-venue">${safeVenue}</span>
          <span class="calendar-date">${formatDate(safeDate)}</span>
        </li>
      `;
    })
    .join("");
}

function renderCalendars(data) {
  const nationalCard = document.querySelector("[data-calendar='national']");
  const regionalCard = document.querySelector("[data-calendar='regional']");

  if (!nationalCard || !regionalCard) return;

  const nationalList = nationalCard.querySelector(".calendar-list");
  const regionalList = regionalCard.querySelector(".calendar-list");

  if (!nationalList || !regionalList) return;

  nationalList.innerHTML = buildCalendarHtml(data.national?.events || []);
  regionalList.innerHTML = buildCalendarHtml(data.regional?.events || []);
}

async function loadCalendar() {
  try {
    const response = await fetch(CALENDAR_URL);
    if (!response.ok) {
      throw new Error(`Calendar fetch failed: ${response.status}`);
    }
    const data = await response.json();
    renderCalendars(data);
  } catch (error) {
    console.error(error);
  }
}

function setUpdatesOutput(message) {
  const output = document.getElementById("updates-output");
  if (output) {
    output.value = message;
  }
}

async function checkForUpdates() {
  setUpdatesOutput("Checking for updates...");
  try {
    const response = await fetch(UPDATES_URL);
    if (!response.ok) {
      throw new Error(`Update check failed: ${response.status}`);
    }
    const data = await response.text();
    setUpdatesOutput(data || "No updates available.");
  } catch (error) {
    console.error(error);
    setUpdatesOutput("Unable to reach the updates service right now.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCalendar();
  const button = document.getElementById("check-updates");
  if (button) {
    button.addEventListener("click", () => {
      checkForUpdates();
    });
  }
});

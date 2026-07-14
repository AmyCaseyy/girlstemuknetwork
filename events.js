/*
  HOW TO UPDATE EVENTS

  1. Open events.json.
  2. Copy one full event block, from { to }.
  3. Paste it underneath the previous event.
  4. Put a comma between event blocks.
  5. Change the text fields:
     - date: the date shown on the website
     - closeDate: the automatic closing date, written as YYYY-MM-DD
     - type: Competition, Workshop, Networking, Symposium, etc.
     - title: event name
     - image: event poster path, usually assets/events/your-image.jpg
     - collaboration: partner or host text
     - entry: price or Free
     - description: short event description
     - prizes: list of prize lines, or [] if there are no prizes
     - link: sign-up or info link

  Events with a future closeDate show as "Currently open".
  Events with a past closeDate show as "Closed".
  Open events are shown first automatically.
*/

const activityList = document.querySelector("#activity-list");

const fallbackEvents = [
  {
    date: "Sunday 12 July 2026",
    closeDate: "2026-07-12",
    type: "Competition",
    title: "A-Level Maths Competition",
    image: "assets/events/mathscomp.jpeg",
    collaboration: "In collaboration with Pathway X and Gradify",
    entry: "£3 entry per participant",
    description: "Test your skills and challenge the best in our A-Level Maths Competition.",
    prizes: [
      "1st place: £75 in cash prizes",
      "2nd place: £20 in cash prizes",
      "3rd place: mystery prize",
      "Everyone else wins free Gradify Premium and a certificate of participation"
    ],
    link: "https://gradify.org.uk"
  }
];

const today = new Date();
today.setHours(0, 0, 0, 0);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[character]));
}

function renderOptionalEventDetails(event) {
  const details = [];

  if (event.status) {
    const statusClass = event.status === "Closed" ? "event-status is-closed" : "event-status";
    details.push(`<span class="${statusClass}">${escapeHtml(event.status)}</span>`);
  }

  if (event.collaboration) {
    details.push(`<span>${escapeHtml(event.collaboration)}</span>`);
  }

  if (event.entry) {
    details.push(`<span>${escapeHtml(event.entry)}</span>`);
  }

  if (!details.length) return "";
  return `<div class="event-detail-row">${details.join("")}</div>`;
}

function renderPrizes(prizes) {
  if (!Array.isArray(prizes) || prizes.length === 0) return "";

  return `
    <ul class="event-prizes">
      ${prizes.map((prize) => `<li>${escapeHtml(prize)}</li>`).join("")}
    </ul>
  `;
}

function renderEventLink(link) {
  if (!link) return "";
  return `<a class="event-link" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Find out more</a>`;
}

function getEventStatus(event) {
  if (!event.closeDate) return event.status || "";

  const closeDate = new Date(`${event.closeDate}T23:59:59`);
  return closeDate < today ? "Closed" : "Currently open";
}

function isEventOpen(event) {
  return getEventStatus(event) === "Currently open";
}

function getSortTime(event) {
  const value = event.closeDate || event.startDate || event.date;
  const time = Date.parse(value);
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function sortEvents(events) {
  return [...events].sort((a, b) => {
    const statusDifference = Number(isEventOpen(b)) - Number(isEventOpen(a));
    if (statusDifference) return statusDifference;
    return getSortTime(a) - getSortTime(b);
  });
}

function renderEvents(events) {
  if (!activityList) return;

  activityList.innerHTML = sortEvents(events).map((event) => {
    const eventStatus = getEventStatus(event);
    const image = escapeHtml(event.image || "assets/girlstem-logo.png");
    const title = escapeHtml(event.title);
    const date = escapeHtml(event.date);
    const type = escapeHtml(event.type);
    const description = escapeHtml(event.description);
    const isFeatured = eventStatus || event.prizes || event.entry || event.collaboration;
    const eventWithStatus = { ...event, status: eventStatus };

    return `
    <article class="activity-card ${isFeatured ? "featured-event-card" : ""}">
      <img class="activity-image" src="${image}" alt="${title}" onerror="this.src = 'assets/girlstem-logo.png'">
      <div class="activity-content">
        <div>
          <p class="activity-meta">${date} / ${type}</p>
          <h3>${title}</h3>
          ${renderOptionalEventDetails(eventWithStatus)}
        </div>
        <p>${description}</p>
        ${renderPrizes(event.prizes)}
        ${renderEventLink(event.link)}
      </div>
    </article>
  `;
  }).join("");
}

fetch("events.json")
  .then((response) => {
    if (!response.ok) throw new Error("Could not load event data");
    return response.json();
  })
  .then(renderEvents)
  .catch(() => renderEvents(fallbackEvents));

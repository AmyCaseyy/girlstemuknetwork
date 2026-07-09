const activityList = document.querySelector("#activity-list");

const fallbackEvents = [
  {
    status: "Currently open",
    date: "Sunday 12 July 2026",
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
    details.push(`<span class="event-status">${escapeHtml(event.status)}</span>`);
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

function renderEvents(events) {
  if (!activityList) return;

  activityList.innerHTML = events.map((event) => {
    const image = escapeHtml(event.image || "assets/girlstem-logo.png");
    const title = escapeHtml(event.title);
    const date = escapeHtml(event.date);
    const type = escapeHtml(event.type);
    const description = escapeHtml(event.description);
    const isFeatured = event.status || event.prizes || event.entry || event.collaboration;

    return `
    <article class="activity-card ${isFeatured ? "featured-event-card" : ""}">
      <img class="activity-image" src="${image}" alt="${title}" onerror="this.src = 'assets/girlstem-logo.png'">
      <div class="activity-content">
        <div>
          <p class="activity-meta">${date} / ${type}</p>
          <h3>${title}</h3>
          ${renderOptionalEventDetails(event)}
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

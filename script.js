/*
  ANVESHAN Frontend — P3
  This is a front-end demo with sample data.
  Later, replace the demo functions with P2's real API endpoints.
*/

const sampleResources = [
  { id: 1, title: "DBMS Mid-sem Question Paper", subject: "DBMS", year: "2024", type: "Mid-sem", faculty: "Dr. Geetanjali Bhola", url: "https://example.com/dbms-midsem-2024" },
  { id: 2, title: "DBMS End-sem Revision Notes", subject: "DBMS", year: "2025", type: "Notes", faculty: "CSE Department", url: "https://example.com/dbms-notes-2025" },
  { id: 3, title: "Data Structures Lab Manual", subject: "Data Structures", year: "2025", type: "Lab Manual", faculty: "CSE Department", url: "https://example.com/ds-lab-manual" },
  { id: 4, title: "Digital System Design Mid-sem", subject: "Digital System Design", year: "2024", type: "Mid-sem", faculty: "Department Faculty", url: "https://example.com/dsd-midsem-2024" },
  { id: 5, title: "ADA End-sem Question Paper", subject: "ADA", year: "2023", type: "End-sem", faculty: "CSE Department", url: "https://example.com/ada-endsem-2023" },
  { id: 6, title: "EVS Course Syllabus", subject: "EVS", year: "2026", type: "Syllabus", faculty: "Department Faculty", url: "https://example.com/evs-syllabus" }
];

let resources = [...sampleResources];
let submissions = [];
let nextId = 100;

const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const subjectFilter = document.querySelector("#subjectFilter");
const yearFilter = document.querySelector("#yearFilter");
const typeFilter = document.querySelector("#typeFilter");
const resultsBody = document.querySelector("#resultsBody");
const resultCount = document.querySelector("#resultCount");
const emptyState = document.querySelector("#emptyState");
const uploadForm = document.querySelector("#uploadForm");
const uploadMessage = document.querySelector("#uploadMessage");
const moderationList = document.querySelector("#moderationList");
const moderationEmpty = document.querySelector("#moderationEmpty");
const pendingCount = document.querySelector("#pendingCount");
const toast = document.querySelector("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function getFilteredResources() {
  const query = searchInput.value.trim().toLowerCase();
  const subject = subjectFilter.value;
  const year = yearFilter.value;
  const type = typeFilter.value;

  return resources.filter((resource) => {
    const searchableText = [resource.title, resource.subject, resource.year, resource.type, resource.faculty].join(" ").toLowerCase();
    return (!query || searchableText.includes(query))
      && (!subject || resource.subject === subject)
      && (!year || resource.year === year)
      && (!type || resource.type === type)
      && resource.status !== "rejected";
  });
}

function renderResults() {
  const filtered = getFilteredResources();
  resultsBody.innerHTML = filtered.map((resource) => `
    <tr>
      <td><div class="resource-name"><span class="doc-icon">▤</span><span>${escapeHtml(resource.title)}<small>Academic resource</small></span></div></td>
      <td>${escapeHtml(resource.subject)}</td>
      <td>${escapeHtml(resource.year)}</td>
      <td><span class="pill">${escapeHtml(resource.type)}</span></td>
      <td>${escapeHtml(resource.faculty || "Not specified")}</td>
      <td><a class="link-button" href="${safeUrl(resource.url)}" target="_blank" rel="noopener noreferrer">Open link ↗</a></td>
    </tr>`).join("");

  resultCount.textContent = `${filtered.length} resource${filtered.length === 1 ? "" : "s"}`;
  emptyState.hidden = filtered.length !== 0;
}

function safeUrl(value) {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) ? escapeHtml(parsed.href) : "#";
  } catch {
    return "#";
  }
}

function renderModeration() {
  const pending = submissions.filter((item) => item.status === "pending");
  pendingCount.textContent = `${pending.length} pending`;
  moderationEmpty.hidden = pending.length !== 0;

  moderationList.innerHTML = pending.map((item) => `
    <article class="moderation-item">
      <div class="moderation-top">
        <div><div class="moderation-title">${escapeHtml(item.title)}</div>
        <div class="moderation-meta">${escapeHtml(item.subject)} · ${escapeHtml(item.year)} · ${escapeHtml(item.type)}<br />${escapeHtml(item.faculty || "Faculty not specified")}</div></div>
        <span class="status">Pending</span>
      </div>
      <div class="moderation-actions">
        <button class="small-btn approve-btn" data-action="approve" data-id="${item.id}">✓ Approve</button>
        <button class="small-btn reject-btn" data-action="reject" data-id="${item.id}">✕ Reject</button>
        <a class="small-btn" href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer">Check link ↗</a>
      </div>
    </article>`).join("");
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderResults();
});

[subjectFilter, yearFilter, typeFilter].forEach((filter) => {
  filter.addEventListener("change", renderResults);
});

searchInput.addEventListener("input", renderResults);

document.querySelector("#clearFilters").addEventListener("click", () => {
  searchInput.value = "";
  subjectFilter.value = "";
  yearFilter.value = "";
  typeFilter.value = "";
  renderResults();
});

uploadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(uploadForm);
  const item = {
    id: nextId++,
    title: String(formData.get("title")).trim(),
    subject: String(formData.get("subject")),
    year: String(formData.get("year")),
    type: String(formData.get("type")),
    faculty: String(formData.get("faculty")).trim(),
    url: String(formData.get("url")).trim(),
    status: "pending"
  };

  if (!/^https?:\/\//i.test(item.url)) {
    uploadMessage.textContent = "Please enter a valid link starting with http:// or https://.";
    return;
  }

  submissions.unshift(item);
  uploadForm.reset();
  uploadMessage.textContent = "Submitted in demo mode. Your resource is now waiting for moderation.";
  renderModeration();
  showToast("Resource added to the review queue");
});

moderationList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const item = submissions.find((submission) => submission.id === id);
  if (!item) return;

  if (button.dataset.action === "approve") {
    item.status = "approved";
    resources.unshift(item);
    showToast("Resource approved and added to demo search results");
    renderResults();
  } else {
    item.status = "rejected";
    showToast("Resource rejected in demo mode");
  }

  renderModeration();
});

document.querySelector("#resetDemo").addEventListener("click", () => {
  resources = [...sampleResources];
  submissions = [];
  uploadForm.reset();
  uploadMessage.textContent = "";
  searchInput.value = "";
  subjectFilter.value = "";
  yearFilter.value = "";
  typeFilter.value = "";
  renderResults();
  renderModeration();
  showToast("Demo data has been reset");
});

// Initial page render
renderResults();
renderModeration();

/*
  BACKEND INTEGRATION TODO (coordinate with P2):
  1. GET /api/documents?q=...&subject=...&year=...&type=...
  2. POST /api/documents or P2's agreed upload endpoint
  3. GET /api/moderation/pending
  4. POST /api/moderation/:id/approve
  5. POST /api/moderation/:id/reject

  Agree on exact endpoint names and JSON fields with P2 before connecting.
*/

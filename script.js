/* Hacker News Daily — Linear newspaper scrollbook */

const feedEl = document.getElementById("feed");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const editionDate = document.getElementById("edition-date");
const feedSelect = document.getElementById("feedSelect");

let storyElements = [];
let focusedIndex = -1;

function formatDateLong(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function timeAgo(ts) {
  const now = Date.now() / 1000;
  const diff = Math.max(1, Math.floor(now - ts));
  const units = [[60, "second"], [60, "minute"], [24, "hour"], [7, "day"], [12, "month"], [Infinity, "year"]];
  let value = diff;
  for (const [step, name] of units) {
    if (value < step) return `${value} ${name}${value !== 1 ? "s" : ""} ago`;
    value = Math.floor(value / step);
  }
  return "just now";
}

function hostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "news.ycombinator.com"; }
}

async function fetchStories() {
  const response = await fetch("data.json");
  if (!response.ok) throw new Error("data.json not found");
  return response.json();
}

function escapeHtml(str) {
  if (!str) return "";
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function stripHtml(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function createStoryHTML(story, isLead = false) {
  if (!story) return "";
  const isAsk = story.title && /^ask hn/i.test(story.title);

  let content = "";
  if (story.summary) {
    content = story.summary;
  } else if (story.text) {
    content = stripHtml(story.text).substring(0, 300) + "...";
  }

  const imgHtml = story.image ? `<img src="${story.image}" class="story-image" onerror="this.style.display='none'" alt="Cover Image">` : "";

  return `
    <article class="story ${isLead ? 'lead' : ''}" data-url="${escapeHtml(story.url || `https://news.ycombinator.com/item?id=${story.id}`)}">
      <span class="kicker">${isAsk ? "Special Inquiry" : "Dispatch"}</span>
      <h3 class="headline"><a class="story-link" href="${story.url || `https://news.ycombinator.com/item?id=${story.id}`}" target="_blank" rel="noopener">${escapeHtml(story.title)}</a></h3>
      <div class="byline">By ${escapeHtml(story.by)}</div>
      ${imgHtml}
      ${content ? `<p class="article-body">${escapeHtml(content)}</p>` : ""}
      <div class="story-meta">${story.score ?? 0} points • ${timeAgo(story.time)} • <a href="https://news.ycombinator.com/item?id=${story.id}" target="_blank" rel="noopener" class="meta-link">${story.descendants ?? 0} comments</a> • ${hostname(story.url)}</div>
    </article>
  `;
}

function renderFeed(stories) {
  feedEl.innerHTML = "";
  storyElements = [];
  focusedIndex = -1;

  let content = `
    <div class="front-masthead">
      <h1 class="masthead-title">Hacker News Daily</h1>
      <div class="masthead-sub">The Internet's Front Page</div>
      <div class="masthead-meta">
        <span>${formatDateLong(new Date())}</span>
        <span>Vol. MMXXVI</span>
        <span>Silicon Valley</span>
      </div>
    </div>
    <div class="news-grid" id="news-grid">
  `;

  stories.forEach((s, idx) => {
    content += createStoryHTML(s, idx === 0);
  });

  content += `</div>`;
  feedEl.innerHTML = content;

  // Cache the story nodes for keyboard navigation
  storyElements = document.querySelectorAll(".story");
}

function updateFocus(newIndex) {
  if (storyElements.length === 0) return;

  // Unfocus current
  if (focusedIndex >= 0 && focusedIndex < storyElements.length) {
    storyElements[focusedIndex].classList.remove("focused");
  }

  // Bound index
  focusedIndex = Math.max(0, Math.min(newIndex, storyElements.length - 1));

  // Focus new
  const el = storyElements[focusedIndex];
  el.classList.add("focused");

  // Scroll it into view smoothly
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function wireEvents() {
  document.addEventListener("keydown", e => {
    if (storyElements.length === 0) return;

    if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "j" || e.key === "l") {
      e.preventDefault();
      updateFocus(focusedIndex + 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "k" || e.key === "h") {
      e.preventDefault();
      updateFocus(focusedIndex - 1);
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && focusedIndex < storyElements.length) {
        const url = storyElements[focusedIndex].getAttribute("data-url");
        if (url) {
          window.open(url, "_blank");
        }
      }
    }
  });

  if (feedSelect) {
    feedSelect.parentElement.style.display = 'none'; // hide static feed selector
  }
}

async function loadAndRender() {
  loadingEl.hidden = false;
  errorEl.hidden = true;
  feedEl.innerHTML = "";
  try {
    const stories = await fetchStories();
    const cleaned = stories.filter(s => s && s.type === "story" && s.title);
    renderFeed(cleaned);
  } catch (e) {
    console.error(e);
    errorEl.hidden = false;
  } finally {
    loadingEl.hidden = true;
  }
}

function init() {
  if (editionDate) editionDate.textContent = formatDateLong(new Date());
  wireEvents();
  loadAndRender();
}

init();

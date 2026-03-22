// ---------------------------------------------------------------------------
// app.js – Client-side rendering for the News Dashboard
// ---------------------------------------------------------------------------
// Fetches docs/news.json and renders each category section.
// Handles tab switching between AI and Finance views.
// ---------------------------------------------------------------------------

(function () {
    "use strict";

    /** Format an ISO date string into a human-friendly form. */
    function formatDate(isoString) {
        try {
            return new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
            }).format(new Date(isoString));
        } catch {
            return isoString || "";
        }
    }

    /** Create DOM elements for a single news item. */
    function renderItem(item) {
        var el = document.createElement("div");
        el.className = "news-item";
        el.innerHTML =
            '<a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer">' +
            escapeHtml(item.title) +
            "</a>" +
            '<div class="news-meta">' +
            '<span class="source">' + escapeHtml(item.source) + "</span>" +
            " · " +
            '<span class="date">' + escapeHtml(formatDate(item.publishedAt)) + "</span>" +
            "</div>";
        return el;
    }

    /** Basic HTML escaping to prevent XSS from feed content. */
    function escapeHtml(str) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(str || ""));
        return div.innerHTML;
    }

    /** Render a list of items into a container. */
    function renderSection(category, items) {
        var container = document.querySelector(
            '.items-list[data-category="' + category + '"]'
        );
        if (!container) return;

        container.innerHTML = "";

        if (!items || items.length === 0) {
            var p = document.createElement("p");
            p.className = "placeholder";
            p.textContent = "No items yet.";
            container.appendChild(p);
            return;
        }

        items.forEach(function (item) {
            container.appendChild(renderItem(item));
        });
    }

    /** Render market trend news items. */
    function renderTrends(trends) {
        renderSection("trends", trends);
    }

    /** Show an error message in all sections. */
    function showError(message) {
        var containers = document.querySelectorAll(".items-list");
        containers.forEach(function (c) {
            c.innerHTML = "";
            var p = document.createElement("p");
            p.className = "error-message";
            p.textContent = message;
            c.appendChild(p);
        });
    }

    /** Set up tab switching. */
    function initTabs() {
        var tabButtons = document.querySelectorAll(".tab");
        tabButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var targetId = btn.getAttribute("data-tab");

                // Update button states
                tabButtons.forEach(function (b) {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");

                // Update tab content visibility
                var panels = document.querySelectorAll(".tab-content");
                panels.forEach(function (panel) {
                    panel.classList.remove("active");
                });
                var target = document.getElementById(targetId);
                if (target) target.classList.add("active");
            });
        });
    }

    /** Main: fetch news.json and render. */
    function init() {
        initTabs();

        fetch("news.json")
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function (data) {
                // AI categories
                var ai = data.ai || {};
                renderSection("developers", ai.developers);
                renderSection("everyone", ai.everyone);
                renderSection("advancements", ai.advancements);

                // Finance categories
                var finance = data.finance || {};
                renderSection("markets", finance.markets);
                renderSection("crypto", finance.crypto);

                // Market trends
                renderTrends(data.trends || []);

                // Update the "last updated" timestamp
                var ts = document.getElementById("last-updated");
                if (ts && data.lastUpdated) {
                    ts.textContent = "Last updated: " + formatDate(data.lastUpdated);
                }
            })
            .catch(function () {
                showError("Unable to load news. Please try again later.");
            });
    }

    document.addEventListener("DOMContentLoaded", init);
})();

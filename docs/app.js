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

    /** Format a number with locale grouping. */
    function formatNum(n) {
        if (n == null) return "—";
        return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    /** Format a percentage with sign and color class. */
    function formatPct(pct) {
        if (pct == null) return '<span class="trend-metric-value">—</span>';
        var sign = pct >= 0 ? "+" : "";
        var cls = pct >= 0 ? "trend-up" : "trend-down";
        return '<span class="trend-metric-value ' + cls + '">' + sign + pct.toFixed(2) + "%</span>";
    }

    /** Render market trend cards grouped by region. */
    function renderTrends(trends) {
        var container = document.getElementById("trends-container");
        if (!container) return;
        container.innerHTML = "";

        if (!trends || trends.length === 0) {
            var p = document.createElement("p");
            p.className = "placeholder";
            p.textContent = "No trend data available.";
            container.appendChild(p);
            return;
        }

        // Group by region
        var regions = {};
        trends.forEach(function (t) {
            var key = (t.flag || "") + " " + (t.region || "Other");
            if (!regions[key]) regions[key] = [];
            regions[key].push(t);
        });

        Object.keys(regions).forEach(function (regionLabel) {
            var heading = document.createElement("h3");
            heading.className = "trend-region-heading";
            heading.textContent = regionLabel;
            container.appendChild(heading);

            var grid = document.createElement("div");
            grid.className = "trend-grid";

            regions[regionLabel].forEach(function (t) {
                var upDown = (t.dayChange != null && t.dayChange >= 0) ? "trend-card-up" : "trend-card-down";
                var card = document.createElement("div");
                card.className = "trend-card " + upDown;
                card.innerHTML =
                    '<div class="trend-header">' +
                    '<span class="trend-name">' + escapeHtml(t.name) + "</span>" +
                    '<span class="trend-price">' + formatNum(t.price) + "</span>" +
                    "</div>" +
                    '<div class="trend-metrics">' +
                    '<div class="trend-metric"><span class="trend-metric-label">Day</span>' + formatPct(t.dayChangePct) + "</div>" +
                    '<div class="trend-metric"><span class="trend-metric-label">1M</span>' + formatPct(t.month1Pct) + "</div>" +
                    '<div class="trend-metric"><span class="trend-metric-label">3M</span>' + formatPct(t.month3Pct) + "</div>" +
                    '<div class="trend-metric"><span class="trend-metric-label">YTD</span>' + formatPct(t.ytdPct) + "</div>" +
                    "</div>";
                grid.appendChild(card);
            });

            container.appendChild(grid);
        });
    }

    /** Show an error message in all sections. */
    function showError(message) {
        var containers = document.querySelectorAll(".items-list, #trends-container");
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

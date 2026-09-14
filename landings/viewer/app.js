(function () {
  "use strict";
  var items = window.HDS_CATALOG || [];
  var catalog = document.getElementById("catalog");
  var search = document.getElementById("search");
  var frame = document.getElementById("preview");
  var title = document.getElementById("current-title");
  var meta = document.getElementById("current-meta");
  var open = document.getElementById("open-example");
  var activeId = "company-page";
  var collapsedGroups = new Set();
  var groups = [
    ["atom", "Атомы"],
    ["element", "Элементы"],
    ["organism", "Организмы"],
    ["block", "Блоки"],
    ["page", "Страницы"]
  ];
  var kindLabels = Object.fromEntries(groups);
  var changeLabels = { new: "Новое", updated: "Обновлено" };

  function select(item) {
    activeId = item.id;
    frame.src = item.example;
    title.textContent = item.title;
    meta.textContent = kindLabels[item.kind] + " · " + item.maturity;
    open.href = item.example;
    render(search.value);
  }

  function render(query) {
    var needle = (query || "").trim().toLowerCase();
    catalog.replaceChildren();
    var filtered = items.filter(function (item) {
      return !needle || (item.title + " " + (item.summary || "") + " " + item.kind + " " + item.category + " " + (changeLabels[item.change] || "")).toLowerCase().includes(needle);
    });
    groups.forEach(function (group) {
      var groupItems = filtered.filter(function (item) { return item.kind === group[0]; });
      if (!groupItems.length) return;
      var section = document.createElement("section");
      var heading = document.createElement("button");
      var isCollapsed = !needle && collapsedGroups.has(group[0]);
      heading.className = "catalog-group__title";
      heading.type = "button";
      heading.textContent = group[1];
      heading.setAttribute("aria-expanded", String(!isCollapsed));
      heading.addEventListener("click", function () {
        if (collapsedGroups.has(group[0])) collapsedGroups.delete(group[0]);
        else collapsedGroups.add(group[0]);
        render(search.value);
      });
      section.className = "catalog-group";
      section.append(heading);
      if (isCollapsed) {
        catalog.append(section);
        return;
      }
      groupItems.forEach(function (item) {
        var button = document.createElement("button");
        var small = document.createElement("small");
        button.type = "button";
        button.className = "catalog-item" + (item.id === activeId ? " is-active" : "");
        button.append(document.createTextNode(item.title));
        if (item.change) {
          var badge = document.createElement("span");
          badge.className = "catalog-item__badge catalog-item__badge--" + item.change;
          badge.textContent = changeLabels[item.change];
          button.append(badge);
        }
        small.textContent = [item.summary, item.maturity].filter(Boolean).join(" · ");
        button.append(small);
        button.addEventListener("click", function () { select(item); });
        section.append(button);
      });
      catalog.append(section);
    });
  }

  search.addEventListener("input", function () { render(search.value); });
  document.querySelectorAll("[data-width]").forEach(function (button) {
    button.addEventListener("click", function () {
      frame.style.width = button.dataset.width === "auto" ? "100%" : button.dataset.width + "px";
      document.querySelectorAll("[data-width]").forEach(function (candidate) { candidate.classList.toggle("is-active", candidate === button); });
    });
  });
  var initial = items.find(function (item) { return item.id === activeId; }) || items[0];
  if (initial) select(initial); else render("");
}());

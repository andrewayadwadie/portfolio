/* Reads SITE_DATA (js/data.js), renders it, wires theme, mobile nav and copy.
 * Contracts: specs/002-cv-motion-redesign/contracts/ (site-data, dom-motion)
 *
 * Content only. Motion (reveal, routing, intro, progress) lives in
 * js/motion.js, which starts on the
 * `site:rendered` event dispatched at the end of boot.
 *
 * Never innerHTML. Every string from SITE_DATA goes through textContent.
 */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var XLINK_NS = "http://www.w3.org/1999/xlink";

  /* -- tiny DOM helpers ---------------------------------------------------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // Marks a node with a reveal effect (dom-motion contract, "Motion attribute API").
  function reveal(node, effect) {
    node.setAttribute("data-reveal", effect);
    return node;
  }

  function group(node) {
    node.setAttribute("data-reveal-group", "");
    return node;
  }

  function setSymbol(use, symbolId) {
    use.setAttribute("href", symbolId);
    use.setAttributeNS(XLINK_NS, "xlink:href", symbolId);
  }

  function icon(symbolId, className) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", className || "icon");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var use = document.createElementNS(SVG_NS, "use");
    setSymbol(use, symbolId);
    svg.appendChild(use);
    return svg;
  }

  function externalAnchor(href) {
    var a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  }

  function sectionIndex(id) {
    for (var i = 0; i < SITE_DATA.sections.length; i++) {
      if (SITE_DATA.sections[i].id === id) return i;
    }
    return -1;
  }

  // Section head: decorative zero-padded index + the CV section name as h2.
  function sectionHead(container, id) {
    var i = sectionIndex(id);
    var meta = SITE_DATA.sections[i];
    var head = group(el("div", "section__head"));

    var index = reveal(el("span", "section__index", String(i + 1).padStart(2, "0")), "fade-up");
    index.setAttribute("aria-hidden", "true");
    head.appendChild(index);

    var h2 = reveal(el("h2", null, meta.heading), "mask");
    h2.id = id + "-title";
    h2.tabIndex = -1;
    head.appendChild(h2);

    container.appendChild(head);
  }

  function sectionShell(section) {
    var container = el("div", "container");
    section.appendChild(container);
    sectionHead(container, section.id);
    return container;
  }

  function chipList(items) {
    var list = el("ul", "chip-list");
    items.forEach(function (text) {
      var li = reveal(el("li"), "fade-up");
      li.appendChild(el("span", "chip", text));
      list.appendChild(li);
    });
    return list;
  }

  /* -- nav ------------------------------------------------------------------ */

  function renderNav() {
    var list = document.getElementById("nav-list");
    if (!list) return;

    SITE_DATA.sections.forEach(function (section, i) {
      var li = el("li");
      li.style.setProperty("--i", String(i));
      var a = el("a", null, section.nav);
      a.href = "#" + section.id;
      a.setAttribute("data-nav", "");
      li.appendChild(a);
      list.appendChild(li);
    });

    // The sliding active indicator. Positioned by js/motion.js scroll-spy.
    var pill = el("li", "nav__pill");
    pill.setAttribute("aria-hidden", "true");
    pill.setAttribute("role", "presentation");
    list.appendChild(pill);
  }

  /* -- product rendering ---------------------------------------------------
   * A string url produces an anchor. A null url produces plain text: no
   * href="#", no disabled state, no hint that a link was ever contemplated.
   */
  function renderProduct(product) {
    var hasLink = typeof product.url === "string" && product.url.length > 0;
    var node = hasLink ? externalAnchor(product.url) : document.createElement("div");
    node.className = "product";
    reveal(node, "fade-up");

    var name = el("span", "product__name");
    name.appendChild(document.createTextNode(product.name));
    if (hasLink) name.appendChild(icon("#icon-external-link"));

    node.appendChild(name);
    node.appendChild(el("span", "product__desc", product.description));
    return node;
  }

  /* -- renderers ----------------------------------------------------------- */

  function renderExperience(section) {
    var container = sectionShell(section);
    var timeline = el("div", "timeline");

    SITE_DATA.experience.forEach(function (job) {
      var article = group(el("article", "job"));

      var rail = reveal(el("span", "job__rail"), "line");
      rail.setAttribute("aria-hidden", "true");
      article.appendChild(rail);

      var head = el("div", "job__head");
      head.appendChild(reveal(el("h3", "job__company", job.company), "mask"));
      head.appendChild(reveal(el("span", "job__dates", job.start + " – " + job.end), "fade-up"));
      article.appendChild(head);

      article.appendChild(reveal(el("p", "job__role", job.role), "fade-up"));
      article.appendChild(reveal(el("p", "job__location", job.location), "fade-up"));

      var bullets = el("ul", "job__bullets");
      job.bullets.forEach(function (text) {
        bullets.appendChild(reveal(el("li", null, text), "fade-up"));
      });
      article.appendChild(bullets);

      if (job.products.length) {
        var wrap = el("div", "products");
        wrap.appendChild(reveal(el("p", "products__label", "Key products"), "fade-up"));
        var list = el("div", "products__list");
        job.products.forEach(function (product) {
          list.appendChild(renderProduct(product));
        });
        wrap.appendChild(list);
        article.appendChild(wrap);
      }

      timeline.appendChild(article);
    });

    container.appendChild(timeline);
  }

  function renderSkills(section) {
    var container = sectionShell(section);
    var grid = el("div", "skills");

    SITE_DATA.skills.forEach(function (skillGroup) {
      var card = group(el("div", "card skillgroup"));
      card.appendChild(reveal(el("h3", "skillgroup__name", skillGroup.category), "mask"));
      card.appendChild(chipList(skillGroup.skills));
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  function renderEducation(section) {
    var container = sectionShell(section);
    var edu = SITE_DATA.education;

    var card = group(el("div", "card edu"));
    card.appendChild(reveal(el("h3", "edu__degree", edu.degree), "mask"));
    card.appendChild(reveal(el("p", "edu__meta", edu.faculty + ", " + edu.institution), "fade-up"));
    card.appendChild(reveal(el("p", "edu__year", "Graduated " + edu.graduated), "fade-up"));

    var facts = el("dl", "edu__facts");
    [
      ["Graduation Project", edu.project],
      ["Grade", edu.grade],
    ].forEach(function (pair) {
      var row = reveal(el("div"), "fade-up");
      row.appendChild(el("dt", null, pair[0]));
      row.appendChild(el("dd", null, pair[1]));
      facts.appendChild(row);
    });
    card.appendChild(facts);

    container.appendChild(card);
  }

  function renderLanguages(section) {
    var container = sectionShell(section);
    var grid = el("ul", "langs-section");

    SITE_DATA.languages.forEach(function (lang) {
      var card = group(el("li", "card lang-card"));
      card.appendChild(reveal(el("h3", "lang-card__name", lang.language), "mask"));
      card.appendChild(reveal(el("p", "lang-card__level", lang.level), "fade-up"));
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  function renderContact(section) {
    var container = sectionShell(section);
    var grid = group(el("div", "contact-grid"));

    var portrait = reveal(el("div", "contact__portrait"), "clip");
    var img = document.createElement("img");
    img.src = SITE_DATA.profile.photo;
    img.alt = SITE_DATA.profile.photoAlt;
    img.width = 836;
    img.height = 1254;
    img.loading = "lazy";
    portrait.appendChild(img);
    grid.appendChild(portrait);

    var side = el("div", "contact__side");
    var list = el("ul", "channels");

    SITE_DATA.contact.forEach(function (channel) {
      var li = reveal(el("li", "channel"), "fade-up");
      var isMail = channel.href.indexOf("mailto:") === 0;

      var link = isMail ? document.createElement("a") : externalAnchor(channel.href);
      if (isMail) link.href = channel.href;
      link.className = "channel__link";

      var iconWrap = el("span", "channel__icon");
      iconWrap.appendChild(icon(channel.icon));
      link.appendChild(iconWrap);

      var textWrap = el("span", "channel__text");
      textWrap.appendChild(el("span", "channel__label", channel.label));
      textWrap.appendChild(el("span", "channel__value", channel.value));
      link.appendChild(textWrap);

      li.appendChild(link);
      if (channel.copyable) li.appendChild(buildCopyButton(channel.value));
      list.appendChild(li);
    });

    side.appendChild(list);

    var actions = reveal(el("div", "contact__actions"), "fade-up");
    var cv = externalAnchor(SITE_DATA.profile.cv);
    cv.className = "btn btn--primary";
    cv.appendChild(icon("#icon-download"));
    cv.appendChild(document.createTextNode("Download CV"));
    actions.appendChild(cv);
    side.appendChild(actions);

    grid.appendChild(side);
    container.appendChild(grid);
  }

  /* -- copy to clipboard + toast -------------------------------------------- */

  var toastTimer = null;

  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-shown");
    }, 2000);
  }

  function buildCopyButton(value) {
    var button = el("button", "btn btn--icon channel__copy");
    button.type = "button";
    button.setAttribute("aria-label", "Copy email address");
    button.appendChild(icon("#icon-copy"));

    button.addEventListener("click", function () {
      copyText(value).then(function (ok) {
        if (!ok) return;
        var use = button.querySelector("use");
        setSymbol(use, "#icon-check");
        button.classList.add("is-done");
        showToast("Email address copied");

        setTimeout(function () {
          setSymbol(use, "#icon-copy");
          button.classList.remove("is-done");
        }, 2000);
      });
    });

    return button;
  }

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value).then(
        function () {
          return true;
        },
        function () {
          return legacyCopy(value);
        }
      );
    }
    return Promise.resolve(legacyCopy(value));
  }

  function legacyCopy(value) {
    var input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "absolute";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(input);
    return ok;
  }

  /* -- theme ----------------------------------------------------------------
   * The click dispatches a cancelable `theme:toggle-request` carrying the
   * apply function. js/motion.js may take it over to run the switch inside a
   * view transition; if nobody cancels it, the theme switches directly.
   */
  function initTheme() {
    var button = document.getElementById("theme-toggle");
    var use = document.getElementById("theme-icon");
    if (!button || !use) return;

    sync(document.documentElement.dataset.theme);

    function apply() {
      var next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        // Storage blocked (Safari private mode). Theme still switches for this
        // visit; the next one falls back to the OS preference.
      }
      sync(next);
    }

    button.addEventListener("click", function () {
      var request = new CustomEvent("theme:toggle-request", {
        cancelable: true,
        detail: { apply: apply, origin: button },
      });
      if (document.dispatchEvent(request)) apply();
    });

    function sync(theme) {
      var isLight = theme === "light";
      setSymbol(use, isLight ? "#icon-sun" : "#icon-moon");
      button.setAttribute("aria-pressed", String(isLight));
      button.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    }
  }

  /* -- mobile nav ----------------------------------------------------------- */

  function initNav() {
    var toggle = document.getElementById("nav-toggle");
    var list = document.getElementById("nav-list");
    var use = document.getElementById("nav-toggle-icon");
    if (!toggle || !list || !use) return;

    function setOpen(open) {
      list.dataset.open = String(open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      setSymbol(use, open ? "#icon-close" : "#icon-menu");
    }

    setOpen(false);

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    list.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* -- boot ------------------------------------------------------------------ */

  var RENDERERS = {
    experience: renderExperience,
    skills: renderSkills,
    education: renderEducation,
    languages: renderLanguages,
    contact: renderContact,
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderNav();

    document.querySelectorAll("[data-render]").forEach(function (section) {
      var render = RENDERERS[section.dataset.render];
      if (render) render(section);
    });

    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    initTheme();
    initNav();

    // Hand off to js/motion.js (dom-motion contract, "Events").
    document.dispatchEvent(new CustomEvent("site:rendered"));
  });
})();

/* Reads SITE_DATA (js/data.js), renders it, wires theme, nav, reveal, copy.
 * Contract: specs/001-cv-portfolio-redesign/contracts/dom.contract.md
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

  function icon(symbolId, className) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", className || "icon");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", symbolId);
    use.setAttributeNS(XLINK_NS, "xlink:href", symbolId);
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

  function sectionHead(container, eyebrow, heading, lead) {
    var head = el("div", "section__head");
    head.appendChild(el("span", "section__eyebrow", eyebrow));
    head.appendChild(el("h2", null, heading));
    if (lead) head.appendChild(el("p", "section__lead", lead));
    container.appendChild(head);
  }

  function sectionShell(section) {
    var container = el("div", "container");
    section.appendChild(container);
    return container;
  }

  /* -- product rendering ---------------------------------------------------
   * The one conditional the whole data structure exists for.
   * A string url produces an anchor. A null url produces plain text — no
   * href="#", no disabled state, no hint that a link was ever contemplated.
   */
  function renderProduct(product) {
    var hasLink = typeof product.url === "string" && product.url.length > 0;
    var node = hasLink ? externalAnchor(product.url) : document.createElement("div");
    node.className = "product";

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
    sectionHead(
      container,
      "Experience",
      "Where I have shipped",
      "Three teams, ten production applications, across government, telecom, e-commerce, and booking."
    );

    SITE_DATA.experience.forEach(function (job) {
      var article = el("article", "job");

      var head = el("div", "job__head");
      head.appendChild(el("h3", "job__company", job.company));
      head.appendChild(el("span", "job__dates", job.start + " — " + job.end));
      article.appendChild(head);

      article.appendChild(el("p", "job__role", job.role));
      article.appendChild(el("p", "job__location", job.location));

      var bullets = el("ul", "job__bullets");
      job.bullets.forEach(function (text) {
        bullets.appendChild(el("li", null, text));
      });
      article.appendChild(bullets);

      if (job.products.length) {
        var wrap = el("div", "products");
        wrap.appendChild(el("p", "products__label", "Key products"));
        var list = el("div", "products__list");
        job.products.forEach(function (product) {
          list.appendChild(renderProduct(product));
        });
        wrap.appendChild(list);
        article.appendChild(wrap);
      }

      container.appendChild(article);
    });
  }

  function renderSideProjects(section) {
    var container = sectionShell(section);
    sectionHead(
      container,
      "Independent Products",
      "Things I built and shipped alone",
      "Owned end to end: product, architecture, backend, monetization, and store submission."
    );

    var grid = el("div", "projects");

    SITE_DATA.sideProjects.forEach(function (project) {
      var card = el("article", "project");

      var header = el("div");
      header.appendChild(el("h3", "project__name", project.name));
      header.appendChild(el("p", "project__tagline", project.tagline));
      header.appendChild(el("p", "project__role", project.role));
      card.appendChild(header);

      var chips = el("ul", "chip-list");
      project.stack.forEach(function (tech) {
        var li = el("li");
        li.appendChild(el("span", "chip", tech));
        chips.appendChild(li);
      });
      card.appendChild(chips);

      var bullets = el("ul", "project__bullets");
      project.bullets.forEach(function (text) {
        bullets.appendChild(el("li", null, text));
      });
      card.appendChild(bullets);

      // Same null-url rule as products: no link means no affordance at all.
      var hasLink = typeof project.url === "string" && project.url.length > 0;
      if (hasLink) {
        var foot = el("div", "project__foot");
        var link = externalAnchor(project.url);
        link.className = "link";
        link.appendChild(document.createTextNode(project.urlLabel || "Visit"));
        link.appendChild(icon("#icon-external-link"));
        foot.appendChild(link);
        card.appendChild(foot);
      }

      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  function renderSkills(section) {
    var container = sectionShell(section);
    sectionHead(container, "Skills", "The toolkit");

    var competencies = el("div", "competencies");
    competencies.appendChild(el("p", "products__label", "Core competencies"));
    var compChips = el("ul", "chip-list");
    SITE_DATA.competencies.forEach(function (item) {
      var li = el("li");
      li.appendChild(el("span", "chip", item));
      compChips.appendChild(li);
    });
    competencies.appendChild(compChips);
    container.appendChild(competencies);

    var grid = el("div", "skills");
    SITE_DATA.skills.forEach(function (group) {
      var card = el("div", "card");
      card.appendChild(el("h3", "skillgroup__name", group.category));
      var chips = el("ul", "chip-list");
      group.skills.forEach(function (skill) {
        var li = el("li");
        li.appendChild(el("span", "chip", skill));
        chips.appendChild(li);
      });
      card.appendChild(chips);
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  function renderEducation(section) {
    var container = sectionShell(section);
    sectionHead(container, "Education", "Where it started");

    var grid = el("div", "edu-grid");

    var eduCard = el("div", "card");
    var edu = SITE_DATA.education;
    eduCard.appendChild(el("h3", "edu__degree", edu.degree));
    eduCard.appendChild(
      el("p", "edu__meta", edu.faculty + ", " + edu.institution + " · " + edu.year)
    );

    var facts = el("dl", "edu__facts");
    [
      ["Graduation project", edu.project],
      ["Grade", edu.grade],
    ].forEach(function (pair) {
      var row = el("div");
      row.appendChild(el("dt", null, pair[0]));
      row.appendChild(el("dd", null, pair[1]));
      facts.appendChild(row);
    });
    eduCard.appendChild(facts);
    grid.appendChild(eduCard);

    var langCard = el("div", "card");
    langCard.appendChild(el("h3", "skillgroup__name", "Languages"));
    var langs = el("ul", "langs");
    SITE_DATA.languages.forEach(function (lang) {
      var li = el("li", "lang");
      li.appendChild(el("span", null, lang.language));
      li.appendChild(el("span", "lang__level", lang.level));
      langs.appendChild(li);
    });
    langCard.appendChild(langs);
    grid.appendChild(langCard);

    container.appendChild(grid);
  }

  function renderContact(section) {
    var container = sectionShell(section);
    sectionHead(
      container,
      "Contact",
      "Let's build something",
      "Reach me on any of these. Email opens in your own mail client — there is no form here."
    );

    var grid = el("div", "contact-grid");

    var portrait = el("div", "contact__portrait");
    var img = document.createElement("img");
    img.src = SITE_DATA.profile.photo;
    img.alt = SITE_DATA.profile.photoAlt;
    img.width = 836;
    img.height = 1254;
    portrait.appendChild(img);
    grid.appendChild(portrait);

    var list = el("ul", "channels");

    SITE_DATA.contact.forEach(function (channel) {
      var li = el("li", "channel");

      var link = channel.href.indexOf("mailto:") === 0
        ? document.createElement("a")
        : externalAnchor(channel.href);
      if (channel.href.indexOf("mailto:") === 0) link.href = channel.href;
      link.className = "channel__link";

      var iconWrap = el("span", "channel__icon");
      iconWrap.appendChild(icon(channel.icon));
      link.appendChild(iconWrap);

      var textWrap = el("span");
      textWrap.appendChild(el("span", "channel__label", channel.label));
      textWrap.appendChild(el("span", "channel__value", channel.value));
      link.appendChild(textWrap);

      li.appendChild(link);

      if (channel.copyable) {
        li.appendChild(buildCopyButton(channel.value));
      }

      list.appendChild(li);
    });

    grid.appendChild(list);
    container.appendChild(grid);
  }

  /* -- copy to clipboard ---------------------------------------------------- */

  function buildCopyButton(value) {
    var button = el("button", "btn btn--icon channel__copy");
    button.type = "button";
    button.setAttribute("aria-label", "Copy email address");
    button.appendChild(icon("#icon-copy"));

    button.addEventListener("click", function () {
      copyText(value).then(function (ok) {
        if (!ok) return;
        var use = button.querySelector("use");
        use.setAttribute("href", "#icon-check");
        use.setAttributeNS(XLINK_NS, "xlink:href", "#icon-check");
        button.classList.add("is-done");
        announce("Email address copied");

        setTimeout(function () {
          use.setAttribute("href", "#icon-copy");
          use.setAttributeNS(XLINK_NS, "xlink:href", "#icon-copy");
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

  function announce(message) {
    var region = document.getElementById("live-region");
    if (region) region.textContent = message;
  }

  /* -- theme ---------------------------------------------------------------- */

  function initTheme() {
    var button = document.getElementById("theme-toggle");
    var use = document.getElementById("theme-icon");
    if (!button || !use) return;

    sync(document.documentElement.dataset.theme);

    button.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        // Storage blocked (Safari private mode). Theme still switches for this
        // visit; the next one falls back to the OS preference.
      }
      sync(next);
    });

    function sync(theme) {
      var isLight = theme === "light";
      var symbol = isLight ? "#icon-sun" : "#icon-moon";
      use.setAttribute("href", symbol);
      use.setAttributeNS(XLINK_NS, "xlink:href", symbol);
      button.setAttribute("aria-pressed", String(isLight));
      button.setAttribute(
        "aria-label",
        isLight ? "Switch to dark theme" : "Switch to light theme"
      );
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
      var symbol = open ? "#icon-close" : "#icon-menu";
      use.setAttribute("href", symbol);
      use.setAttributeNS(XLINK_NS, "xlink:href", symbol);
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

  /* -- reveal ---------------------------------------------------------------
   * The .js-reveal class on <html> is what gates the initial-hidden styles.
   * If this script never runs, the class is never added, the hidden rule never
   * matches, and no section is stranded invisible.
   */
  function initReveal() {
    var targets = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    targets.forEach(function (node) {
      observer.observe(node);
    });
  }

  /* -- boot ------------------------------------------------------------------ */

  var RENDERERS = {
    experience: renderExperience,
    sideProjects: renderSideProjects,
    skills: renderSkills,
    education: renderEducation,
    contact: renderContact,
  };

  document.documentElement.classList.add("js-reveal");

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-render]").forEach(function (section) {
      var render = RENDERERS[section.dataset.render];
      if (render) render(section);
    });

    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    initTheme();
    initNav();
    initReveal();
  });
})();

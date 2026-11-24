/* Motion and navigation layer: progressive enhancement on top of js/main.js.
 * Contract: specs/002-cv-motion-redesign/contracts/dom-motion.contract.md
 * Decisions: specs/002-cv-motion-redesign/research.md R4–R9, R11, R14
 *
 * Starts on `site:rendered`. If this file never runs, nothing is hidden:
 * every hidden starting style in css/motion.css is gated on html.js-motion,
 * which only this file adds.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var reducedQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  function reduced() {
    return reducedQuery.matches;
  }

  // Duration tokens are read from CSS so JS timing never drifts from them.
  function token(name, fallback) {
    var v = parseFloat(getComputedStyle(root).getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  }

  /* -- word split (text nodes only, never innerHTML) ----------------------- */

  // Wraps each word in <span class="w"><span>word</span></span>. Spaces stay
  // real text nodes, so the accessible name is unchanged.
  function splitWords(node) {
    if (node.dataset.split) return;
    node.dataset.split = "1";
    var words = node.textContent.trim().split(/\s+/);
    while (node.firstChild) node.removeChild(node.firstChild);
    words.forEach(function (word, i) {
      if (i > 0) node.appendChild(document.createTextNode(" "));
      var outer = document.createElement("span");
      outer.className = "w";
      var inner = document.createElement("span");
      inner.style.setProperty("--w", String(i));
      inner.textContent = word;
      outer.appendChild(inner);
      node.appendChild(outer);
    });
  }

  /* -- reveal (R5) ----------------------------------------------------------- */

  var groups = [];
  var revealObserver = null;
  var onGroupVisible = []; // hooks, e.g. count-up

  function markVisible(groupEl) {
    if (groupEl.classList.contains("is-visible")) return;
    groupEl.classList.add("is-visible");
    if (revealObserver) revealObserver.unobserve(groupEl);
    onGroupVisible.forEach(function (fn) {
      fn(groupEl);
    });

    // Once the staggered entrance is over, drop the reveal transitions so
    // hover states run on their own timing.
    var cap = token("--stagger-cap", 8);
    var stagger = token("--stagger", 70);
    var settle = token("--dur-4", 1100) + cap * stagger + 200;
    setTimeout(function () {
      groupEl.classList.add("is-settled");
    }, reduced() ? 0 : settle);
  }

  function initReveal() {
    groups = Array.prototype.slice.call(document.querySelectorAll("[data-reveal-group]"));

    if (reduced() || !("IntersectionObserver" in window)) {
      groups.forEach(markVisible);
      return;
    }

    root.classList.add("js-motion");

    groups.forEach(function (groupEl) {
      var items = groupEl.querySelectorAll("[data-reveal]");
      Array.prototype.forEach.call(items, function (item, i) {
        item.style.setProperty("--i", String(i));
        if (item.getAttribute("data-reveal") === "mask") splitWords(item);
      });
    });

    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) markVisible(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    groups.forEach(function (groupEl) {
      revealObserver.observe(groupEl);
    });
  }

  // Deep links and fast jumps: everything at or above the target is shown at
  // once, so nothing the visitor skipped past stays hidden.
  function revealUpTo(target) {
    groups.forEach(function (groupEl) {
      var pos = target.compareDocumentPosition(groupEl);
      var before = pos & Node.DOCUMENT_POSITION_PRECEDING;
      var inside = pos & Node.DOCUMENT_POSITION_CONTAINED_BY;
      if (before || inside || groupEl === target) markVisible(groupEl);
    });
  }

  /* -- count-up (stats) ------------------------------------------------------ */

  function initCountUp() {
    onGroupVisible.push(function (groupEl) {
      var counters = groupEl.querySelectorAll("[data-count]");
      if (!counters.length || reduced()) return;

      var duration = token("--dur-4", 1100);
      Array.prototype.forEach.call(counters, function (node) {
        var target = parseInt(node.getAttribute("data-count"), 10);
        var suffix = node.getAttribute("data-suffix") || "";
        var finalText = node.textContent;
        if (isNaN(target)) return;

        var start = null;
        node.setAttribute("aria-label", finalText);
        function frame(now) {
          if (start === null) start = now;
          var t = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
          node.textContent = Math.round(eased * target) + suffix;
          if (t < 1) requestAnimationFrame(frame);
          else node.textContent = finalText;
        }
        node.textContent = "0" + suffix;
        requestAnimationFrame(frame);
      });
    });
  }

  /* -- landing intro (R9) ----------------------------------------------------- */

  function initIntro() {
    var mode = root.classList.contains("intro-full")
      ? "intro-full"
      : root.classList.contains("intro-short")
        ? "intro-short"
        : null;
    if (!mode) return;

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      root.classList.remove("intro-full", "intro-short", "intro-done");
      document.removeEventListener("pointerdown", skip, true);
      document.removeEventListener("keydown", skip, true);
    }

    function skip() {
      root.classList.add("intro-done");
      // Let the end state paint, then drop the intro classes entirely.
      requestAnimationFrame(finish);
    }

    document.addEventListener("pointerdown", skip, true);
    document.addEventListener("keydown", skip, true);

    // The longest intro piece is the portrait wipe (full) or the grid fade
    // (short). When it ends, the intro is over.
    var last = document.querySelector(mode === "intro-full" ? ".hero__portrait" : ".hero__grid");
    if (last) {
      last.addEventListener("animationend", function (event) {
        if (event.target === last) finish();
      });
    }
    setTimeout(finish, 1500); // backstop
  }

  /* -- hero background pause (R8) -------------------------------------------- */

  var heroVisible = true;

  function syncBackground() {
    root.classList.toggle("bg-paused", document.hidden || !heroVisible);
  }

  function initBackgroundPause() {
    document.addEventListener("visibilitychange", syncBackground);
  }

  /* -- hero observer: background pause + back-to-top ------------------------ */

  function initHeroWatch(toTop) {
    var hero = document.getElementById("hero");
    if (!hero || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      syncBackground();
      if (toTop) toTop.classList.toggle("is-shown", !heroVisible);
    }).observe(hero);
  }

  /* -- scroll progress (R7) --------------------------------------------------- */

  function initProgress() {
    var bar = document.querySelector(".scroll-progress");
    if (!bar) return;
    var queued = false;

    function update() {
      queued = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.setProperty("--progress", p.toFixed(4));
    }

    function request() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    update();
  }

  /* -- routing: hash navigation + scroll-spy (R6) ----------------------------- */

  var routeIds = [];
  var navLinks = {};
  var pill = null;
  var activeId = null;
  var spyLockedUntil = 0;

  function isRoute(id) {
    return routeIds.indexOf(id) !== -1;
  }

  function hashFor(id) {
    return id === "hero" ? location.pathname + location.search : "#" + id;
  }

  function movePill() {
    if (!pill) return;
    var link = activeId ? navLinks[activeId] : null;
    if (!link || link.offsetParent === null) {
      pill.classList.remove("is-active");
      return;
    }
    pill.style.setProperty("--pill-x", link.offsetLeft + "px");
    pill.style.setProperty("--pill-w", link.offsetWidth + "px");
    pill.classList.add("is-active");
  }

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    Object.keys(navLinks).forEach(function (key) {
      if (key === id) navLinks[key].setAttribute("aria-current", "true");
      else navLinks[key].removeAttribute("aria-current");
    });
    movePill();
  }

  function navigate(id, push) {
    var target = document.getElementById(id);
    if (!target) return;

    if (push && location.hash !== "#" + id) {
      history.pushState(null, "", hashFor(id));
    }

    revealUpTo(target);
    setActive(id === "hero" ? null : id);

    // Keep scroll-spy from rewriting the URL while we glide past sections.
    spyLockedUntil = Date.now() + 1200;

    target.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });

    var heading = document.getElementById(id + "-title");
    if (heading) heading.focus({ preventScroll: true });
  }

  function initHashNav() {
    routeIds = ["hero"].concat(
      SITE_DATA.sections.map(function (s) {
        return s.id;
      })
    );

    document.addEventListener("click", function (event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute("href").slice(1);
      if (!isRoute(id)) return;
      event.preventDefault();
      navigate(id, true);
    });

    window.addEventListener("popstate", function () {
      var id = location.hash.slice(1) || "hero";
      if (isRoute(id)) navigate(id, false);
    });

    // Initial load.
    var initial = location.hash.slice(1);
    if (!initial) return;
    if (isRoute(initial)) {
      var target = document.getElementById(initial);
      revealUpTo(target);
      setActive(initial === "hero" ? null : initial);
      spyLockedUntil = Date.now() + 600;
      // Sections are rendered by JS, so the browser's own jump landed early.
      requestAnimationFrame(function () {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      });
    } else {
      history.replaceState(null, "", location.pathname + location.search);
      window.scrollTo(0, 0);
    }
  }

  function initScrollSpy() {
    var list = document.getElementById("nav-list");
    if (list) {
      pill = list.querySelector(".nav__pill");
      Array.prototype.forEach.call(list.querySelectorAll("a[data-nav]"), function (a) {
        navLinks[a.getAttribute("href").slice(1)] = a;
      });
    }

    var targets = Array.prototype.slice.call(
      document.querySelectorAll("#hero, [data-section]")
    );
    if (!("IntersectionObserver" in window) || !targets.length) return;

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || Date.now() < spyLockedUntil) return;
          var id = entry.target.id;
          setActive(id === "hero" ? null : id);
          var wanted = id === "hero" ? "" : "#" + id;
          if (location.hash !== wanted) history.replaceState(null, "", hashFor(id));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    targets.forEach(function (t) {
      spy.observe(t);
    });

    window.addEventListener("resize", movePill);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);
  }

  /* -- back to top ------------------------------------------------------------ */

  function initToTop() {
    var button = document.querySelector(".to-top");
    if (!button) return null;
    button.hidden = false;
    button.addEventListener("click", function () {
      navigate("hero", true);
    });
    return button;
  }

  /* -- theme switch as a view transition (R11) ------------------------------- */

  function initThemeTransition() {
    document.addEventListener("theme:toggle-request", function (event) {
      if (reduced() || typeof document.startViewTransition !== "function") return;
      event.preventDefault();

      var origin = event.detail.origin.getBoundingClientRect();
      var x = origin.left + origin.width / 2;
      var y = origin.top + origin.height / 2;
      var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.style.setProperty("--vt-x", x + "px");
      root.style.setProperty("--vt-y", y + "px");
      root.style.setProperty("--vt-r", r + "px");

      document.startViewTransition(event.detail.apply);
    });
  }

  /* -- boot ------------------------------------------------------------------- */

  function init() {
    initIntro();
    initBackgroundPause();
    initCountUp();
    initReveal();
    initProgress();
    initScrollSpy();
    initHashNav();
    initHeroWatch(initToTop());
    initThemeTransition();
  }

  document.addEventListener("site:rendered", init);
})();

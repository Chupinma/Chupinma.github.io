(() => {
  "use strict";

  const root = document.getElementById("root");
  const START = new Date(2022, 9, 10, 0, 0, 0); // 10 oct 2022

  function runLoader() {
    const loader = document.getElementById("loader");
    const fill = document.getElementById("loaderFill");
    const pct = document.getElementById("loaderPct");
    const start = performance.now();
    const dur = 2200;

    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 2);
      if (fill) {
        fill.setAttribute("y", String(100 - eased * 100));
        fill.setAttribute("height", String(eased * 100));
      }
      if (pct) pct.textContent = Math.round(eased * 100) + "%";
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        if (loader) {
          loader.style.opacity = "0";
          setTimeout(() => { loader.style.display = "none"; }, 700);
        }
        startReveals();
        setTimeout(() => burst(18), 250);
      }
    }
    requestAnimationFrame(tick);
  }

  function startReveals() {
    if (!root) return;
    const els = root.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
  }

  function startCounter() {
    const pad = (n) => String(n).padStart(2, "0");
    const daysEl = document.getElementById("daysNum");
    const hoursEl = document.getElementById("hoursNum");
    const minsEl = document.getElementById("minsNum");
    const secsEl = document.getElementById("secsNum");
    const yearsEl = document.getElementById("yearsNote");

    function upd() {
      const diff = Date.now() - START.getTime();
      const days = Math.floor(diff / 86400000);
      const rem = diff % 86400000;
      const h = Math.floor(rem / 3600000);
      const m = Math.floor((rem % 3600000) / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      if (daysEl) daysEl.textContent = days.toLocaleString("fr-FR");
      if (hoursEl) hoursEl.textContent = pad(h);
      if (minsEl) minsEl.textContent = pad(m);
      if (secsEl) secsEl.textContent = pad(s);
      if (yearsEl) {
        const yrs = diff / (365.25 * 86400000);
        yearsEl.textContent = "≈ " + yrs.toFixed(1).replace(".", ",") + " ans à s'aimer sans compter";
      }
    }
    upd();
    setInterval(upd, 1000);
  }

  function setupParallax() {
    if (!root) return;
    const hearts = Array.prototype.slice.call(root.querySelectorAll(".pheart"));
    let mx = 0, my = 0;
    function apply() {
      const sy = window.scrollY || 0;
      hearts.forEach((el) => {
        const d = parseFloat(el.getAttribute("data-depth")) || 1;
        el.style.transform = "translate(" + (mx * d * 22) + "px," + (my * d * 22 + sy * d * 0.08) + "px)";
      });
    }
    window.addEventListener("mousemove", (e) => {
      mx = (e.clientX / window.innerWidth - 0.5);
      my = (e.clientY / window.innerHeight - 0.5);
      apply();
    }, { passive: true });
    window.addEventListener("scroll", apply, { passive: true });
  }

  function setupNavScroll() {
    const nav = document.getElementById("nav");
    if (!nav) return;
    window.addEventListener("scroll", () => {
      if ((window.scrollY || 0) > 40) {
        nav.style.boxShadow = "0 8px 26px rgba(74,49,37,.12)";
        nav.style.background = "rgba(253,244,233,.9)";
      } else {
        nav.style.boxShadow = "none";
        nav.style.background = "rgba(253,244,233,.72)";
      }
    }, { passive: true });
  }

  let confettiLayer = null;
  function setupConfetti() {
    const cl = document.createElement("div");
    cl.style.cssText = "position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:9500";
    document.body.appendChild(cl);
    confettiLayer = cl;
  }

  function burst(n) {
    if (!confettiLayer) return;
    const glyphs = ["❤️", "💖", "💕", "🧡", "🤍", "💛", "💗"];
    for (let i = 0; i < n; i++) {
      const el = document.createElement("span");
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      const size = 16 + Math.random() * 26;
      const dx = (Math.random() * 2 - 1) * 30;
      const rot = (Math.random() * 2 - 1) * 720;
      el.style.cssText = "position:absolute;left:" + (Math.random() * 100) + "vw;top:-6vh;font-size:" + size +
        "px;--dx:" + dx + "vw;--rot:" + rot + "deg;animation:confettiFall " + (3 + Math.random() * 2.4) +
        "s cubic-bezier(.3,.2,.5,1) forwards;will-change:transform,opacity";
      confettiLayer.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
    }
  }

  function setupCardFlip() {
    if (!root) return;
    const cards = root.querySelectorAll(".pola-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        // une seule carte retournée à la fois
        cards.forEach((other) => {
          if (other !== card) other.classList.remove("flipped");
        });
        card.classList.toggle("flipped");
      });
    });
  }

  let envelope = null;
  let envelopeUnlocked = false;

  // l'enveloppe apparaît sans aucun effet : c'est à Lou de la trouver
  function unlockEnvelope() {
    envelopeUnlocked = true;
    if (envelope) envelope.classList.add("unlocked");
  }

  function setupMemory() {
    const grid = document.getElementById("memoryGrid");
    const status = document.getElementById("memoryStatus");
    if (!grid) return;

    // nombre d'erreurs autorisées avant que toutes les cartes se retournent et se mélangent
    const MAX_ERRORS = 150;
    const sources = Array.prototype.slice.call(grid.querySelectorAll("img")).map((img) => img.getAttribute("src"));
    const total = sources.length;

    let first = null;
    let busy = false;
    let found = 0;
    let errors = 0;

    function deal() {
      const deck = [];
      sources.forEach((src, i) => { deck.push(i, i); });
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = deck[i]; deck[i] = deck[j]; deck[j] = t;
      }
      grid.innerHTML = "";
      deck.forEach((key) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "mcard";
        card.dataset.key = String(key);
        card.setAttribute("aria-label", "Carte cachée");
        card.innerHTML = '<span class="mcard-inner"><span class="mcard-back">❤</span>' +
          '<span class="mcard-front"><img src="' + sources[key] + '" alt="Bebou"></span></span>';
        grid.appendChild(card);
      });
      first = null;
      found = 0;
      errors = 0;
      if (status) status.textContent = "";
    }

    // toutes les cartes se retournent face cachée, puis changent de place
    function reshuffle() {
      busy = true;
      grid.querySelectorAll(".mcard").forEach((c) => c.classList.remove("up", "matched"));
      setTimeout(() => {
        deal();
        busy = false;
      }, 650);
    }

    function win() {
      unlockEnvelope();
      if (!status) return;
      const again = document.createElement("button");
      again.type = "button";
      again.className = "memory-restart";
      again.textContent = "↻";
      again.setAttribute("aria-label", "Recommencer");
      again.title = "Recommencer";
      again.addEventListener("click", reshuffle);
      status.appendChild(again);
    }

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".mcard");
      if (!card || busy || card.classList.contains("up")) return;
      card.classList.add("up");

      if (!first) {
        first = card;
        return;
      }

      if (first.dataset.key === card.dataset.key) {
        first.classList.add("matched");
        card.classList.add("matched");
        first = null;
        found++;
        if (found === total) setTimeout(win, 700);
        return;
      }

      // pas la même photo : on retourne les deux côté dos
      const a = first;
      first = null;
      busy = true;
      errors++;
      setTimeout(() => {
        if (errors >= MAX_ERRORS) {
          reshuffle();
          return;
        }
        a.classList.remove("up");
        card.classList.remove("up");
        busy = false;
      }, 900);
    });

    deal();
  }

  function setupLetterModal() {
    const modal = document.getElementById("letterModal");
    const card = document.getElementById("letterCard");
    const closeBtn = document.getElementById("closeLetter");
    if (!modal || !card) return;

    function openLetter() {
      modal.style.opacity = "1";
      modal.style.pointerEvents = "auto";
      modal.style.background = "rgba(74,42,28,.55)";
      card.style.opacity = "1";
      card.style.transform = "none";
      burst(30);
    }

    function closeLetter() {
      modal.style.opacity = "0";
      modal.style.pointerEvents = "none";
      modal.style.background = "rgba(74,42,28,0)";
      card.style.opacity = "0";
      card.style.transform = "translateY(34px) scale(.96)";
    }

    if (closeBtn) closeBtn.addEventListener("click", closeLetter);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeLetter();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLetter();
    });

    const packingBtn = document.getElementById("packingBtn");
    const packingList = document.getElementById("packingList");
    if (packingBtn && packingList) {
      packingBtn.addEventListener("click", () => {
        const open = packingList.hidden;
        packingList.hidden = !open;
        packingBtn.setAttribute("aria-expanded", String(open));
        packingBtn.textContent = open ? "🧳 Ta valise ▴" : "🧳 Ta valise ▾";
      });
    }

    const acceptBtn = document.getElementById("acceptInvite");
    if (acceptBtn) {
      acceptBtn.addEventListener("click", () => {
        acceptBtn.textContent = "Hâte de te voir 🥰";
        burst(50);
      });
    }

    // enveloppe glissée derrière une polaroid des voyages, invisible tant que le memory n'est pas fini
    const voyagesSection = document.getElementById("voyages");
    if (voyagesSection) {
      const cards = voyagesSection.querySelectorAll(".pola-card");
      if (cards.length > 0) {
        const target = cards[Math.min(12, cards.length - 1)];
        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = "envelope";
        tab.setAttribute("aria-label", "?");
        tab.addEventListener("click", (e) => {
          e.stopPropagation();
          if (envelopeUnlocked) openLetter();
        });
        target.appendChild(tab);
        envelope = tab;
        if (envelopeUnlocked) unlockEnvelope();
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupConfetti();
    runLoader();
    startCounter();
    setupParallax();
    setupNavScroll();
    setupCardFlip();
    setupLetterModal();
    setupMemory();
  });
})();

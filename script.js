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
        card.classList.toggle("flipped");
      });
    });
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

    const voyagesSection = document.getElementById("voyages");
    if (voyagesSection) {
      const figures = voyagesSection.querySelectorAll(".pola");
      if (figures.length > 0) {
        const targetFig = figures[Math.min(12, figures.length - 1)];
        targetFig.style.position = "relative";
        const tab = document.createElement("button");
        tab.setAttribute("aria-label", "?");
        tab.type = "button";
        tab.style.cssText = "position:absolute;bottom:-6px;right:-6px;width:46px;height:32px;border:none;padding:0;margin:0;cursor:pointer;z-index:2;transform:rotate(-7deg);transition:bottom .3s ease,right .3s ease,filter .3s;background:linear-gradient(160deg,#F0A57F,#E4685A);border-radius:6px 6px 2px 2px;box-shadow:0 5px 12px rgba(180,72,44,.32)";
        const flap = document.createElement("span");
        flap.style.cssText = "position:absolute;left:0;top:0;width:0;height:0;border-left:23px solid transparent;border-right:23px solid transparent;border-top:13px solid #F6BE9A";
        tab.appendChild(flap);
        tab.addEventListener("mouseenter", () => {
          tab.style.bottom = "-2px";
          tab.style.right = "-2px";
          tab.style.filter = "brightness(1.05)";
        });
        tab.addEventListener("mouseleave", () => {
          tab.style.bottom = "-6px";
          tab.style.right = "-6px";
          tab.style.filter = "none";
        });
        tab.addEventListener("click", (e) => {
          e.stopPropagation();
          openLetter();
        });
        targetFig.appendChild(tab);
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
  });
})();

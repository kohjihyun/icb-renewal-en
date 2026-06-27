(function () {
  /* ---- partners marquee : build two identical groups for a seamless loop ---- */
  const line1 = [
    ["알리페이", 74, 26], ["thunes", 90, 20], ["lianlian-pay", 100, 20], ["Thai QR", 86, 26],
    ["xnap", 52, 28], ["HIVEX", 82, 28], ["coral global", 115, 24], ["metro bank", 132, 24],
    ["알리페이 플러스", 113, 20], ["union pay", 118, 26], ["western union", 159, 18], ["paypal-logo 2", 65, 22],
    ["yoomoney 1", 109, 23], ["wechat pay", 95, 30], ["kakao pay", 65, 24], ["핑퐁", 78, 24]
  ];
  const line2 = [
    ["아모레퍼시픽", 161, 16], ["diesel", 58, 32], ["nike", 56, 20], ["polo", 46, 46],
    ["아디다스", 48, 32], ["마리떼", 56, 36], ["쿠쿠", 95, 14], ["11번가", 42, 18],
    ["롯데면세점", 35, 32], ["신세계", 98, 22], ["신라면세점", 74, 32], ["현대면세", 116, 24],
    ["gtog", 22, 28], ["lg생활건강", 102, 20], ["public beacon", 157, 14]
  ];

  function buildGroup(items, dir) {
    const g = document.createElement("div");
    g.className = "marquee__group";
    items.forEach(([name, w, h]) => {
      const img = document.createElement("img");
      img.src = "assets/partners/" + dir + "/" + name + ".png";
      img.alt = name;
      img.style.width = w + "px";
      img.style.height = h + "px";
      g.appendChild(img);
    });
    return g;
  }

  document.querySelectorAll(".marquee__track").forEach((track) => {
    const isLine1 = track.dataset.group === "line1";
    const set = isLine1 ? line1 : line2;
    const dir = isLine1 ? "line-1" : "line-2";
    track.appendChild(buildGroup(set, dir));
    track.appendChild(buildGroup(set, dir));
  });

  /* ---- GNB mega-menu : hover opens full-width panel ---- */
  const gnb = document.getElementById("gnb");
  if (gnb) {
    let closeTimer = null;
    gnb.querySelectorAll(".gnb__item[data-menu]").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        clearTimeout(closeTimer);
        gnb.dataset.active = item.dataset.menu;
      });
    });
    gnb.addEventListener("mouseleave", () => {
      closeTimer = setTimeout(() => { delete gnb.dataset.active; }, 120);
    });
    gnb.addEventListener("mouseenter", () => clearTimeout(closeTimer));
  }

  /* ---- hero-1 reveal on load ---- */
  function revealHero1() {
    const h1 = document.querySelector(".hero-1");
    if (h1) h1.classList.add("is-visible");
  }
  if (document.readyState === "complete") {
    requestAnimationFrame(revealHero1);
  } else {
    window.addEventListener("load", () => requestAnimationFrame(revealHero1));
  }

  /* ---- hero-2 reveal when scrolled into view ---- */
  const hero2 = document.getElementById("hero2");
  if (hero2) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          hero2.classList.add("is-visible");
          io.unobserve(hero2);
        }
      });
    }, { threshold: 0.35 });
    io.observe(hero2);
  }

  /* ---- GNB turns into a solid dark bar from section1 onward ---- */
  const sec1 = document.getElementById("sec1");
  if (sec1 && gnb) {
    const onScroll = () => {
      gnb.classList.toggle("is-solid", sec1.getBoundingClientRect().top <= 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- autoplay the section videos (muted, inline) ---- */
  function autoplay(v) {
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    const tryPlay = () => { const p = v.play(); if (p) p.catch(() => {}); };
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("loadeddata", tryPlay, { once: true });
  }
  document.querySelectorAll(".bizcard__video, .sec3__video").forEach(autoplay);

  /* ---- scroll-linked reveals ----------------------------------------------
     Reveal progress follows the scroll position (not a fixed timer), so the
     motion is always seen no matter how fast or slow the user scrolls.
     Each element reveals as its anchor travels from ~92% to ~55% of the
     viewport height; progress only moves forward (latches once complete). */
  (function scrollReveal() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = ["sec1", "sec2", "sec3", "sec4", "sec5", "sec6"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    const targets = [];
    sections.forEach((sec) => {
      // clip-mask lines: titles, subtitles, capitems, stat number/label/desc
      sec.querySelectorAll(".hero-line-inner, .stat__num, .stat__clip > .stat__label, .stat__clip > .stat__desc")
        .forEach((el) => targets.push({ el, anchor: el.parentElement, kind: "line", p: 0 }));
      // tags rise + fade in
      sec.querySelectorAll(".tag")
        .forEach((el) => targets.push({ el, anchor: el, kind: "rise", dist: 24, p: 0 }));
      // capitem plus icon fades in
      sec.querySelectorAll(".capitem__plus")
        .forEach((el) => targets.push({ el, anchor: el.closest(".capitem") || el, kind: "fade", p: 0 }));
      // business cards rise from below, then settle (flip cover to front, enable hover)
      sec.querySelectorAll(".bizcard")
        .forEach((el) => targets.push({ el, anchor: el, kind: "card", dist: 140, p: 0, idx: parseInt(el.dataset.idx, 10) || 0 }));
    });
    if (!targets.length) return;

    if (reduced) {
      targets.forEach((t) => {
        t.el.style.transition = "none";
        if (t.kind === "line" || t.kind === "rise") t.el.style.transform = "translateY(0)";
        if (t.kind === "rise" || t.kind === "fade") t.el.style.opacity = "1";
        if (t.kind === "card") t.el.classList.add("is-visible", "is-settled");
      });
      return;
    }

    // we set transform/opacity every frame, so disable the CSS transitions
    targets.forEach((t) => { t.el.style.transition = "none"; });

    const easeOut = (x) => 1 - Math.pow(1 - x, 3);
    let ticking = false;

    function frame() {
      ticking = false;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const start = vh * 0.92;   // p = 0 : anchor just entering from the bottom
      const end = vh * 0.55;     // p = 1 : anchor comfortably in view
      const span = start - end;
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        if (t.p >= 1) continue;                       // already fully revealed
        const top = t.anchor.getBoundingClientRect().top;
        let p = (start - top) / span;
        if (p < 0) p = 0; else if (p > 1) p = 1;
        if (t.kind === "card") {
          // cards sit side-by-side: give each its own non-overlapping window
          // so they rise strictly one at a time, in order (idx 0 -> 3)
          const w = 0.25;                     // 4 cards, each owns a quarter of the band
          p = (p - t.idx * w) / w;
          if (p < 0) p = 0; else if (p > 1) p = 1;
        }
        if (p <= t.p) continue;                        // forward-only
        t.p = p;
        const e = easeOut(p);
        if (t.kind === "line") {
          t.el.style.transform = "translateY(" + ((1 - e) * 110) + "%)";
        } else if (t.kind === "rise") {
          t.el.style.transform = "translateY(" + ((1 - e) * t.dist) + "px)";
          t.el.style.opacity = p;
        } else if (t.kind === "fade") {
          t.el.style.opacity = p;
        } else if (t.kind === "card") {
          if (p >= 0.999) {
            t.p = 1;
            t.el.style.transform = "";
            t.el.style.opacity = "";
            t.el.style.transition = "";          // restore CSS (hover lift)
            t.el.classList.add("is-visible", "is-settled");
          } else {
            t.el.style.transform = "translateY(" + ((1 - e) * t.dist) + "px)";
            t.el.style.opacity = p;
          }
        }
      }
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    frame();
  })();
})();

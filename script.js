// Novo Horizonte — motion
// Pré-loader: réplica de "Motion Apresentacao Logo.mp4" (tempos e coordenadas do vídeo 1920 × 1080).
// Site: mesmo vocabulário do Parreira — GSAP + ScrollTrigger + Lenis, entradas x −200 / power4.out / 3 s.
(() => {
  const HERO_INTERVAL_MS = 6000;
  const FONT_WAIT_MS = 1500;
  const STAGE = { width: 1920, height: 1080, fitWidth: 1300 };
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  const header = document.querySelector('header');
  const divHero = document.querySelector('.div-hero');
  const loader = document.querySelector('.screen-loading');

  // ---------- Scroll suave (Lenis) ----------
  let lenis = null;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (hasGsap && !prefersReducedMotion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: target.id === 'topo' ? 0 : -72, duration: 1.6 });
      else target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  // ---------- Header e hero ao rolar (Parreira: active-header / active-div-hero) ----------
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    divHero.classList.toggle('is-hidden', y >= divHero.offsetHeight);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Hero: troca de fotos ----------
  const slides = [...document.querySelectorAll('.bg-hero figure')];
  const bars = [...document.querySelectorAll('.bar-photo')];
  let current = 0;
  let heroTimer = null;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    bars.forEach((b, i) => b.classList.toggle('is-active', i === current));
  };
  const startHero = () => {
    if (prefersReducedMotion || slides.length < 2) return;
    clearInterval(heroTimer);
    heroTimer = setInterval(() => showSlide(current + 1), HERO_INTERVAL_MS);
  };
  bars.forEach((bar, i) => bar.addEventListener('click', () => { showSlide(i); startHero(); }));

  // ---------- Pré-loader ----------
  const finishWithoutMotion = () => {
    if (loader) loader.remove();
    startHero();
  };

  const buildLoaderTimeline = () => {
    const W = loader.clientWidth;
    const H = loader.clientHeight;
    const s = Math.min(W / STAGE.fitWidth, H / STAGE.height);
    const vx = (x) => W / 2 + (x - STAGE.width / 2) * s;
    const vy = (y) => H / 2 + (y - STAGE.height / 2) * s;
    loader.style.setProperty('--pl-scale', s.toFixed(4));

    const line = loader.querySelector('.pl-line');
    const stage = loader.querySelector('.pl-stage');
    const symbol = loader.querySelector('.pl-symbol');
    const svg = symbol.querySelector('svg');
    const cut = loader.querySelector('.pl-cut');
    const arc = loader.querySelector('.pl-arc');
    const words = loader.querySelectorAll('.pl-word > span');
    const desc = loader.querySelector('.pl-desc');

    gsap.set(line, { left: 0, width: W, top: vy(780) - 1, height: 2, scaleX: 0, transformOrigin: '50% 50%' });
    gsap.set(svg, { y: 0, yPercent: 100 });
    gsap.set(cut, { autoAlpha: 1, scaleX: 0, scaleY: 0.012, transformOrigin: '100% 0%' });
    gsap.set(arc, { autoAlpha: 1, scale: 0, transformOrigin: '100% 100%' });
    gsap.set(words, { y: 0, yPercent: 105 });

    return gsap.timeline()
      // 0,1 – 1,0 s · o horizonte se abre do centro para as bordas
      .to(line, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 0.1)
      // 1,35 s · a massa sobe de trás do horizonte
      .to(svg, { yPercent: 0, duration: 0.55, ease: 'power3.out' }, 1.35)
      // 2,85 s · corte: fenda horizontal, depois o quadrante desaba
      .to(cut, { scaleX: 1, duration: 0.1, ease: 'none' }, 2.85)
      .to(cut, { scaleY: 1, duration: 0.3, ease: 'power2.inOut' }, 2.95)
      // 3,8 s · no vazio nasce o arco
      .to(arc, { scale: 1, duration: 0.45, ease: 'power3.out' }, 3.8)
      // 4,6 s · o horizonte recua até o símbolo
      .to(line, { left: vx(1200), width: W - vx(1200), duration: 0.7, ease: 'power2.inOut' }, 4.6)
      // 5,15 s · símbolo encolhe para a assinatura; a linha vira o filete
      .to(symbol, { x: 451 - 720, y: 416 - 300, scale: 257 / 480, duration: 0.75, ease: 'power3.inOut' }, 5.15)
      .to(line, { left: vx(744), width: 782 * s, top: vy(619), height: Math.max(2, 6 * s), duration: 0.75, ease: 'power3.inOut' }, 5.15)
      // 5,9 s · NOVO / HORIZONTE sobem por máscara
      .to(words, { yPercent: 0, duration: 0.5, ease: 'power3.out', stagger: 0.1 }, 5.9)
      // 6,4 s · descritor
      .fromTo(desc, { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.4, ease: 'power1.out' }, 6.4)
      // 8,6 s · assinatura some
      .addLabel('exit', 8.6)
      .to([stage, line], { autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 'exit');
  };

  const buildIntroTimeline = () => gsap.timeline({ paused: true })
    .from('header nav > *', { y: 200, opacity: 0, duration: 3, ease: 'power4.out', stagger: 0.2 }, 0)
    .from('.hero .reveal', { x: -200, opacity: 0, duration: 3, ease: 'power4.out', stagger: 0.4 }, 0.2);

  const runLoader = () => {
    if (lenis) lenis.stop();
    window.scrollTo(0, 0);
    const intro = buildIntroTimeline();
    const master = buildLoaderTimeline()
      .add(() => {
        intro.play();
        if (lenis) lenis.start();
        startHero();
      }, 'exit+=0.3')
      .to(loader, { autoAlpha: 0, duration: 1.2, ease: 'power4.out' }, 'exit+=0.4')
      .add(() => loader.remove());

    // Clique ou tecla pula direto para a saída
    const skip = () => { if (master.time() < master.labels.exit) master.seek('exit'); };
    loader.addEventListener('click', skip);
    window.addEventListener('keydown', skip, { once: true });
  };

  if (!hasGsap || prefersReducedMotion || !loader) {
    finishWithoutMotion();
  } else {
    // Espera as fontes para a assinatura entrar já na tipografia certa
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS))]).then(runLoader);
  }

  // ---------- Entradas ao rolar (Parreira) ----------
  if (hasGsap && !prefersReducedMotion) {
    document.querySelectorAll('main section:not(.hero)').forEach((section) => {
      const items = section.querySelectorAll('.reveal');
      if (!items.length) return;
      gsap.from(items, {
        x: -200,
        opacity: 0,
        duration: 3,
        ease: 'power4.out',
        stagger: 0.15,
        scrollTrigger: { trigger: section, start: 'top 80%' },
      });
    });

    // Mídia: escala 0.4 → 1 atrelada ao scroll
    const media = document.querySelector('[data-scale-media]');
    if (media) {
      gsap.from(media, {
        y: 100,
        scale: 0.4,
        borderRadius: 24,
        ease: 'power4.out',
        scrollTrigger: { trigger: media, start: 'top 80%', end: 'top 50%', scrub: 3 },
      });
    }

    // Frases: alternam esquerda / direita, a última sobe
    const phrases = [...document.querySelectorAll('.phrases h2')];
    phrases.forEach((phrase, i) => {
      const isLast = i === phrases.length - 1;
      gsap.from(phrase, {
        x: isLast ? 0 : (i % 2 === 0 ? -200 : 200),
        y: isLast ? 200 : 0,
        opacity: 0,
        ease: 'power4.out',
        scrollTrigger: { trigger: phrase, start: 'top 80%', end: 'top 50%', scrub: 4 },
      });
    });
  }

  // ---------- Carrossel do método ----------
  const carousel = document.querySelector('.carousel');
  const prev = document.querySelector('.carousel-nav .prev');
  const next = document.querySelector('.carousel-nav .next');
  if (carousel && prev && next) {
    const step = () => {
      const card = carousel.querySelector('.card');
      return card ? card.offsetWidth + 24 : carousel.clientWidth;
    };
    const updateNav = () => {
      const max = carousel.scrollWidth - carousel.clientWidth - 2;
      prev.disabled = carousel.scrollLeft <= 2;
      next.disabled = carousel.scrollLeft >= max;
    };
    prev.addEventListener('click', () => carousel.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => carousel.scrollBy({ left: step(), behavior: 'smooth' }));
    carousel.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);
    updateNav();
  }

  // ---------- Accordion: um item aberto por vez ----------
  const buttons = [...document.querySelectorAll('.accordion-button')];
  const setOpen = (button, isOpen) => {
    const content = button.nextElementSibling;
    button.setAttribute('aria-expanded', String(isOpen));
    content.style.maxHeight = isOpen ? `${content.scrollHeight}px` : '0px';
  };
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const willOpen = button.getAttribute('aria-expanded') !== 'true';
      buttons.forEach((b) => setOpen(b, false));
      if (willOpen) setOpen(button, true);
      if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 750);
    });
  });

  // Ano corrente no rodapé
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();

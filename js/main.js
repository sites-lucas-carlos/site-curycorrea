/* =========================================================
   Cury Correa Seguros – interações
   ========================================================= */
(() => {
  /* Número do WhatsApp usado em todos os botões (só dígitos, com 55 + DDD) */
  const WHATSAPP = '5561999577714';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Botões de WhatsApp com mensagem pronta ---------- */
  // Ex.: <a href="https://wa.me/5561999577714" data-wa="Quero uma cotação de Seguro Auto.">
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = waLink(a.dataset.wa || 'Olá! Vim pelo site e quero falar com um corretor.');
  });

  /* ---------- Formulário de cotação → abre o WhatsApp ---------- */
  const quoteForm = document.querySelector('[data-quote-form]');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(quoteForm);
      const nome = (data.get('nome') || '').toString().trim();
      const seguro = (data.get('seguro') || '').toString().trim();
      const msg = (data.get('mensagem') || '').toString().trim();
      const partes = [
        `Olá! Meu nome é ${nome}.`,
        seguro ? `Quero uma cotação de ${seguro}.` : 'Quero uma cotação de seguro.',
        msg,
      ].filter(Boolean);
      window.open(waLink(partes.join(' ')), '_blank', 'noopener');
    });
  }

  /* ---------- Menu do celular/tablet ---------- */
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  if (header && toggle) {
    const setOpen = (open) => {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
    header.querySelectorAll('.site-nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---------- Quebra títulos em palavras (para animar) ---------- */
  const splitWords = (root) => {
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = part;
            frag.append(span);
            words.push(span);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(root);
    return words;
  };

  /* Topo: palavras sobem uma a uma ao carregar */
  document.querySelectorAll('[data-split="load"]').forEach((el) => {
    splitWords(el).forEach((w, i) => w.style.setProperty('--i', i));
  });
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));

  /* Títulos que "acendem" palavra por palavra conforme a rolagem */
  const scrollTitles = [...document.querySelectorAll('[data-split="scroll"]')].map((el) => ({
    el,
    words: splitWords(el),
  }));

  /* ---------- Elementos que aparecem ao entrar na tela ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    revealEls.forEach((el) => {
      // Pequeno atraso em cascata entre irmãos (cards lado a lado)
      const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
      const index = siblings.indexOf(el);
      if (index > 0) el.style.transitionDelay = `${Math.min(index, 7) * 80}ms`;
      io.observe(el);
    });
  }

  /* ---------- Contadores ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const format = (el, value) => `${el.dataset.prefix || ''}${value}${el.dataset.suffix || ''}`;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    counters.forEach((el) => { el.textContent = format(el, 0); });
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const duration = 1800;
        const start = performance.now();
        const tick = (now) => {
          const t = clamp((now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = format(el, Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countIo.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countIo.observe(el));
  }

  /* ---------- Efeitos ligados à rolagem ---------- */
  const scaleEls = [...document.querySelectorAll('[data-scale]')];

  const onScroll = () => {
    const vh = window.innerHeight;

    // Palavras: de transparente a sólido conforme o título sobe na tela
    scrollTitles.forEach(({ el, words }) => {
      const top = el.getBoundingClientRect().top;
      const start = vh * 0.85;
      const progress = clamp((start - top) / start);
      const soft = 4; // quantas palavras ficam "meio acesas" ao mesmo tempo
      const head = progress * (words.length + soft);
      words.forEach((w, i) => { w.style.opacity = clamp((head - i) / soft).toFixed(3); });
    });

    // Cards de destaque e passos: crescem de 90% para 100% ao subir
    scaleEls.forEach((el) => {
      const top = el.parentElement.getBoundingClientRect().top;
      const p = clamp((vh * 1.1 - top) / (vh * 0.4));
      el.style.setProperty('--s', (0.9 + 0.1 * p).toFixed(4));
    });
  };

  if (!reduceMotion) {
    let ticking = false;
    const requestTick = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { onScroll(); ticking = false; });
    };
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
    onScroll();
  }

  /* ---------- Carrossel infinito de seguros ---------- */
  const ticker = document.querySelector('[data-ticker]');
  const track = document.querySelector('[data-ticker-track]');
  if (ticker && track) {
    const originals = [...track.children];

    // Duplica os cards para o carrossel rodar sem emenda
    originals.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('data-clone', '');
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
      track.append(clone);
    });

    // Velocidade constante (~40px por segundo) independente do número de cards
    const setDuration = () => {
      const distance = track.scrollWidth / 2;
      ticker.style.setProperty('--ticker-duration', `${Math.max(20, distance / 40)}s`);
    };
    setDuration();
    window.addEventListener('resize', setDuration);

    // Bolinhas do carrossel no celular
    const dots = document.querySelector('[data-ticker-dots]');
    if (dots) {
      originals.forEach(() => dots.append(document.createElement('span')));
      const dotEls = [...dots.children];
      const updateDots = () => {
        const center = ticker.scrollLeft + ticker.clientWidth / 2;
        let active = 0;
        let best = Infinity;
        originals.forEach((card, i) => {
          const mid = card.offsetLeft + card.offsetWidth / 2;
          const d = Math.abs(mid - center);
          if (d < best) { best = d; active = i; }
        });
        dotEls.forEach((d, i) => d.classList.toggle('is-active', i === active));
      };
      ticker.addEventListener('scroll', updateDots, { passive: true });
      updateDots();
    }
  }

  /* ---------- Atalhos da página Seguros: marca o seguro visível ---------- */
  const subnavList = document.querySelector('[data-subnav]');
  const subnavLinks = subnavList ? [...subnavList.querySelectorAll('a')] : [];
  if (subnavLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(subnavLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const link = byId.get(entry.target.id);
        if (!link) return;
        subnavLinks.forEach((a) => a.classList.toggle('is-active', a === link));
        // Rola só a faixa de atalhos (na horizontal), sem mexer na página
        subnavList.scrollTo({
          left: link.offsetLeft - subnavList.clientWidth / 2 + link.offsetWidth / 2,
          behavior: reduceMotion ? 'auto' : 'smooth',
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }
})();

    /* hero role typewriter-cycle */
    const HERO_ROLE_PHRASES = [
        'Data Cleaning',
        'Data Visualization',
        'Statistical Analysis',
        'A/B Testing',
        'Data QA',
        'Root-Cause Analysis',
        'Business Storytelling'
    ];

    const heroRoleText = document.getElementById('heroRoleText');
    const TYPE_MS = 65;
    const DELETE_MS = 35;
    const PAUSE_MS = 1900;

    if (heroRoleText) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            heroRoleText.textContent = HERO_ROLE_PHRASES[0];
        } else {
            let phraseIndex = 0;
            let charIndex = 0;

            function typeStep() {
                const phrase = HERO_ROLE_PHRASES[phraseIndex];
                charIndex++;
                heroRoleText.textContent = phrase.slice(0, charIndex);
                if (charIndex < phrase.length) {
                    setTimeout(typeStep, TYPE_MS);
                } else {
                    setTimeout(deleteStep, PAUSE_MS);
                }
            }

            function deleteStep() {
                charIndex--;
                heroRoleText.textContent = HERO_ROLE_PHRASES[phraseIndex].slice(0, charIndex);
                if (charIndex > 0) {
                    setTimeout(deleteStep, DELETE_MS);
                } else {
                    phraseIndex = (phraseIndex + 1) % HERO_ROLE_PHRASES.length;
                    setTimeout(typeStep, TYPE_MS);
                }
            }

            setTimeout(typeStep, TYPE_MS);
        }
    }

    /* reveal-on-scroll */
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                io.unobserve(e.target);
            }
        });
    }, {threshold: .12});
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    /* mobile nav toggle */
    const navToggle = document.getElementById('navToggle');
    const mobileNav = document.getElementById('mobileNav');

    function closeMobileNav() {
        mobileNav.classList.remove('open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
    }

    navToggle.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('open');
        navToggle.classList.toggle('is-active', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        mobileNav.setAttribute('aria-hidden', String(!isOpen));
        if (isOpen) {
            mobileNav.querySelector('a').focus();
        }
    });
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
            closeMobileNav();
            navToggle.focus();
        }
    });

    /* active-nav highlight (hero links) */
    const navLinks = document.querySelectorAll('.hero-links a');
    const sections = [...navLinks].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const navIO = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                navLinks.forEach(a => a.style.color = '');
                const active = [...navLinks].find(a => a.getAttribute('href') === '#' + e.target.id);
                if (active) active.style.color = '#fff';
            }
        });
    }, {rootMargin: '-40% 0px -55% 0px'});
    sections.forEach(s => navIO.observe(s));

    /* click-to-enlarge for finding chart screenshots */
    document.querySelectorAll('.find-chart img, .dash-img').forEach(img => {
        img.addEventListener('click', () => {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImg');
            modalImg.src = img.src;
            modalImg.alt = img.alt;
            modal.classList.add('active');
        });
    });

    function closeImageModal() {
        document.getElementById('imageModal').classList.remove('active');
    }

    document.querySelector('.image-modal-close').addEventListener('click', closeImageModal);
    document.getElementById('imageModal').addEventListener('click', (e) => {
        if (e.target.id === 'imageModal') closeImageModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeImageModal();
    });

    /* scale fixed-size Tableau embeds to fit their responsive wrapper */
    const TABLEAU_NATIVE_WIDTH = 1440;
    const TABLEAU_NATIVE_HEIGHT = 1024;

    function scaleTableauEmbeds() {
        document.querySelectorAll('.dash-embed-wrap').forEach(wrap => {
            const iframe = wrap.querySelector('.dash-embed');
            if (!iframe) return;
            const scale = wrap.clientWidth / TABLEAU_NATIVE_WIDTH;
            iframe.style.transform = `scale(${scale})`;
            wrap.style.height = (TABLEAU_NATIVE_HEIGHT * scale) + 'px';
        });
    }

    scaleTableauEmbeds();
    window.addEventListener('resize', scaleTableauEmbeds);

    /* fixed-nav scroll state + scroll-to-top button, driven by a single #home observer */
    const heroNav = document.querySelector('.hero-nav');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const homeSection = document.getElementById('home');

    let heroIntersecting = true;

    function applyNavState() {
        const scrolledPast = !heroIntersecting;
        heroNav.classList.toggle('nav-scrolled', scrolledPast);
        scrollTopBtn.classList.toggle('visible', scrolledPast);
        heroNav.classList.toggle('nav-name-hidden', heroIntersecting && window.scrollY > 0);
    }

    const heroIO = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            heroIntersecting = e.isIntersecting;
            applyNavState();
        });
    }, {threshold: 0});
    heroIO.observe(homeSection);

    /* safety net: re-verify directly from geometry on scroll, rAF-throttled.
       Guards against a missed IntersectionObserver notification after a
       layout shift elsewhere on the page (e.g. the Tableau embed resizing
       itself post-load), which would otherwise leave nav-scrolled stuck off.
       Also drives nav-name-hidden, which depends on live scrollY while
       still inside the hero, not just the intersection boundary. */
    let heroCheckQueued = false;
    window.addEventListener('scroll', () => {
        if (heroCheckQueued) return;
        heroCheckQueued = true;
        requestAnimationFrame(() => {
            heroCheckQueued = false;
            heroIntersecting = homeSection.getBoundingClientRect().bottom > 0;
            applyNavState();
        });
    }, {passive: true});

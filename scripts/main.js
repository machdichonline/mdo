// Splash Screen Logic (Run immediately)
const isHomePage = window.location.pathname === '/' || 
                   window.location.pathname.endsWith('/index.html') || 
                   window.location.pathname.split('/').pop() === '' ||
                   window.location.pathname.split('/').pop() === 'index.html';

let splash = null;

if (isHomePage) {
    splash = document.createElement('div');
    splash.id = 'splash-screen';
    splash.innerHTML = `<div class="splash-logo"><img src="/logo.png" alt="Logo" class="splash-logo-image"></div>`;
    document.body.prepend(splash);
    document.body.classList.add('loading');

    // Fail-safe: Always remove splash after 3 seconds to prevent being stuck
    setTimeout(() => {
        if (document.body.classList.contains('loading')) {
            console.warn('Splash fail-safe triggered');
            splash.classList.add('hidden');
            document.body.classList.remove('loading');
            if (window.ScrollEngineInstance) {
                window.ScrollEngineInstance.init();
            }
        }
    }, 3000);
} else {
    // Immediately ensure we are not in loading state on other pages
    document.body.classList.remove('loading');
}

document.addEventListener('DOMContentLoaded', () => {
    
    // Custom Cursor Logic – only on non-touch devices
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    const blob = document.createElement('div');
    blob.id = 'cursor-blob';
    if (!isTouchDevice) {
        document.body.appendChild(cursor);
        document.body.appendChild(blob);
    }

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let blobX = 0, blobY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animateCursor = () => {
        const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
        
        cursorX = lerp(cursorX, mouseX, 0.3);
        cursorY = lerp(cursorY, mouseY, 0.3);
        cursor.style.left = `${cursorX - 10}px`;
        cursor.style.top = `${cursorY - 10}px`;

        blobX = lerp(blobX, mouseX, 0.05);
        blobY = lerp(blobY, mouseY, 0.05);
        blob.style.left = `${blobX - 150}px`;
        blob.style.top = `${blobY - 150}px`;

        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const updateInteractiveElements = () => {
        const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, .hover-target');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '60px';
                cursor.style.height = '60px';
                cursor.style.backgroundColor = 'rgba(149, 209, 0, 0.3)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursor.style.backgroundColor = 'var(--accent)';
            });
        });
    };
    updateInteractiveElements();

    // Reveal on scroll logic
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    const reobserve = () => {
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    };
    reobserve();

    // Form Handling (Lead Form)
    const leadForm = document.getElementById('hero-lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = leadForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'WIRD GESENDET...';
            btn.disabled = true;

            const formData = new FormData(leadForm);
            fetch(leadForm.action || 'https://formsubmit.co/ajax/kontakt@mach-dich-online.de', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    btn.innerHTML = 'DANKE! WIR MELDEN UNS.';
                    btn.style.backgroundColor = '#00F0FF';
                    leadForm.reset();
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                        btn.style.backgroundColor = '#95D100';
                    }, 5000);
                } else {
                    throw new Error('Senden fehlgeschlagen');
                }
            })
            .catch(error => {
                btn.innerHTML = 'FEHLER! BITTE NOCHMAL.';
                btn.style.backgroundColor = '#FF4B2B';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.backgroundColor = '#95D100';
                }, 3000);
            });
        });
    }

    // Scroll Performance Optimization
    const handleScroll = () => {
        const header = document.querySelector('nav');
        if (header) {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Logo Animation Function (Optimized for 60fps)
    const triggerLogoFlight = () => {
        const headerLogo = document.querySelector('.header-logo');
        const headerLogoImg = headerLogo?.querySelector('img');

        if (!isHomePage || !headerLogo || !headerLogoImg) {
            document.body.classList.remove('loading');
            if (headerLogo) headerLogo.style.opacity = '1';
            return;
        }

        const splashLogo = splash.querySelector('.splash-logo');
        const splashLogoImg = splashLogo.querySelector('img');

        // Initial states are already set in CSS (centered)
        const startRect = splashLogoImg.getBoundingClientRect();
        const targetRect = headerLogoImg.getBoundingClientRect();

        // Calculate deltas for GPU translation
        const dx = targetRect.left + targetRect.width / 2 - (startRect.left + startRect.width / 2);
        const dy = targetRect.top + targetRect.height / 2 - (startRect.top + startRect.height / 2);
        const scale = targetRect.width / startRect.width;

        setTimeout(() => {
            splashLogo.classList.add('flying');
            // Using transform instead of top/left/width/height for butter-smooth performance
            splashLogo.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
            
            setTimeout(() => {
                splash.classList.add('hidden');
                headerLogo.style.opacity = '1';
                document.body.classList.remove('loading');
                if (window.ScrollEngineInstance) {
                    window.ScrollEngineInstance.splitText();
                    window.ScrollEngineInstance.setupObservers();
                }
                reobserve();
                updateInteractiveElements();
            }, 800);
        }, 200);
    };

    // Global Component Loader
    const loadComponents = async () => {
        const headerPlaceholder = document.querySelector('#header-placeholder');
        const footerPlaceholder = document.querySelector('#footer-placeholder');
        
        // Load Header
        if (headerPlaceholder) {
            fetch('/components/header.html')
                .then(res => res.text())
                .then(html => {
                    headerPlaceholder.innerHTML = html;
                    handleScroll();
                    
                    const currentPath = window.location.pathname;
                    
                    const hamburger = document.getElementById('hamburger');
                    const navLinks = document.getElementById('nav-links');
                    if (hamburger && navLinks) {
                        hamburger.addEventListener('click', () => {
                            hamburger.classList.toggle('active');
                            navLinks.classList.toggle('active');
                            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
                        });

                        navLinks.querySelectorAll('a').forEach(link => {
                            link.addEventListener('click', () => {
                                hamburger.classList.remove('active');
                                navLinks.classList.remove('active');
                                document.body.style.overflow = '';
                            });
                        });
                    }
                    document.querySelectorAll('.nav-links a').forEach(link => {
                        const href = link.getAttribute('href');
                        if (href && currentPath === href) {
                            link.classList.add('active');
                        }
                    });

                    triggerLogoFlight();
                })
                .catch(err => {
                    console.error('Error loading header:', err);
                    if (splash) splash.classList.add('hidden');
                    document.body.classList.remove('loading');
                });
        } else {
            if (splash) splash.classList.add('hidden');
            document.body.classList.remove('loading');
        }

        // Load Footer Independently
        if (footerPlaceholder) {
            fetch('/components/footer.html')
                .then(res => res.text())
                .then(html => {
                    footerPlaceholder.innerHTML = html;
                    if (window.ScrollEngineInstance) {
                        window.ScrollEngineInstance.splitText();
                        window.ScrollEngineInstance.setupObservers();
                    }
                    updateInteractiveElements();
                    reobserve();
                })
                .catch(err => console.error('Error loading footer:', err));
        }
        // Trigger initial ScrollEngine if already available
        if (window.ScrollEngineInstance) {
            window.ScrollEngineInstance.init();
        }
        
    };

    // Cookie Banner Logic
    const initCookieBanner = () => {
        const consent = localStorage.getItem('md_cookie_consent');
        if (consent) return;

        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <img src="/logo.png" alt="Logo" class="cookie-logo">
                <h4 style="margin-bottom: 10px;">Deine Privatsphäre ist uns wichtig</h4>
                <p style="font-size: 14px; color: var(--text-muted); line-height: 1.6;">
                    Wir nutzen Cookies, um deine Erfahrung auf unserer Website zu verbessern. Einige sind essenziell, während andere uns helfen, diese Website und dein Erlebnis zu verbessern.
                </p>
            </div>
            <div class="cookie-buttons">
                <button class="cookie-btn cookie-btn-secondary" id="cookie-reject">Ablehnen</button>
                <button class="cookie-btn cookie-btn-secondary" id="cookie-essential">Nur essenziell</button>
                <button class="cookie-btn cookie-btn-primary" id="cookie-accept">Alle akzeptieren</button>
            </div>
        `;
        document.body.appendChild(banner);

        // Show banner with small delay
        setTimeout(() => banner.classList.add('active'), 1000);

        const handleConsent = (type) => {
            localStorage.setItem('md_cookie_consent', type);
            banner.classList.remove('active');
            setTimeout(() => banner.remove(), 600);
            
            // Here you would normally initialize scripts based on 'type'
            console.log(`Cookie consent: ${type}`);
            if (type === 'all' || type === 'essential') {
                // Initialize analytics if allowed
            }
        };

        document.getElementById('cookie-accept').addEventListener('click', () => handleConsent('all'));
        document.getElementById('cookie-reject').addEventListener('click', () => handleConsent('none'));
        document.getElementById('cookie-essential').addEventListener('click', () => handleConsent('essential'));
    };

    // Initialize components
    loadComponents().then(() => {
        initCookieBanner();
    });
});

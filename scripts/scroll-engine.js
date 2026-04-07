/**
 * ScrollEngine.js
 * Advanced scrollytelling and motion orchestration
 */

class ScrollEngine {
    constructor() {
        this.init();
    }

    init() {
        this.splitText();
        this.setupObservers();
        this.setupParallax();
    }

    /**
     * Splits text elements into spans for word-by-word animation
     */
    splitText() {
        const targets = document.querySelectorAll('.split-text');
        
        const processNode = (node, indexOffset = 0) => {
            if (node.nodeType === 3) { // Text node
                const text = node.textContent;
                const words = text.split(/(\s+)/);
                const frag = document.createDocumentFragment();
                
                words.forEach((word) => {
                    if (word.trim() === '') {
                        frag.appendChild(document.createTextNode(word));
                        return;
                    }
                    const parent = document.createElement('span');
                    parent.className = 'split-parent';
                    const child = document.createElement('span');
                    child.className = 'split-child';
                    child.style.transitionDelay = `${indexOffset * 0.05}s`;
                    child.textContent = word;
                    parent.appendChild(child);
                    frag.appendChild(parent);
                    indexOffset++;
                });
                return { fragment: frag, newOffset: indexOffset };
            } else if (node.nodeType === 1) { // Element node
                const clone = node.cloneNode(false);
                let currentOffset = indexOffset;
                node.childNodes.forEach(child => {
                    const result = processNode(child, currentOffset);
                    clone.appendChild(result.fragment);
                    currentOffset = result.newOffset;
                });
                return { fragment: clone, newOffset: currentOffset };
            }
            return { fragment: node.cloneNode(true), newOffset: indexOffset };
        };

        targets.forEach(el => {
            if (el.dataset.splitDone) return;
            el.dataset.splitDone = "true";

            const nodes = Array.from(el.childNodes);
            const frag = document.createDocumentFragment();
            let currentOffset = 0;
            
            nodes.forEach(node => {
                const result = processNode(node, currentOffset);
                frag.appendChild(result.fragment);
                currentOffset = result.newOffset;
            });
            
            el.innerHTML = '';
            el.appendChild(frag);
            
            if (!el.classList.contains('reveal')) {
                el.classList.add('reveal');
            }
        });
    }

    /**
     * Advanced Intersection Observer for progress-based animations
     */
    setupObservers() {
        const revealOptions = {
            threshold: 0.05, // Lowered for better reliability on all screen sizes
            rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters view
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Calculate visual progress for custom property (optional, keep for robustness)
                    const ratio = entry.intersectionRatio;
                    entry.target.style.setProperty('--scroll-progress', ratio);
                    
                    // Once active, we can stop observing this specific element for reveal
                    revealObserver.unobserve(entry.target);
                }
            });
        }, revealOptions);

        document.querySelectorAll('.reveal, .scroll-reveal-item, .split-text').forEach(el => {
            // Ensure split-text elements have the reveal class for CSS rules to work
            if (el.classList.contains('split-text') && !el.classList.contains('reveal')) {
                el.classList.add('reveal');
            }
            revealObserver.observe(el);
        });
    }

    /**
     * Minimal performance-optimized parallax using hardware-accelerated transforms
     */
    setupParallax() {
        const parallaxTargets = document.querySelectorAll('.parallax-bg');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            parallaxTargets.forEach(target => {
                const speed = 0.2;
                const offset = target.parentElement.offsetTop;
                const movement = (scrolled - offset) * speed;
                target.style.transform = `translate3d(0, ${movement}px, 0)`;
            });
        }, { passive: true });
    }
}

// Global initialization
window.ScrollEngineInstance = new ScrollEngine();

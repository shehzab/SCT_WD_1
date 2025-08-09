
class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.sections = document.querySelectorAll('section[id]');
        this.body = document.body;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.updateTimeout = null;
        
        this.init();
    }
    
    init() {
        this.setupScrollEffect();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
        this.setupHoverEffects();
        this.handleResize();
    }
    
    setupScrollEffect() {
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateNavbar = () => {
            const currentScrollY = window.scrollY;
            
            
            if (currentScrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            

            this.navbar.style.transform = 'translateY(0)';
            
            lastScrollY = currentScrollY;
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });
    }
    
    setupMobileMenu() {
        this.hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });
        
        // Close mobile menu when clicking on nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.navMenu.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });
        });
        
        // Close mobile menu when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
        
        // Handling resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.navMenu.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleMobileMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        // Preventing body scroll when menu is open
        if (this.navMenu.classList.contains('active')) {
            this.body.classList.add('menu-open');
            this.body.style.top = `-${window.scrollY}px`;
        } else {
            this.body.classList.remove('menu-open');
            const scrollY = this.body.style.top;
            this.body.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
    }
    
    closeMobileMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        
        // Restoring body scroll
        this.body.classList.remove('menu-open');
        const scrollY = this.body.style.top;
        this.body.style.top = '';
        if (scrollY) {
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
    }
    
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    
                    this.isScrolling = true;
                    
                    // Clear any existing timeout
                    if (this.scrollTimeout) {
                        clearTimeout(this.scrollTimeout);
                    }
                    
                    // Calculating offset accounting for fixed navbar height
                    const navbarHeight = this.navbar.offsetHeight;
                    const targetPosition = targetSection.offsetTop - navbarHeight - 10;
                    
                    // Use custom smooth scroll function
                    this.smoothScrollTo(Math.max(0, targetPosition), 800);
                    
                    // Reset scrolling flag after animation completes
                    this.scrollTimeout = setTimeout(() => {
                        this.isScrolling = false;
                        this.updateActiveNavigation();
                    }, 900);
                }
            });
        });
    }
    
    smoothScrollTo(targetY, duration = 800) {
        const startY = window.scrollY;
        const distance = targetY - startY;
        const startTime = performance.now();
        
        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };
        
        const animate = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            window.scrollTo(0, startY + distance * easeInOutCubic(progress));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    setupActiveNavigation() {
        const navbarHeight = this.navbar.offsetHeight;
        
        const observerOptions = {
            rootMargin: `-${navbarHeight + 50}px 0px -50% 0px`,
            threshold: [0.1, 0.5, 0.7]
        };
        
        const observer = new IntersectionObserver((entries) => {
            const visibleEntries = entries.filter(entry => entry.isIntersecting);
            
            if (visibleEntries.length > 0) {
                const mostVisible = visibleEntries.reduce((prev, current) => {
                    if (current.intersectionRatio > prev.intersectionRatio) {
                        return current;
                    } else if (current.intersectionRatio === prev.intersectionRatio) {
                        return current.boundingClientRect.top < prev.boundingClientRect.top ? current : prev;
                    }
                    return prev;
                });
                
                this.setActiveNavLink(mostVisible.target.id);
            }
        }, observerOptions);
        
        this.sections.forEach(section => observer.observe(section));
        
        // Manual updates for scroll events
        window.addEventListener('scroll', () => {
            if (!this.isScrolling && !this.updateTimeout) {
                this.updateTimeout = setTimeout(() => {
                    this.updateActiveNavigation();
                    this.updateTimeout = null;
                }, 100);
            }
        });
    }
    
    updateActiveNavigation() {
        const navbarHeight = this.navbar.offsetHeight;
        const scrollPosition = window.scrollY + navbarHeight + 100;
        
        let activeSection = null;
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                activeSection = section.id;
            }
        });
        
        // Handle edge cases
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
            const lastSection = this.sections[this.sections.length - 1];
            activeSection = lastSection ? lastSection.id : null;
        }
        
        if (window.scrollY < 100) {
            activeSection = 'home';
        }
        
        if (activeSection) {
            this.setActiveNavLink(activeSection);
        }
    }
    
    setActiveNavLink(sectionId) {
        this.navLinks.forEach(link => link.classList.remove('active'));
        
        const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    setupHoverEffects() {
        // Logo hover effect
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('mouseenter', () => {
                const logoIcon = logo.querySelector('.logo-icon');
                if (logoIcon) {
                    logoIcon.style.transform = 'rotate(360deg) scale(1.2)';
                    logoIcon.style.textShadow = '0 0 30px #00ff9d, 0 0 40px #00ff9d';
                }
            });
            
            logo.addEventListener('mouseleave', () => {
                const logoIcon = logo.querySelector('.logo-icon');
                if (logoIcon) {
                    logoIcon.style.transform = 'rotate(0deg) scale(1)';
                    logoIcon.style.textShadow = '0 0 20px #00ff9d';
                }
            });
        }
        
        // Nav links hover effects
        this.navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    const ripple = document.createElement('div');
                    ripple.className = 'nav-ripple';
                    ripple.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 0;
                        height: 0;
                        background: radial-gradient(circle, rgba(0, 255, 157, 0.3) 0%, transparent 70%);
                        border-radius: 50%;
                        transform: translate(-50%, -50%);
                        animation: ripple 0.6s ease-out;
                        pointer-events: none;
                        z-index: -1;
                    `;
                    
                    link.appendChild(ripple);
                    
                    setTimeout(() => {
                        if (ripple.parentNode) {
                            ripple.remove();
                        }
                    }, 600);
                }
            });
        });
    }
    
    handleResize() {
        window.addEventListener('resize', () => {
            // Force navbar recalculation on resize
            setTimeout(() => {
                this.updateActiveNavigation();
            }, 100);
        });
    }
}

// Animated counter for statistics
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    updateCounter();
}

// Intersection Observer for counter animation
const observerOptions = {
    threshold: 0.7,
    rootMargin: '0px 0px -100px 0px'
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
            });
            counterObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe the hero stats section
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    counterObserver.observe(heroStats);
}

// Particle animation for hero section
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: rgba(0, 255, 157, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 20 + 10}s linear infinite;
            box-shadow: 0 0 ${Math.random() * 10 + 5}px rgba(0, 255, 157, 0.5);
        `;
        particlesContainer.appendChild(particle);
    }
}

// Initialize particles
createParticles();

// Animated Bitcoin price
function animateBitcoinPrice() {
    const priceElement = document.getElementById('btc-price');
    if (!priceElement) return;
    
    const basePrice = 45231;
    
    setInterval(() => {
        const variation = (Math.random() - 0.5) * 1000;
        const newPrice = Math.floor(basePrice + variation);
        priceElement.textContent = newPrice.toLocaleString();
    }, 3000);
}

animateBitcoinPrice();

// Feature cards hover effect enhancement
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Button click effects
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});

// Blockchain blocks animation enhancement
document.querySelectorAll('.block').forEach((block, index) => {
    block.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1) rotate(5deg)';
        this.style.boxShadow = '0 0 30px rgba(0, 255, 157, 0.8)';
    });
    
    block.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
        this.style.boxShadow = '0 0 20px rgba(0, 255, 157, 0.5)';
    });
});

// Scroll-triggered animations for sections
const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

// Apply scroll animations to sections
document.querySelectorAll('.features, .about, .contact').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(50px)';
    section.style.transition = 'all 0.8s ease';
    animateOnScroll.observe(section);
});

// Crypto card glow animation
const cryptoCard = document.querySelector('.crypto-card');
if (cryptoCard) {
    cryptoCard.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05) rotateY(10deg)';
        this.style.boxShadow = '0 20px 40px rgba(0, 255, 157, 0.4)';
    });
    
    cryptoCard.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotateY(0deg)';
        this.style.boxShadow = 'none';
    });
}

// Dynamic gradient animation for hero background
function animateHeroGradient() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    let angle = 0;
    
    setInterval(() => {
        angle += 1;
        hero.style.background = `
            radial-gradient(ellipse at center, 
                rgba(0, 255, 157, ${0.1 + Math.sin(angle * 0.01) * 0.05}) 0%, 
                rgba(10, 10, 10, 1) 70%)
        `;
    }, 100);
}

animateHeroGradient();

// Initialize enhanced navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const navManager = new NavigationManager();
    
    // Force initial active navigation check
    setTimeout(() => {
        navManager.updateActiveNavigation();
    }, 100);
});

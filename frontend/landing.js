// Landing page scroll animations & interactions

document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll-triggered reveal (IntersectionObserver)
    const scrollElements = document.querySelectorAll('.scroll-hidden')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
        scrollElements.forEach(el => el.classList.add('scroll-visible'))
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-visible')
                    observer.unobserve(entry.target)
                }
            })
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })

        scrollElements.forEach(el => observer.observe(el))
    }

    // 2. Counter animation
    const counters = document.querySelectorAll('.counter-value')
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target)
                counterObserver.unobserve(entry.target)
            }
        })
    }, { threshold: 0.5 })

    counters.forEach(el => counterObserver.observe(el))

    function animateCounter(el) {
        const target = parseFloat(el.dataset.target)
        const suffix = el.dataset.suffix || ''
        const prefix = el.dataset.prefix || ''
        const duration = prefersReducedMotion ? 0 : 1800
        const start = performance.now()
        const isFloat = target % 1 !== 0

        function update(now) {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = eased * target

            if (isFloat) {
                el.textContent = prefix + current.toFixed(1) + suffix
            } else {
                el.textContent = prefix + Math.round(current) + suffix
            }

            if (progress < 1) {
                requestAnimationFrame(update)
            }
        }

        requestAnimationFrame(update)
    }

    // 3. Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href')
            if (targetId === '#') return
            const targetEl = document.querySelector(targetId)
            if (targetEl) {
                e.preventDefault()
                targetEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
            }
        })
    })

    // 4. Navbar background on scroll
    const nav = document.querySelector('nav')
    let lastScroll = 0
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY
        if (scrollY > 50) {
            nav.classList.add('bg-background/90')
            nav.classList.remove('bg-background/70')
        } else {
            nav.classList.add('bg-background/70')
            nav.classList.remove('bg-background/90')
        }
        lastScroll = scrollY
    }, { passive: true })
})

// FAQ toggle (global for onclick)
function toggleFaq(button) {
    const item = button.closest('.faq-item')
    const answer = item.querySelector('.faq-answer')
    const isOpen = item.classList.contains('open')

    // Close all others
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) {
            openItem.classList.remove('open')
            openItem.querySelector('.faq-answer').classList.remove('open')
            openItem.querySelector('button').setAttribute('aria-expanded', 'false')
        }
    })

    if (isOpen) {
        item.classList.remove('open')
        answer.classList.remove('open')
        button.setAttribute('aria-expanded', 'false')
    } else {
        item.classList.add('open')
        answer.classList.add('open')
        button.setAttribute('aria-expanded', 'true')
    }
}

window.toggleFaq = toggleFaq

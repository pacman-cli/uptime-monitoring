// Landing page scroll animations & interactions

document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll-triggered reveal (IntersectionObserver) with automatic stagger cascading
    const scrollElements = document.querySelectorAll('.scroll-hidden')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
        scrollElements.forEach(el => el.classList.add('scroll-visible'))
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target
                    // Check if parent container wants to stagger its children's slide-in
                    const staggerContainer = el.closest('.stagger-children')
                    if (staggerContainer) {
                        const siblings = Array.from(staggerContainer.querySelectorAll('.scroll-hidden'))
                        const index = siblings.indexOf(el)
                        if (index !== -1) {
                            el.style.transitionDelay = `${index * 120}ms`
                        }
                    }
                    el.classList.add('scroll-visible')
                    observer.unobserve(el)
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

    // 5. Smooth marquee scrolling with deceleration on hover (supports multiple horizontal/vertical marquees)
    const marqueeContainers = document.querySelectorAll('.marquee-container')
    if (!prefersReducedMotion) {
        marqueeContainers.forEach(container => {
            const content = container.querySelector('.marquee-content')
            if (!content) return

            const isHorizontal = container.classList.contains('horizontal')

            // Clear CSS animation to let JS drive it smoothly
            content.style.animation = 'none'

            let currentPos = 0
            let currentSpeed = 0.8 // normal scrolling speed in pixels per frame

            // Dynamically monitor size changes (width for horizontal, height for vertical) without layout thrashing
            let halfSize = isHorizontal ? (content.offsetWidth / 2 || 0) : (content.offsetHeight / 2 || 0)
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    if (isHorizontal) {
                        halfSize = entry.borderBoxSize?.[0]?.inlineSize / 2 || entry.contentRect.width / 2
                    } else {
                        halfSize = entry.borderBoxSize?.[0]?.blockSize / 2 || entry.contentRect.height / 2
                    }
                }
            })
            resizeObserver.observe(content)

            function animateMarquee() {
                // Use native CSS :hover matching on content wrapper to only pause when directly over cards
                const isHovered = content.matches(':hover')
                const targetSpeed = isHovered ? 0 : 0.8
                
                // Smoothly interpolate current speed towards target speed using lerp
                currentSpeed += (targetSpeed - currentSpeed) * 0.08

                currentPos -= currentSpeed

                // Loop reset: since duplicate cards exist, wrap around at halfSize
                if (halfSize > 0 && Math.abs(currentPos) >= halfSize) {
                    currentPos = currentPos % halfSize
                }

                // Using 3D transform for hardware acceleration (X translate for horizontal, Y translate for vertical)
                if (isHorizontal) {
                    content.style.transform = `translate3d(${currentPos}px, 0, 0)`
                } else {
                    content.style.transform = `translate3d(0, ${currentPos}px, 0)`
                }

                requestAnimationFrame(animateMarquee)
            }

            // Initialize animation loop
            requestAnimationFrame(animateMarquee)
        })
    }
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

// Interactive demo uptime ping test
function runDemoPing() {
    const input = document.getElementById('demoUrlInput')
    const btn = document.getElementById('demoRunBtn')
    const output = document.getElementById('demoOutput')
    
    if (!input || !btn || !output) return
    
    // Parse domain
    let val = input.value.trim()
    if (!val) return
    let hostname = 'endpoint'
    try {
        if (!val.startsWith('http://') && !val.startsWith('https://')) {
            val = 'https://' + val
        }
        const url = new URL(val)
        hostname = url.hostname
    } catch {
        hostname = val
    }
    
    // Disable inputs
    input.disabled = true
    btn.disabled = true
    btn.classList.add('opacity-60', 'cursor-not-allowed')
    
    // Reset output divs
    output.classList.remove('hidden')
    
    const step1 = document.getElementById('step1')
    const step2 = document.getElementById('step2')
    const step3 = document.getElementById('step3')
    const step4 = document.getElementById('step4')
    const result = document.getElementById('demoResult')
    
    // NOTE: hostname is user-controlled (set from raw input when URL parsing fails),
    // so it MUST be inserted as a text node, never parsed as HTML (XSS).
    step1.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-slate-500 animate-ping" aria-hidden="true"></span>`
    step1.appendChild(document.createTextNode(` Resolving ${hostname}...`))
    step1.classList.remove('hidden', 'text-emerald-400')
    step1.classList.add('text-slate-500')
    
    step2.classList.add('hidden')
    step3.classList.add('hidden')
    step4.classList.add('hidden')
    result.classList.add('hidden')
    
    // Step 1 -> Step 2
    setTimeout(() => {
        step1.classList.remove('text-slate-500')
        step1.classList.add('text-emerald-400')
        step1.textContent = `✓ Resolved ${hostname}`
        
        step2.classList.remove('hidden')
        setTimeout(() => {
            step2.classList.remove('text-slate-500')
            step2.classList.add('text-emerald-400')
            step2.innerHTML = `✓ Established TCP connection`
            
            step3.classList.remove('hidden')
            setTimeout(() => {
                step3.classList.remove('text-slate-500')
                step3.classList.add('text-emerald-400')
                step3.innerHTML = `✓ TLS Handshake successful`
                
                step4.classList.remove('hidden')
                setTimeout(() => {
                    step4.classList.remove('text-slate-500')
                    step4.classList.add('text-emerald-400')
                    step4.innerHTML = `✓ GET request sent`
                    
                    // Show final result with a random latency
                    setTimeout(() => {
                        const latency = Math.floor(Math.random() * 130) + 20
                        const latencyVal = document.getElementById('demoLatencyVal')
                        if (latencyVal) {
                            latencyVal.textContent = `Latency: ${latency}ms`
                        }
                        
                        // Dynamically update simulated chart bars
                        const demoBarChart = document.getElementById('demoBarChart')
                        if (demoBarChart) {
                            const heights = [
                                Math.floor(Math.random() * 16) + 8,
                                Math.floor(Math.random() * 16) + 8,
                                Math.floor(Math.random() * 16) + 8,
                                Math.floor(Math.random() * 16) + 8,
                                Math.floor(Math.random() * 16) + 8
                            ]
                            
                            demoBarChart.innerHTML = heights.map((h, idx) => {
                                const isActive = idx === heights.length - 1
                                const bgClass = isActive 
                                    ? 'bg-brand shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' 
                                    : 'bg-brand/30 hover:bg-brand'
                                return `<div class="w-full ${bgClass} rounded-sm transition-all duration-300" style="height: ${h}px"></div>`
                            }).join('')
                        }
                        
                        result.classList.remove('hidden')
                        
                        // Re-enable input
                        input.disabled = false
                        btn.disabled = false
                        btn.classList.remove('opacity-60', 'cursor-not-allowed')
                    }, 500)
                }, 400)
            }, 400)
        }, 400)
    }, 500)
}

window.toggleFaq = toggleFaq
window.runDemoPing = runDemoPing


/**
 * IRONZERO41 Academia - Portal Oficial
 * Interatividade, Carrossel, Horários em Tempo Real, Tabs e FAQ
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Atualizar Ano no Rodapé
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // 2. Verificador de Status Aberto / Fechado em Tempo Real
    initGymStatusChecker();

    // 3. Menu Mobile Drawer
    initMobileMenu();

    // 4. Carrossel de Fotos Reais da Estrutura
    initStructureCarousel();

    // 5. Tabs Interativas do Tour da Estrutura
    initStructureTabs();

    // 6. FAQ Accordion
    initFaqAccordion();

    // 7. Tooltip do WhatsApp Flutuante
    initWhatsTooltip();

    // 8. Gráfico de Horários de Movimento (Picos)
    initCrowdChart();
});

/**
 * Verifica o status da academia em tempo real com base no horário de Curitiba
 * Seg-Sex: 06:00 às 22:30
 * Sábado: 10:30 às 15:00
 * Domingo: Fechado
 */
function initGymStatusChecker() {
    const statusBadge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    if (!statusBadge || !statusText) return;

    function updateStatus() {
        const now = new Date();
        const day = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour + minute / 60;

        let isOpen = false;
        let message = '';

        if (day >= 1 && day <= 5) {
            // Segunda a Sexta: 06:00 (6.0) até 22:30 (22.5)
            if (currentTime >= 6.0 && currentTime < 22.5) {
                isOpen = true;
                message = 'Academia Aberta Agora • Fecha às 22:30';
            } else if (currentTime < 6.0) {
                message = 'Abre hoje às 06:00';
            } else {
                message = 'Fechada no momento • Abre amanhã às 06:00';
            }
        } else if (day === 6) {
            // Sábado: 10:30 (10.5) até 15:00 (15.0)
            if (currentTime >= 10.5 && currentTime < 15.0) {
                isOpen = true;
                message = 'Academia Aberta Agora • Fecha às 15:00';
            } else if (currentTime < 10.5) {
                message = 'Abre hoje às 10:30';
            } else {
                message = 'Fechada no momento • Abre segunda às 06:00';
            }
        } else {
            // Domingo
            message = 'Fechada aos domingos • Abre segunda às 06:00';
        }

        if (isOpen) {
            statusBadge.className = 'flex items-center gap-1.5 text-xs font-semibold text-emerald-400';
            statusText.textContent = message;
        } else {
            statusBadge.className = 'flex items-center gap-1.5 text-xs font-semibold text-amber-400';
            statusText.textContent = message;
        }
    }

    updateStatus();
    setInterval(updateStatus, 60000);
}

/**
 * Menu Mobile Drawer
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

/**
 * Carrossel de Fotos Interativo com Swipe, Teclado, Autoplay e Dots
 */
function initStructureCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    const dotsContainer = document.getElementById('carouselDots');
    const slides = document.querySelectorAll('.carousel-slide');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    let autoPlayTimer = null;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;

    function getVisibleSlidesCount() {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 640) return 2;
        return 1;
    }

    function getMaxIndex() {
        const visible = getVisibleSlidesCount();
        return Math.max(0, slides.length - visible);
    }

    function renderDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        const max = getMaxIndex();
        for (let i = 0; i <= max; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot-indicator');
            if (i === currentIndex) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(i);
                resetAutoplay();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        const dots = dotsContainer?.querySelectorAll('.dot-indicator');
        if (!dots) return;
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function goToSlide(index) {
        const max = getMaxIndex();
        currentIndex = Math.max(0, Math.min(index, max));
        const slideWidthPercent = 100 / getVisibleSlidesCount();
        const translateX = -(currentIndex * slideWidthPercent);
        track.style.transform = `translateX(${translateX}%)`;
        updateDots();
    }

    function nextSlide() {
        const max = getMaxIndex();
        if (currentIndex >= max) {
            goToSlide(0);
        } else {
            goToSlide(currentIndex + 1);
        }
    }

    function prevSlide() {
        const max = getMaxIndex();
        if (currentIndex <= 0) {
            goToSlide(max);
        } else {
            goToSlide(currentIndex - 1);
        }
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoplay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoplay();
        });
    }

    // Touch e Swipe para Celular
    track.addEventListener('touchstart', (e) => {
        startPos = e.touches[0].clientX;
        isDragging = true;
        clearInterval(autoPlayTimer);
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentTranslate = e.touches[0].clientX - startPos;
    }, { passive: true });

    track.addEventListener('touchend', () => {
        isDragging = false;
        if (currentTranslate < -50) {
            nextSlide();
        } else if (currentTranslate > 50) {
            prevSlide();
        }
        currentTranslate = 0;
        resetAutoplay();
    });

    function startAutoplay() {
        autoPlayTimer = setInterval(nextSlide, 4500);
    }

    function resetAutoplay() {
        clearInterval(autoPlayTimer);
        startAutoplay();
    }

    track.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    track.addEventListener('mouseleave', () => startAutoplay());

    window.addEventListener('resize', () => {
        renderDots();
        goToSlide(currentIndex);
    });

    renderDots();
    startAutoplay();
}

/**
 * Tabs Interativas do Tour da Estrutura
 */
function initStructureTabs() {
    const tabButtons = document.querySelectorAll('.structure-tab-btn');
    const tabPanels = document.querySelectorAll('.structure-tab-panel');

    if (tabButtons.length === 0 || tabPanels.length === 0) return;

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            // Atualiza botões
            tabButtons.forEach(b => {
                b.classList.remove('active', 'bg-iron-gold', 'text-black');
                b.classList.add('bg-white/5', 'text-slate-300');
            });
            btn.classList.add('active', 'bg-iron-gold', 'text-black');
            btn.classList.remove('bg-white/5', 'text-slate-300');

            // Atualiza painéis
            tabPanels.forEach(panel => {
                if (panel.id === target) {
                    panel.classList.remove('hidden');
                } else {
                    panel.classList.add('hidden');
                }
            });
        });
    });
}

/**
 * FAQ Accordion
 */
function initFaqAccordion() {
    const faqButtons = document.querySelectorAll('.faq-button');

    faqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentItem = btn.closest('.faq-item');
            const isActive = currentItem.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            if (!isActive) {
                currentItem.classList.add('active');
            }
        });
    });
}

/**
 * Tooltip do WhatsApp Flutuante
 */
function initWhatsTooltip() {
    const closeBtn = document.getElementById('closeWhatsTooltip');
    const tooltip = document.getElementById('whatsTooltip');

    if (closeBtn && tooltip) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tooltip.style.display = 'none';
        });
    }
}

/**
 * Gráfico Interativo de Horários de Movimento (Picos)
 */
function initCrowdChart() {
    const chartTabWeekday = document.getElementById('chartTabWeekday');
    const chartTabSaturday = document.getElementById('chartTabSaturday');
    const weekdayBars = document.getElementById('weekdayBars');
    const saturdayBars = document.getElementById('saturdayBars');

    if (!chartTabWeekday || !chartTabSaturday || !weekdayBars || !saturdayBars) return;

    chartTabWeekday.addEventListener('click', () => {
        chartTabWeekday.classList.add('bg-iron-gold', 'text-black');
        chartTabWeekday.classList.remove('bg-white/5', 'text-slate-300');
        chartTabSaturday.classList.remove('bg-iron-gold', 'text-black');
        chartTabSaturday.classList.add('bg-white/5', 'text-slate-300');

        weekdayBars.classList.remove('hidden');
        saturdayBars.classList.add('hidden');
    });

    chartTabSaturday.addEventListener('click', () => {
        chartTabSaturday.classList.add('bg-iron-gold', 'text-black');
        chartTabSaturday.classList.remove('bg-white/5', 'text-slate-300');
        chartTabWeekday.classList.remove('bg-iron-gold', 'text-black');
        chartTabWeekday.classList.add('bg-white/5', 'text-slate-300');

        saturdayBars.classList.remove('hidden');
        weekdayBars.classList.add('hidden');
    });
}

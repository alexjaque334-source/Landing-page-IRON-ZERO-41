/**
 * IRONZERO41 Academia - Interatividade da Landing Page
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Atualizar Ano no Rodapé
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // 2. Verificador de Horário Aberto / Fechado em Tempo Real
    initGymStatusChecker();

    // 3. Menu Mobile Drawer
    initMobileMenu();

    // 4. Carrossel de Fotos da Estrutura
    initStructureCarousel();

    // 5. FAQ Accordion
    initFaqAccordion();

    // 6. Tooltip do WhatsApp Flutuante
    initWhatsTooltip();
});

/**
 * Verifica se a academia está aberta com base no fuso horário do Brasil
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
        // Dia da semana: 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
        const day = now.getDay();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour + minute / 60;

        let isOpen = false;
        let message = '';

        if (day >= 1 && day <= 5) {
            // Segunda a Sexta: 06:00 (6.0) até 22:30 (22.5)
            if (currentTime >= 6.0 && currentTime < 22.5) {
                isOpen = true;
                message = 'Aberta agora • Fecha às 22:30';
            } else if (currentTime < 6.0) {
                message = 'Abre hoje às 06:00';
            } else {
                message = 'Fechada • Abre amanhã às 06:00';
            }
        } else if (day === 6) {
            // Sábado: 10:30 (10.5) até 15:00 (15.0)
            if (currentTime >= 10.5 && currentTime < 15.0) {
                isOpen = true;
                message = 'Aberta agora • Fecha às 15:00';
            } else if (currentTime < 10.5) {
                message = 'Abre hoje às 10:30';
            } else {
                message = 'Fechada • Abre segunda às 06:00';
            }
        } else {
            // Domingo
            message = 'Fechada hoje • Abre segunda às 06:00';
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
    // Atualizar a cada minuto
    setInterval(updateStatus, 60000);
}

/**
 * Toggle do Menu Mobile
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
        } else {
            mobileMenu.classList.add('hidden');
        }
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
    let prevTranslate = 0;

    // Determina quantos slides são visíveis conforme o breakpoint da tela
    function getVisibleSlidesCount() {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 640) return 2;
        return 1;
    }

    function getMaxIndex() {
        const visible = getVisibleSlidesCount();
        return Math.max(0, slides.length - visible);
    }

    // Criar Dots
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
        
        // Em mobile cada slide é 100%, em tablet 50%, em desktop 33.333%
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

    // Botões
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
    track.addEventListener('touchstart', touchStart);
    track.addEventListener('touchmove', touchMove);
    track.addEventListener('touchend', touchEnd);

    function touchStart(event) {
        startPos = event.touches[0].clientX;
        isDragging = true;
        clearInterval(autoPlayTimer);
    }

    function touchMove(event) {
        if (!isDragging) return;
        const currentPosition = event.touches[0].clientX;
        currentTranslate = currentPosition - startPos;
    }

    function touchEnd() {
        isDragging = false;
        if (currentTranslate < -50) {
            nextSlide();
        } else if (currentTranslate > 50) {
            prevSlide();
        }
        currentTranslate = 0;
        resetAutoplay();
    }

    // Autoplay
    function startAutoplay() {
        autoPlayTimer = setInterval(nextSlide, 4500);
    }

    function resetAutoplay() {
        clearInterval(autoPlayTimer);
        startAutoplay();
    }

    // Pausar no Hover (Desktop)
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
 * FAQ Accordion com transição e abertura/fechamento único
 */
function initFaqAccordion() {
    const faqButtons = document.querySelectorAll('.faq-button');

    faqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentItem = btn.closest('.faq-item');
            const isActive = currentItem.classList.contains('active');

            // Fechar todos os outros
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Alternar o clicado
            if (!isActive) {
                currentItem.classList.add('active');
            }
        });
    });
}

/**
 * Fechar Tooltip do WhatsApp Flutuante
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

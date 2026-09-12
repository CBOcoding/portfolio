/**
 * CLAUDIO BORROMEI PORTFOLIO ENGINE
 * * Contents:
 * 1. Contact Form Handling (Web3Forms API)
 * 2. Horizontal Scroll Control (Draggable Scrubber + Auto-play)
 * 3. Internationalization (EN/IT Language Toggle)
 * 4. Theme Management (Light/Dark Mode Persistence)
 */

/* ==========================================================================
   1. CONTACT FORM LOGIC
   Handles asynchronous submission using Fetch API and async/await.
   ========================================================================== */
const form = document.getElementById("form");
const result = document.getElementById("result");

if (form) {
    form.addEventListener("submit", handleFormSubmit);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const submitBtn = form.querySelector("button");
    submitBtn.disabled = true;
    result.innerHTML = "Please wait...";

    try {
        const formData = new FormData(form);
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        const json = await response.json();

        if (response.status === 200) {
            result.innerHTML = "Success! Message sent.";
            result.style.color = "green";
            form.reset();
        } else {
            result.innerHTML = json.message;
            result.style.color = "red";
        }
    } catch (error) {
        console.error("Submission error:", error);
        result.innerHTML = "Something went wrong!";
        result.style.color = "red";
    } finally {
        // Clear message after 5 seconds and re-enable button
        setTimeout(() => { result.innerHTML = ""; }, 5000);
        submitBtn.disabled = false;
    }
}

/* ==========================================================================
   2. HORIZONTAL SCROLL CONTROL (DRAGGABLE SCRUBBER + AUTOPLAY)
   Draggable scrollbar-style handle + automatic back-and-forth carousel
   for projects. Works the same on mobile and desktop.
   ========================================================================== */
const projectSections = document.querySelectorAll(".projects-container-relative");

projectSections.forEach(section => {
    const scrollContainer = section.querySelector(".projectContainer");
    const scrubber = section.querySelector(".scroll-scrubber");

    if (!scrollContainer || !scrubber) return;

    const projects = scrollContainer.querySelectorAll(".project-element");
    if (projects.length === 0) return;

    let currentIndex = 0;
    let direction = 1; // 1 = forward, -1 = backward
    let autoPlayId;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;

    scrubber.innerHTML = "";
    const thumb = document.createElement("div");
    thumb.className = "scroll-scrubber-thumb";
    scrubber.appendChild(thumb);

    const getTargetOffset = (index) => {
        const target = projects[index];
        return target.offsetLeft - scrollContainer.offsetLeft;
    };

    const getMaxScroll = () => scrollContainer.scrollWidth - scrollContainer.clientWidth;

    const updateThumb = () => {
        const maxScroll = getMaxScroll();

        if (maxScroll <= 0) {
            thumb.style.width = "100%";
            thumb.style.left = "0";
            scrubber.classList.add("scroll-scrubber-disabled");
            return;
        }

        scrubber.classList.remove("scroll-scrubber-disabled");

        const trackWidth = scrubber.clientWidth;
        const thumbWidthRatio = Math.min(1, scrollContainer.clientWidth / scrollContainer.scrollWidth);
        const thumbWidthPx = Math.max(32, thumbWidthRatio * trackWidth);
        const maxThumbLeft = Math.max(0, trackWidth - thumbWidthPx);
        const scrollRatio = scrollContainer.scrollLeft / maxScroll;

        thumb.style.width = `${thumbWidthPx}px`;
        thumb.style.left = `${scrollRatio * maxThumbLeft}px`;
    };

    const scrollToIndex = (index, smooth = true) => {
        currentIndex = index;
        const left = getTargetOffset(currentIndex);
        scrollContainer.scrollTo({
            left,
            behavior: smooth ? "smooth" : "auto",
        });
        updateThumb();
    };

    const findClosestIndex = () => {
        let closest = 0;
        let minDiff = Infinity;
        const currentLeft = scrollContainer.scrollLeft;

        projects.forEach((card, index) => {
            const cardLeft = card.offsetLeft - scrollContainer.offsetLeft;
            const diff = Math.abs(currentLeft - cardLeft);
            if (diff < minDiff) {
                minDiff = diff;
                closest = index;
            }
        });

        return closest;
    };

    const handleScroll = () => {
        currentIndex = findClosestIndex();
        updateThumb();
    };

    const stopAutoPlay = () => {
        if (autoPlayId) {
            clearInterval(autoPlayId);
            autoPlayId = undefined;
        }
    };

    const startAutoPlay = () => {
        if (autoPlayId || projects.length <= 1) return;

        autoPlayId = setInterval(() => {
            let next = currentIndex + direction;

            if (next >= projects.length) {
                // Hit the right end, bounce back
                direction = -1;
                next = projects.length - 2 >= 0 ? projects.length - 2 : 0;
            } else if (next < 0) {
                // Hit the left end, go forward
                direction = 1;
                next = projects.length > 1 ? 1 : 0;
            }

            scrollToIndex(next);
        }, 4000); // Change project every 4 seconds
    };

    // Dragging the thumb scrubs the scroll position directly
    const onThumbPointerMove = (e) => {
        if (!isDragging) return;

        const maxScroll = getMaxScroll();
        const trackWidth = scrubber.clientWidth;
        const maxThumbLeft = trackWidth - thumb.offsetWidth;
        if (maxScroll <= 0 || maxThumbLeft <= 0) return;

        const deltaRatio = (e.clientX - dragStartX) / maxThumbLeft;
        scrollContainer.scrollLeft = dragStartScrollLeft + deltaRatio * maxScroll;
    };

    const endThumbDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        scrubber.classList.remove("dragging");
        if (e && thumb.hasPointerCapture(e.pointerId)) {
            thumb.releasePointerCapture(e.pointerId);
        }
        currentIndex = findClosestIndex();
        startAutoPlay();
    };

    thumb.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        stopAutoPlay();
        isDragging = true;
        dragStartX = e.clientX;
        dragStartScrollLeft = scrollContainer.scrollLeft;
        scrubber.classList.add("dragging");
        thumb.setPointerCapture(e.pointerId);
    });

    thumb.addEventListener("pointermove", onThumbPointerMove);
    thumb.addEventListener("pointerup", endThumbDrag);
    thumb.addEventListener("pointercancel", endThumbDrag);

    // Clicking/tapping the track jumps the thumb (and scroll) to that spot
    scrubber.addEventListener("pointerdown", (e) => {
        if (e.target === thumb || scrubber.classList.contains("scroll-scrubber-disabled")) return;

        const maxScroll = getMaxScroll();
        const trackWidth = scrubber.clientWidth;
        const maxThumbLeft = trackWidth - thumb.offsetWidth;
        if (maxScroll <= 0 || maxThumbLeft <= 0) return;

        const rect = scrubber.getBoundingClientRect();
        const targetLeft = (e.clientX - rect.left) - thumb.offsetWidth / 2;
        const clampedRatio = Math.max(0, Math.min(1, targetLeft / maxThumbLeft));

        stopAutoPlay();
        scrollContainer.scrollTo({ left: clampedRatio * maxScroll, behavior: "smooth" });
        currentIndex = findClosestIndex();
        startAutoPlay();
    });

    scrollToIndex(0, false);

    // Keep the scrubber thumb in sync when user scrolls (e.g., touch swipe)
    let scrollTimeout;
    scrollContainer.addEventListener("scroll", () => {
        // Throttle updates a bit for smoother behavior
        if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
        scrollTimeout = requestAnimationFrame(handleScroll);
    });

    // Keep the thumb sized correctly if the viewport is resized
    window.addEventListener("resize", updateThumb);

    // Pause autoplay on interaction, resume after
    ["mouseenter", "touchstart"].forEach(evt => {
        scrollContainer.addEventListener(evt, stopAutoPlay);
    });

    ["mouseleave", "touchend"].forEach(evt => {
        scrollContainer.addEventListener(evt, startAutoPlay);
    });

    startAutoPlay();
});

/* ==========================================================================
   3. INTERNATIONALIZATION (EN/IT)
   Swaps text content using data attributes for instant translation.
   ========================================================================== */
const langBtn = document.getElementById('langToggle');
let currentLang = 'en';

if (langBtn) {
    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'it' : 'en';
        langBtn.innerText = currentLang === 'en' ? 'IT' : 'EN';

        document.querySelectorAll('[data-en]').forEach(el => {
            // Update text content based on the data-attribute matching the current language
            const translation = el.getAttribute(`data-${currentLang}`);
            if (translation) el.innerText = translation;
        });
    });
}

/* ==========================================================================
   4. THEME MANAGEMENT
   Toggles Dark/Light mode and persists choice in LocalStorage.
   ========================================================================== */
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');

// Apply saved theme on page load
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeToggle) themeToggle.innerText = savedTheme === 'dark' ? '☀️' : '🌙';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerText = newTheme === 'dark' ? '☀️' : '🌙';
    });
}

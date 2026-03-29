/**
 * CLAUDIO BORROMEI PORTFOLIO ENGINE
 * * Contents:
 * 1. Contact Form Handling (Web3Forms API)
 * 2. Horizontal Scroll Control (Dot Carousel + Auto-play)
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
   2. HORIZONTAL SCROLL CONTROL (DOTS + AUTOPLAY)
   Dot navigation + automatic back-and-forth carousel for projects.
   Works the same on mobile and desktop.
   ========================================================================== */
const projectSections = document.querySelectorAll(".projects-container-relative");

projectSections.forEach(section => {
    const scrollContainer = section.querySelector(".projectContainer");
    const dotsContainer = section.querySelector(".dot-indicators");

    if (!scrollContainer || !dotsContainer) return;

    const projects = scrollContainer.querySelectorAll(".project-element");
    if (projects.length === 0) return;

    let dots = [];
    let currentIndex = 0;
    let direction = 1; // 1 = forward, -1 = backward
    let autoPlayId;

    const getTargetOffset = (index) => {
        const target = projects[index];
        return target.offsetLeft - scrollContainer.offsetLeft;
    };

    const setActiveDot = (activeIndex) => {
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === activeIndex);
        });
    };

    const scrollToIndex = (index, smooth = true) => {
        currentIndex = index;
        const left = getTargetOffset(currentIndex);
        scrollContainer.scrollTo({
            left,
            behavior: smooth ? "smooth" : "auto",
        });
        setActiveDot(currentIndex);
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
        const closestIndex = findClosestIndex();
        currentIndex = closestIndex;
        setActiveDot(currentIndex);
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

    const createDots = () => {
        dotsContainer.innerHTML = "";
        dots = [];

        projects.forEach((_, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "dot";
            dot.setAttribute("aria-label", `Go to project ${index + 1}`);

            dot.addEventListener("click", () => {
                stopAutoPlay();
                scrollToIndex(index);
                // Restart autoplay after manual selection
                startAutoPlay();
            });

            dotsContainer.appendChild(dot);
            dots.push(dot);
        });

        setActiveDot(0);
    };

    createDots();
    scrollToIndex(0, false);

    // Keep dots in sync when user scrolls (e.g., touch swipe)
    let scrollTimeout;
    scrollContainer.addEventListener("scroll", () => {
        // Throttle updates a bit for smoother behavior
        if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
        scrollTimeout = requestAnimationFrame(handleScroll);
    });

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

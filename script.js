/**
 * CLAUDIO BORROMEI PORTFOLIO ENGINE
 * * Contents:
 * 1. Contact Form Handling (Web3Forms API)
 * 2. Horizontal Scroll Control (Projects Section)
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
   2. HORIZONTAL SCROLL CONTROL
   Manages button visibility and smooth scrolling for project cards.
   ========================================================================== */
const projectSections = document.querySelectorAll(".projects-container-relative");

projectSections.forEach(section => {
    const scrollContainer = section.querySelector(".projectContainer");
    const scrollLeft = section.querySelector(".scrollLeft");
    const scrollRight = section.querySelector(".scrollRight");

    if (scrollContainer && scrollLeft && scrollRight) {
        scrollRight.addEventListener("click", () => {
            scrollContainer.scrollBy({ left: 320, behavior: "smooth" });
        });

        scrollLeft.addEventListener("click", () => {
            scrollContainer.scrollBy({ left: -320, behavior: "smooth" });
        });

        scrollContainer.addEventListener("scroll", () => {
            // Toggle visibility of scroll buttons based on position
            const isAtStart = scrollContainer.scrollLeft <= 10;
            const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            const isAtEnd = scrollContainer.scrollLeft >= maxScroll - 10;

            scrollLeft.style.opacity = isAtStart ? "0" : "1";
            scrollLeft.style.pointerEvents = isAtStart ? "none" : "auto";

            scrollRight.style.opacity = isAtEnd ? "0" : "1";
            scrollRight.style.pointerEvents = isAtEnd ? "none" : "auto";
        });

        // Initialize button visibility
        const isAtStart = scrollContainer.scrollLeft <= 10;
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const isAtEnd = scrollContainer.scrollLeft >= maxScroll - 10;

        scrollLeft.style.opacity = isAtStart ? "0" : "1";
        scrollLeft.style.pointerEvents = isAtStart ? "none" : "auto";
        scrollRight.style.opacity = isAtEnd ? "0" : "1";
        scrollRight.style.pointerEvents = isAtEnd ? "none" : "auto";
    }
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

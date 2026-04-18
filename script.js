// HERO FADE-IN ANIMATION
window.addEventListener("load", () => {
    const heroContent = document.querySelector(".hero-content");
    heroContent.classList.add("show");
});


// SMOOTH SCROLL (for future sections)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        const target = this.getAttribute("href");

        if (target !== "#") {
            e.preventDefault();
            document.querySelector(target).scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

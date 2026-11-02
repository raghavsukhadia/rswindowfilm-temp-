// Premium Navbar Scroll Effect
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 20) {
    navbar.classList.add("bg-black/90", "shadow-2xl");
    navbar.classList.remove("bg-black/70");
  } else {
    navbar.classList.remove("bg-black/90", "shadow-2xl");
    navbar.classList.add("bg-black/70");
  }
});

// Desktop Products Dropdown
const productsBtn = document.getElementById("productsBtn");
const productsMenu = document.getElementById("productsMenu");
const windowFilmItem = document.getElementById("windowFilmItem");
const windowFilmMenu = document.getElementById("windowFilmMenu");
const staticSeriesItem = document.getElementById("staticSeriesItem");
const staticSeriesMenu = document.getElementById("staticSeriesMenu");

// Show/hide products dropdown on click with premium animation
productsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (productsMenu.classList.contains("hidden")) {
    productsMenu.classList.remove("hidden");
    setTimeout(() => {
      productsMenu.classList.remove("opacity-0", "scale-95", "translate-y-2");
      productsMenu.classList.add("opacity-100", "scale-100", "translate-y-0");
    }, 10);
  } else {
    productsMenu.classList.add("opacity-0", "scale-95", "translate-y-2");
    productsMenu.classList.remove("opacity-100", "scale-100", "translate-y-0");
    setTimeout(() => {
      productsMenu.classList.add("hidden");
    }, 200);
  }
});

// Show window film submenu on hover with premium animation
windowFilmItem.addEventListener("mouseenter", () => {
  windowFilmMenu.classList.remove("hidden");
  setTimeout(() => {
    windowFilmMenu.classList.remove("opacity-0", "scale-95", "translate-x-2");
    windowFilmMenu.classList.add("opacity-100", "scale-100", "translate-x-0");
  }, 10);
});

windowFilmItem.addEventListener("mouseleave", (e) => {
  if (!windowFilmMenu.contains(e.relatedTarget)) {
    windowFilmMenu.classList.add("opacity-0", "scale-95", "translate-x-2");
    windowFilmMenu.classList.remove("opacity-100", "scale-100", "translate-x-0");
    setTimeout(() => {
      windowFilmMenu.classList.add("hidden");
    }, 200);
  }
});

windowFilmMenu.addEventListener("mouseleave", () => {
  windowFilmMenu.classList.add("opacity-0", "scale-95", "translate-x-2");
  windowFilmMenu.classList.remove("opacity-100", "scale-100", "translate-x-0");
  setTimeout(() => {
    windowFilmMenu.classList.add("hidden");
  }, 200);
});

// Show static series submenu on hover with premium animation
staticSeriesItem.addEventListener("mouseenter", () => {
  staticSeriesMenu.classList.remove("hidden");
  setTimeout(() => {
    staticSeriesMenu.classList.remove("opacity-0", "scale-95", "translate-x-2");
    staticSeriesMenu.classList.add("opacity-100", "scale-100", "translate-x-0");
  }, 10);
});

staticSeriesItem.addEventListener("mouseleave", (e) => {
  if (!staticSeriesMenu.contains(e.relatedTarget)) {
    staticSeriesMenu.classList.add("opacity-0", "scale-95", "translate-x-2");
    staticSeriesMenu.classList.remove("opacity-100", "scale-100", "translate-x-0");
    setTimeout(() => {
      staticSeriesMenu.classList.add("hidden");
    }, 200);
  }
});

staticSeriesMenu.addEventListener("mouseleave", () => {
  staticSeriesMenu.classList.add("opacity-0", "scale-95", "translate-x-2");
  staticSeriesMenu.classList.remove("opacity-100", "scale-100", "translate-x-0");
  setTimeout(() => {
    staticSeriesMenu.classList.add("hidden");
  }, 200);
});

// Mobile Menu Toggle
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

// Mobile Products Accordion
const mobileProductsBtn = document.getElementById("mobileProductsBtn");
const mobileProductsMenu = document.getElementById("mobileProductsMenu");
const productsArrow = document.getElementById("productsArrow");

mobileProductsBtn.addEventListener("click", () => {
  mobileProductsMenu.classList.toggle("hidden");
  
  // Rotate arrow
  if (mobileProductsMenu.classList.contains("hidden")) {
    productsArrow.textContent = "▾";
  } else {
    productsArrow.textContent = "▴";
  }
});

// Close menus when clicking outside
document.addEventListener("click", (e) => {
  // Close mobile menu
  if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
    mobileMenu.classList.add("hidden");
  }
  
  // Close desktop products menu with premium animation
  if (!productsBtn.contains(e.target) && !productsMenu.contains(e.target)) {
    if (!productsMenu.classList.contains("hidden")) {
      productsMenu.classList.add("opacity-0", "scale-95", "translate-y-2");
      productsMenu.classList.remove("opacity-100", "scale-100", "translate-y-0");
      setTimeout(() => {
        productsMenu.classList.add("hidden");
      }, 200);
    }
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      // Close mobile menu after clicking
      mobileMenu.classList.add("hidden");
    }
  });
});

// Scroll-based reveal animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("opacity-100", "translate-y-0");
      entry.target.classList.remove("opacity-0", "translate-y-8");
    }
  });
}, {
  threshold: 0.1
});

// Observe all elements with .reveal class
document.querySelectorAll(".reveal").forEach(el => {
  el.classList.add("opacity-0", "translate-y-8", "transition-all", "duration-700");
  observer.observe(el);
});
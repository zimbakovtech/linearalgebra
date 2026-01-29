// MathJax Configuration
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    packages: ['base', 'ams', 'noerrors', 'noundefined']
  },
  options: {
    ignoreHtmlClass: 'tex2jax_ignore',
    processHtmlClass: 'tex2jax_process'
  },
  loader: {load: ['[tex]/ams']}
};

document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Logic
    const themeToggleBtn = document.createElement('button');
    themeToggleBtn.className = 'theme-toggle-btn';
    themeToggleBtn.setAttribute('aria-label', 'Toggle Dark Mode');
    themeToggleBtn.innerHTML = '🌓';
    document.body.appendChild(themeToggleBtn);

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Back to Top Logic
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '⬆';
    backToTopBtn.setAttribute('aria-label', 'Back to Top');
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Header Hide/Show on Scroll
    const header = document.querySelector('.study-nav');
    if (header) {
        let lastScrollY = window.scrollY;
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    
                    if (currentScrollY > lastScrollY && currentScrollY > 100) {
                        // Scrolling down
                        header.classList.add('hidden');
                    } else {
                        // Scrolling up
                        header.classList.remove('hidden');
                    }
                    
                    lastScrollY = currentScrollY;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // Generate Table of Contents (skip when container opts out)
    const container = document.querySelector('.container');
    const headings = document.querySelectorAll('h1, h2, h3, h4');
    
    const noTocPage = document.body?.dataset?.page === 'problems';

    if (container && headings.length > 0 && !container.hasAttribute('data-no-toc') && !noTocPage) {
        const tocContainer = document.createElement('div');
        tocContainer.className = 'toc-container';
        
        const tocTitle = document.createElement('h3');
        tocTitle.textContent = 'Содржина';
        tocContainer.appendChild(tocTitle);

        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';

        // Insert TOC at the top of the container
        container.insertBefore(tocContainer, container.firstChild);

        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${id}`;
            a.textContent = heading.textContent;
            
            if (heading.tagName === 'H2') {
                a.className = 'toc-subitem';
            } else if (heading.tagName === 'H3') {
                a.className = 'toc-subitem toc-h3';
            } else if (['H4', 'H5', 'H6'].includes(heading.tagName)) {
                a.className = 'toc-subitem toc-h4';
            }

            li.appendChild(a);
            tocList.appendChild(li);
        });

        tocContainer.appendChild(tocList);
    }

    // ==== STUDY PAGE FEATURES ====
    if (document.body.dataset.page === 'study' && typeof initializeStudyFeatures === 'function') {
        initializeStudyFeatures();
    }

    // ==== PROBLEMS PAGE FEATURES ====
    if (document.body.dataset.page === 'problems' && typeof initializeProblemsPage === 'function') {
        initializeProblemsPage();
    }
});

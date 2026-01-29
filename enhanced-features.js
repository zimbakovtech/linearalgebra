// Enhanced Features for Study Pages
// This file contains all the study features like search, bookmarks, progress tracking, and study timer

// ==== STUDY FEATURES INITIALIZATION ====
function initializeStudyFeatures() {
    const pageId = window.location.pathname;

    // Panel Toggle Logic
    function initPanel(toggleId, panelId) {
        const toggle = document.getElementById(toggleId);
        const panel = document.getElementById(panelId);
        const closeBtn = panel?.querySelector('.panel-close');

        if (!toggle || !panel) return;

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.side-panel').forEach(p => {
                if (p !== panel) p.classList.remove('open');
            });
            panel.classList.toggle('open');
        });

        closeBtn?.addEventListener('click', () => {
            panel.classList.remove('open');
        });

        document.addEventListener('click', (e) => {
            if (panel.classList.contains('open') && !panel.contains(e.target) && !toggle.contains(e.target)) {
                panel.classList.remove('open');
            }
        });
    }

    initPanel('search-toggle', 'search-panel');
    initPanel('bookmark-toggle', 'bookmarks-panel');
    initPanel('progress-toggle', 'progress-panel');
    initPanel('timer-toggle', 'timer-panel');

    // ==== SEARCH FUNCTIONALITY ====
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            searchResults.innerHTML = '';

            if (query.length < 2) {
                searchResults.innerHTML = '<p class="panel-hint">Внесете барем 2 карактери...</p>';
                return;
            }

            const headings = document.querySelectorAll('.container h1, .container h2, .container h3');
            const results = [];

            headings.forEach(heading => {
                const text = heading.textContent.toLowerCase();
                if (text.includes(query)) {
                    results.push({
                        element: heading,
                        title: heading.textContent,
                        preview: text.substring(0, 100)
                    });
                }
            });

            const paragraphs = document.querySelectorAll('.container p');
            paragraphs.forEach(p => {
                const text = p.textContent.toLowerCase();
                if (text.includes(query) && results.length < 10) {
                    const prevHeading = getPreviousHeading(p);
                    results.push({
                        element: p,
                        title: prevHeading ? prevHeading.textContent : 'Параграф',
                        preview: text.substring(0, 100) + '...'
                    });
                }
            });

            if (results.length === 0) {
                searchResults.innerHTML = '<p class="panel-hint">Нема резултати</p>';
                return;
            }

            results.forEach(result => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-preview">${result.preview}</div>
                `;
                item.addEventListener('click', () => {
                    result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    result.element.style.backgroundColor = 'var(--secondary-color)';
                    setTimeout(() => {
                        result.element.style.backgroundColor = '';
                    }, 2000);
                    document.querySelector('.side-panel.open')?.classList.remove('open');
                });
                searchResults.appendChild(item);
            });
        });
    }

    function getPreviousHeading(element) {
        let prev = element.previousElementSibling;
        while (prev) {
            if (prev.tagName.match(/^H[1-6]$/)) return prev;
            prev = prev.previousElementSibling;
        }
        return null;
    }

    // ==== BOOKMARKS FUNCTIONALITY ====
    const bookmarksList = document.getElementById('bookmarks-list');
    const storageKey = `bookmarks_${pageId}`;
    let bookmarks = JSON.parse(localStorage.getItem(storageKey) || '[]');

    function saveBookmarks() {
        localStorage.setItem(storageKey, JSON.stringify(bookmarks));
    }

    function renderBookmarks() {
        if (!bookmarksList) return;
        bookmarksList.innerHTML = '';

        if (bookmarks.length === 0) {
            bookmarksList.innerHTML = '<p class="panel-hint">Нема обележани секции</p>';
            return;
        }

        bookmarks.forEach((bookmark, index) => {
            const item = document.createElement('div');
            item.className = 'bookmark-item';
            item.innerHTML = `
                <span class="bookmark-title">${bookmark.title}</span>
                <button class="bookmark-remove">×</button>
            `;
            
            item.querySelector('.bookmark-title').addEventListener('click', () => {
                const element = document.getElementById(bookmark.id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    document.querySelector('.side-panel.open')?.classList.remove('open');
                }
            });

            item.querySelector('.bookmark-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                bookmarks.splice(index, 1);
                saveBookmarks();
                renderBookmarks();
                updateBookmarkIcons();
            });

            bookmarksList.appendChild(item);
        });
    }

    function updateBookmarkIcons() {
        document.querySelectorAll('.container h1, .container h2, .container h3').forEach(heading => {
            const isBookmarked = bookmarks.some(b => b.id === heading.id);
            heading.classList.toggle('bookmarked', isBookmarked);
        });
    }

    document.querySelectorAll('.container h1, .container h2, .container h3').forEach(heading => {
        heading.addEventListener('click', () => {
            const id = heading.id;
            const title = heading.textContent;
            const index = bookmarks.findIndex(b => b.id === id);

            if (index >= 0) {
                bookmarks.splice(index, 1);
            } else {
                bookmarks.push({ id, title });
            }

            saveBookmarks();
            renderBookmarks();
            updateBookmarkIcons();
        });
    });

    renderBookmarks();
    updateBookmarkIcons();

    // ==== PROGRESS TRACKING ====
    const progressKey = `progress_${pageId}`;
    let readSections = JSON.parse(localStorage.getItem(progressKey) || '[]');
    const allSections = Array.from(document.querySelectorAll('.container h2, .container h3'));

    function updateProgress() {
        const sectionsReadEl = document.getElementById('sections-read');
        const progressBar = document.getElementById('reading-progress');
        
        if (sectionsReadEl) {
            sectionsReadEl.textContent = `${readSections.length} / ${allSections.length}`;
        }
        
        if (progressBar) {
            const percentage = allSections.length > 0 ? (readSections.length / allSections.length) * 100 : 0;
            progressBar.style.width = percentage + '%';
        }

        allSections.forEach(section => {
            section.classList.toggle('section-read', readSections.includes(section.id));
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !readSections.includes(entry.target.id)) {
                readSections.push(entry.target.id);
                localStorage.setItem(progressKey, JSON.stringify(readSections));
                updateProgress();
            }
        });
    }, { threshold: 0.5 });

    allSections.forEach(section => observer.observe(section));

    const resetProgressBtn = document.getElementById('reset-progress');
    if (resetProgressBtn) {
        resetProgressBtn.addEventListener('click', () => {
            readSections = [];
            localStorage.setItem(progressKey, JSON.stringify(readSections));
            updateProgress();
        });
    }

    updateProgress();

    // ==== STUDY TIMER ====
    let timerInterval = null;
    let timerSeconds = 0;
    const totalTimeKey = `total_time_${new Date().toDateString()}`;

    const timerDisplay = document.getElementById('timer-display');
    const timerStart = document.getElementById('timer-start');
    const timerPause = document.getElementById('timer-pause');
    const timerReset = document.getElementById('timer-reset');
    const totalTimeEl = document.getElementById('total-time');

    function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function updateTimerDisplay() {
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timerSeconds);
        }
    }

    function updateTotalTime() {
        if (totalTimeEl) {
            const totalSecs = parseInt(localStorage.getItem(totalTimeKey) || '0');
            const mins = Math.floor(totalSecs / 60);
            totalTimeEl.textContent = `${mins} мин`;
        }
    }

    if (timerStart) {
        timerStart.addEventListener('click', () => {
            if (timerInterval) return;
            
            timerInterval = setInterval(() => {
                timerSeconds++;
                updateTimerDisplay();
                
                const totalSecs = parseInt(localStorage.getItem(totalTimeKey) || '0');
                localStorage.setItem(totalTimeKey, (totalSecs + 1).toString());
                updateTotalTime();
            }, 1000);

            timerStart.style.display = 'none';
            if (timerPause) timerPause.style.display = 'block';
        });
    }

    if (timerPause) {
        timerPause.addEventListener('click', () => {
            clearInterval(timerInterval);
            timerInterval = null;
            timerPause.style.display = 'none';
            if (timerStart) timerStart.style.display = 'block';
        });
    }

    if (timerReset) {
        timerReset.addEventListener('click', () => {
            clearInterval(timerInterval);
            timerInterval = null;
            timerSeconds = 0;
            updateTimerDisplay();
            if (timerStart) timerStart.style.display = 'block';
            if (timerPause) timerPause.style.display = 'none';
        });
    }

    updateTimerDisplay();
    updateTotalTime();
}

// ==== PROBLEMS PAGE INITIALIZATION ====
function initializeProblemsPage() {
    const imageFiles = [
        '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg',
        '7.jpg', '8.png', '9.png', '10.jpg', '11.jpg', '12.jpg'
    ];

    const grid = document.getElementById('problems-grid');
    const lightboxOverlay = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxOpen = document.getElementById('lightbox-open');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');
    const btnClose = document.getElementById('lightbox-close');
    const btnZoomIn = document.getElementById('lightbox-zoom-in');
    const btnZoomOut = document.getElementById('lightbox-zoom-out');
    const btnReset = document.getElementById('lightbox-reset');
    
    let currentIndex = 0;
    let currentZoom = 1;
    const allItems = [];

    const getLabelForFile = (file) => {
        const base = file.split('.')[0];
        const num = Number.parseInt(base, 10);
        return Number.isFinite(num) ? `Задача ${num}` : file;
    };

    const getSrcForFile = (file) => `images/problems/${file}`;

    const openLightbox = (index) => {
        currentIndex = (index + imageFiles.length) % imageFiles.length;
        const file = imageFiles[currentIndex];
        const src = getSrcForFile(file);
        const label = getLabelForFile(file);

        lightboxImg.src = src;
        lightboxImg.alt = label;
        lightboxTitle.textContent = label;
        lightboxOpen.href = src;
        currentZoom = 1;
        lightboxImg.style.transform = 'scale(1)';
        lightboxImg.classList.remove('zoomed');

        lightboxOverlay.classList.add('open');
        lightboxOverlay.setAttribute('aria-hidden', 'false');
        btnClose.focus();
    };

    const closeLightbox = () => {
        lightboxOverlay.classList.remove('open');
        lightboxOverlay.setAttribute('aria-hidden', 'true');
        lightboxImg.src = '';
        lightboxImg.alt = '';
        lightboxTitle.textContent = '';
        lightboxOpen.href = '#';
    };

    const goPrev = () => openLightbox(currentIndex - 1);
    const goNext = () => openLightbox(currentIndex + 1);

    const zoomIn = () => {
        currentZoom = Math.min(currentZoom + 0.5, 3);
        lightboxImg.style.transform = `scale(${currentZoom})`;
        lightboxImg.classList.add('zoomed');
    };

    const zoomOut = () => {
        currentZoom = Math.max(currentZoom - 0.5, 0.5);
        lightboxImg.style.transform = `scale(${currentZoom})`;
        if (currentZoom === 1) lightboxImg.classList.remove('zoomed');
    };

    const resetZoom = () => {
        currentZoom = 1;
        lightboxImg.style.transform = 'scale(1)';
        lightboxImg.classList.remove('zoomed');
    };

    imageFiles.forEach((file, index) => {
        const href = getSrcForFile(file);
        const label = getLabelForFile(file);

        const item = document.createElement('a');
        item.className = 'gallery-item';
        item.href = href;
        item.dataset.index = index;
        item.dataset.label = label;
        item.setAttribute('aria-label', `${label} (клик за преглед)`);

        item.addEventListener('click', (e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            openLightbox(index);
        });

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.src = href;
        img.alt = label;

        const caption = document.createElement('div');
        caption.className = 'gallery-caption';
        caption.textContent = label;

        item.appendChild(img);
        item.appendChild(caption);
        grid.appendChild(item);
        allItems.push(item);
    });

    btnClose?.addEventListener('click', closeLightbox);
    btnPrev?.addEventListener('click', goPrev);
    btnNext?.addEventListener('click', goNext);
    btnZoomIn?.addEventListener('click', zoomIn);
    btnZoomOut?.addEventListener('click', zoomOut);
    btnReset?.addEventListener('click', resetZoom);

    lightboxOverlay?.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) closeLightbox();
    });

    lightboxImg?.addEventListener('click', () => {
        if (currentZoom === 1) zoomIn();
        else resetZoom();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightboxOverlay.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') goPrev();
        if (e.key === 'ArrowRight') goNext();
        if (e.key === '+' || e.key === '=') zoomIn();
        if (e.key === '-') zoomOut();
        if (e.key === '0') resetZoom();
    });

    // ==== FILTER AND SEARCH ====
    const searchInput = document.getElementById('problem-search');
    const filterSelect = document.getElementById('problem-filter');
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');

    function filterItems() {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const filterValue = filterSelect?.value || 'all';

        allItems.forEach((item, index) => {
            const label = item.dataset.label.toLowerCase();
            const matchesSearch = label.includes(searchTerm);
            let matchesFilter = true;

            if (filterValue === '1-4') matchesFilter = index >= 0 && index <= 3;
            else if (filterValue === '5-8') matchesFilter = index >= 4 && index <= 7;
            else if (filterValue === '9-12') matchesFilter = index >= 8 && index <= 11;

            item.classList.toggle('hidden', !(matchesSearch && matchesFilter));
        });
    }

    searchInput?.addEventListener('input', filterItems);
    filterSelect?.addEventListener('change', filterItems);

    gridViewBtn?.addEventListener('click', () => {
        grid.classList.remove('list-view');
        gridViewBtn.classList.add('active');
        listViewBtn?.classList.remove('active');
    });

    listViewBtn?.addEventListener('click', () => {
        grid.classList.add('list-view');
        listViewBtn.classList.add('active');
        gridViewBtn?.classList.remove('active');
    });
}

// Add reading progress bar for study pages
if (document.body.dataset.page === 'study') {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress-bar';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

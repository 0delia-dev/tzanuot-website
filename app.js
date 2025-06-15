// Sample data definitions for safety (remove if defined elsewhere)
let sampleItems = sampleItems || [];
let forumPosts = forumPosts || [];

// ציטוטי צניעות
const tzniutQuotes = [
    {
        id: 1,
        author: "נחמה ליבוביץ",
        text: "האדם צריך להיות צנוע לא רק בחיצוניות אלא בפנימיות.",
        source: "עיונים בספר בראשית",
        comments: []
    },
    {
        id: 2,
        author: "רבקה מירב",
        text: "הצניעות היא כוח פנימי המעניק לאישה יופי אמיתי ועמוק.",
        source: "אמונה בעידן המודרני",
        comments: []
    },
    {
        id: 3,
        author: "הרבנית טל אורן",
        text: "צניעות איננה הסתרה אלא הדגשה נכונה - להדגיש את הנשמה ולא רק את הגוף.",
        source: "דרשות לנשים",
        comments: []
    }
];

// משתנים גלובליים
let currentItems = [...sampleItems];
let currentForumPosts = [...forumPosts];
let currentQuotes = [...tzniutQuotes];

// אתחול האפליקציה
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // טעינת הגדרות משתמש
    loadUserSettings();
    
    // הגדרת event listeners
    setupEventListeners();
    
    // טעינת תוכן ראשוני
    loadInitialContent();
    
    // טעינת נתונים מ-localStorage אם קיימים
    loadDataFromStorage();
}

function setupEventListeners() {
    // כפתורי נגישות
    const themeToggle = document.getElementById('theme-toggle');
    const fontSizeToggle = document.getElementById('font-size-toggle');
    const contrastToggle = document.getElementById('contrast-toggle');
    
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (fontSizeToggle) fontSizeToggle.addEventListener('click', toggleFontSize);
    if (contrastToggle) contrastToggle.addEventListener('click', toggleContrast);
    
    // כפתורי ניווט
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    const actionButtons = document.querySelectorAll('.btn[data-tab]');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // טופס הוספת בגד
    const addItemForm = document.getElementById('add-item-form');
    if (addItemForm) {
        addItemForm.addEventListener('submit', handleAddItem);
    }
    
    // מסננים
    const filters = ['sleeve-filter', 'skirt-filter', 'collar-filter', 'pockets-filter'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) filter.addEventListener('change', applyFilters);
    });
    
    // פורום
    const askQuestionBtn = document.getElementById('ask-question-btn');
    const submitQuestionBtn = document.getElementById('submit-question-btn');
    const cancelQuestionBtn = document.getElementById('cancel-question-btn');
    if (askQuestionBtn) askQuestionBtn.addEventListener('click', showQuestionForm);
    if (submitQuestionBtn) submitQuestionBtn.addEventListener('click', submitQuestion);
    if (cancelQuestionBtn) cancelQuestionBtn.addEventListener('click', hideQuestionForm);
}

// נגישות - החלפת ערכת נושא
function toggleTheme() {
    const currentTheme = document.body.dataset.theme || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = newTheme;
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.textContent = newTheme === 'light' ? '⏾' : '✹';
    }
    localStorage.setItem('theme', newTheme);
    showNotification(`מעבר למצב ${newTheme === 'light' ? 'בהיר' : 'כהה'}`);

    // Animate ויהי אור in a circle if changing from dark to light
    if (currentTheme === 'dark' && newTheme === 'light') {
        const lightMsg = document.getElementById('let-there-be-light');
        if (lightMsg) {
            lightMsg.style.display = 'block';
            lightMsg.classList.remove('animate');
            // Force reflow to restart the animation
            void lightMsg.offsetWidth;
            lightMsg.classList.add('animate');
            setTimeout(() => {
                lightMsg.classList.remove('animate');
                lightMsg.style.display = 'none';
            }, 1600); // matches animation duration
        }
    }
}

// נגישות - שינוי גודל טקסט
function toggleFontSize() {
    const sizes = ['normal', 'small', 'large', 'extra-large'];
    const currentSize = document.body.dataset.fontSize || 'normal';
    const currentIndex = sizes.indexOf(currentSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const newSize = sizes[nextIndex];
    document.body.dataset.fontSize = newSize;
    localStorage.setItem('fontSize', newSize);
    showNotification(`גודל טקסט: ${getSizeLabel(newSize)}`);
}

// נגישות - החלפת ניגודיות
function toggleContrast() {
    const currentContrast = document.body.dataset.contrast || 'normal';
    const newContrast = currentContrast === 'normal' ? 'high' : 'normal';
    document.body.dataset.contrast = newContrast;
    localStorage.setItem('contrast', newContrast);
    showNotification(`ניגודיות ${newContrast === 'high' ? 'גבוהה' : 'רגילה'}`);
}

function loadUserSettings() {
    const theme = localStorage.getItem('theme') || 'light';
    const fontSize = localStorage.getItem('fontSize') || 'normal';
    const contrast = localStorage.getItem('contrast') || 'normal';
    document.body.dataset.theme = theme;
    document.body.dataset.fontSize = fontSize;
    document.body.dataset.contrast = contrast;
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.textContent = theme === 'light' ? '⏾' : '✹';
}

function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const navBtns = document.querySelectorAll('.nav-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    navBtns.forEach(btn => btn.classList.remove('active'));
    const targetTab = document.getElementById(tabId);
    const targetNavBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (targetTab) targetTab.classList.add('active');
    if (targetNavBtn) targetNavBtn.classList.add('active');
    loadTabContent(tabId);
}

function loadTabContent(tabId) {
    switch(tabId) {
        case 'gallery': renderItems(); break;
        case 'forum': renderForumPosts(); break;
        case 'tzniut-forum': renderTzniutQuotes(); break;
    }
}

function loadInitialContent() {
    renderItems();
    renderForumPosts();
    renderTzniutQuotes();
}

// רינדור פריטי בגדים
function renderItems(itemsToRender = currentItems) {
    const grid = document.getElementById('items-grid');
    if (!grid) return;
    if (itemsToRender.length === 0) {
        grid.innerHTML = '<div class="no-results">לא נמצאו פריטים מתאימים</div>';
        return;
    }
    grid.innerHTML = itemsToRender.map(item => `
        <div class="item-card">
            <div class="item-title">${item.title}</div>
            <div class="item-details">
                <span class="item-tag">שרוולים: ${getHebrewValue('sleeve', item.sleeve_length)}</span>
                <span class="item-tag">חצאית: ${getHebrewValue('skirt', item.skirt_length)}</span>
                <span class="item-tag">צווארון: ${getHebrewValue('collar', item.collar_type)}</span>
                ${item.has_pockets ? '<span class="item-tag">✓ כיסים</span>' : ''}
            </div>
            <div class="item-rating" data-item-id="${item.id}">
                ${generateStars(item.rating, item.id)}
            </div>
            <div class="item-comments">
                ${item.comments.map(comment => `<div class="comment">${comment}</div>`).join('')}
                <div class="add-comment">
                    <input type="text" placeholder="הוסיפי הערה..." data-item-id="${item.id}">
                    <button onclick="addComment(${item.id})">שלחי</button>
                </div>
            </div>
            <a href="${item.url}" target="_blank" class="btn btn-primary" style="margin-top: 15px; text-decoration: none;">צפי באתר המקורי</a>
        </div>
    `).join('');
    setupStarRatings();
}

function generateStars(rating, itemId) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        const active = i <= rating ? 'active' : '';
        stars += `<span class="star ${active}" data-rating="${i}" data-item-id="${itemId}">★</span>`;
    }
    return stars;
}

function setupStarRatings() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            const itemId = parseInt(this.dataset.itemId);
            updateItemRating(itemId, rating);
        });
    });
}

function updateItemRating(itemId, rating) {
    const item = currentItems.find(i => i.id === itemId);
    if (item) {
        item.rating = rating;
        renderItems();
        saveDataToStorage();
        showNotification('דירוג נשמר בהצלחה!');
    }
}

function addComment(itemId) {
    const input = document.querySelector(`input[data-item-id="${itemId}"]`);
    const comment = input.value.trim();
    if (comment) {
        const item = currentItems.find(i => i.id === itemId);
        if (item) {
            item.comments.push(comment);
            input.value = '';
            renderItems();
            saveDataToStorage();
            showNotification('הערה נוספה בהצלחה!');
        }
    }
}

function applyFilters() {
    const sleeveFilter = document.getElementById('sleeve-filter').value;
    const skirtFilter = document.getElementById('skirt-filter').value;
    const collarFilter = document.getElementById('collar-filter').value;
    const pocketsFilter = document.getElementById('pockets-filter').value;
    let filteredItems = currentItems.filter(item => {
        const sleeveMatch = !sleeveFilter || item.sleeve_length === sleeveFilter;
        const skirtMatch = !skirtFilter || item.skirt_length === skirtFilter;
        const collarMatch = !collarFilter || item.collar_type === collarFilter;
        const pocketsMatch = !pocketsFilter || 
            (pocketsFilter === 'yes' && item.has_pockets) ||
            (pocketsFilter === 'no' && !item.has_pockets);
        return sleeveMatch && skirtMatch && collarMatch && pocketsMatch;
    });
    renderItems(filteredItems);
    showNotification(`נמצאו ${filteredItems.length} פריטים מתאימים`);
}

// הוספת בגד חדש
function handleAddItem(e) {
    e.preventDefault();
    const formData = {
        id: Date.now(),
        url: document.getElementById('item-url').value,
        title: document.getElementById('item-title').value,
        sleeve_length: document.getElementById('sleeve-length').value,
        skirt_length: document.getElementById('skirt-length').value,
        collar_type: document.getElementById('collar-type').value,
        has_pockets: document.getElementById('has-pockets').checked,
        rating: 0,
        comments: []
    };
    currentItems.push(formData);
    document.getElementById('add-item-form').reset();
    saveDataToStorage();
    switchTab('gallery');
    showNotification('בגד נוסף בהצלחה!');
}

// פורום - הצגת טופס שאלה
function showQuestionForm() {
    const form = document.getElementById('ask-question-form');
    if (form) {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

// פורום - הסתרת טופס שאלה
function hideQuestionForm() {
    const form = document.getElementById('ask-question-form');
    if (form) {
        form.style.display = 'none';
        document.getElementById('question-title').value = '';
        document.getElementById('question-content').value = '';
    }
}

// פורום - שליחת שאלה
function submitQuestion() {
    const title = document.getElementById('question-title').value.trim();
    const content = document.getElementById('question-content').value.trim();
    if (!title || !content) {
        showNotification('אנא מלאי את כל השדות');
        return;
    }
    const newPost = {
        id: Date.now(),
        title: title,
        content: content,
        answers: [],
        date: new Date().toLocaleDateString('he-IL')
    };
    currentForumPosts.unshift(newPost);
    renderForumPosts();
    hideQuestionForm();
    saveDataToStorage();
    showNotification('שאלה פורסמה בהצלחה!');
}

function renderForumPosts() {
    const container = document.getElementById('forum-posts');
    if (!container) return;
    if (currentForumPosts.length === 0) {
        container.innerHTML = '<div class="no-results">עדיין אין שאלות בפורום. היי הראשונה לשאול!</div>';
        return;
    }
    container.innerHTML = currentForumPosts.map(post => `
        <div class="forum-post">
            <h3>${post.title}</h3>
            <div class="forum-post-content">${post.content}</div>
            <small>פורסם ב: ${post.date}</small>
            <div class="forum-answers">
                ${post.answers.map(answer => `<div class="forum-answer">${answer}</div>`).join('')}
                <div class="add-answer">
                    <input type="text" placeholder="כתבי תשובה..." data-post-id="${post.id}">
                    <button onclick="addAnswer(${post.id})">שלחי</button>
                </div>
            </div>
        </div>
    `).join('');
}

function addAnswer(postId) {
    const input = document.querySelector(`input[data-post-id="${postId}"]`);
    const answer = input.value.trim();
    if (answer) {
        const post = currentForumPosts.find(p => p.id === postId);
        if (post) {
            post.answers.push(answer);
            input.value = '';
            renderForumPosts();
            saveDataToStorage();
            showNotification('תשובה נוספה בהצלחה!');
        }
    }
}

function renderTzniutQuotes() {
    const container = document.getElementById('tzniut-quotes');
    if (!container) return;
    container.innerHTML = currentQuotes.map(quote => `
        <div class="quote-card">
            <div class="quote-text">"${quote.text}"</div>
            <div class="quote-author">— ${quote.author}</div>
            <div class="quote-comments">
                ${quote.comments.map(comment => `<div class="quote-comment">${comment}</div>`).join('')}
                <div class="add-quote-comment">
                    <input type="text" placeholder="הוסיפי תגובה..." data-quote-id="${quote.id}">
                    <button onclick="addQuoteComment(${quote.id})">שלחי</button>
                </div>
            </div>
        </div


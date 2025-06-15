async function extractMetadataFromUrl(url) {
    try {
        // שימוש ב-CORS proxy
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        if (data.contents) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            
            // חילוץ שם המוצר
            let productName = '';
            
            // נסה למצוא כותרת
            const title = doc.querySelector('title');
            if (title) {
                productName = title.textContent.trim();
            }
            
            // נסה Open Graph title
            const ogTitle = doc.querySelector('meta[property="og:title"]');
            if (ogTitle && !productName) {
                productName = ogTitle.getAttribute('content');
            }
            
            // חילוץ תמונה
            let productImage = '';
            
            // נסה Open Graph image
            const ogImage = doc.querySelector('meta[property="og:image"]');
            if (ogImage) {
                productImage = ogImage.getAttribute('content');
            }
            
            // נסה תמונה ראשונה
            if (!productImage) {
                const firstImg = doc.querySelector('img[src]');
                if (firstImg) {
                    productImage = firstImg.getAttribute('src');
                }
            }
            
            return {
                name: productName || 'בגד ללא שם',
                image: productImage || generatePlaceholderImage(),
                description: extractDescription(doc) || ''
            };
        }
    } catch (error) {
        console.log('לא ניתן לחלץ מידע מהקישור:', error);
    }
    
    return {
        name: 'בגד ללא שם',
        image: generatePlaceholderImage(),
        description: ''
    };
}

function extractDescription(doc) {
    // נסה meta description
    const metaDesc = doc.querySelector('meta[name="description"]');
    if (metaDesc) {
        return metaDesc.getAttribute('content');
    }
    
    // נסה Open Graph description
    const ogDesc = doc.querySelector('meta[property="og:description"]');
    if (ogDesc) {
        return ogDesc.getAttribute('content');
    }
    
    return '';
}
async function handleItemUpload(e) {
    e.preventDefault();
    
    const url = document.getElementById('itemUrl').value;
    
    // הצגת הודעת טעינה
    showNotification('מחלץ מידע מהקישור...', 'info');
    
    // חילוץ מידע מהקישור
    const metadata = await extractMetadataFromUrl(url);
    
    const formData = {
        url: url,
        name: metadata.name,
        image: metadata.image,
        description: metadata.description || document.getElementById('itemDescription').value,
        sleeveLength: document.getElementById('sleeveLength').value,
        skirtLength: document.getElementById('skirtLength').value,
        collarType: document.getElementById('collarType').value,
        hasPockets: document.getElementById('hasPockets').checked,
        rating: 0,
        comments: [],
        id: Date.now()
    };
    
    items.push(formData);
    renderItems();
    closeUploadForm();
    
    showNotification(`בגד "${formData.name}" נוסף בהצלחה!`, 'success');
}


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
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (fontSizeToggle) {
        fontSizeToggle.addEventListener('click', toggleFontSize);
    }
    
    if (contrastToggle) {
        contrastToggle.addEventListener('click', toggleContrast);
    }
    
    // כפתורי ניווט
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // כפתורי פעולה בעמוד הבית
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
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });
    
    // פורום
    const askQuestionBtn = document.getElementById('ask-question-btn');
    const submitQuestionBtn = document.getElementById('submit-question-btn');
    const cancelQuestionBtn = document.getElementById('cancel-question-btn');
    
    if (askQuestionBtn) {
        askQuestionBtn.addEventListener('click', showQuestionForm);
    }
    
    if (submitQuestionBtn) {
        submitQuestionBtn.addEventListener('click', submitQuestion);
    }
    
    if (cancelQuestionBtn) {
        cancelQuestionBtn.addEventListener('click', hideQuestionForm);
    }
}

// נגישות - החלפת ערכת נושא
function toggleTheme() {
    const currentTheme = document.body.dataset.theme || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.dataset.theme = newTheme;
    
    // עדכון סמל הכפתור
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.textContent = newTheme === 'light' ? '⏾' : '✹';
    }
    
    // שמירה ב-localStorage
    localStorage.setItem('theme', newTheme);
    
    showNotification(`מעבר למצב ${newTheme === 'light' ? 'בהיר' : 'כהה'}`);
}

// נגישות - שינוי גודל טקסט
function toggleFontSize() {
    const sizes = ['normal', 'small', 'large', 'extra-large'];
    const currentSize = document.body.dataset.fontSize || 'normal';
    const currentIndex = sizes.indexOf(currentSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const newSize = sizes[nextIndex];
    
    document.body.dataset.fontSize = newSize;
    
    // שמירה ב-localStorage
    localStorage.setItem('fontSize', newSize);
    
    showNotification(`גודל טקסט: ${getSizeLabel(newSize)}`);
}

// נגישות - החלפת ניגודיות
function toggleContrast() {
    const currentContrast = document.body.dataset.contrast || 'normal';
    const newContrast = currentContrast === 'normal' ? 'high' : 'normal';
    
    document.body.dataset.contrast = newContrast;
    
    // שמירה ב-localStorage
    localStorage.setItem('contrast', newContrast);
    
    showNotification(`ניגודיות ${newContrast === 'high' ? 'גבוהה' : 'רגילה'}`);
}

// טעינת הגדרות משתמש
function loadUserSettings() {
    const theme = localStorage.getItem('theme') || 'light';
    const fontSize = localStorage.getItem('fontSize') || 'normal';
    const contrast = localStorage.getItem('contrast') || 'normal';
    
    document.body.dataset.theme = theme;
    document.body.dataset.fontSize = fontSize;
    document.body.dataset.contrast = contrast;
    
    // עדכון כפתור הערכת נושא
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.textContent = theme === 'light' ? '⏾' : '✹';
    }
}

// מעבר בין טאבים
function switchTab(tabId) {
    // הסרת active מכל הטאבים
    const tabs = document.querySelectorAll('.tab-content');
    const navBtns = document.querySelectorAll('.nav-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    // הוספת active לטאב הנוכחי
    const targetTab = document.getElementById(tabId);
    const targetNavBtn = document.querySelector(`[data-tab="${tabId}"]`);
    
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (targetNavBtn) {
        targetNavBtn.classList.add('active');
    }
    
    // טעינת תוכן ספציפי לטאב
    loadTabContent(tabId);
}

// טעינת תוכן לפי טאב
function loadTabContent(tabId) {
    switch(tabId) {
        case 'gallery':
            renderItems();
            break;
        case 'forum':
            renderForumPosts();
            break;
        case 'tzniut-forum':
            renderTzniutQuotes();
            break;
    }
}

// טעינת תוכן ראשוני
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
    
    // הוספת event listeners לכוכבים
    setupStarRatings();
}

// יצירת כוכבי דירוג
function generateStars(rating, itemId) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        const active = i <= rating ? 'active' : '';
        stars += `<span class="star ${active}" data-rating="${i}" data-item-id="${itemId}">★</span>`;
    }
    return stars;
}

// הגדרת event listeners לכוכבים
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

// עדכון דירוג פריט
function updateItemRating(itemId, rating) {
    const item = currentItems.find(i => i.id === itemId);
    if (item) {
        item.rating = rating;
        renderItems();
        saveDataToStorage();
        showNotification('דירוג נשמר בהצלחה!');
    }
}

// הוספת תגובה
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

// סינון פריטים
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
    
    // איפוס הטופס
    document.getElementById('add-item-form').reset();
    
    // שמירה ב-localStorage
    saveDataToStorage();
    
    // מעבר לגלריה
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
        // איפוס הטופס
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

// רינדור פוסטי פורום
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

// הוספת תשובה לפורום
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

// רינדור ציטוטי צניעות
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
        </div>
    `).join('');
}

// הוספת תגובה לציטוט
function addQuoteComment(quoteId) {
    const input = document.querySelector(`input[data-quote-id="${quoteId}"]`);
    const comment = input.value.trim();
    
    if (comment) {
        const quote = currentQuotes.find(q => q.id === quoteId);
        if (quote) {
            quote.comments.push(comment);
            input.value = '';
            renderTzniutQuotes();
            saveDataToStorage();
            showNotification('תגובה נוספה בהצלחה!');
        }
    }
}

// פונקציות עזר
function getHebrewValue(type, value) {
    const translations = {
        sleeve: {
            'long': 'ארוך',
            '3quarter': '3/4',
            'short': 'קצר',
            'none': 'ללא שרוולים'
        },
        skirt: {
            'long': 'ארוכה',
            'midi': 'מידי',
            'short': 'קצרה',
            'none': 'ללא'
        },
        collar: {
            'high': 'גבוה',
            'round': 'עגול',
            'v': 'וי',
            'none': 'ללא'
        }
    };
    
    return translations[type][value] || value;
}

function getSizeLabel(size) {
    const labels = {
        'small': 'קטן',
        'normal': 'רגיל',
        'large': 'גדול',
        'extra-large': 'גדול מאוד'
    };
    return labels[size] || 'רגיל';
}

// הצגת הודעות מערכת
function showNotification(message) {
    // הסרת הודעות קיימות
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    // יצירת הודעה חדשה
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // הסרה אוטומטית אחרי 3 שניות
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// שמירת נתונים ב-localStorage
function saveDataToStorage() {
    localStorage.setItem('tzanuot-items', JSON.stringify(currentItems));
    localStorage.setItem('tzanuot-forum-posts', JSON.stringify(currentForumPosts));
    localStorage.setItem('tzanuot-quotes', JSON.stringify(currentQuotes));
}

// טעינת נתונים מ-localStorage
function loadDataFromStorage() {
    const savedItems = localStorage.getItem('tzanuot-items');
    const savedPosts = localStorage.getItem('tzanuot-forum-posts');
    const savedQuotes = localStorage.getItem('tzanuot-quotes');
    
    if (savedItems) {
        currentItems = JSON.parse(savedItems);
    }
    
    if (savedPosts) {
        currentForumPosts = JSON.parse(savedPosts);
    }
    
    if (savedQuotes) {
        currentQuotes = JSON.parse(savedQuotes);
    }
    
    // רינדור התוכן המעודכן
    renderItems();
    renderForumPosts();
    renderTzniutQuotes();
}

// keyboard shortcuts לנגישות
document.addEventListener('keydown', function(e) {
    if (e.altKey) {
        switch(e.key) {
            case 'd':
            case 'ד':
                e.preventDefault();
                toggleTheme();
                break;
            case 't':
            case 'ת':
                e.preventDefault();
                toggleFontSize();
                break;
            case 'c':
            case 'ג':
                e.preventDefault();
                toggleContrast();
                break;
            case '1':
                e.preventDefault();
                switchTab('home');
                break;
            case '2':
                e.preventDefault();
                switchTab('gallery');
                break;
            case '3':
                e.preventDefault();
                switchTab('add-item');
                break;
            case '4':
                e.preventDefault();
                switchTab('forum');
                break;
            case '5':
                e.preventDefault();
                switchTab('tzniut-forum');
                break;
            case '6':
                e.preventDefault();
                switchTab('about');
                break;
        }
    }
});

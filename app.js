
// מערכים ריקים - אין דמו
let currentItems = [];
let currentForumPosts = [];
let currentQuotes = [];

// זמן התחלת מילוי טופס (להגנה על ספאם)
let formStartTime = Date.now();

// אתחול האפליקציה
// ... existing code ...

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();

    // כאן להכניס את קוד השדות הדינמיים:
    const dynamicFields = document.getElementById('dynamic-fields');
    document.getElementById('item-type').addEventListener('change', function() {
      const type = this.value;
      let html = '';
      if (type === 'dress') {
        html = `
          <label>אורך שרוול:
            <select id="sleeve-length" required>
              <option value="">בחרי</option>
              <option value="long">ארוך</option>
              <option value="3quarter">3/4</option>
              <option value="short">קצר</option>
            </select>
          </label>
          <label>אורך חצאית:
            <select id="skirt-length" required>
              <option value="">בחרי</option>
              <option value="long">ארוכה</option>
              <option value="midi">מידי</option>
              <option value="short">קצרה</option>
            </select>
          </label>
          <label>סוג צווארון:
            <select id="collar-type" required>
              <option value="">בחרי</option>
              <option value="high">גבוה</option>
              <option value="round">עגול</option>
              <option value="v">וי</option>
            </select>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="has-pockets"> יש כיסים
          </label>
        `;
      } else if (type === 'skirt') {
        html = `
          <label>אורך חצאית:
            <select id="skirt-length" required>
              <option value="">בחרי</option>
              <option value="long">ארוכה</option>
              <option value="midi">מידי</option>
              <option value="short">קצרה</option>
            </select>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="has-slit"> יש שסע
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="has-pockets"> יש כיסים
          </label>
        `;
      } else if (type === 'shirt') {
        html = `
          <label>אורך שרוול:
            <select id="sleeve-length" required>
              <option value="">בחרי</option>
              <option value="long">ארוך</option>
              <option value="3quarter">3/4</option>
              <option value="short">קצר</option>
            </select>
          </label>
          <label>סוג צווארון:
            <select id="collar-type" required>
              <option value="">בחרי</option>
              <option value="high">גבוה</option>
              <option value="round">עגול</option>
              <option value="v">וי</option>
            </select>
          </label>
          <label>אורך חולצה:
            <select id="shirt-length" required>
              <option value="">בחרי</option>
              <option value="long">ארוכה</option>
              <option value="regular">רגילה</option>
              <option value="short">קצרה</option>
            </select>
          </label>
        `;
      }
      dynamicFields.innerHTML = html;
    });
});

// ----------------- נגישות -----------------
function setupEventListeners() {
    // כפתורי נגישות
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('font-size-toggle')?.addEventListener('click', toggleFontSize);
    document.getElementById('contrast-toggle')?.addEventListener('click', toggleContrast);

    // ניווט
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // טפסים
    document.getElementById('add-item-form')?.addEventListener('submit', handleAddItem);
    document.getElementById('ask-question-btn')?.addEventListener('click', showQuestionForm);
    document.getElementById('ask-question-form')?.addEventListener('submit', handleQuestionSubmit);

    // מסננים
    ['sleeve-filter', 'skirt-filter', 'collar-filter', 'pockets-filter'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', applyFilters);
    });
}

function toggleTheme() {
    const current = document.body.dataset.theme || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = next;
    document.getElementById('theme-toggle').textContent = next === 'light' ? '⏾' : '✹';
    localStorage.setItem('theme', next);
    if (current === 'dark' && next === 'light') animateLightTransition();
}

function animateLightTransition() {
    const el = document.getElementById('let-there-be-light');
    if (!el) return;
    el.style.display = 'block';
    el.classList.remove('animate');
    void el.offsetWidth; // force reflow
    el.classList.add('animate');
    setTimeout(() => {
        el.classList.remove('animate');
        el.style.display = 'none';
    }, 1600);
}

function toggleFontSize() {
    const sizes = ['normal', 'small', 'large', 'extra-large'];
    const current = document.body.dataset.fontSize || 'normal';
    const idx = sizes.indexOf(current);
    const next = sizes[(idx + 1) % sizes.length];
    document.body.dataset.fontSize = next;
    localStorage.setItem('fontSize', next);
    showNotification(`גודל טקסט: ${getSizeLabel(next)}`);
}

function toggleContrast() {
    const current = document.body.dataset.contrast || 'normal';
    const next = current === 'normal' ? 'high' : 'normal';
    document.body.dataset.contrast = next;
    localStorage.setItem('contrast', next);
    showNotification(`ניגודיות ${next === 'high' ? 'גבוהה' : 'רגילה'}`);
}

function loadUserSettings() {
    const theme = localStorage.getItem('theme') || 'light';
    const fontSize = localStorage.getItem('fontSize') || 'normal';
    const contrast = localStorage.getItem('contrast') || 'normal';
    document.body.dataset.theme = theme;
    document.body.dataset.fontSize = fontSize;
    document.body.dataset.contrast = contrast;
    document.getElementById('theme-toggle').textContent = theme === 'light' ? '⏾' : '✹';
}

// ----------------- ניווט -----------------
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
    if (tabId === 'gallery') renderItems();
    if (tabId === 'forum') renderForumPosts();
    if (tabId === 'tzniut-forum') renderTzniutQuotes();
}

// ----------------- גלריה -----------------
function renderItems(itemsToRender = currentItems) {
    const grid = document.getElementById('items-grid');
    if (!grid) return;
    if (itemsToRender.length === 0) {
        grid.innerHTML = '<div class="no-results">לא נמצאו פריטים - הוסיפי את הבגד הראשון!</div>';
        return;
    }
    grid.innerHTML = itemsToRender.map(item => `
        <div class="item-card">
            <div class="item-title">${item.title || 'בגד ללא שם'}</div>
            <div class="item-details">
                <span class="item-tag">שרוולים: ${getHebrewValue('sleeve', item.sleeve_length)}</span>
                <span class="item-tag">חצאית: ${getHebrewValue('skirt', item.skirt_length)}</span>
                <span class="item-tag">צווארון: ${getHebrewValue('collar', item.collar_type)}</span>
                ${item.has_pockets ? '<span class="item-tag">✓ כיסים</span>' : ''}
            </div>
            <div class="item-rating" data-item-id="${item.id}">
                ${generateStars(item.rating || 0, item.id)}
            </div>
            <div class="item-comments">
                ${(item.comments || []).map(comment => `<div class="comment">${comment}</div>`).join('')}
                <div class="add-comment">
                    <input type="text" placeholder="הוסיפי הערה..." data-item-id="${item.id}">
                    <button onclick="addComment(${item.id})">שלחי</button>
                </div>
            </div>
            ${item.url ? `<a href="${item.url}" target="_blank" class="btn btn-primary" style="margin-top: 15px;">צפי באתר המקורי</a>` : ''}
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
    document.querySelectorAll('.star').forEach(star => {
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
            if (!item.comments) item.comments = [];
            item.comments.push(comment);
            input.value = '';
            renderItems();
            saveDataToStorage();
            showNotification('הערה נוספה בהצלחה!');
        }
    }
}

function applyFilters() {
    const sleeveFilter = document.getElementById('sleeve-filter')?.value;
    const skirtFilter = document.getElementById('skirt-filter')?.value;
    const collarFilter = document.getElementById('collar-filter')?.value;
    const pocketsFilter = document.getElementById('pockets-filter')?.value;
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
}

// ----------------- טופס הוספת בגד -----------------
async function handleAddItem(e) {
    e.preventDefault();
    if (!validateFormSecurity('item')) return;
    const formData = {
        title: document.getElementById('item-title').value.trim(),
        url: document.getElementById('item-url').value.trim(),
        sleeve_length: document.getElementById('sleeve-length').value,
        skirt_length: document.getElementById('skirt-length').value,
        collar_type: document.getElementById('collar-type').value,
        has_pockets: document.getElementById('has-pockets').checked,
        description: document.getElementById('item-description').value.trim(),
        rating: 0,
        comments: [],
        created: new Date().toISOString()
    };
    await window.addClothToFirestore(formData); // שמירה ב-Firebase
    document.getElementById('add-item-form').reset();
    setupCaptcha();
    formStartTime = Date.now();
    switchTab('gallery');
    showNotification('בגד נוסף בהצלחה!');
}

// ----------------- פורום -----------------
function showQuestionForm() {
    document.getElementById('ask-question-form').style.display = 'block';
    setupCaptcha();
    formStartTime = Date.now();
}

function hideQuestionForm() {
    document.getElementById('ask-question-form').style.display = 'none';
    document.getElementById('question-title').value = '';
    document.getElementById('question-content').value = '';
}

function handleQuestionSubmit(e) {
    e.preventDefault();
    if (!validateFormSecurity('question')) return;
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

// ----------------- פורום צניעות -----------------
function renderTzniutQuotes() {
    const container = document.getElementById('tzniut-quotes');
    if (!container) return;
    if (currentQuotes.length === 0) {
        container.innerHTML = '<div class="no-results">עדיין אין ציטוטים בפורום. הוסיפי את הראשון!</div>';
        return;
    }
    container.innerHTML = currentQuotes.map(quote => `
        <div class="quote-card">
            <div class="quote-text">"${quote.text}"</div>
            <div class="quote-author">— ${quote.author}</div>
            ${quote.source ? `<small style="color: var(--text-muted);">${quote.source}</small>` : ''}
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

// ----------------- עזר -----------------
function getHebrewValue(type, value) {
    const translations = {
        sleeve: { 'long': 'ארוך', '3quarter': '3/4', 'short': 'קצר', 'none': 'ללא' },
        skirt: { 'long': 'ארוכה', 'midi': 'מידי', 'short': 'קצרה', 'none': 'ללא' },
        collar: { 'high': 'גבוה', 'round': 'עגול', 'v': 'וי', 'none': 'ללא' }
    };
    return translations[type]?.[value] || value;
}

function getSizeLabel(size) {
    return { 'small': 'קטן', 'normal': 'רגיל', 'large': 'גדול', 'extra-large': 'גדול מאוד' }[size] || 'רגיל';
}

function showNotification(message) {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ----------------- שמירת נתונים -----------------
function saveDataToStorage() {
    try {
        localStorage.setItem('tzanuot-items', JSON.stringify(currentItems));
        localStorage.setItem('tzanuot-forum-posts', JSON.stringify(currentForumPosts));
        localStorage.setItem('tzanuot-quotes', JSON.stringify(currentQuotes));
    } catch (error) {
        console.error('שגיאה בשמירת הנתונים:', error);
    }
}

function loadDataFromStorage() {
    try {
        const savedItems = localStorage.getItem('tzanuot-items');
        const savedPosts = localStorage.getItem('tzanuot-forum-posts');
        const savedQuotes = localStorage.getItem('tzanuot-quotes');
        if (savedItems) currentItems = JSON.parse(savedItems);
        if (savedPosts) currentForumPosts = JSON.parse(savedPosts);
        if (savedQuotes) currentQuotes = JSON.parse(savedQuotes);
        renderItems();
        renderForumPosts();
        renderTzniutQuotes();
    } catch (error) {
        console.error('שגיאה בטעינת הנתונים:', error);
        showNotification('שגיאה בטעינת הנתונים השמורים');
    }
}

// ----------------- קאפצ'ה והגנת בוטים -----------------
function setupCaptcha() {
    generateCaptcha('captcha-question', 'captcha-answer');
    generateCaptcha('question-captcha-question', 'question-captcha-answer');
}

function generateCaptcha(questionElementId, answerElementId) {
    const questionElement = document.getElementById(questionElementId);
    const answerElement = document.getElementById(answerElementId);
    if (!questionElement || !answerElement) return;
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    let question, answer;
    if (operation === '+') {
        question = `${num1} + ${num2} = ?`;
        answer = num1 + num2;
    } else {
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        question = `${larger} - ${smaller} = ?`;
        answer = larger - smaller;
    }
    questionElement.textContent = question;
    questionElement.dataset.answer = answer;
    answerElement.value = '';
}

function validateCaptcha(questionElementId, answerElementId) {
    const questionElement = document.getElementById(questionElementId);
    const answerElement = document.getElementById(answerElementId);
    if (!questionElement || !answerElement) return false;
    const correctAnswer = parseInt(questionElement.dataset.answer);
    const userAnswer = parseInt(answerElement.value);
    return correctAnswer === userAnswer;
}

function validateFormSecurity(formType = 'item') {
    // Honeypot
    const websiteField = document.getElementById('website');
    if (websiteField && websiteField.value) {
        showNotification('שגיאה בשליחה. אנא נסי שוב.');
        return false;
    }
    // זמן מילוי טופס
    if (Date.now() - formStartTime < 3000) {
        showNotification('אנא המתיני מספר שניות לפני השליחה.');
        return false;
    }
    // קאפצ'ה
    const questionId = formType === 'item' ? 'captcha-question' : 'question-captcha-question';
    const answerId = formType === 'item' ? 'captcha-answer' : 'question-captcha-answer';
    if (!validateCaptcha(questionId, answerId)) {
        showNotification('תשובה שגויה לבעיה המתמטית. נסי שוב.');
        setupCaptcha();
        return false;
    }
    return true;
}
document.getElementById('item-url').addEventListener('blur', function() {
// הכניסי את ה-API Key שלך כאן
const apiKey = "4ec38ad480e0da088c7beb21717f99ef";

// פונקציה שמופעלת כאשר המשתמשת מסיימת להקליד קישור
document.getElementById('item-url').addEventListener('blur', function() {
  const urlToPreview = this.value.trim();
  if (!urlToPreview) return;

  fetch(`https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(urlToPreview)}`)
    .then(response => response.json())
    .then(data => {
      // שם הבגד (כותרת)
      if (data.title) document.getElementById('item-title').value = data.title;
      // תיאור
      if (data.description) document.getElementById('item-description').value = data.description;
      // תמונה
      if (data.image) {
        // אם יש שדה תמונה בטופס (input type="url" או img לתצוגה)
        const imgField = document.getElementById('item-image');
        if (imgField) imgField.value = data.image; // אם זה input
        // או להציג preview:
        const imgPreview = document.getElementById('item-image-preview');
        if (imgPreview) imgPreview.src = data.image;
      }
      // מחיר וטווח מידות – נסה לאתר בתיאור (לא תמיד קיים)
      if (data.description) {
        // דוגמה פשוטה: נסה לאתר מחיר בתיאור
        const priceMatch = data.description.match(/(\d{2,5}(\.\d{1,2})?)\s*₪/);
        if (priceMatch && document.getElementById('item-price')) {
          document.getElementById('item-price').value = priceMatch[1];
        }
        // דוגמה: נסה לאתר טווח מידות (למשל "מידות S-XL")
        const sizeMatch = data.description.match(/מיד[ו|ה]ת?\s*[:\-]?\s*([A-Za-z0-9\-–, ]+)/i);
        if (sizeMatch && document.getElementById('item-sizes')) {
          document.getElementById('item-sizes').value = sizeMatch[1];
        }
      }
    })
    .catch(error => {
      console.error("שגיאה בשליפת נתונים מהקישור:", error);
    });
    <script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAFJlKA6NnRb3YA2ILxcHQiwT2Kh1LZTTc",
    authDomain: "tzanuot-website.firebaseapp.com",
    projectId: "tzanuot-website",
    storageBucket: "tzanuot-website.firebasestorage.app",
    messagingSenderId: "684808024105",
    appId: "1:684808024105:web:f890452f7e0622f73e2c38",
    measurementId: "G-MNREGLH4D1"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
});

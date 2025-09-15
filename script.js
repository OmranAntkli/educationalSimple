// متغيرات عامة
let totalStars = 0;
let moduleStars = {
    quran: 0,
    writing: 0,
    reading: 0,
    coding: 0
};

let completedVerses = [];
let completedLetters = [];
let completedStories = [];
let completedLessons = [];

let currentStory = 0;
let currentLesson = 'html';

// تحميل البيانات المحفوظة
function loadProgress() {
    const saved = localStorage.getItem('learningProgress');
    if (saved) {
        const data = JSON.parse(saved);
        totalStars = data.totalStars || 0;
        moduleStars = data.moduleStars || { quran: 0, writing: 0, reading: 0, coding: 0 };
        completedVerses = data.completedVerses || [];
        completedLetters = data.completedLetters || [];
        completedStories = data.completedStories || [];
        completedLessons = data.completedLessons || [];
    }
    updateStarsDisplay();
}

// حفظ التقدم
function saveProgress() {
    const data = {
        totalStars,
        moduleStars,
        completedVerses,
        completedLetters,
        completedStories,
        completedLessons
    };
    localStorage.setItem('learningProgress', JSON.stringify(data));
}

// تحديث عرض النجوم
function updateStarsDisplay() {
    document.getElementById('total-stars').textContent = totalStars;
    document.getElementById('quran-stars').textContent = moduleStars.quran;
    document.getElementById('writing-stars').textContent = moduleStars.writing;
    document.getElementById('reading-stars').textContent = moduleStars.reading;
    document.getElementById('coding-stars').textContent = moduleStars.coding;
}

// إضافة نجمة
function addStar(module) {
    totalStars++;
    moduleStars[module]++;
    updateStarsDisplay();
    saveProgress();
    
    // تأثير بصري للنجمة
    showStarAnimation();
}

// عرض تأثير النجمة
function showStarAnimation() {
    const star = document.createElement('div');
    star.innerHTML = '⭐';
    star.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        font-size: 3rem;
        z-index: 1000;
        animation: starPop 1s ease-out forwards;
        pointer-events: none;
    `;
    
    document.body.appendChild(star);
    
    setTimeout(() => {
        document.body.removeChild(star);
    }, 1000);
}

// إضافة CSS للتأثير
const style = document.createElement('style');
style.textContent = `
    @keyframes starPop {
        0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(1) rotate(360deg) translateY(-100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// عرض الوحدة
function showModule(module) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // عرض الصفحة المطلوبة
    if (module === 'home') {
        document.getElementById('home-page').classList.add('active');
    } else {
        document.getElementById(module + '-page').classList.add('active');
    }
    
    // تحديث الحالة حسب الوحدة
    if (module === 'quran') {
        updateQuranProgress();
    } else if (module === 'writing') {
        initWritingCanvas();
    } else if (module === 'reading') {
        updateStoryDisplay();
    } else if (module === 'coding') {
        showLesson(currentLesson);
    }
}

// === وحدة القرآن ===
function updateQuranProgress() {
    completedVerses.forEach(index => {
        const card = document.querySelector(`[data-verse="${index}"]`);
        if (card) {
            card.classList.add('completed');
            const btn = card.querySelector('.complete-btn');
            btn.textContent = '✅ تم الحفظ';
            btn.style.background = 'linear-gradient(45deg, #10b981, #059669)';
        }
    });
}

function playAudio(verseIndex) {
    // في التطبيق الحقيقي، سيتم تشغيل الصوت هنا
    const messages = [
        '🎵 يتم تشغيل تلاوة البسملة...',
        '🎵 يتم تشغيل تلاوة الحمد لله رب العالمين...',
        '🎵 يتم تشغيل تلاوة وقل رب زدني علماً...'
    ];
    
    alert(messages[verseIndex] || '🎵 يتم تشغيل التلاوة...');
}

function completeVerse(verseIndex) {
    if (!completedVerses.includes(verseIndex)) {
        completedVerses.push(verseIndex);
        addStar('quran');
        
        const card = document.querySelector(`[data-verse="${verseIndex}"]`);
        card.classList.add('completed');
        
        const btn = card.querySelector('.complete-btn');
        btn.textContent = '✅ تم الحفظ';
        btn.style.background = 'linear-gradient(45deg, #10b981, #059669)';
        
        // رسالة تهنئة
        setTimeout(() => {
            alert('🎉 أحسنت! لقد حفظت الآية بنجاح!');
        }, 500);
    }
}

// === وحدة الكتابة ===
let canvas, ctx;
let isDrawing = false;
let currentLetter = 'أ';
let currentLetterIndex = 0;

const letters = [
    { letter: 'أ', name: 'ألف' },
    { letter: 'ب', name: 'باء' },
    { letter: 'ت', name: 'تاء' },
    { letter: 'ث', name: 'ثاء' },
    { letter: 'ج', name: 'جيم' },
    { letter: 'ح', name: 'حاء' }
];

function initWritingCanvas() {
    canvas = document.getElementById('writing-canvas');
    ctx = canvas.getContext('2d');
    
    // إعداد الرسم
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // أحداث الماوس
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // أحداث اللمس للهواتف
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
    
    updateLetterProgress();
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                     e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function selectLetter(letter, name, index) {
    currentLetter = letter;
    currentLetterIndex = index;
    
    document.getElementById('current-letter').textContent = letter;
    document.getElementById('letter-name').textContent = name;
    
    // تحديث الأزرار
    document.querySelectorAll('.letter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.letter-btn')[index].classList.add('active');
    
    clearCanvas();
}

function checkWriting() {
    // في التطبيق الحقيقي، سيتم استخدام AI للتحقق من الكتابة
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let hasDrawing = false;
    
    // التحقق من وجود رسم
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] > 0) { // قناة الشفافية
            hasDrawing = true;
            break;
        }
    }
    
    if (hasDrawing) {
        if (!completedLetters.includes(currentLetterIndex)) {
            completedLetters.push(currentLetterIndex);
            addStar('writing');
            
            // تحديث زر الحرف
            const btn = document.querySelectorAll('.letter-btn')[currentLetterIndex];
            btn.style.background = 'linear-gradient(45deg, #10b981, #059669)';
            btn.style.color = 'white';
            
            alert('🎉 ممتاز! لقد كتبت الحرف بشكل جيد!');
        } else {
            alert('👍 جيد! لقد كتبت هذا الحرف من قبل.');
        }
    } else {
        alert('⚠️ يرجى كتابة الحرف أولاً!');
    }
}

function updateLetterProgress() {
    completedLetters.forEach(index => {
        const btn = document.querySelectorAll('.letter-btn')[index];
        if (btn) {
            btn.style.background = 'linear-gradient(45deg, #10b981, #059669)';
            btn.style.color = 'white';
        }
    });
}

// === وحدة القراءة ===
const stories = [
    {
        title: '🐰 الأرنب الذكي',
        text: 'كان هناك أرنب صغير ذكي يعيش في الغابة. كان يحب أن يتعلم أشياء جديدة كل يوم. في يوم من الأيام، وجد كتاباً تحت الشجرة. فتح الكتاب وبدأ يقرأ. تعلم الأرنب من الكتاب كيف يزرع الجزر ويعتني بالنباتات. أصبح الأرنب أذكى أرنب في الغابة بفضل حبه للقراءة والتعلم.',
        question: 'ماذا وجد الأرنب تحت الشجرة؟',
        answers: ['جزرة', 'كتاب', 'لعبة'],
        correct: 1
    },
    {
        title: '🌟 النجمة الصغيرة',
        text: 'في السماء البعيدة، كانت هناك نجمة صغيرة تريد أن تضيء أكثر من النجوم الأخرى. سألت النجمة الكبيرة: "كيف أصبح أكثر إضاءة؟" قالت النجمة الكبيرة: "عليك أن تتعلمي وتمارسي كل يوم." بدأت النجمة الصغيرة تتعلم وتمارس، وأصبحت أجمل نجمة في السماء.',
        question: 'ماذا أرادت النجمة الصغيرة؟',
        answers: ['أن تضيء أكثر', 'أن تنام', 'أن تلعب'],
        correct: 0
    }
];

function updateStoryDisplay() {
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach((card, index) => {
        card.classList.toggle('active', index === currentStory);
    });
    
    document.getElementById('story-counter').textContent = `${currentStory + 1} من ${stories.length}`;
    
    // تحديث أزرار التنقل
    const prevBtn = document.querySelector('.story-navigation button:first-child');
    const nextBtn = document.querySelector('.story-navigation button:last-child');
    
    prevBtn.disabled = currentStory === 0;
    nextBtn.disabled = currentStory === stories.length - 1;
}

function previousStory() {
    if (currentStory > 0) {
        currentStory--;
        updateStoryDisplay();
    }
}

function nextStory() {
    if (currentStory < stories.length - 1) {
        currentStory++;
        updateStoryDisplay();
    }
}

function checkAnswer(storyIndex, isCorrect) {
    const answerBtns = document.querySelectorAll(`[data-story="${storyIndex}"] .answer-btn`);
    
    answerBtns.forEach((btn, index) => {
        btn.disabled = true;
        if (index === stories[storyIndex].correct) {
            btn.classList.add('correct');
        } else if (btn === event.target && !isCorrect) {
            btn.classList.add('wrong');
        }
    });
    
    if (isCorrect) {
        if (!completedStories.includes(storyIndex)) {
            completedStories.push(storyIndex);
            addStar('reading');
            setTimeout(() => {
                alert('🎉 إجابة صحيحة! أحسنت!');
            }, 500);
        }
    } else {
        setTimeout(() => {
            alert('❌ إجابة خاطئة. حاول مرة أخرى!');
            // إعادة تفعيل الأزرار
            answerBtns.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('wrong');
            });
        }, 1000);
    }
}






// تحميل التقدم عند بدء التطبيق
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    
    // إعداد الأحداث
    if (document.getElementById('writing-canvas')) {
        initWritingCanvas();
    }
});

// حفظ التقدم عند إغلاق الصفحة
window.addEventListener('beforeunload', saveProgress);
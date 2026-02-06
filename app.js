document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const container = document.getElementById('verses-container');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');

    // API Configuration
    const BASE_URL = 'https://api.quran.com/api/v4';
    const TRANSLATION_ID = 20; 

    // State Management
    let verseState = {
        chapterId: null,
        surahName: '', // NEW: To store the Surah name
        totalVerses: 0,
        startVerse: 0,
        endVerse: 0
    };

    generateBtn.addEventListener('click', handleGenerate);
    prevBtn.addEventListener('click', handlePrev);
    nextBtn.addEventListener('click', handleNext);

    async function handleGenerate() {
        container.innerHTML = '';
        errorEl.classList.add('hidden');
        loadingEl.classList.remove('hidden');
        prevBtn.classList.add('hidden');
        nextBtn.classList.add('hidden');
        generateBtn.disabled = true;

        try {
            // 1. Fetch Random Ayah
            const randomData = await fetchRandomAyah();
            const mainVerseKey = randomData.verse_key;
            
            // 2. Determine Context Keys & Get Chapter Info
            const keysToFetch = await calculateContextKeys(mainVerseKey);
            
            // 3. Fetch All Verses
            const verses = await fetchVersesSafe(keysToFetch);

            // 4. Update State Ranges
            if (verses.length > 0) {
                const verseNumbers = verses.map(v => parseInt(v.verse_key.split(':')[1]));
                verseState.startVerse = Math.min(...verseNumbers);
                verseState.endVerse = Math.max(...verseNumbers);
            }

            // 5. Render
            renderVerses(verses, mainVerseKey);

            // 6. Update UI
            updateButtonUI();

        } catch (error) {
            console.error(error);
            showError('Failed to fetch content. Please check your internet connection and try again.');
        } finally {
            loadingEl.classList.add('hidden');
            generateBtn.disabled = false;
        }
    }

    // --- Button Handlers ---

    async function handlePrev() {
        if (verseState.startVerse <= 1) return;

        const newVerseNum = verseState.startVerse - 1;
        const key = `${verseState.chapterId}:${newVerseNum}`;

        prevBtn.disabled = true;
        prevBtn.textContent = 'Loading...';

        try {
            const verses = await fetchVersesSafe([key]);
            if (verses.length > 0) {
                const verse = verses[0];
                const card = createVerseCard(verse, false);
                
                // Scroll Logic
                const oldHeight = container.scrollHeight;
                const oldScrollY = window.scrollY;

                container.prepend(card);

                const newHeight = container.scrollHeight;
                window.scrollTo(0, oldScrollY + (newHeight - oldHeight));

                verseState.startVerse = newVerseNum;
                updateButtonUI();
            }
        } catch (e) {
            console.error(e);
        } finally {
            prevBtn.textContent = 'Load Previous Ayah';
        }
    }

    async function handleNext() {
        if (verseState.endVerse >= verseState.totalVerses) return;

        const newVerseNum = verseState.endVerse + 1;
        const key = `${verseState.chapterId}:${newVerseNum}`;

        nextBtn.disabled = true;
        nextBtn.textContent = 'Loading...';

        try {
            const verses = await fetchVersesSafe([key]);
            if (verses.length > 0) {
                const verse = verses[0];
                const card = createVerseCard(verse, false);
                container.appendChild(card); 

                verseState.endVerse = newVerseNum;
                updateButtonUI();
            }
        } catch (e) {
            console.error(e);
        } finally {
            nextBtn.textContent = 'Load Next Ayah';
        }
    }

    function updateButtonUI() {
        prevBtn.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
        prevBtn.disabled = verseState.startVerse <= 1;
        nextBtn.disabled = verseState.endVerse >= verseState.totalVerses;
    }

    // --- Core Logic ---

    async function fetchRandomAyah() {
        const response = await fetch(`${BASE_URL}/verses/random?translations=${TRANSLATION_ID}&fields=text_uthmani`);
        if (!response.ok) throw new Error('Failed to fetch random ayah');
        const data = await response.json();
        return data.verse;
    }

    async function calculateContextKeys(verseKey) {
        const [chapterStr, verseStr] = verseKey.split(':');
        const chapter = parseInt(chapterStr);
        const verse = parseInt(verseStr);

        // Fetch chapter info
        const chapterResponse = await fetch(`${BASE_URL}/chapters/${chapter}`);
        if (!chapterResponse.ok) throw new Error('Failed to fetch chapter info');
        const chapterData = await chapterResponse.json();
        
        // UPDATE STATE: Store name and counts
        verseState.totalVerses = chapterData.chapter.verses_count;
        verseState.chapterId = chapter;
        verseState.surahName = chapterData.chapter.name_simple; // Get "Al-Fatihah", etc.

        const keys = [];
        if (verse > 1) keys.push(`${chapter}:${verse - 1}`);
        keys.push(`${chapter}:${verse}`);
        if (verse < verseState.totalVerses) keys.push(`${chapter}:${verse + 1}`);

        return keys;
    }

    async function fetchVersesSafe(keys) {
        const promises = keys.map(async (key) => {
            const url = `${BASE_URL}/verses/by_key/${key}?translations=${TRANSLATION_ID}&fields=text_uthmani`;
            const res = await fetch(url);
            if (!res.ok) return null;
            const data = await res.json();
            return data.verse;
        });

        const results = await Promise.all(promises);
        return results.filter(v => v !== null);
    }

    // --- Render Logic ---

    function createVerseCard(verse, isMain) {
        const translation = verse.translations && verse.translations.length > 0 
            ? verse.translations[0].text 
            : 'Translation unavailable';

        // Display "Surah Al-Name 2:155"
        const headerText = `${verseState.surahName} ${verse.verse_key}`;

        const card = document.createElement('div');
        card.className = `verse-card ${isMain ? 'main-verse' : 'context-verse'}`;
        
        card.innerHTML = `
            <div class="verse-header">
                <span>${isMain ? 'Selected Ayah' : 'Context'}</span>
                <span class="badge">${headerText}</span>
            </div>
            <div class="arabic-text">
                ${verse.text_uthmani}
            </div>
            <div class="translation-text">
                ${removeFootnotes(translation)}
            </div>
        `;
        return card;
    }

    function renderVerses(verses, mainKey) {
        container.innerHTML = '';
        verses.forEach(verse => {
            const isMain = verse.verse_key === mainKey;
            const card = createVerseCard(verse, isMain);
            container.appendChild(card);
        });

        const mainCard = document.querySelector('.main-verse');
        if(mainCard) {
            mainCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function removeFootnotes(text) {
        return text.replace(/<sup.*?<\/sup>/g, '').replace(/\[\d+\]/g, '');       
    }

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
    }
});
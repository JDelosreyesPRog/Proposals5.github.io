/* Obligations & Contracts Application Logic */

let bookmarks = JSON.parse(localStorage.getItem('oblicon_saved_topics')) || [];

window.onload = function() {
    updateBookmarkButtons();
    renderSavedTopics();
    runContractCheck();
};

function switchTab(tabId, btnElement) {
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(panel => panel.classList.remove('active'));

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    btnElement.classList.add('active');

    if (tabId === 'bookmarks') {
        renderSavedTopics();
    }
}

function applyFilters() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const cards = document.querySelectorAll('.topic-card');

    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const text = card.innerText.toLowerCase();

        const matchesSearch = text.includes(query);
        const matchesCategory = (category === 'ALL' || cardCategory === category);

        if (matchesSearch && matchesCategory) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function toggleBookmark(id, title) {
    const index = bookmarks.findIndex(item => item.id === id);

    if (index === -1) {
        bookmarks.push({ id: id, title: title });
        showToast(`Saved "${title}" to Reviewer!`);
    } else {
        bookmarks.splice(index, 1);
        showToast(`Removed from Reviewer.`);
    }

    localStorage.setItem('oblicon_saved_topics', JSON.stringify(bookmarks));
    updateBookmarkButtons();
    renderSavedTopics();
}

function updateBookmarkButtons() {
    const badge = document.getElementById('bookmarkBadge');
    if (badge) badge.innerText = bookmarks.length;

    const cards = document.querySelectorAll('.topic-card');
    cards.forEach(card => {
        const id = card.getAttribute('data-id');
        const btn = card.querySelector('.bookmark-btn');
        if (btn) {
            const isSaved = bookmarks.some(item => item.id === id);
            if (isSaved) {
                btn.classList.add('saved');
                btn.querySelector('.btn-text').innerText = 'Saved';
            } else {
                btn.classList.remove('saved');
                btn.querySelector('.btn-text').innerText = 'Save';
            }
        }
    });
}

function renderSavedTopics() {
    const container = document.getElementById('savedContainer');
    if (!container) return;

    if (bookmarks.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-style: italic;">No saved topics yet. Click the "★ Save" button on any lesson card to store it here.</p>`;
        return;
    }

    let html = '<ul class="bullet-list" style="margin-left:0; list-style:none;">';
    bookmarks.forEach(item => {
        html += `
            <li style="background:#f8fafc; padding:10px 14px; border-radius:6px; margin-bottom:8px; border:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                <strong>${item.title}</strong>
                <div>
                    <button onclick="jumpToTopic('${item.id}')" style="background:var(--primary); color:#fff; border:none; padding:4px 10px; border-radius:4px; font-size:0.8rem; cursor:pointer; margin-right:6px;">View Lesson</button>
                    <button onclick="toggleBookmark('${item.id}', '${item.title}')" style="background:#fee2e2; color:#991b1b; border:none; padding:4px 10px; border-radius:4px; font-size:0.8rem; cursor:pointer;">Remove</button>
                </div>
            </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
}

function jumpToTopic(id) {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
        switchTab('lessons', document.querySelector('.nav-item'));
        card.scrollIntoView({ behavior: 'smooth' });
    }
}

function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

function runContractCheck() {
    const consent = document.getElementById('valConsent').value;
    const object = document.getElementById('valObject').value;
    const cause = document.getElementById('valCause').value;
    const lesion = document.getElementById('valLesion').value;

    const titleElem = document.getElementById('resultTitle');
    const descElem = document.getElementById('resultDesc');
    const box = document.getElementById('checkerResultDisplay');

    if (!titleElem || !descElem || !box) return;

    if (object === 'illegal' || object === 'impossible' || cause === 'false' || cause === 'absent' || consent === 'none') {
        box.style.borderLeftColor = '#ef4444';
        titleElem.style.color = '#dc2626';
        titleElem.innerText = 'Status: VOID / INEXISTENT CONTRACT (Art. 1409)';
        descElem.innerText = 'This contract produces NO legal effect whatsoever from the beginning. It cannot be ratified or enforced in court because the cause/object is illegal or consent is completely absent.';
        return;
    }

    if (consent === 'minor' && object === 'impossible') {
        box.style.borderLeftColor = '#8b5cf6';
        titleElem.style.color = '#7c3aed';
        titleElem.innerText = 'Status: UNENFORCEABLE CONTRACT';
        descElem.innerText = 'Cannot be enforced in court unless ratified by legal guardians or proper authority.';
        return;
    }

    if (consent === 'vitiated' || consent === 'minor') {
        box.style.borderLeftColor = '#3b82f6';
        titleElem.style.color = '#2563eb';
        titleElem.innerText = 'Status: VOIDABLE CONTRACT (Art. 1390)';
        descElem.innerText = 'The contract is VALID and binding until annulled by a court of law. It can be ratified to clean the defect.';
        return;
    }

    if (lesion !== 'none') {
        box.style.borderLeftColor = '#f59e0b';
        titleElem.style.color = '#d97706';
        titleElem.innerText = 'Status: RESCISSIBLE CONTRACT (Art. 1381)';
        descElem.innerText = 'Valid and binding, but may be rescinded due to economic damage (lesion) or intent to defraud creditors.';
        return;
    }

    box.style.borderLeftColor = 'var(--primary)';
    titleElem.style.color = 'var(--primary)';
    titleElem.innerText = 'Status: VALID & BINDING CONTRACT (Art. 1318)';
    descElem.innerText = 'All essential requisites (Consent, Object Certain, and Cause) are fully satisfied without defects. The contract has the force of law between the contracting parties.';
}

function evaluateQuiz() {
    const questions = document.querySelectorAll('.quiz-question');
    let score = 0;
    const total = questions.length;

    questions.forEach(q => {
        const qNum = q.getAttribute('data-q');
        const correctAnswer = q.getAttribute('data-correct');
        const selected = document.querySelector(`input[name="q${qNum}"]:checked`);
        const expBox = q.querySelector('.quiz-explanation');

        expBox.classList.add('show');

        if (selected && selected.value === correctAnswer) {
            score++;
            expBox.className = 'quiz-explanation show correct';
        } else {
            expBox.className = 'quiz-explanation show incorrect';
        }
    });

    const banner = document.getElementById('scoreBanner');
    banner.style.display = 'block';

    if (score >= 6) {
        banner.style.backgroundColor = '#dcfce7';
        banner.style.color = '#166534';
        banner.innerText = `🎉 High Score: ${score} / ${total}! Excellent grasp of Obligations & Contracts.`;
    } else {
        banner.style.backgroundColor = '#fee2e2';
        banner.style.color = '#991b1b';
        banner.innerText = `Score: ${score} / ${total}. Review the lesson topics and flashcards to improve your score!`;
    }

    banner.scrollIntoView({ behavior: 'smooth' });
}

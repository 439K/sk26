// ==========================================
// 1. グローバル変数の定義
// ==========================================
let audioContext = null;
let audioBuffers = [];
let currentSurveyData = null;
let currentTrackIndex = 0;
let currentSource = null;
let currentGainNode = null;
let currentTrackStartTime = 0; 
let currentTrackOffset = 0;    
let isAllAnswered = false;     
let surveyResults = [];
let animationFrameId = null;

// ==========================================
// 共通処理：カラー変換ツール（HEX -> RGBA）
// ==========================================
function hexToRgba(hex, alpha) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ==========================================
// 共通処理：一時停止/再生ボタンのUI更新
// ==========================================
function updatePlayPauseBtnUI(isPaused) {
    const btn = document.getElementById('play-pause-btn');
    if (!btn) return;
    
    const themeColor = (currentSurveyData && currentSurveyData.themeColor) ? currentSurveyData.themeColor : '#0d6efd';

    if (isPaused) {
        btn.innerHTML = '<i class="bi bi-play-fill"></i> 再生';
        btn.className = 'btn btn-lg px-5 py-3 fs-3 mt-4 rounded-pill shadow-sm text-white fw-bold';
        btn.style.backgroundColor = themeColor;
        btn.style.borderColor = themeColor;
        btn.style.color = '#fff';
    } else {
        btn.innerHTML = '<i class="bi bi-pause-fill"></i> 一時停止';
        btn.className = 'btn btn-lg px-5 py-3 fs-3 mt-4 rounded-pill shadow-sm fw-bold';
        btn.style.backgroundColor = '#fff';
        btn.style.borderColor = themeColor;
        btn.style.color = themeColor;
    }
}

// ==========================================
// 共通処理：オーディオとUIの完全停止
// ==========================================
function stopAllAudio() {
    if (currentSource) {
        currentSource.stop();
        currentSource = null;
        currentGainNode = null;
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    updatePlayPauseBtnUI(false);
}

// ==========================================
// 2. 画面遷移（SPAルーティング）機能
// ==========================================
function showSection(sectionId) {
    if (sectionId === 'home-section') {
        stopAllAudio();
        renderHome();
        document.body.style.backgroundColor = '#f8f9fa';
    }
    document.getElementById('home-section').classList.add('d-none');
    document.getElementById('survey-section').classList.add('d-none');
    document.getElementById(sectionId).classList.remove('d-none');
}

// ==========================================
// 3. トップ画面（ホーム）の描画処理
// ==========================================
function renderHome() {
    const container = document.getElementById('survey-list-container');
    container.innerHTML = '';

    const completedSurveys = JSON.parse(localStorage.getItem('completedSurveys')) || [];

    appData.surveys.forEach(survey => {
        const isCompleted = completedSurveys.includes(survey.id);
        const overlayHtml = isCompleted ? `<div class="completed-overlay">✅</div>` : '';
        
        const themeColor = survey.themeColor || '#0d6efd';

        const cardHtml = `
            <div class="col-md-6 mb-4">
                <div class="card survey-card h-100 text-center p-4 shadow-sm border-0" style="border-top: 6px solid ${themeColor} !important;" onclick="initSurvey('${survey.id}')">
                    ${overlayHtml}
                    <div class="survey-icon mb-3 fs-1">${survey.icon}</div>
                    <h4 class="card-title fw-bold" style="color: ${themeColor};">${survey.title}</h4>
                    <p class="text-muted mt-2 mb-0">${survey.tracks.length}曲 / ${survey.questions.length}項目</p>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// ==========================================
// 4. 調査の初期化とUI準備
// ==========================================
function initSurvey(surveyId) {
    currentSurveyData = appData.surveys.find(s => s.id === surveyId);
    
    currentTrackIndex = 0;
    surveyResults = [];
    audioBuffers = [];
    isAllAnswered = false;
    
    stopAllAudio(); 

    const themeColor = currentSurveyData.themeColor || '#0d6efd';
    document.documentElement.style.setProperty('--theme-color', themeColor);
    document.documentElement.style.setProperty('--theme-color-transparent', hexToRgba(themeColor, 0.5));
    
    document.body.style.backgroundColor = hexToRgba(themeColor, 0.08);

    document.getElementById('progress-bar').style.backgroundColor = themeColor;
    document.getElementById('current-survey-title').style.color = themeColor;
    document.getElementById('current-beat-text').style.color = themeColor;
    
    document.getElementById('current-survey-title').innerText = currentSurveyData.title;
    document.getElementById('info-total-tracks').innerText = currentSurveyData.tracks.length;
    document.getElementById('info-total-questions').innerText = currentSurveyData.questions.length;
    
    let totalLockSeconds = 0;
    currentSurveyData.tracks.forEach(track => {
        const secPerBeat = 60 / track.bpm;
        const reqBeats = track.requiredBeats || track.beatCount;
        totalLockSeconds += (reqBeats * secPerBeat);
    });
    
    const qCount = currentSurveyData.questions.length;
    const multiplier = 1 + (qCount * 0.1);
    const estimatedTotalSeconds = totalLockSeconds * multiplier;
    
    const estimatedMinutes = Math.ceil(estimatedTotalSeconds / 60);
    const timeString = `約 ${estimatedMinutes} 分`;
    
    document.getElementById('info-estimated-time').innerText = timeString;

    // 🌟 検証準備画面を開いた時は「戻る」ボタンを確実に表示する
    const backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.classList.remove('d-none');

    document.getElementById('dashboard-card').classList.remove('d-none');
    document.getElementById('survey-info-before-start').classList.remove('d-none');
    document.getElementById('progress-container').classList.add('d-none');
    
    document.getElementById('survey-form-area').classList.add('d-none');
    document.getElementById('beat-tracker').classList.add('d-none');
    document.getElementById('start-btn').parentElement.classList.remove('d-none');
    
    const startBtn = document.getElementById('start-btn');
    startBtn.style.display = 'block';
    startBtn.textContent = "音声データを読み込み＆開始 (音が出ます)";
    startBtn.disabled = false;
    startBtn.style.backgroundColor = themeColor;
    startBtn.style.borderColor = themeColor;

    showSection('survey-section');
}

// ==========================================
// 5. 音声ファイルの読み込み処理
// ==========================================
async function loadAudioFiles() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const tracks = currentSurveyData.tracks;
    
    const fetchPromises = tracks.map(async (track) => {
        const response = await fetch(track.src);
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    });

    try {
        audioBuffers = await Promise.all(fetchPromises);
    } catch (e) {
        console.error("音源の読み込みに失敗しました。", e);
        alert("音源の読み込みに失敗しました。");
    }
}

// ==========================================
// 6. 拍数トラッカー ＆ ボタンのカウントダウン制御
// ==========================================
function updateBeatIndicator() {
    if (!currentSource || !audioContext) return;

    const trackInfo = currentSurveyData.tracks[currentTrackIndex];
    const secPerBeat = 60 / trackInfo.bpm;
    const now = audioContext.currentTime;
    
    const listenDuration = Math.max(0, now - currentTrackStartTime);
    const trackPosition = listenDuration + currentTrackOffset;
    const currentBeat = Math.floor(trackPosition / secPerBeat) % trackInfo.beatCount;
    
    const beatText = document.getElementById('current-beat-text');
    beatText.innerText = currentBeat + 1;

    const circles = document.querySelectorAll('.beat-circle');
    circles.forEach((circle, idx) => {
        if (idx === currentBeat) {
            circle.classList.add('active');
        } else {
            circle.classList.remove('active');
        }
    });

    const requiredBeats = trackInfo.requiredBeats || trackInfo.beatCount;
    const requiredSeconds = requiredBeats * secPerBeat; 
    const remainingSeconds = Math.max(0, requiredSeconds - listenDuration); 
    
    const displaySeconds = Math.ceil(remainingSeconds);

    const nextBtn = document.getElementById('next-btn');
    const isLastTrack = currentTrackIndex === currentSurveyData.tracks.length - 1;
    
    const baseText = isLastTrack ? "次へ進む" : "次の楽曲へ";

    if (displaySeconds > 0) {
        nextBtn.innerText = `${baseText}（${displaySeconds}秒）`;
        nextBtn.disabled = true;
    } else {
        nextBtn.innerText = baseText;
        nextBtn.disabled = !isAllAnswered; 
    }

    animationFrameId = requestAnimationFrame(updateBeatIndicator);
}

// ==========================================
// 7. 音楽再生・シームレス切り替えロジック
// ==========================================
function playTrack(index, scheduledTime = 0, offset = 0, fadeDuration = 0) {
    const trackInfo = currentSurveyData.tracks[index];
    const buffer = audioBuffers[index];
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true; 
    
    const gainNode = audioContext.createGain();
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const startTime = scheduledTime === 0 ? audioContext.currentTime : scheduledTime;
    
    if (fadeDuration > 0) {
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(1, startTime + fadeDuration);

        if (currentSource && currentGainNode) {
            const prevSrc = currentSource;
            const prevGain = currentGainNode;
            prevGain.gain.setValueAtTime(prevGain.gain.value, startTime);
            prevGain.gain.linearRampToValueAtTime(0, startTime + fadeDuration);
            prevSrc.stop(startTime + fadeDuration);
        }
    } else {
        gainNode.gain.value = 1;
        if (currentSource) {
            currentSource.stop(startTime);
        }
    }

    source.start(startTime, offset);

    currentSource = source;
    currentGainNode = gainNode;
    
    currentTrackStartTime = startTime;
    currentTrackOffset = offset;

    const beatCirclesContainer = document.getElementById('beat-circles');
    beatCirclesContainer.innerHTML = '';
    for (let i = 0; i < trackInfo.beatCount; i++) {
        beatCirclesContainer.insertAdjacentHTML('beforeend', '<div class="beat-circle"></div>');
    }

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(updateBeatIndicator);
}

// ==========================================
// 8. アンケートUIの動的生成
// ==========================================
function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    isAllAnswered = false;
    
    currentSurveyData.questions.forEach((q, index) => {
        let radiosHtml = '';
        for (let i = 1; i <= 10; i++) {
            radiosHtml += `
                <div class="radio-circle-container">
                    <input type="radio" class="btn-check question-radio" name="q-${q.id}" id="q-${q.id}-${i}" value="${i}" data-id="${q.id}">
                    <label class="radio-circle" for="q-${q.id}-${i}"></label>
                    <span class="radio-label-text">${i}</span>
                </div>
            `;
        }

        const html = `
            <div class="mb-5 pb-3 border-bottom">
                <div class="d-flex justify-content-between fs-5 fw-bold text-dark mb-3 px-2">
                    <span>${q.left}</span>
                    <span>${q.right}</span>
                </div>
                <div class="radio-scale-group px-2">
                    ${radiosHtml}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });

    const radios = document.querySelectorAll('.question-radio');
    let answeredQuestions = new Set();
    const nextBtn = document.getElementById('next-btn');

    const themeColor = currentSurveyData.themeColor || '#0d6efd';
    nextBtn.style.backgroundColor = themeColor;
    nextBtn.style.borderColor = themeColor;

    radios.forEach((radio) => {
        radio.addEventListener('change', (e) => {
            const qId = e.target.getAttribute('data-id');
            answeredQuestions.add(qId);
            
            document.querySelectorAll(`input[name="q-${qId}"] + .radio-circle`).forEach(label => {
                label.style.backgroundColor = '';
                label.style.borderColor = '#ccc';
            });
            const selectedLabel = document.querySelector(`label[for="${e.target.id}"]`);
            if (selectedLabel) {
                const themeColor = currentSurveyData.themeColor || '#0d6efd';
                selectedLabel.style.backgroundColor = themeColor;
                selectedLabel.style.outlineColor = themeColor;
                selectedLabel.style.borderColor = '#fff';
            }

            if (answeredQuestions.size === currentSurveyData.questions.length) {
                isAllAnswered = true; 
            }
        });
    });
}

function updateProgress() {
    const total = currentSurveyData.tracks.length;
    document.getElementById('progress-text').innerText = `${currentTrackIndex + 1} / ${total}`;
    const percent = ((currentTrackIndex + 1) / total) * 100;
    document.getElementById('progress-bar').style.width = `${percent}%`;
}

function resetForm() {
    renderQuestions();
}

// ==========================================
// 9. ボタンのイベントリスナー
// ==========================================
document.getElementById('start-btn').addEventListener('click', async (e) => {
    const btn = e.target;
    btn.textContent = "読み込み中...お待ちください";
    btn.disabled = true;

    await loadAudioFiles();
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    btn.style.display = 'none';
    document.getElementById('survey-info-before-start').classList.add('d-none');
    document.getElementById('progress-container').classList.remove('d-none');
    
    document.getElementById('survey-form-area').classList.remove('d-none');
    document.getElementById('beat-tracker').classList.remove('d-none');
    
    renderQuestions();
    updateProgress();
    
    playTrack(currentTrackIndex, 0);
});

document.getElementById('play-pause-btn').addEventListener('click', () => {
    if (!audioContext) return;
    
    if (audioContext.state === 'running') {
        audioContext.suspend().then(() => {
            updatePlayPauseBtnUI(true);
        });
    } else if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            updatePlayPauseBtnUI(false);
        });
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    const currentData = { 
        trackId: currentSurveyData.tracks[currentTrackIndex].id, 
        answers: {} 
    };
    
    document.querySelectorAll('.question-radio:checked').forEach(radio => {
        currentData.answers[radio.getAttribute('data-id')] = parseInt(radio.value, 10);
    });
    surveyResults.push(currentData);

    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
        updatePlayPauseBtnUI(false);
    }

    currentTrackIndex++;

    if (currentTrackIndex < currentSurveyData.tracks.length) {
        updateProgress();
        resetForm();

        const nextTrack = currentSurveyData.tracks[currentTrackIndex];
        const secPerBeat = 60 / nextTrack.bpm;
        const loopDuration = secPerBeat * nextTrack.beatCount; 
        
        const now = audioContext.currentTime;
        
        const listenDuration = now - currentTrackStartTime; 
        const trackPosition = listenDuration + currentTrackOffset;
        
        const offset = trackPosition % loopDuration;
        const fadeTime = secPerBeat; 

        playTrack(currentTrackIndex, now, offset, fadeTime);

    } else {
        finishSurvey();
    }
});

// 🌟 戻るボタンのイベント制御（準備画面ならそのまま、検証中ならポップアップ）
document.getElementById('back-btn').addEventListener('click', () => {
    const isSurveyRunning = !document.getElementById('survey-form-area').classList.contains('d-none');
    
    if (isSurveyRunning) {
        const confirmLeave = confirm('進捗を保存せずにトップページに戻ります。よろしいですか？');
        if (!confirmLeave) {
            return; 
        }
    }
    
    showSection('home-section');
});

// ==========================================
// 10. 調査完了処理 ＆ データ送信
// ==========================================
function finishSurvey() {
    stopAllAudio();
    
    document.getElementById('dashboard-card').classList.add('d-none');
    
    // UIを「送信中」の表示に切り替える
    const formArea = document.getElementById('survey-form-area');
    formArea.innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <h4 class="text-secondary fw-bold">データを送信しています...</h4>
            <p class="text-muted small mt-2">画面を閉じずにお待ちください</p>
        </div>
    `;
    
    let completedSurveys = JSON.parse(localStorage.getItem('completedSurveys')) || [];
    if (!completedSurveys.includes(currentSurveyData.id)) {
        completedSurveys.push(currentSurveyData.id);
        localStorage.setItem('completedSurveys', JSON.stringify(completedSurveys));
    }

    const themeColor = currentSurveyData.themeColor || '#0d6efd';

    // 🌟 送信するデータのパッケージを作成
    const payload = {
        surveyId: currentSurveyData.id,
        timestamp: new Date().toLocaleString("ja-JP"),
        results: surveyResults
    };

    // 🌟 GASのウェブアプリURL（↓ここを書き換えてください！）
    const GAS_URL = "https://script.google.com/macros/s/AKfycbw3eB7oLyLiw2VBwQO9BpH01OACKsxDHOJ_4GJkZSj5sCJs4QJSxyyQ2mn9CVRXhr_j/exec";

    // fetchを使ってバックエンド(GAS)へPOST送信
    fetch(GAS_URL, {
        method: "POST",
        // CORS(通信ブロック)を回避するため、あえて text/plain を指定します
        headers: { "Content-Type": "text/plain" }, 
        body: JSON.stringify(payload)
    })
    .then(response => {
        // 送信成功時の表示
        formArea.innerHTML = `
            <div class="text-center p-5">
                <h3 class="mb-4 fw-bold" style="color: ${themeColor}">ご協力ありがとうございました！</h3>
                <p>回答データの送信が完了しました。</p>
                <button class="btn mt-4 btn-lg py-3 px-5 fw-bold shadow-sm text-white" style="background-color: ${themeColor}; border-color: ${themeColor};" onclick="location.reload()">トップ画面へ戻る</button>
            </div>
        `;
        console.log("◆ データ送信成功 ◆");
    })
    .catch(error => {
        // 送信失敗時（オフラインなど）の表示
        console.error("送信エラー:", error);
        formArea.innerHTML = `
            <div class="text-center p-5">
                <h3 class="mb-4 fw-bold text-danger">エラーが発生しました</h3>
                <p>データの送信に失敗しました。ネットワーク環境をご確認ください。</p>
                <button class="btn btn-secondary mt-4 py-2 px-4" onclick="location.reload()">トップへ戻る</button>
            </div>
        `;
    });
}

window.onload = () => {
    showSection('home-section');
};
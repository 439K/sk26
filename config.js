// config.js
const appData = {
    surveys: [
        {
            id: 'test',
            title: 'テスト',
            icon: '😊', // Emojiや画像パス
            themeColor: '#ff6200',
            questions: [
                // 【カテゴリー1】 感情・評価（心地よさや気分の変化）
                { id: 'q1', left: '不快な', right: '快適な' },
                { id: 'q2', left: '緊張する', right: 'リラックスする' },
                { id: 'q3', left: '暗い', right: '明るい' },
                { id: 'q4', left: '退屈な', right: 'ワクワクする' },
                
                // 【カテゴリー2】 迫力・力量（音のエネルギーや重厚感）
                { id: 'q5', left: '迫力がない', right: '迫力がある' },
                { id: 'q6', left: '軽い', right: '重厚な' },
                { id: 'q7', left: '弱い', right: '力強い' },
                
                // 【カテゴリー3】 空間・音質（ミックスやテクスチャ）
                { id: 'q8', left: 'こもった', right: 'クリアな' },
                { id: 'q9', left: '平坦な（のっぺりした）', right: '立体的な（奥行きがある）' },
                { id: 'q10', left: '狭い', right: '広がりがある' },
                { id: 'q11', left: '散らかっている', right: 'まとまっている' },
                
                // 【カテゴリー4】 適合性・クオリティ（ゲームへのマッチ度）
                { id: 'q12', left: '違和感がある', right: '違和感がない' },
                { id: 'q13', left: '安っぽい', right: 'リッチな（高級感がある）' },
                { id: 'q14', left: '世界観に合わない', right: '世界観に合っている' }
            ],
            tracks: [
                { id: 'tt_1', src: './audio/Mixdown.mp3', bpm: 124, beatCount: 16, requiredBeats: 32 },
                { id: 'tt_2', src: './audio/Mixdown(2).mp3', bpm: 124, beatCount: 16, requiredBeats: 32 },
                { id: 'tt_3', src: './audio/Mixdown(3).mp3', bpm: 124, beatCount: 16, requiredBeats: 32 },
                { id: 'tt_4', src: './audio/Mixdown(4).mp3', bpm: 124, beatCount: 16, requiredBeats: 32 },
                { id: 'tt_5', src: './audio/Mixdown(5).mp3', bpm: 124, beatCount: 16, requiredBeats: 32 },
                { id: 'tt_6', src: './audio/Mixdown(6).mp3', bpm: 124, beatCount: 16, requiredBeats: 32 },
                { id: 'tt_7', src: './audio/Mixdown(7).mp3', bpm: 124, beatCount: 16, requiredBeats: 32 },
                { id: 'tt_8', src: './audio/Mixdown(8).mp3', bpm: 124, beatCount: 16, requiredBeats: 32 }
                // ... 9曲分
            ]
        },
        {
            id: 'survey_mix',
            title: '音圧・EQ 心理評価',
            icon: '🎛️', // Emojiや画像パス
            themeColor: '#bd0dfd',
            questions: [
                { id: 'q1', left: '不快な', right: '快適な' },
                { id: 'q2', left: '迫力がない', right: '迫力がある' }
            ],
            tracks: [
                { id: 'mix_1', src: './audio/mix_1.mp3', bpm: 124, beatCount: 16, requiredBeats: 8 },
                { id: 'mix_2', src: './audio/mix_2.mp3', bpm: 124, beatCount: 16, requiredBeats: 8 },
                { id: 'mix_3', src: './audio/mix_3.mp3', bpm: 124, beatCount: 16, requiredBeats: 8 }
                // ... 9曲分
            ]
        },
        {
            id: 'survey_orchestra',
            title: 'アレンジ検証（オーケストラ）',
            icon: '🎻',
            themeColor: '#198754',
            questions: [
                { id: 'q1', left: '散らかっている', right: 'まとまっている' },
                { id: 'q2', left: '違和感がない', right: '違和感がある' }
            ],
            tracks: [
                { id: 'orch_1', src: './audio/orch_1.wav', bpm: 200, beatCount: 16 },
                { id: 'orch_2', src: './audio/orch_2.wav', bpm: 200, beatCount: 16 }
                // ... 9曲分
            ]
        }
    ]
};
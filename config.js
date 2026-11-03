// config.js
const appData = {
    surveys: [
        {
            id: 'Mastering',
            title: 'マスタリングの変化',
            icon: '🎛️', // Emojiや画像パス
            themeColor: '#006aff',
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
                { id: 'q9', left: 'のっぺりした', right: '奥行きがある' },
                { id: 'q10', left: '狭い', right: '広がりがある' },
                { id: 'q11', left: '散らかっている', right: 'まとまっている' },
                
                // 【カテゴリー4】 適合性・クオリティ（ゲームへのマッチ度）
                { id: 'q12', left: '違和感がある', right: '違和感がない' },
                { id: 'q13', left: '安っぽい', right: '高級感がある' }
            ],
            tracks: [
                { id: 'M1', src: './audio/Mst_1.mp3', bpm: 128, beatCount: 16, requiredBeats: 32 },
                { id: 'M2', src: './audio/Mst_2.mp3', bpm: 128, beatCount: 16, requiredBeats: 32 },
                { id: 'M3', src: './audio/Mst_3.mp3', bpm: 128, beatCount: 16, requiredBeats: 32 },
                { id: 'M4', src: './audio/Mst_4.mp3', bpm: 128, beatCount: 16, requiredBeats: 32 },
                { id: 'M5', src: './audio/Mst_5.mp3', bpm: 128, beatCount: 16, requiredBeats: 32 },
                { id: 'M6', src: './audio/Mst_6.mp3', bpm: 128, beatCount: 16, requiredBeats: 32 },
                { id: 'M7', src: './audio/Mst_7.mp3', bpm: 128, beatCount: 16, requiredBeats: 32 },
                { id: 'M8', src: './audio/Mst_8.mp3', bpm: 128, beatCount: 16, requiredBeats: 32 },
                { id: 'M9', src: './audio/Mst_9.mp3', bpm: 128, beatCount: 16, requiredBeats: 32 }
            ]
        }
    ]
};
const express = require("express");
const router = express.Router();
const axios = require("axios");

const EXTERNAL_SERVER_URL = process.env.EXTERNAL_HISTORY_SERVER || "https://your-external-server.com/api";
const EXTERNAL_API_KEY = process.env.EXTERNAL_API_KEY;

// 動画再生履歴をログに記録
router.post('/log-playback', async (req, res) => {
    try {
        const { videoId, playbackTime, timestamp } = req.body;
        
        if (!videoId || !playbackTime) {
            return res.status(400).json({ error: "videoId と playbackTime は必須です" });
        }

        // 外部サーバーに送信
        const payload = {
            videoId: videoId,
            playbackTime: playbackTime,
            timestamp: timestamp || Date.now(),
            serverTime: new Date().toISOString()
        };

        // 外部サーバーへの非同期送信（レスポンス待たない）
        axios.post(`${EXTERNAL_SERVER_URL}/history`, payload, {
            headers: {
                'Authorization': `Bearer ${EXTERNAL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        }).catch(err => {
            console.error('外部サーバーへの送信失敗:', err.message);
            // エラーでも処理を止めない
        });

        // クライアントにはすぐレスポンスを返す
        res.json({ success: true, message: "履歴が記録されました" });

    } catch (error) {
        console.error('履歴記録エラー:', error);
        res.status(500).json({ error: "履歴の記録に失敗しました" });
    }
});

module.exports = router;

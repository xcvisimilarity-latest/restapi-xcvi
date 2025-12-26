const { logRequest } = require('./notif');

module.exports = async (req, res) => {
    await logRequest(req, 'ttdl');
    
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                status: 'error',
                message: 'URL parameter is required'
            });
        }
        
        const videoData = {
            status: 'success',
            data: {
                id: Date.now().toString(),
                original_url: url,
                video_url: `https://cdn.api-xcvi.my.id/videos/tiktok_${Date.now()}.mp4`,
                thumbnail: `https://cdn.api-xcvi.my.id/thumbs/tiktok_${Date.now()}.jpg`,
                title: 'TikTok Video',
                author: '@tiktok_user',
                duration: '00:15',
                size: '2.5 MB',
                timestamp: new Date().toISOString()
            },
            meta: {
                endpoint: 'ttdl',
                response_time: `${Date.now() - req.startTime}ms`
            }
        };
        
        res.json(videoData);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

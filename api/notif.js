const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8552858564:AAFCDkKDzCEf4tNZXJx7Js0DRI7QUK7PCps';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7950114253';

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            status: 'error',
            message: 'Method not allowed',
            creator: 'Wanz Official'
        });
    }
    
    try {
        let data;
        
        // Parse JSON body
        if (typeof req.body === 'string') {
            try {
                data = JSON.parse(req.body);
            } catch {
                data = req.body;
            }
        } else {
            data = req.body;
        }
        
        // Log the notification
        console.log('Notification received:', data);
        
        // If Telegram credentials are set, send notification
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
            try {
                const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
                const message = `🔔 API Notification\nType: ${data.type || 'unknown'}\nEndpoint: ${data.data?.endpoint || 'N/A'}`;
                
                await fetch(telegramUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: message,
                        parse_mode: 'HTML'
                    })
                });
            } catch (telegramError) {
                console.error('Telegram error:', telegramError);
            }
        }
        
        // Always return success even if Telegram fails
        return res.status(200).json({
            status: 'success',
            message: 'Notification processed',
            received: data,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Notification error:', error);
        
        // Return error response
        return res.status(200).json({
            status: 'error',
            message: 'Notification failed',
            error: error.message
        });
    }
};

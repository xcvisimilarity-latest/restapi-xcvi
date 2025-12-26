const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8552858564:AAFCDkKDzCEf4tNZXJx7Js0DRI7QUK7PCps';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7950114253';

async function sendTelegramMessage(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || TELEGRAM_BOT_TOKEN === '8552858564:AAFCDkKDzCEf4tNZXJx7Js0DRI7QUK7PCps') {
        console.log('⚠️ Telegram notifications are disabled');
        return false;
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });

        return response.ok;
    } catch (error) {
        console.error('Telegram notification error:', error.message);
        return false;
    }
}

function formatTelegramMessage(type, data) {
    const time = new Date().toLocaleString('en-US');
    
    switch (type) {
        case 'api_test':
            return `
✅ <b>API Test Success</b>
━━━━━━━━━━━━━━━━━
📊 <b>Endpoint:</b> ${data.endpoint}
⏰ <b>Time:</b> ${time}
⏱️ <b>Response Time:</b> ${data.response_time}ms
📡 <b>Status:</b> ${data.status}
━━━━━━━━━━━━━━━━━
            `.trim();
            
        case 'api_error':
            return `
❌ <b>API Error</b>
━━━━━━━━━━━━━━━━━
📊 <b>Endpoint:</b> ${data.endpoint}
⏰ <b>Time:</b> ${time}
🚫 <b>Error:</b> ${data.error}
━━━━━━━━━━━━━━━━━
            `.trim();
            
        default:
            return `
📨 <b>Notification</b>
━━━━━━━━━━━━━━━━━
📊 <b>Type:</b> ${type}
⏰ <b>Time:</b> ${time}
━━━━━━━━━━━━━━━━━
            `.trim();
    }
}

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            status: 'error',
            message: 'Method not allowed'
        });
    }
    
    try {
        const { type, data } = req.body;
        
        if (!type) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required field: type'
            });
        }
        
        const telegramMessage = formatTelegramMessage(type, data || {});
        const sent = await sendTelegramMessage(telegramMessage);
        
        return res.status(200).json({
            status: 'success',
            message: sent ? 'Notification sent' : 'Notification service not configured',
            sent: sent
        });
        
    } catch (error) {
        console.error('Notification handler error:', error);
        
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};
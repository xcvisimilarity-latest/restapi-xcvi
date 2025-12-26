const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8552858564:AAFCDkKDzCEf4tNZXJx7Js0DRI7QUK7PCps';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7950114253';

async function sendTelegramMessage(message) {
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
                parse_mode: 'HTML'
            })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        return null;
    }
}

async function logRequest(req, endpointName) {
    const timestamp = new Date().toLocaleString('id-ID');
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const method = req.method;
    
    const message = `
🔄 <b>API Request Detected</b>
━━━━━━━━━━━━━━━
📊 <b>Endpoint:</b> ${endpointName}
⏰ <b>Time:</b> ${timestamp}
📡 <b>Method:</b> ${method}
🌐 <b>IP:</b> ${ip}
🖥️ <b>User Agent:</b> ${userAgent.substring(0, 50)}...
━━━━━━━━━━━━━━━
📈 <i>API XCVI Monitoring System</i>
    `;
    
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        await sendTelegramMessage(message);
    }
    
    // Log ke console untuk debugging
    console.log(`[${timestamp}] ${method} ${endpointName} from ${ip}`);
}

module.exports = {
    sendTelegramMessage,
    logRequest
};
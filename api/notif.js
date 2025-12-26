const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8552858564:AAFCDkKDzCEf4tNZXJx7Js0DRI7QUK7PCps';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7950114253';

async function sendTelegramMessage(message) {
    if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === '8552858564:AAFCDkKDzCEf4tNZXJx7Js0DRI7QUK7PCps' || 
        !TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID === '7950114253') {
        console.log('Telegram notifications disabled - please configure token and chat ID');
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
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        return data.ok === true;
    } catch (error) {
        console.error('Telegram notification error:', error);
        return false;
    }
}

async function logRequest(req, endpoint) {
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown';
    const time = new Date().toLocaleString('id-ID');
    const agent = req.headers['user-agent'] || 'Unknown';
    const method = req.method;
    
    const message = `
🔔 <b>API Request</b>
━━━━━━━━━━━━━━━━━
📊 <b>Endpoint:</b> ${endpoint}
⏰ <b>Time:</b> ${time}
📡 <b>Method:</b> ${method}
🌐 <b>IP:</b> ${ip}
📱 <b>Agent:</b> ${agent.substring(0, 80)}...
━━━━━━━━━━━━━━━━━
    `;
    
    await sendTelegramMessage(message);
}

module.exports = async (req, res) => {
    try {
        const { type, data, timestamp } = req.body;
        
        if (!type || !data) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }
        
        let telegramMessage = '';
        
        switch (type) {
            case 'bug_report':
                telegramMessage = `
🐛 <b>Bug Report</b>
━━━━━━━━━━━━━━━━━
👤 <b>From:</b> ${data.name}
⏰ <b>Time:</b> ${new Date(timestamp).toLocaleString('id-ID')}
🌐 <b>Page:</b> ${data.page || 'Unknown'}
📝 <b>Message:</b>
${data.message}
━━━━━━━━━━━━━━━━━
                `;
                break;
                
            case 'api_test':
                telegramMessage = `
🧪 <b>API Test</b>
━━━━━━━━━━━━━━━━━
📊 <b>Endpoint:</b> ${data.endpoint}
📁 <b>File:</b> ${data.file}
⏰ <b>Time:</b> ${new Date(timestamp).toLocaleString('id-ID')}
⏱️ <b>Response:</b> ${data.response_time}ms
✅ <b>Status:</b> ${data.status}
🔗 <b>URL:</b> ${data.url}
━━━━━━━━━━━━━━━━━
                `;
                break;
                
            case 'api_error':
                telegramMessage = `
❌ <b>API Error</b>
━━━━━━━━━━━━━━━━━
📊 <b>Endpoint:</b> ${data.endpoint}
📁 <b>File:</b> ${data.file}
⏰ <b>Time:</b> ${new Date(timestamp).toLocaleString('id-ID')}
🚫 <b>Error:</b> ${data.error}
━━━━━━━━━━━━━━━━━
                `;
                break;
                
            default:
                telegramMessage = `
📨 <b>Notification</b>
━━━━━━━━━━━━━━━━━
📊 <b>Type:</b> ${type}
⏰ <b>Time:</b> ${new Date(timestamp).toLocaleString('id-ID')}
📋 <b>Data:</b>
${JSON.stringify(data, null, 2)}
━━━━━━━━━━━━━━━━━
                `;
        }
        
        const sent = await sendTelegramMessage(telegramMessage);
        
        res.json({
            status: 'success',
            message: sent ? 'Notification sent successfully' : 'Notification queued',
            sent: sent
        });
        
    } catch (error) {
        console.error('Notification handler error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process notification'
        });
    }
};

module.exports.logRequest = logRequest;

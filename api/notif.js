const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8552858564:AAFCDkKDzCEf4tNZXJx7Js0DRI7QUK7PCps';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7950114253';

async function sendTelegramNotification(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('Telegram notifications disabled - missing token or chat ID');
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

async function logRequest(req, endpointName) {
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown';
    const time = new Date().toLocaleString('id-ID');
    const agent = req.headers['user-agent'] || 'Unknown';
    const method = req.method;
    const url = req.url;
    
    const message = `
🔔 <b>API Request</b>
━━━━━━━━━━━━━━━━━━━
📊 <b>Endpoint:</b> ${endpointName}
⏰ <b>Time:</b> ${time}
📡 <b>Method:</b> ${method}
🌐 <b>URL:</b> ${url}
🖥️ <b>IP:</b> ${ip}
📱 <b>User Agent:</b> ${agent.substring(0, 100)}...
━━━━━━━━━━━━━━━━━━━
    `;
    
    await sendTelegramNotification(message);
}

async function logBugReport(data) {
    const message = `
🐛 <b>Bug Report Received</b>
━━━━━━━━━━━━━━━━━━━
👤 <b>From:</b> ${data.name}
📧 <b>Email:</b> ${data.email || 'Not provided'}
⏰ <b>Time:</b> ${new Date().toLocaleString('id-ID')}
🌐 <b>Page:</b> ${data.page_url}
📝 <b>Message:</b>
${data.message}
━━━━━━━━━━━━━━━━━━━
    `;
    
    await sendTelegramNotification(message);
}

async function logApiTest(data) {
    const message = `
🧪 <b>API Test Executed</b>
━━━━━━━━━━━━━━━━━━━
📊 <b>Endpoint:</b> ${data.endpoint}
⏰ <b>Time:</b> ${new Date().toLocaleString('id-ID')}
⏱️ <b>Response:</b> ${data.response_time}ms
✅ <b>Status:</b> ${data.status}
🔗 <b>URL:</b> ${data.url}
━━━━━━━━━━━━━━━━━━━
    `;
    
    await sendTelegramNotification(message);
}

module.exports = async (req, res) => {
    try {
        const data = req.body;
        
        if (!data || !data.type) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request data'
            });
        }
        
        switch (data.type) {
            case 'bug_report':
                await logBugReport(data);
                break;
                
            case 'api_test':
                await logApiTest(data);
                break;
                
            default:
                await sendTelegramNotification(
                    `📨 <b>New Notification</b>\nType: ${data.type}\nData: ${JSON.stringify(data, null, 2)}`
                );
        }
        
        res.json({
            status: 'success',
            message: 'Notification sent successfully'
        });
        
    } catch (error) {
        console.error('Notification handler error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process notification'
        });
    }
};

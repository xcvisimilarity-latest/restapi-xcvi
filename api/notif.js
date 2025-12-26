const TELEGRAM_BOT_TOKEN = '8552858564:AAFCDkKDzCEf4tNZXJx7Js0DRI7QUK7PCps';
const TELEGRAM_CHAT_ID = '7950114253';

async function sendTelegramMessage(text) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.error('Telegram notification failed:', error);
    }
}

async function logRequest(req, endpoint) {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const time = new Date().toLocaleString('id-ID');
    const agent = req.headers['user-agent'] || 'Unknown';
    
    const message = `
🔔 <b>API Request</b>
━━━━━━━━━━━━━━━
📊 <b>Endpoint:</b> ${endpoint}
⏰ <b>Time:</b> ${time}
📡 <b>Method:</b> ${req.method}
🌐 <b>IP:</b> ${ip}
🖥️ <b>User Agent:</b> ${agent.substring(0, 80)}...
━━━━━━━━━━━━━━━
    `;
    
    await sendTelegramMessage(message);
}

async function logBugReport(data) {
    const message = `
🐛 <b>Bug Report</b>
━━━━━━━━━━━━━━━
👤 <b>From:</b> ${data.name}
⏰ <b>Time:</b> ${new Date(data.timestamp).toLocaleString('id-ID')}
📝 <b>Message:</b>
${data.message}
━━━━━━━━━━━━━━━
    `;
    
    await sendTelegramMessage(message);
}

module.exports = { logRequest, logBugReport, sendTelegramMessage };

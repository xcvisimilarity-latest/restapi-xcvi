const TELEGRAM_BOT_TOKEN = '8552858564:AAFCDkKDzCEf4tNZXJx7Js0DRI7QUK7PCps';
const TELEGRAM_CHAT_ID = '7950114253';

async function safeFetch(url, options) {
    const timeout = 5000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

async function sendTelegramMessage(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('⚠️ Telegram notifications disabled - missing credentials');
        return false;
    }
    
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await safeFetch(url, {
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
        
        if (!response.ok) {
            throw new Error(`Telegram API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.ok === true;
        
    } catch (error) {
        console.error('❌ Telegram notification error:', error.message);
        return false;
    }
}

function formatTelegramMessage(type, data) {
    const time = new Date(data.timestamp).toLocaleString('id-ID');
    let message = '';
    
    switch (type) {
        case 'bug_report':
            message = `
🐛 <b>Bug Report</b>
━━━━━━━━━━━━━━━━━
👤 <b>From:</b> ${data.name || 'Anonymous'}
📧 <b>Email:</b> ${data.email || 'Not provided'}
⏰ <b>Time:</b> ${time}
🌐 <b>Page:</b> ${data.page || 'Unknown'}
📱 <b>User Agent:</b> ${data.userAgent || 'Unknown'}

📝 <b>Message:</b>
${data.message}
━━━━━━━━━━━━━━━━━
            `;
            break;
            
        case 'api_test':
            message = `
✅ <b>API Test Success</b>
━━━━━━━━━━━━━━━━━
📊 <b>Endpoint:</b> ${data.endpoint}
⏰ <b>Time:</b> ${time}
⏱️ <b>Response Time:</b> ${data.response_time}ms
📡 <b>Status:</b> ${data.status}
🔗 <b>URL:</b> <code>${data.url}</code>
━━━━━━━━━━━━━━━━━
            `;
            break;
            
        case 'api_error':
            message = `
❌ <b>API Error</b>
━━━━━━━━━━━━━━━━━
📊 <b>Endpoint:</b> ${data.endpoint}
⏰ <b>Time:</b> ${time}
🚫 <b>Error:</b> ${data.error}
━━━━━━━━━━━━━━━━━
            `;
            break;
            
        default:
            message = `
📨 <b>Notification</b>
━━━━━━━━━━━━━━━━━
📊 <b>Type:</b> ${type}
⏰ <b>Time:</b> ${time}
📋 <b>Data:</b>
${JSON.stringify(data, null, 2)}
━━━━━━━━━━━━━━━━━
            `;
    }
    
    return message.trim();
}

// Main handler function
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
        let data;
        
        // Try to parse JSON body
        try {
            data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        } catch (parseError) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid JSON body'
            });
        }
        
        // Validate required fields
        if (!data || !data.type) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: type'
            });
        }
        
        const { type, data: payloadData, timestamp } = data;
        
        // Format message
        const telegramMessage = formatTelegramMessage(type, {
            ...payloadData,
            timestamp: timestamp || new Date().toISOString()
        });
        
        // Send to Telegram
        const sent = await sendTelegramMessage(telegramMessage);
        
        // Return success response
        return res.status(200).json({
            status: 'success',
            message: sent ? 'Notification sent successfully' : 'Notification queued (telegram not configured)',
            sent: sent,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Notification handler error:', error);
        
        // Return error response without crashing
        return res.status(200).json({
            status: 'error',
            message: 'Notification service temporarily unavailable',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Export for use in other API files
module.exports.logRequest = async function(req, endpoint) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
    
    const ip = req.headers['x-forwarded-for'] || req.ip || 'Unknown';
    const time = new Date().toLocaleString('id-ID');
    const agent = req.headers['user-agent'] || 'Unknown';
    
    const message = `
🔔 <b>API Request</b>
━━━━━━━━━━━━━━━━━
📊 <b>Endpoint:</b> ${endpoint}
⏰ <b>Time:</b> ${time}
📡 <b>Method:</b> ${req.method}
🌐 <b>IP:</b> ${ip}
📱 <b>Agent:</b> ${agent.substring(0, 80)}...
━━━━━━━━━━━━━━━━━
    `;
    
    await sendTelegramMessage(message.trim());
};

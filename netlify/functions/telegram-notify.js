// Netlify Function — relays "Contact" and "Skyridge join" form submissions
// to a Telegram chat via the Bot API. The bot token / chat id never touch
// the client: they're read from Netlify environment variables at runtime.
//
// Required env vars (set in Netlify → Site settings → Environment variables):
//   TELEGRAM_BOT_TOKEN — token from @BotFather
//   TELEGRAM_CHAT_ID   — numeric chat/user/group id the bot should message

const clean = (value, max) => String(value ?? '').trim().slice(0, max);

const escapeHtml = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildMessage(type, fields) {
  const name = clean(fields.name, 100);
  const message = clean(fields.message, 2000);
  if (!name) return { error: 'Name is required' };

  if (type === 'skyridge') {
    const phone = clean(fields.phone, 40);
    if (!phone) return { error: 'Phone is required' };
    return {
      text:
        `🏔 <b>New Skyridge join request</b>\n\n` +
        `👤 <b>Name:</b> ${escapeHtml(name)}\n` +
        `📱 <b>Phone:</b> ${escapeHtml(phone)}\n` +
        `💬 <b>Message:</b> ${message ? escapeHtml(message) : '—'}`,
    };
  }

  if (type === 'contact') {
    const email = clean(fields.email, 120);
    if (!email) return { error: 'Email is required' };
    if (!message) return { error: 'Message is required' };
    return {
      text:
        `📩 <b>New contact message</b>\n\n` +
        `👤 <b>Name:</b> ${escapeHtml(name)}\n` +
        `✉️ <b>Email:</b> ${escapeHtml(email)}\n` +
        `💬 <b>Message:</b> ${escapeHtml(message)}`,
    };
  }

  return { error: 'Unknown form type' };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  if (!TOKEN || !CHAT_ID) {
    console.error('TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not configured');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is not configured' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const built = buildMessage(data.type, data);
  if (built.error) {
    return { statusCode: 400, body: JSON.stringify({ error: built.error }) };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: built.text, parse_mode: 'HTML' }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      console.error('Telegram API error', json);
      return { statusCode: 502, body: JSON.stringify({ error: 'Failed to deliver notification' }) };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('Telegram request failed', err);
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to deliver notification' }) };
  }
};

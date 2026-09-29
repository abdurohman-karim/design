// Shared client helper — posts form submissions to the Netlify function that
// relays them to Telegram. Used by both the Contact section and the
// Skyridge join form (payload's `type` field keeps the two notifications apart).
window.sendNotification = function sendNotification(payload) {
  return fetch('/.netlify/functions/telegram-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    let data = {};
    try { data = await res.json(); } catch (e) { /* non-JSON error body */ }
    if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
    return data;
  });
};

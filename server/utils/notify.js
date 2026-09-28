// Optional e-mail notification for new contact messages via the Resend API.
// Silently skipped when RESEND_API_KEY / CONTACT_NOTIFICATION_EMAIL are unset.
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

async function notifyNewMessage({ name, email, message }) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_NOTIFICATION_EMAIL
  if (!apiKey || !to) return

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Darshan Portfolio <onboarding@resend.dev>',
      to: [to],
      reply_to: email,
      subject: `New portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    }),
  })
  if (!response.ok) throw new Error(`Resend responded with ${response.status}`)
}

module.exports = { notifyNewMessage }

// Vercel Serverless Function: Dispatch Activation Code via Email & SMS
// Configure optional env vars in Vercel Project Settings for real delivery:
//   RESEND_API_KEY (for real Email via Resend)
//   EMAIL_FROM     (default: Sazib TV <onboarding@resend.dev>)
//   SMS_API_URL    (e.g. BulkSMSBD / GreenWeb / custom SMS gateway GET/POST URL)
//   SMS_API_KEY    (SMS gateway API key)
//   SMS_SENDER_ID  (SMS sender ID)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, address, nid, activationCode } = req.body || {};
    if (!email || !phone || !activationCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let emailDispatched = false;
    let smsDispatched = false;

    // 1. Real Email Delivery via Resend (if RESEND_API_KEY is configured on Vercel)
    if (process.env.RESEND_API_KEY) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'Sazib TV <onboarding@resend.dev>',
            to: [email],
            subject: `Your Sazib TV Activation Code: ${activationCode}`,
            html: `
              <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;background:#0f172a;color:#f8fafc;border-radius:14px;">
                <h2 style="color:#e50914;margin-top:0;">SAZIB TV - Account Activation</h2>
                <p>Hello <strong>${name || 'Subscriber'}</strong>,</p>
                <p>Your Sazib TV account has been registered successfully. Use the activation code below to log in:</p>
                <div style="background:#1e293b;border:1px solid #334155;padding:16px;border-radius:10px;text-align:center;font-size:26px;font-weight:800;letter-spacing:3px;color:#38bdf8;margin:18px 0;">
                  ${activationCode}
                </div>
                <p style="font-size:13px;color:#94a3b8;">
                  Phone: ${phone}<br/>
                  Address: ${address || 'N/A'}<br/>
                  NID: ${nid || 'N/A'}
                </p>
                <p style="font-size:12px;color:#64748b;">Login at https://sazib-tv.vercel.app/</p>
              </div>
            `
          })
        });
        emailDispatched = emailRes.ok;
      } catch {}
    }

    // 2. Real SMS Delivery (if SMS_API_URL is configured on Vercel)
    if (process.env.SMS_API_URL && process.env.SMS_API_KEY) {
      try {
        const smsMessage = `Sazib TV: Welcome ${name || ''}! Your Activation Code is ${activationCode}. Use your phone/email & this code to login at sazib-tv.vercel.app`;
        const smsUrl = new URL(process.env.SMS_API_URL);
        smsUrl.searchParams.set('api_key', process.env.SMS_API_KEY);
        if (process.env.SMS_SENDER_ID) smsUrl.searchParams.set('senderid', process.env.SMS_SENDER_ID);
        smsUrl.searchParams.set('number', phone);
        smsUrl.searchParams.set('message', smsMessage);
        const smsRes = await fetch(smsUrl.toString());
        smsDispatched = smsRes.ok;
      } catch {}
    }

    return res.status(200).json({
      success: true,
      activationCode,
      emailDispatched,
      smsDispatched,
      mode: (emailDispatched || smsDispatched) ? 'live-gateway' : 'instant-delivery'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

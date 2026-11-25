import fs from 'fs';

const TMP_CUSTOMERS_FILE = '/tmp/sazib_registered_customers.json';

function readTmpCustomers() {
  try {
    if (fs.existsSync(TMP_CUSTOMERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_CUSTOMERS_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch {}
  return [];
}

function saveTmpCustomer(customer) {
  try {
    const list = readTmpCustomers();
    const exists = list.some(
      c => c.id === customer.id || (customer.phone && c.phone === customer.phone) || (customer.email && c.email === customer.email)
    );
    if (!exists) {
      list.unshift(customer);
      fs.writeFileSync(TMP_CUSTOMERS_FILE, JSON.stringify(list, null, 2), 'utf8');
    }
  } catch {}
}

async function syncCustomerToAdminGitHub(customer) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return false;
  try {
    const repo = process.env.ADMIN_GITHUB_REPO || 'sazibkhan-me-6/sazib-tv-admin';
    const filePath = 'public/customers.json';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'sazib-tv-sync'
    };

    const getRes = await fetch(apiUrl, { headers });
    if (!getRes.ok) return false;
    const fileMeta = await getRes.json();
    const existing = JSON.parse(Buffer.from(fileMeta.content, 'base64').toString('utf8'));
    if (!Array.isArray(existing)) return false;

    const already = existing.some(
      c => c.id === customer.id || (customer.phone && c.phone === customer.phone) || (customer.email && c.email === customer.email)
    );
    if (!already) {
      existing.unshift(customer);
      const updatedB64 = Buffer.from(JSON.stringify(existing, null, 2), 'utf8').toString('base64');
      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `feat(customer): auto-register ${customer.name} (${customer.phone})`,
          content: updatedB64,
          sha: fileMeta.sha,
          branch: 'main'
        })
      });
      return putRes.ok;
    }
    return true;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { id, name, email, phone, address, nid, activationCode } = req.body || {};
    if (!email || !phone || !activationCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 30);

    const customerRecord = {
      id: id || `cust-${Date.now()}`,
      name: (name || 'New Subscriber').trim(),
      phone: String(phone).trim(),
      email: String(email).trim().toLowerCase(),
      address: (address || '').trim(),
      nid: String(nid || '').trim(),
      code: String(activationCode).trim().toUpperCase(),
      token: `tok_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      plan: 'Free',
      allowedCategories: ['all'],
      status: 'active',
      expiresAt: expiresDate.toISOString().split('T')[0],
      deviceLimit: 2,
      activeDevices: 1,
      createdAt: new Date().toISOString().split('T')[0],
      notes: 'Signed up via sazib-tv.vercel.app'
    };

    // 1. Save immediately for live Admin Panel polling (/api/customers)
    saveTmpCustomer(customerRecord);

    // 2. Permanently sync to Admin Control Panel GitHub repo if GITHUB_TOKEN is configured
    const adminSynced = await syncCustomerToAdminGitHub(customerRecord);

    // 3. Real Email Delivery via Resend (if RESEND_API_KEY is configured)
    let emailDispatched = false;
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
                <p style="font-size:13px;color:#94a3b8;">Phone: ${phone}<br/>Address: ${address || 'N/A'}<br/>NID: ${nid || 'N/A'}</p>
                <p style="font-size:12px;color:#64748b;">Login at https://sazib-tv.vercel.app/</p>
              </div>
            `
          })
        });
        emailDispatched = emailRes.ok;
      } catch {}
    }

    // 4. Real SMS Delivery (if SMS_API_URL & SMS_API_KEY are configured)
    let smsDispatched = false;
    if (process.env.SMS_API_URL && process.env.SMS_API_KEY) {
      try {
        const smsMessage = `Sazib TV: Welcome ${name || ''}! Your Activation Code is ${activationCode}. Login at sazib-tv.vercel.app`;
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
      adminSynced,
      customer: customerRecord
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}

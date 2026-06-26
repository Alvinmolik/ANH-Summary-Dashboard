// Vercel Serverless Function — proxy ke Google Apps Script
// File ini di-deploy otomatis oleh Vercel sebagai /api/data

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxofRKj6gaMhOWscAVUrlHXdzxweJf9ufKu1Q9fn1v0yxtTw3iv1banZxRepVGPDbvrOA/exec';

export default async function handler(req, res) {
  // CORS headers agar dashboard bisa fetch
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300'); // cache 5 menit di Vercel edge

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const type = req.query.type || 'summary';
  const days = req.query.days || '30';

  try {
    const url = `${APPS_SCRIPT_URL}?type=${type}&days=${days}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      // Follow redirects (Apps Script sering redirect)
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Apps Script returned ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
      type: type
    });
  }
}

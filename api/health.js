// GET /api/health — diagnóstico rápido del servidor
// Visita the303studio.com/api/health para verificar que la API y las env vars están activas

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const notionKeySet = !!process.env.NOTION_API_KEY;
  const notionKeyPreview = process.env.NOTION_API_KEY
    ? `secret_...${process.env.NOTION_API_KEY.slice(-4)}`
    : 'NOT SET ❌';

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      NOTION_API_KEY: notionKeySet ? notionKeyPreview : 'NOT SET ❌',
      NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID || 'd31c61488ec349dbb3b254d7bb0e06bc (hardcoded fallback)',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    },
    ready: notionKeySet
  });
}

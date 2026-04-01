// Vercel Serverless Function — POST /api/diagnostico
// Receives audit form data and creates a lead in Notion BRIEFS database

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID || 'd31c61488ec349dbb3b254d7bb0e06bc';

  if (!NOTION_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const data = req.body;

    const properties = {
      "Nombre completo": {
        title: [{ text: { content: data.nombre || 'Sin nombre' } }]
      },
      "Email": {
        email: data.email || null
      },
      "Nombre del negocio": {
        rich_text: [{ text: { content: data.negocio || '' } }]
      },
      "Redes sociales": {
        rich_text: [{ text: { content: data.instagram || '' } }]
      },
      "Servicio de interés": {
        rich_text: [{ text: { content: "Diagnóstico de Marca" } }]
      },
      "Fuente": {
        select: { name: "Formulario web" }
      },
      "Canal de origen": {
        select: { name: "Formulario Web" }
      },
      "Estado": {
        select: { name: "Recibido" }
      },
      "Etapa": {
        select: { name: "Nuevo" }
      },
      "Fecha de entrada": {
        date: { start: new Date().toISOString().split('T')[0] }
      }
    };

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Notion error:', JSON.stringify(result));
      return res.status(500).json({ error: 'Failed to save', details: result.message });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Vercel Serverless Function — POST /api/brief
// Receives form data from the website and creates a page in Notion BRIEFS database

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID || 'd31c61488ec349dbb3b254d7bb0e06bc';

  if (!NOTION_API_KEY) {
    console.error('NOTION_API_KEY not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const data = req.body;

    // Build Notion page properties
    const properties = {
      // Title (required)
      "Nombre completo": {
        title: [{ text: { content: data.nombre || 'Sin nombre' } }]
      },
      // Email
      "Email": {
        email: data.email || null
      },
      // Phone
      "Teléfono": {
        phone_number: data.telefono || null
      },
      // Business name
      "Nombre del negocio": {
        rich_text: [{ text: { content: data.negocio || '' } }]
      },
      // Industry
      "Industria / Nicho": {
        rich_text: [{ text: { content: data.industria || '' } }]
      },
      // Website
      "Website": {
        url: data.website && data.website.trim() ? (data.website.startsWith('http') ? data.website : `https://${data.website}`) : null
      },
      // Social media
      "Redes sociales": {
        rich_text: [{ text: { content: data.redes || '' } }]
      },
      // What the business does
      "Qué hace tu negocio": {
        rich_text: [{ text: { content: data.que_hace || '' } }]
      },
      // Value proposition / differentiator
      "Propuesta de valor": {
        rich_text: [{ text: { content: data.diferenciador || '' } }]
      },
      // Ideal client
      "Cliente ideal": {
        rich_text: [{ text: { content: data.cliente_ideal || '' } }]
      },
      // Current branding
      "Branding actual": {
        rich_text: [{ text: { content: data.branding_actual || '' } }]
      },
      // Service of interest
      "Servicio de interés": {
        rich_text: [{ text: { content: data.servicio || '' } }]
      },
      // Main objectives
      "Objetivos principales": {
        rich_text: [{ text: { content: data.objetivos || '' } }]
      },
      // Deadline
      "Fecha límite": {
        rich_text: [{ text: { content: data.deadline || '' } }]
      },
      // Inspiration
      "Inspiración / Referencias": {
        rich_text: [{ text: { content: data.inspiracion || '' } }]
      },
      // Brand keywords
      "Palabras clave de marca": {
        rich_text: [{ text: { content: data.palabras_clave || '' } }]
      },
      // Additional notes
      "Notas adicionales": {
        rich_text: [{ text: { content: data.notas || '' } }]
      },
      // Source
      "Fuente": {
        select: { name: "Formulario web" }
      },
      // Channel
      "Canal de origen": {
        select: { name: "Formulario Web" }
      },
      // Status
      "Estado": {
        select: { name: "Recibido" }
      },
      // Stage
      "Etapa": {
        select: { name: "Nuevo" }
      },
      // Entry date
      "Fecha de entrada": {
        date: { start: new Date().toISOString().split('T')[0] }
      }
    };

    // Budget mapping
    if (data.presupuesto) {
      const budgetMap = {
        'Menos de $500': 'Menos de 500',
        '$500 - $1,000': '500 a 1000',
        '$1,000 - $2,500': '1000 a 2500',
        '$2,500 - $5,000': '2500 a 5000',
        '$5,000+': '5000+'
      };
      const mapped = budgetMap[data.presupuesto];
      if (mapped) {
        properties["Presupuesto estimado"] = { select: { name: mapped } };
      }
    }

    // Build page content with the story section
    let contentParts = [];
    if (data.historia) contentParts.push(`## Historia del negocio\n${data.historia}`);
    if (data.logro) contentParts.push(`## Mayor logro\n${data.logro}`);
    if (data.percepcion) contentParts.push(`## Percepción deseada\n${data.percepcion}`);

    const pageData = {
      parent: { database_id: DATABASE_ID },
      properties: properties
    };

    // Add content if there's story data
    if (contentParts.length > 0) {
      pageData.children = contentParts.join('\n\n').split('\n').filter(line => line.trim()).map(line => {
        if (line.startsWith('## ')) {
          return {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ type: 'text', text: { content: line.replace('## ', '') } }]
            }
          };
        }
        return {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: line } }]
          }
        };
      });
    }

    // Send to Notion
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(pageData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Notion API error:', JSON.stringify(result));
      return res.status(500).json({ error: 'Failed to save to Notion', details: result.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Brief guardado exitosamente',
      notionPageId: result.id
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Support large file uploads (PDFs, images, documents in base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Candidate models for basic text & summarization tasks in fallback order
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-flash-latest',
];

// Robust caller with automatic model fallback for high demand and rate limits
async function callGeminiWithRetryAndFallback(
  ai: GoogleGenAI,
  requestParamsBuilder: (model: string) => any
) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const params = requestParamsBuilder(model);
      const response = await ai.models.generateContent({
        model,
        ...params,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errMessage = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
      console.log(`[Gemini Request] Model ${model} unavailable, checking next fallback candidate... (${errMessage.slice(0, 120)})`);

      const isDemandOrRateLimit =
        errMessage.includes('503') ||
        errMessage.includes('UNAVAILABLE') ||
        errMessage.includes('high demand') ||
        errMessage.includes('429') ||
        errMessage.includes('RESOURCE_EXHAUSTED') ||
        errMessage.includes('overloaded');

      // If it's a structural error (not capacity/rate-limit), do not keep cycling models blindly
      if (!isDemandOrRateLimit) {
        break;
      }
    }
  }

  throw lastError;
}

function formatGeminiErrorMessage(error: any): string {
  const rawMsg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
  try {
    const jsonStart = rawMsg.indexOf('{');
    if (jsonStart !== -1) {
      const parsed = JSON.parse(rawMsg.slice(jsonStart));
      if (parsed?.error?.code === 503 || parsed?.error?.status === 'UNAVAILABLE' || rawMsg.includes('high demand')) {
        return 'Los modelos de IA están experimentando una alta demanda temporal. Por favor, reintenta en unos instantes.';
      }
      if (parsed?.error?.code === 429 || parsed?.error?.status === 'RESOURCE_EXHAUSTED') {
        return 'Se ha alcanzado temporalmente el límite de solicitudes. Por favor, espera unos segundos e intenta nuevamente.';
      }
      if (parsed?.error?.message) {
        return parsed.error.message;
      }
    }
  } catch {
    // Continue with text checks
  }

  if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand')) {
    return 'Los modelos de IA están experimentando una alta demanda temporal. Por favor, reintenta en unos instantes.';
  }
  if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
    return 'Límite de solicitudes alcanzado temporalmente. Por favor, espera unos segundos e intenta de nuevo.';
  }

  return rawMsg || 'Ocurrió un error al procesar la solicitud con el servicio de IA.';
}

// Lazy initialize GenAI instance
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Summarization API endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, files = [], options = {} } = req.body;

    if (!text && (!files || files.length === 0)) {
      return res.status(400).json({
        error: 'Debes proporcionar texto o al menos un archivo para resumir.',
      });
    }

    const ai = getGenAI();

    const summaryType = options.summaryType || 'executive';
    const length = options.length || 'medium';
    const language = options.language || 'es';
    const tone = options.tone || 'neutral';
    const customInstructions = options.customInstructions || '';
    const includeKeyTakeaways = options.includeKeyTakeaways ?? true;
    const includeActionItems = options.includeActionItems ?? false;
    const includeFlashcards = options.includeFlashcards ?? false;
    const includeGlossary = options.includeGlossary ?? false;

    // Type instructions mapping
    const typeInstructions: Record<string, string> = {
      executive: 'Resumen Ejecutivo: Directo, estructurado para toma de decisiones rápida, con antecedentes, puntos clave y conclusiones.',
      bullets: 'Puntos Clave y Viñetas: Estructura jerárquica con viñetas claras, conceptos en negrita y lectura sumamente rápida.',
      study: 'Guía de Estudio Académica: Estructurado por temas principales, explicaciones conceptuales, ejemplos clave y síntesis para repasar.',
      eli5: 'Explicación Sencilla (ELI5): Lenguaje claro, analogías intuitivas, sin jerga innecesaria pero manteniendo la exactitud.',
      deep: 'Resumen Exhaustivo y Profundo: Análisis completo, desglose exhaustivo de argumentos, evidencia, matices y conclusiones.',
      qa: 'Preguntas y Respuestas (Q&A): Formato estructurado de preguntas clave que el texto responde con sus respectivas explicaciones.',
      actionable: 'Plan de Acción y Pasos Clave: Orientado a ejecución, tareas concretas, metodologías y recomendaciones prácticas.',
      comparative: 'Tabla Comparativa y Análisis: Destacando similitudes, diferencias, pros/contras o categorizaciones en tablas.'
    };

    const lengthInstructions: Record<string, string> = {
      short: 'Extensión: Breve y conciso (aprox. 150-300 palabras). Prioriza máxima densidad de información.',
      medium: 'Extensión: Equilibrada (aprox. 400-800 palabras). Buen balance entre profundidad y rapidez de lectura.',
      detailed: 'Extensión: Detallada y completa (aprox. 900-1800 palabras). Cubre todos los aspectos con suficiente desarrollo.'
    };

    const languageNames: Record<string, string> = {
      es: 'Español',
      en: 'Inglés',
      fr: 'Francés',
      de: 'Alemán',
      pt: 'Portugués',
      it: 'Italiano',
      auto: 'el mismo idioma del documento de origen'
    };

    const systemPrompt = `Eres Sintaxis, un motor de síntesis y comprensión de lectura de nivel profesional con estética y precisión inspirada en Apple.
Tu objetivo es analizar los documentos y textos proporcionados y crear un resumen de máxima calidad, impecablemente estructurado, claro y elegante.

Debes responder SIEMPRE con un objeto JSON válido con la siguiente estructura exacta:
{
  "title": "Título descriptivo, elegante y conciso del resumen",
  "summary": "El contenido principal del resumen en formato Markdown limpio y profesional (usa encabezados ##, ###, viñetas, tablas cuando corresponda, negritas para ideas clave, citas)",
  "keyTakeaways": ["Idea clave 1", "Idea clave 2", "Idea clave 3", "Idea clave 4"],
  "actionItems": ["Punto de acción o recomendación 1", "Punto 2"],
  "flashcards": [
    { "question": "¿Pregunta sobre un concepto vital?", "answer": "Respuesta concisa y directa." }
  ],
  "glossary": [
    { "term": "Término técnico o clave", "definition": "Definición clara en 1-2 oraciones." }
  ],
  "sentimentOrTone": "Tono del contenido (ej: Informativo, Técnico, Persuasivo)",
  "estimatedReadingTimeMinutes": 3,
  "reductionRatio": "75%"
}

Instrucciones de formato y estilo:
- Idioma de salida obligatorio: ${languageNames[language] || 'Español'}.
- Tipo de formato solicitado: ${typeInstructions[summaryType] || typeInstructions.executive}.
- Longitud objetivo: ${lengthInstructions[length] || lengthInstructions.medium}.
- Tono: ${tone}.
${customInstructions ? `- INSTRUCCIONES ESPECÍFICAS DEL USUARIO (Prioridad Alta): "${customInstructions}"` : ''}
- ${includeKeyTakeaways ? 'Incluye 3-6 keyTakeaways sustanciales.' : 'Deja keyTakeaways vacío si no aplica.'}
- ${includeActionItems ? 'Incluye puntos de acción o pasos a seguir si el texto lo permite.' : 'Deja actionItems vacío si no aplica.'}
- ${includeFlashcards ? 'Incluye de 3 a 6 tarjetas de memoria (flashcards) para auto-evaluación del tema.' : 'Deja flashcards vacío si no aplica.'}
- ${includeGlossary ? 'Extrae términos especializados con sus definiciones en el glosario.' : 'Deja glossary vacío si no aplica.'}

Asegúrate de NO incluir texto fuera del bloque JSON.`;

    // Prepare contents array for Gemini
    const contents: any[] = [];

    // Add files if present (multimodal: PDFs, Images, Audio, Text files)
    if (Array.isArray(files) && files.length > 0) {
      for (const file of files) {
        if (file.data && file.mimeType) {
          // Clean base64 data if it includes data URL prefix
          const base64Clean = file.data.includes('base64,') 
            ? file.data.split('base64,')[1] 
            : file.data;

          contents.push({
            inlineData: {
              mimeType: file.mimeType,
              data: base64Clean,
            },
          });
        }
      }
    }

    // Add main user text prompt
    let userPromptText = 'Por favor analiza el contenido adjunto y genera el resumen estructurado siguiendo las especificaciones.';
    if (text && text.trim()) {
      userPromptText = `Texto a analizar y resumir:\n"""\n${text}\n"""\n\nGenera el resumen estructurado según las especificaciones requeridas.`;
    }

    contents.push({
      text: userPromptText,
    });

    const response = await callGeminiWithRetryAndFallback(ai, (model) => ({
      contents: contents.length === 1 ? contents[0].text : { parts: contents },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    }));

    const outputText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(outputText);
    } catch (parseErr) {
      // Fallback in case of JSON parse quirk
      const jsonMatch = outputText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        parsedResult = {
          title: 'Resumen Generado',
          summary: outputText,
          keyTakeaways: [],
          actionItems: [],
          flashcards: [],
          glossary: [],
          estimatedReadingTimeMinutes: 2,
          reductionRatio: '70%',
        };
      }
    }

    // Calculate word counts and metadata
    const summaryWords = (parsedResult.summary || '').split(/\s+/).filter(Boolean).length;
    const originalWords = (text || '').split(/\s+/).filter(Boolean).length || summaryWords * 3;
    const reductionPercent = Math.max(10, Math.min(95, Math.round((1 - summaryWords / (originalWords || 1)) * 100)));

    res.json({
      success: true,
      data: {
        id: 'sum_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title: parsedResult.title || 'Resumen Sintaxis',
        summary: parsedResult.summary || '',
        keyTakeaways: parsedResult.keyTakeaways || [],
        actionItems: parsedResult.actionItems || [],
        flashcards: parsedResult.flashcards || [],
        glossary: parsedResult.glossary || [],
        sentimentOrTone: parsedResult.sentimentOrTone || tone,
        stats: {
          originalWords,
          summaryWords,
          reductionPercentage: reductionPercent,
          readTimeMinutes: parsedResult.estimatedReadingTimeMinutes || Math.max(1, Math.ceil(summaryWords / 200)),
        },
        createdAt: new Date().toISOString(),
        options,
      },
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    const friendlyMessage = formatGeminiErrorMessage(error);
    res.status(500).json({
      error: friendlyMessage,
    });
  }
});

// Interactive Ask / Chat with Summary endpoint
app.post('/api/ask', async (req, res) => {
  try {
    const { summaryContent, originalText, question, conversation = [] } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'La pregunta no puede estar vacía.' });
    }

    const ai = getGenAI();

    const systemPrompt = `Eres el asistente inteligente de lectura de Sintaxis.
Tienes acceso al resumen y al texto original del documento analizado.
Tu tarea es responder preguntas con claridad, precisión y brevedad basándote en la información proporcionada.
Si la información no se encuentra en el documento, indícalo cortésmente.
Usa formato Markdown elegante y conciso.`;

    const contextText = `Contexto del Documento Resumido:\n\nRESUMEN:\n${summaryContent || 'No disponible'}\n\n${originalText ? `TEXTO ORIGINAL / REFERENCIA:\n${originalText.slice(0, 8000)}` : ''}`;

    const prompt = `${contextText}\n\nPregunta del usuario: ${question}\n\nPor favor responde de manera concisa y clara.`;

    const response = await callGeminiWithRetryAndFallback(ai, (model) => ({
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      },
    }));

    res.json({
      success: true,
      answer: response.text || 'No fue posible formular una respuesta.',
    });
  } catch (error: any) {
    console.error('Error in ask endpoint:', error);
    const friendlyMessage = formatGeminiErrorMessage(error);
    res.status(500).json({
      error: friendlyMessage,
    });
  }
});

// Setup Vite development server or production static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sintaxis Server running on http://0.0.0.0:${PORT}`);
  });
}

start();

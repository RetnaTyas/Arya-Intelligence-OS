import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    system: 'Personal Intelligence OS v0.1',
  });
});

// Endpoint: Socratic Tutor Dialog
app.post('/api/tutor/socratic', async (req, res) => {
  try {
    const { concept, studentMessage, history, learnerState } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Local Socratic engine fallback when API key is not configured
      const localResponse = generateLocalSocraticResponse(concept, studentMessage, learnerState);
      return res.json(localResponse);
    }

    const systemInstruction = `
You are the Socratic Tutor & Feynman Sensor inside the "Personal Intelligence OS".
Your role is NOT to deliver lectures, but to:
1. Ask probing, curiosity-sparking Socratic questions based on the "WHY-first" philosophy (Rules -> Principles -> Derivation).
2. Never just give the final formula. Help the student derive it through thought experiments, causal chains, and predictions.
3. Act as a Feynman Sensor: detect whether the student really understands the mechanism or is just repeating buzzwords.
4. Detect cognitive misconceptions (e.g. confusing mass with density, thinking heavier objects always sink, or treating algebra as 'magic steps').
5. Respond in Indonesian (Bahasa Indonesia) warmly, concisely (2-4 sentences max), accompanied by a provocative question or thought experiment.

Concept context: ${JSON.stringify(concept || 'General')}
Current learner state: ${JSON.stringify(learnerState || {})}
`;

    const chatContents = (history || []).map((h: any) => `${h.role === 'student' ? 'Student' : 'Tutor'}: ${h.text}`).join('\n');
    const prompt = `${chatContents}\nStudent: ${studentMessage || 'Halo, saya ingin memahami konsep ini.'}\nTutor:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'Bagaimana menurutmu hal itu bisa terjadi jika kita telaah dari sebab akibatnya?';
    res.json({ text: replyText, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Error in Socratic tutor:', error);
    res.json({
      text: 'Mari kita telusuri: apa yang sesungguhnya terjadi pada partikel air ketika benda diletakkan di atasnya?',
      source: 'local-fallback',
      error: error.message,
    });
  }
});

// Endpoint: Feynman Sensor Diagnosis
app.post('/api/diagnose/feynman', async (req, res) => {
  try {
    const { conceptName, studentExplanation, expectedPrinciple } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const localDiag = generateLocalFeynmanDiagnosis(conceptName, studentExplanation);
      return res.json(localDiag);
    }

    const systemInstruction = `
You are the Feynman Sensor in Personal Intelligence OS.
Analyze the student's verbal explanation of a concept.
You must output strictly JSON matching this structure:
{
  "conceptualUnderstanding": number (0.0 to 1.0),
  "causalReasoning": number (0.0 to 1.0),
  "transferScore": number (0.0 to 1.0),
  "analogyDetected": boolean,
  "misconceptions": string[],
  "feedbackSummary": string,
  "nextBestProbe": string
}

Concept: "${conceptName}"
Expected Principle: "${expectedPrinciple || 'Fundamental causal mechanism'}"
Do not output markdown codeblocks if possible, or ensure clean JSON.
`;

    const prompt = `Student explanation: "${studentExplanation}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in Feynman Sensor:', error);
    const fallback = generateLocalFeynmanDiagnosis(req.body.conceptName, req.body.studentExplanation);
    res.json(fallback);
  }
});

// Fallback intelligent helpers
function generateLocalSocraticResponse(concept: string, studentMessage: string, learnerState: any) {
  const msg = (studentMessage || '').toLowerCase();
  if (concept?.toLowerCase().includes('buoyancy') || concept?.toLowerCase().includes('apung') || concept?.toLowerCase().includes('fluid')) {
    if (msg.includes('berat') && !msg.includes('massa jenis') && !msg.includes('volume')) {
      return {
        text: 'Menarik! Kamu menyebutkan bahwa berat menentukan apakah benda tenggelam. Tetapi bayangkan ini: kapal induk baja beratnya ratusan ribu ton dan mengapung, sedangkan sebutir kelereng besi kecil langsung tenggelam. Bagaimana kamu menjelaskan teka-teki ini?',
        source: 'socratic-engine',
        detectedMisconception: 'berat menentukan tenggelam/mengapung',
      };
    }
    if (msg.includes('volume') || msg.includes('desak') || msg.includes('pindah')) {
      return {
        text: 'Tepat sekali! Saat lambung kapal yang berongga mendesak air, air itu melawan balik ke atas dengan gaya apung. Apa yang terjadi jika volume air yang dipindahkan menghasilkan gaya ke atas yang melebihi berat total kapal?',
        source: 'socratic-engine',
      };
    }
    return {
      text: 'Pertanyaan bagus! Sebelum kita melihat rumusnya, apa yang kamu rasakan ketika mencoba menekan bola plastik berongga ke dalam air kolam renang? Kenapa ada dorongan kuat ke atas?',
      source: 'socratic-engine',
    };
  }

  if (concept?.toLowerCase().includes('aljabar') || concept?.toLowerCase().includes('equality') || concept?.toLowerCase().includes('persamaan')) {
    if (msg.includes('pindah ruas')) {
      return {
        text: 'Di sekolah sering dikatakan "pindahkan x ke kanan jadi minus". Tapi dari mana aturan itu lahir? Jika timbangan berada dalam keadaan seimbang sempurna, apa yang harus kita lakukan pada kedua sisi agar timbangan tetap seimbang?',
        source: 'socratic-engine',
        detectedMisconception: 'aljabar dianggap aturan manipulasi magis',
      };
    }
    return {
      text: 'Pikirkan aljabar sebagai neraca seimbang. Persamaan bukanlah daftar perintah, melainkan pernyataan bahwa sisi kiri dan sisi kanan memiliki bobot yang sama. Apa operasi yang menjaga kesetaraan ini?',
      source: 'socratic-engine',
    };
  }

  return {
    text: `Mari kita telaah esensinya: apa alasan paling mendasar (prinsip WHY) yang membuat fenomena ${concept || 'ini'} bekerja demikian? Coba buat satu analogi sederhana.`,
    source: 'socratic-engine',
  };
}

function generateLocalFeynmanDiagnosis(conceptName: string, explanation: string) {
  const text = (explanation || '').toLowerCase();
  const hasCausal = text.includes('karena') || text.includes('sebab') || text.includes('mengakibatkan') || text.includes('sehingga');
  const hasAnalogy = text.includes('seperti') || text.includes('ibarat') || text.includes('mirip') || text.includes('misal');
  const mentionsWeightOnly = text.includes('berat') && !text.includes('massa jenis') && !text.includes('volume') && !text.includes('desak');

  let misconceptions: string[] = [];
  if (mentionsWeightOnly && (conceptName.toLowerCase().includes('apung') || conceptName.toLowerCase().includes('buoyancy'))) {
    misconceptions.push('berat menentukan tenggelam/mengapung');
  }

  const conceptual = mentionsWeightOnly ? 0.45 : (text.length > 50 ? 0.88 : 0.65);
  const causal = hasCausal ? 0.82 : 0.52;
  const transfer = hasAnalogy ? 0.74 : 0.48;

  return {
    conceptualUnderstanding: conceptual,
    causalReasoning: causal,
    transferScore: transfer,
    analogyDetected: hasAnalogy,
    misconceptions,
    feedbackSummary: misconceptions.length > 0
      ? 'Terdeteksi hipotesis berat intuitif. Perlu dialihkan ke perbandingan massa jenis dan volume fluida yang dipindahkan.'
      : 'Penalaran sebab-akibat teridentifikasi dengan baik. Mampu menjelaskan mekanisme dasar secara logis.',
    nextBestProbe: misconceptions.length > 0
      ? 'Ajak menguji perbandingan massa jenis di Lab Simulasi Fluida.'
      : 'Uji kemampuan transfer ke skenario baru (misalnya kapal selam di air tawar vs air laut).',
  };
}

// Vite middleware for development & static serving for production
async function startServer() {
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
    console.log(`Personal Intelligence OS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

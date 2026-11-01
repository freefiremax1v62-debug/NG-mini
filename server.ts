import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '30mb' }));

// Initialize GoogleGenAI SDK according to gemini-api skill instructions
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_MODEL = 'gemini-3.8-flash';

function safeJsonParse(rawText: string | undefined, fallback: any = {}) {
  if (!rawText) return fallback;
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('safeJsonParse failed, raw was:', rawText);
    return fallback;
  }
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Endpoint: Snap & Solve OCR + Step-by-Step Problem Solving
app.post('/api/ai/solve-question', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, textQuery, language = 'english' } = req.body;

    if (!imageBase64 && !textQuery) {
      return res.status(400).json({ error: 'Please provide an image or question text.' });
    }

    const systemInstruction = `You are "NG Chat", the premier AI Tutor and Homework Assistant for students.
Your mission is to guide students to genuine mastery with clarity, warmth, and step-by-step mathematical & scientific precision.
Language instruction: Respond in ${language} (if Hinglish, use a natural friendly mix of Hindi in Latin script and English familiar to Indian & international students; if Hindi, use clear Hindi with English technical terms).

You must analyze the student's question (from text or image OCR) and produce a detailed structured JSON response.
Always identify:
1. Exact detected question text.
2. Subject (e.g., Algebra, Physics, Chemistry, Biology, Geometry, Calculus, Economics, etc.).
3. Core concept or theorem/formula involved.
4. Summary of what the question is asking.
5. An array of logical sequential steps. For each step:
   - stepNumber
   - title
   - explanation (clear, educational explanation)
   - mathFormula (clean LaTeX/KaTeX string or expression, if applicable)
   - hint (a subtle clue to prompt active student thinking)
6. Final answer clearly highlighted.
7. "Why this answer is correct" explanation.
8. One similar practice question for the student to test their understanding.`;

    const contents: any[] = [];
    if (imageBase64) {
      // Clean base64 string if it contains data prefix
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const promptText = textQuery 
      ? `Solve this question with step-by-step breakdown: "${textQuery}"`
      : 'Carefully scan and OCR the question in this image, identify formulas, equations, or diagrams, and provide a full step-by-step educational solution.';
    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedQuestion: { type: Type.STRING, description: 'The exact question detected via OCR or text' },
            subject: { type: Type.STRING, description: 'Primary subject category' },
            subTopic: { type: Type.STRING, description: 'Subtopic or chapter' },
            conceptFormula: { type: Type.STRING, description: 'Key concept or formula needed' },
            whatIsAsked: { type: Type.STRING, description: 'Plain language breakdown of what is being asked' },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  mathFormula: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ['stepNumber', 'title', 'explanation'],
              },
            },
            finalAnswer: { type: Type.STRING, description: 'Clear final answer' },
            whyItWorks: { type: Type.STRING, description: 'Why this answer is correct' },
            practiceQuestion: { type: Type.STRING, description: 'A similar practice question to try next' },
          },
          required: ['detectedQuestion', 'subject', 'conceptFormula', 'whatIsAsked', 'steps', 'finalAnswer', 'whyItWorks'],
        },
      },
    });

    const parsed = safeJsonParse(response.text, {});
    return res.json({ success: true, solution: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/solve-question:', error);
    return res.status(500).json({
      error: error.message || 'Failed to solve question. Please verify your input.',
    });
  }
});

// Endpoint: AI Personal Tutor Chat
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages = [], language = 'english', studentLevel = 'High School', activeSubject = 'General' } = req.body;

    const systemInstruction = `You are "NG Chat", a friendly, ultra-knowledgeable personal AI tutor mascot named "Nogi".
Target Student Level: ${studentLevel}
Subject Focus: ${activeSubject}
Language Preference: ${language} (support English, Hindi, and Hinglish naturally).

Core Personality & Rules:
1. Warm, encouraging, patient, and pedagogically sound.
2. Use clear formatting with bullet points and bold highlights.
3. Write math formulas in KaTeX format, e.g. $2x + 5 = 15$ or $$\\int_0^1 x^2 dx = \\frac{1}{3}$$.
4. Use real-life analogies to make abstract concepts intuitive (like comparing electricity to water flowing in pipes, or mitosis to photocopying a recipe).
5. Offer quick follow-up prompt suggestions at the bottom under "**Suggested follow-ups:**" to spark curiosity.
6. If the student made a mistake in their previous response, gently diagnose WHY the mistake happened without making them feel bad.`;

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      success: true,
      text: response.text || "I'm here to help! Could you please repeat your question?",
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return res.status(500).json({ error: error.message || 'Error communicating with AI Tutor.' });
  }
});

// Endpoint: Practice Test Generator (MCQ with 4 options, auto scoring, hints)
app.post('/api/ai/generate-test', async (req: Request, res: Response) => {
  try {
    const { subject = 'Mathematics', topic = 'Algebra', numQuestions = 5, difficulty = 'medium', studentLevel = 'High School' } = req.body;

    const systemInstruction = `You are a test preparation expert for ${subject}. Generate a focused, high-yield practice quiz on the topic "${topic}" for ${studentLevel} level at ${difficulty} difficulty.
Each question MUST have exactly 4 choices (index 0, 1, 2, 3), one correct option, a helpful hint, and a comprehensive explanation covering why the correct choice is right and common pitfalls in the wrong options.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `Generate ${numQuestions} multiple choice questions for ${subject} - ${topic}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            testTitle: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            estimatedMinutes: { type: Type.INTEGER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Array of exactly 4 option strings',
                  },
                  correctIndex: { type: Type.INTEGER, description: '0 to 3' },
                  hint: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  subTopic: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'hint', 'explanation'],
              },
            },
          },
          required: ['testTitle', 'subject', 'topic', 'questions'],
        },
      },
    });

    const parsed = safeJsonParse(response.text, {});
    return res.json({ success: true, test: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-test:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate test.' });
  }
});

// Endpoint: Learn Topics With Ease (Guided lessons, analogies, definitions, formula notes)
app.post('/api/ai/learn-topic', async (req: Request, res: Response) => {
  try {
    const { subject, topic, language = 'english' } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ error: 'Subject and topic are required.' });
    }

    const systemInstruction = `You are NG Chat's master educator.
Craft a comprehensive, engaging interactive study lesson for "${topic}" in "${subject}".
Language: ${language}.
Include:
1. Executive summary / what is this topic.
2. Real-world analogy (e.g. connecting physics or biology to sports, video games, food, or everyday life).
3. Core definitions and formulas with mathematical notation.
4. Step-by-step example problem solved with clarity.
5. Common student misconceptions.
6. Key takeaways / revision cheat sheet bullet points.
7. 2 quick comprehension check questions.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `Teach me the topic "${topic}" in "${subject}" thoroughly with analogies and examples.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            summary: { type: Type.STRING },
            realWorldAnalogy: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                story: { type: Type.STRING },
                connection: { type: Type.STRING },
              },
              required: ['title', 'story', 'connection'],
            },
            definitionsAndFormulas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  formula: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            stepByStepExample: {
              type: Type.OBJECT,
              properties: {
                problem: { type: Type.STRING },
                solutionSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                finalAnswer: { type: Type.STRING },
              },
              required: ['problem', 'solutionSteps', 'finalAnswer'],
            },
            commonMistakes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            takeawayNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedVideoKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'summary', 'realWorldAnalogy', 'definitionsAndFormulas', 'stepByStepExample', 'takeawayNotes'],
        },
      },
    });

    const parsed = safeJsonParse(response.text, {});
    return res.json({ success: true, lesson: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/learn-topic:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate topic lesson.' });
  }
});

// Endpoint: AI Learning Tools (Explain simply, Translate, Rephrase, Analogy, Summarize, Generate Notes)
app.post('/api/ai/tool-action', async (req: Request, res: Response) => {
  try {
    const { tool, content, targetLanguage = 'Hindi' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    let instruction = '';
    switch (tool) {
      case 'simple':
        instruction = 'Explain this concept in extremely simple words like you are explaining it to a 10-year-old. Use plain language and no heavy jargon.';
        break;
      case 'translate':
        instruction = `Translate and explain the following educational text accurately into ${targetLanguage}. Keep math notations intact.`;
        break;
      case 'rephrase':
        instruction = 'Rephrase this explanation in 2 different clearer ways that make it much easier to remember and visualize.';
        break;
      case 'analogy':
        instruction = 'Provide a vivid, relatable real-world analogy for this concept (e.g., relating it to cooking, sports, smartphones, or daily life).';
        break;
      case 'summarize':
        instruction = 'Summarize this educational content into 4 concise bullet points for quick revision.';
        break;
      case 'notes':
        instruction = 'Convert this content into structured revision study notes with headings, bullet points, key formulas, and exam tips.';
        break;
      case 'hint':
        instruction = 'Provide a helpful Socratic hint for this question that nudges the student in the right direction without spoiling the final answer.';
        break;
      default:
        instruction = 'Clarify and explain this educational content in depth.';
    }

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `${instruction}\n\nContent:\n"${content}"`,
    });

    return res.json({ success: true, result: response.text || '' });
  } catch (error: any) {
    console.error('Error in /api/ai/tool-action:', error);
    return res.status(500).json({ error: error.message || 'Failed to process AI learning tool.' });
  }
});

// Explicit Android APK Download Route
app.get(['/ng-chat-ai-tutor.apk', '/api/download-apk'], (req: Request, res: Response) => {
  const apkPath = path.resolve(__dirname, 'public/ng-chat-ai-tutor.apk');
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="ng-chat-ai-tutor.apk"');
  res.sendFile(apkPath);
});

// Explicit Android Studio Project ZIP Download Route
app.get('/ng-chat-android-source.zip', (req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'public/ng-chat-android-source.zip');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="ng-chat-android-source.zip"');
  res.sendFile(zipPath);
});

// Server bootstrap with Vite middleware
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NG Chat AI Tutor Server running on port ${PORT}`);
  });
}

startServer();

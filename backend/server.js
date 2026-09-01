require('dotenv').config();
console.log('Key loaded:', process.env.GROQ_API_KEY ? 'YES' : 'NO');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse').default || require('pdf-parse');
const mammoth = require('mammoth');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const CHUNK_SIZE = 35000;

const PROMPTS = {
  bullets: 'Summarize the following document in 5-8 clear bullet points. Focus on the main ideas and key facts.',
  paragraph: 'Summarize the following document in a well-organized paragraph of 4-6 sentences. Focus on the main ideas and key facts.',
  abstract: 'Write a formal, academic-style abstract (150-250 words) summarizing the following document, covering purpose, method, and key findings if applicable.',
  eli5: 'Explain the following document in simple terms, as if explaining it to someone with no background knowledge on the topic. Use short sentences and everyday language.',
};

const SUPPORTED_TYPES = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

async function extractText(file) {
  const kind = SUPPORTED_TYPES[file.mimetype];

  if (kind === 'pdf') {
    const data = await pdfParse(file.buffer);
    return data.text.trim();
  }

  if (kind === 'txt') {
    return file.buffer.toString('utf-8').trim();
  }

  if (kind === 'docx') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value.trim();
  }

  throw new Error('Unsupported file type');
}

function splitIntoChunks(text, size) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

async function summarizeText(text, promptInstruction) {
  const completion = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      {
        role: 'user',
        content: `${promptInstruction}\n\nDocument:\n${text}`,
      },
    ],
    max_tokens: 1000,
  });
  return completion.choices[0]?.message?.content || '';
}

app.post('/api/summarize', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!SUPPORTED_TYPES[req.file.mimetype]) {
      return res.status(400).json({
        error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.',
      });
    }

    const style = PROMPTS[req.body.style] ? req.body.style : 'bullets';
    const promptInstruction = PROMPTS[style];

    const text = await extractText(req.file);

    if (!text) {
      return res.status(400).json({ error: 'Could not extract any text from this file' });
    }

    let summary;

    if (text.length <= CHUNK_SIZE) {
      summary = await summarizeText(text, promptInstruction);
    } else {
      const chunks = splitIntoChunks(text, CHUNK_SIZE);
      console.log(`Document split into ${chunks.length} chunks for summarization`);

      const chunkSummaries = [];
      for (let i = 0; i < chunks.length; i++) {
        const partial = await summarizeText(
          chunks[i],
          'Summarize the key points of the following section of a larger document. Be concise.'
        );
        chunkSummaries.push(partial);
      }

      const combinedText = chunkSummaries.join('\n\n');
      summary = await summarizeText(
        combinedText,
        `${promptInstruction} The text below consists of section-by-section summaries of a longer document — combine them into one coherent final summary.`
      );
    }

    res.json({ summary });
  } catch (err) {
    console.error('Summarize error:', err);
    res.status(500).json({ error: 'Something went wrong while summarizing the document' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
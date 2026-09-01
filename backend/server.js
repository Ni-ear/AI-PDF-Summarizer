require('dotenv').config();
console.log('Key loaded:', process.env.GROQ_API_KEY ? 'YES' : 'NO');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse').default || require('pdf-parse');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // raised to 15MB since we now handle long docs
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ~4 chars per token; keep each chunk comfortably under the model's context limit
const CHUNK_SIZE = 35000;

const PROMPTS = {
  bullets: 'Summarize the following document in 5-8 clear bullet points. Focus on the main ideas and key facts.',
  paragraph: 'Summarize the following document in a well-organized paragraph of 4-6 sentences. Focus on the main ideas and key facts.',
  abstract: 'Write a formal, academic-style abstract (150-250 words) summarizing the following document, covering purpose, method, and key findings if applicable.',
  eli5: 'Explain the following document in simple terms, as if explaining it to someone with no background knowledge on the topic. Use short sentences and everyday language.',
};

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

app.post('/api/summarize', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const style = PROMPTS[req.body.style] ? req.body.style : 'bullets';
    const promptInstruction = PROMPTS[style];

    const data = await pdfParse(req.file.buffer);
    const text = data.text.trim();

    if (!text) {
      return res.status(400).json({ error: 'Could not extract any text from this PDF' });
    }

    let summary;

    if (text.length <= CHUNK_SIZE) {
      // Short enough for a single pass
      summary = await summarizeText(text, promptInstruction);
    } else {
      // Long document: summarize each chunk, then combine the chunk summaries
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
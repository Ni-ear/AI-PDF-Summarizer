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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Roughly 4 chars per token; keep well under the model's context limit
const MAX_CHARS = 40000;

app.post('/api/summarize', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Extract text from the uploaded PDF
    const data = await pdfParse(req.file.buffer);
    let text = data.text.trim();

    if (!text) {
      return res.status(400).json({ error: 'Could not extract any text from this PDF' });
    }

    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS);
    }

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'user',
          content: `Summarize the following document in 5-8 clear bullet points. Focus on the main ideas and key facts.\n\nDocument:\n${text}`,
        },
      ],
      max_tokens: 1000,
    });

    const summary = completion.choices[0]?.message?.content || 'No summary generated.';

    res.json({ summary });
  } catch (err) {
    console.error('Summarize error:', err);
    res.status(500).json({ error: 'Something went wrong while summarizing the document' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
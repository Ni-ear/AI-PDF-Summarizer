# AI PDF Summarizer

A full-stack web app that lets you upload a PDF and get an instant AI-generated bullet-point summary powered by Groq's LLM API.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ai--pdf--summarizer--mu.vercel.app-blue)](https://ai-pdf-summarizer-mu.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-blue)](https://react.dev)

## Quick Start

**Try it live:** [ai-pdf-summarizer-mu.vercel.app](https://ai-pdf-summarizer-mu.vercel.app)  
_Note: First request may take 20-30s if the backend has been idle (Vercel cold start)_

## Demo Video

🎥 Watch it in action:

https://github.com/user-attachments/assets/9c2abc67-9875-442b-853f-fc14e3718340

## Features

- 📄 Upload any PDF and automatically extract its text
- 🤖 AI-generated summary in 5-8 clear bullet points
- ⚡ Fast inference powered by Groq's LLM API
- 🎨 Clean, responsive React interface with loading and error states
- 🚀 Deployed on Vercel (frontend) and backend serverless ready

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React, Vite, CSS |
| **Backend** | Node.js, Express, Multer, pdf-parse |
| **AI** | Groq API (`openai/gpt-oss-120b`) |

## Getting Started

### Prerequisites

- **Node.js** v18 or higher ([download](https://nodejs.org))
- **Groq API Key** (free tier available at [console.groq.com](https://console.groq.com))
  - Sign up for a free account
  - Generate an API key from your dashboard

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` folder with your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Start the server:
   ```bash
   node server.js
   ```
   Backend runs on `http://localhost:5000`

5. Verify it's working:
   ```bash
   curl http://localhost:5000/health
   ```

### Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## How It Works

```
User Uploads PDF → Frontend → Backend Extracts Text → Groq API Summarization → Result Displayed
```

1. **Upload**: User selects a PDF through the React interface
2. **Extract**: Backend receives the file and extracts text using `pdf-parse`
3. **Summarize**: Extracted text is sent to Groq's API with a summarization prompt
4. **Display**: AI-generated summary is returned and displayed as bullet points

## API Endpoints

### POST `/summarize`

Uploads a PDF and returns an AI-generated summary.

**Request:**
```bash
curl -X POST -F "file=@sample.pdf" http://localhost:5000/summarize
```

**Response:**
```json
{
  "summary": [
    "• First key point from the PDF",
    "• Second key point",
    "• Third key point",
    "..."
  ],
  "success": true
}
```

**Error Handling:**
- Invalid file type: 400
- File too large: 413
- API rate limit: 429
- Groq API issues: 502

## Project Structure

```
AI-PDF-Summarizer/
├── backend/
│   ├── server.js           # Express server & routes
│   ├── .env                # Environment variables (create this)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main component
│   │   └── main.jsx        # React entry point
│   ├── index.html
│   └── package.json
└── README.md
```

## Troubleshooting

### "First request takes 20-30 seconds"
This is normal on Vercel's free tier. The backend is running on a serverless cold start. Subsequent requests are much faster (~2-5s).

### "GROQ_API_KEY not found"
- Ensure you've created a `.env` file in the `backend` folder
- Verify the key is correctly copied from [console.groq.com](https://console.groq.com)
- Restart the backend server after adding the key

### "File upload fails"
- Check that the backend is running on `http://localhost:5000`
- Verify the PDF file is under 25 MB
- Try a smaller PDF first to test

### "Summary is incomplete or cut off"
- Try a PDF with clearer, well-formatted text
- Very large documents (100+ pages) may need chunking (see Future Improvements)

## Future Improvements

- [ ] Support for multi-document Q&A (RAG-style retrieval)
- [ ] Downloadable summary as PDF/text file
- [ ] Document chunking for files larger than 50 pages
- [ ] Summary tone/style selection (bullet points, paragraph, abstract, etc.)
- [ ] Support for other file formats (DOCX, TXT, images via OCR)
- [ ] Dark mode UI
- [ ] Summary history and favorites

## License

MIT License — See LICENSE file for details

## Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Author

Built by **Shaqkobe Dos P. Tejada**

- 🐙 [GitHub](https://github.com/Ni-ear)
- 🔗 [Portfolio](https://shaqkobe.dev)

---

If you found this helpful, please consider giving it a ⭐ on GitHub!

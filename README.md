# AI PDF Summarizer

A full-stack web app that transforms PDFs into AI-generated summaries in your choice of style—bullet points, paragraphs, academic abstracts, or simple explanations.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ai--pdf--summarizer--mu.vercel.app-blue)](https://ai-pdf-summarizer-mu.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-blue)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow)](#license)

## Quick Links

🔗 **[Try it live](https://ai-pdf-summarizer-mu.vercel.app)** | 📖 [Documentation](#getting-started) | 💡 [Features](#features)

> **Note:** First request may take 15-30s if the backend is idle (Vercel cold start). Subsequent requests are much faster (~2-5s).

## Demo

🎥 ** 

https://github.com/user-attachments/assets/ada34238-8138-486b-bf75-250d32625652

**  

_Show users what the UI looks like and how fast it is_

## Features

✨ **Smart Summarization**
- Upload any PDF and automatically extract its text
- Choose your summary style: **bullet points**, **paragraph**, **academic abstract**, or **simple explanation**
- Intelligent automatic chunking for long documents—no content lost to truncation

📥 **Easy Export**
- Download summaries as `.txt` files
- Copy-to-clipboard functionality (optional enhancement)

🎨 **User Experience**
- Clean, dark-themed React interface
- Real-time loading states and error handling
- Responsive design (mobile-friendly)

⚡ **Performance**
- Fast inference powered by Groq's LLM API
- Backend optimized for serverless deployment

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18+, Vite, react-markdown, CSS |
| **Backend** | Node.js (v18+), Express, Multer, pdf-parse |
| **AI Engine** | Groq API (`openai/gpt-oss-120b`) |
| **Deployment** | Vercel (frontend), Render (backend) |

## Getting Started

### Prerequisites

Before you start, make sure you have:

- ✅ **Node.js** v18 or higher ([download](https://nodejs.org))
- ✅ **Groq API Key** — Get it free at [console.groq.com](https://console.groq.com)
  - Sign up for a free account
  - Generate an API key from your dashboard

### Backend Setup

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the `backend` folder with your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
   ⚠️ **Important:** Add `.env` to your `.gitignore` to keep your API key safe.

4. **Start the server:**
   ```bash
   node server.js
   ```
   Backend runs on `http://localhost:5000`

5. **Verify it's working:**
   ```bash
   curl http://localhost:5000/health
   ```
   Expected response: `{"status": "ok"}`

### Frontend Setup

1. **Open a new terminal and navigate to the frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the dev server:**
   ```bash
   npm run dev
   ```

4. **Open your browser** at [http://localhost:5173](http://localhost:5173)

## How It Works

```
User Uploads PDF → Selects Style → Backend Extracts Text → Document Chunking (if needed) → Groq API Summarization → Download/View Result
```

### Step-by-Step Process

1. **Upload** — User selects a PDF and chooses their preferred summary style through the React interface
2. **Extract** — Backend receives the file and extracts text using `pdf-parse`
3. **Chunk** — If the document is long, it's automatically split into manageable chunks
4. **Summarize** — Each chunk is sent to Groq's API with a prompt tailored to the selected style
5. **Combine** — Individual summaries are merged into one coherent, final summary
6. **Download** — User can view the summary in the UI or download it as a `.txt` file

## API Endpoints

### POST `/summarize`

Uploads a PDF, summarizes it, and returns the result.

**Request:**
```bash
curl -X POST -F "file=@sample.pdf" -F "style=bullet" http://localhost:5000/summarize
```

**Query Parameters:**
- `style` (required) — Summary style: `bullet`, `paragraph`, `abstract`, or `simple`

**Response (Success):**
```json
{
  "success": true,
  "summary": "• First key point\n• Second key point\n• Third key point",
  "style": "bullet",
  "documentName": "sample.pdf"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "File size exceeds 25 MB limit"
}
```

**Status Codes:**
- `200` — Success
- `400` — Invalid file type or missing parameters
- `413` — File too large (>25 MB)
- `429` — API rate limit exceeded
- `502` — Groq API error

## Project Structure

```
AI-PDF-Summarizer/
├── backend/
│   ├── server.js              # Express server & API routes
│   ├── .env                   # Environment variables (create this)
│   ├── .gitignore             # Ensure .env is listed here
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── main.jsx           # React entry point
│   │   └── styles.css         # Styling
│   ├── index.html
│   └── package.json
└── README.md
```

## Troubleshooting

### ⏱️ "First request takes 20-30 seconds"
**Cause:** Vercel's free tier backend runs on serverless functions that cold-start.  
**Solution:** This is normal. Subsequent requests are much faster (~2-5s). For production, consider upgrading to a paid plan.

### 🔑 "GROQ_API_KEY not found"
**Steps to fix:**
1. Create a `.env` file in the `backend` folder (not in the root)
2. Copy your API key from [console.groq.com](https://console.groq.com)
3. Paste it as `GROQ_API_KEY=your_key_here`
4. Restart the backend server (`node server.js`)

### 📤 "File upload fails"
**Checklist:**
- ✅ Backend is running on `http://localhost:5000`
- ✅ PDF file is under 25 MB
- ✅ File has a `.pdf` extension
- ✅ No special characters in the filename

### 📝 "Summary is incomplete or cut off"
**Cause:** Very large PDFs may exceed token limits.  
**Solution:** The app now automatically chunks long documents. If issues persist, try:
- Using a PDF with clearer, well-formatted text
- Testing with a smaller sample of the document first

### 🚫 "CORS error in browser console"
**Solution:** Ensure your backend URL is correctly configured in the frontend. Check that `http://localhost:5000` matches your backend's actual address.

## ✅ Completed Features

- [x] Summary style selection (bullet points, paragraph, abstract, simple explanation)
- [x] Downloadable summaries as `.txt` files
- [x] Automatic document chunking for long PDFs (no content lost)
- [x] Dark-themed UI with loading/error states
- [x] Mobile-responsive design

## 🚀 Planned Improvements

- [ ] Support for multi-document Q&A (RAG-style retrieval)
- [ ] Additional file formats (DOCX, TXT, images via OCR)
- [ ] Dark/light mode toggle
- [ ] Summary history and favorites
- [ ] Copy-to-clipboard feature
- [ ] Advanced chunking strategies for better coherence
- [ ] API key validation before deployment

## Deployment

### Deploy Frontend to Vercel

1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Deploy automatically on every push

### Deploy Backend to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repo
3. Set environment variables (add `GROQ_API_KEY`)
4. Deploy

**Update frontend:** Change the API URL from `http://localhost:5000` to your Render backend URL.

## License

MIT License — See [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request** and describe your changes

## Author

Built by **Shaqkobe Dos P. Tejada**

- 🐙 [GitHub](https://github.com/Ni-ear)
- 🔗 [Portfolio](https://shaqkobe.dev)
- 💼 Open to collaboration and feedback!

---

## Support & Feedback

Found a bug? Have a feature request? [Open an issue](https://github.com/Ni-ear/AI-PDF-Summarizer/issues) on GitHub.

If you found this project helpful, please consider giving it a ⭐ on GitHub!

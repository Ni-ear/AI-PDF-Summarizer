# AI PDF Summarizer

A full-stack web app that lets you upload a PDF and get an instant AI-generated bullet-point summary.

## Demo

🎥 [Add your demo video/GIF here]

## Features

- Upload any PDF and extract its text automatically
- AI-generated summary in 5-8 clear bullet points
- Clean, simple React interface with loading and error states
- Fast inference powered by Groq's LLM API

## Tech Stack

**Frontend:** React, Vite
**Backend:** Node.js, Express, Multer (file uploads), pdf-parse
**AI:** Groq API (`openai/gpt-oss-120b`)

## Getting Started

### Prerequisites
- Node.js (v18+)
- A free Groq API key from [console.groq.com](https://console.groq.com)

### Backend Setup
1. Navigate to the backend folder:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the `backend` folder:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```
4. Start the server:
   ```
   node server.js
   ```
   The backend runs on `http://localhost:5000`.

### Frontend Setup
1. Navigate to the frontend folder:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. Open the app at `http://localhost:5173`.

## How It Works

1. User uploads a PDF through the React frontend.
2. The file is sent to the Express backend, which extracts its text using `pdf-parse`.
3. The extracted text is sent to Groq's API with a summarization prompt.
4. The AI-generated summary is returned and displayed in the UI.

## Future Improvements

- [ ] Support for multi-document Q&A (RAG-style)
- [ ] Downloadable summary as PDF/text file
- [ ] Support for larger documents via chunking

## Author

Built by Shaqkobe Dos P. Tejada — [GitHub](https://github.com/Ni-ear) | [Portfolio link]

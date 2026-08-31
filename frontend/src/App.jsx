import { useState } from 'react';

const BACKEND_URL = 'http://localhost:5000';

function App() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
    setSummary('');
  };

  const handleSummarize = async () => {
    if (!file) {
      setError('Please choose a PDF first.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await fetch(`${BACKEND_URL}/api/summarize`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to summarize the document.');
      }

      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>PDF Summarizer</h1>
      <p>Upload a PDF and get a quick bullet-point summary.</p>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      <div style={{ marginTop: 16 }}>
        <button onClick={handleSummarize} disabled={loading || !file}>
          {loading ? 'Summarizing...' : 'Summarize'}
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: 16 }}>{error}</p>}

      {summary && (
        <div style={{ marginTop: 24, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          <h2>Summary</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default App;

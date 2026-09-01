import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = 'https://ai-pdf-summarizer-ttn2.onrender.com';

const STYLE_OPTIONS = [
  { value: 'bullets', label: 'Bullet Points' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'abstract', label: 'Academic Abstract' },
  { value: 'eli5', label: 'Explain Simply' },
];

const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function App() {
  const [file, setFile] = useState(null);
  const [style, setStyle] = useState('bullets');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && !ALLOWED_TYPES.includes(selected.type)) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
    setSummary('');
  };

  const handleSummarize = async () => {
    if (!file) {
      setError('Please choose a file first.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('style', style);

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

  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const baseName = file?.name.replace(/\.(pdf|docx|txt)$/i, '') || 'summary';
    link.href = url;
    link.download = `${baseName}-summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>📄 Document Summarizer</h1>
        <p style={styles.subtitle}>
          Upload a PDF, DOCX, or TXT file and get a quick, clear summary.
        </p>

        <div style={styles.uploadRow}>
          <label style={styles.fileLabel}>
            {file ? file.name : 'Choose a file (PDF, DOCX, TXT)'}
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div style={styles.uploadRow}>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            style={styles.select}
          >
            {STYLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSummarize}
          disabled={loading || !file}
          style={{
            ...styles.button,
            opacity: loading || !file ? 0.5 : 1,
            cursor: loading || !file ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Summarizing…' : 'Summarize'}
        </button>

        {loading && (
          <p style={styles.note}>
            First request may take up to 30s while the server wakes up.
          </p>
        )}

        {error && <p style={styles.error}>{error}</p>}

        {summary && (
          <div style={styles.summaryBox}>
            <div style={styles.summaryHeader}>
              <h2 style={styles.summaryHeading}>Summary</h2>
              <button onClick={handleDownload} style={styles.downloadButton}>
                ⬇ Download
              </button>
            </div>
            <div style={styles.markdown}>
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f0f13',
    display: 'flex',
    justifyContent: 'center',
    padding: '48px 16px',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: 640,
    color: '#e8e8ec',
  },
  title: {
    fontSize: '2.2rem',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#a0a0ab',
    marginBottom: 28,
  },
  uploadRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fileLabel: {
    background: '#1c1c22',
    border: '1px solid #33333c',
    borderRadius: 10,
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#cfcfd6',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  select: {
    background: '#1c1c22',
    color: '#e8e8ec',
    border: '1px solid #33333c',
    borderRadius: 10,
    padding: '10px 16px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  button: {
    display: 'block',
    margin: '0 auto',
    background: '#6c5ce7',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    padding: '12px 28px',
    fontSize: '1rem',
    fontWeight: 600,
  },
  note: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#8a8a94',
    marginTop: 12,
  },
  error: {
    textAlign: 'center',
    color: '#ff6b6b',
    marginTop: 16,
  },
  summaryBox: {
    marginTop: 32,
    background: '#1a1a20',
    border: '1px solid #2c2c35',
    borderRadius: 14,
    padding: '24px 28px',
  },
  summaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryHeading: {
    margin: 0,
    fontSize: '1.3rem',
  },
  downloadButton: {
    background: '#2a2a33',
    color: '#e8e8ec',
    border: '1px solid #3a3a44',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  markdown: {
    lineHeight: 1.7,
    fontSize: '0.98rem',
    color: '#d8d8de',
  },
};

export default App;
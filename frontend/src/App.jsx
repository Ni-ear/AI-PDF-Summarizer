import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = 'https://ai-pdf-summarizer-ttn2.onrender.com';
const HISTORY_KEY = 'summaryHistory';
const MAX_HISTORY = 20;

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

const THEMES = {
  dark: {
    pageBg: '#0f0f13', text: '#e8e8ec', subtitleText: '#a0a0ab',
    fieldBg: '#1c1c22', fieldBorder: '#33333c', fieldText: '#cfcfd6',
    accent: '#6c5ce7', noteText: '#8a8a94', errorText: '#ff6b6b',
    boxBg: '#1a1a20', boxBorder: '#2c2c35', downloadBg: '#2a2a33',
    downloadBorder: '#3a3a44', markdownText: '#d8d8de',
  },
  light: {
    pageBg: '#f5f5f7', text: '#1a1a1f', subtitleText: '#5a5a63',
    fieldBg: '#ffffff', fieldBorder: '#d8d8de', fieldText: '#2a2a30',
    accent: '#6c5ce7', noteText: '#7a7a83', errorText: '#d63c3c',
    boxBg: '#ffffff', boxBorder: '#e2e2e8', downloadBg: '#eeeef2',
    downloadBorder: '#d0d0d8', markdownText: '#2e2e35',
  },
};

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function App() {
  const [file, setFile] = useState(null);
  const [style, setStyle] = useState('bullets');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [history, setHistory] = useState(loadHistory);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const t = THEMES[theme];

  const saveToHistory = (entry) => {
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavorite = (id) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      );
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteHistoryItem = (id) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const loadFromHistory = (item) => {
    setSummary(item.summary);
    setStyle(item.style);
    setFile({ name: item.fileName });
    setShowHistory(false);
  };

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
    if (!file || !file.type) {
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
      saveToHistory({
        id: Date.now().toString(),
        fileName: file.name,
        style,
        summary: data.summary,
        timestamp: new Date().toISOString(),
        favorite: false,
      });
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

  const sortedHistory = [...history].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <div style={{ ...styles.page, background: t.pageBg }}>
      <div style={{ ...styles.card, color: t.text }}>
        <div style={styles.topRow}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{ ...styles.themeToggle, background: t.fieldBg, border: `1px solid ${t.fieldBorder}`, color: t.text }}
            title="View history"
          >
            🕘
          </button>
          <h1 style={{ ...styles.title, color: t.text }}>📄 Document Summarizer</h1>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ ...styles.themeToggle, background: t.fieldBg, border: `1px solid ${t.fieldBorder}`, color: t.text }}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <p style={{ ...styles.subtitle, color: t.subtitleText }}>
          Upload a PDF, DOCX, or TXT file and get a quick, clear summary.
        </p>

        {showHistory && (
          <div style={{ ...styles.summaryBox, background: t.boxBg, border: `1px solid ${t.boxBorder}`, marginBottom: 24 }}>
            <h2 style={{ ...styles.summaryHeading, color: t.text, marginBottom: 16 }}>History</h2>
            {sortedHistory.length === 0 && (
              <p style={{ color: t.subtitleText }}>No summaries yet.</p>
            )}
            {sortedHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '10px 0',
                  borderBottom: `1px solid ${t.boxBorder}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  onClick={() => loadFromHistory(item)}
                  style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
                >
                  <div style={{ fontSize: '0.9rem', color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.fileName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: t.noteText }}>
                    {STYLE_OPTIONS.find((s) => s.value === item.style)?.label} · {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                  title="Favorite"
                >
                  {item.favorite ? '⭐' : '☆'}
                </button>
                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.errorText, fontSize: '0.9rem' }}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={styles.uploadRow}>
          <label style={{ ...styles.fileLabel, background: t.fieldBg, border: `1px solid ${t.fieldBorder}`, color: t.fieldText }}>
            {file ? file.name : 'Choose a file (PDF, DOCX, TXT)'}
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={styles.uploadRow}>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            style={{ ...styles.select, background: t.fieldBg, border: `1px solid ${t.fieldBorder}`, color: t.text }}
          >
            {STYLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSummarize}
          disabled={loading || !file}
          style={{ ...styles.button, background: t.accent, opacity: loading || !file ? 0.5 : 1, cursor: loading || !file ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Summarizing…' : 'Summarize'}
        </button>

        {loading && (
          <p style={{ ...styles.note, color: t.noteText }}>
            First request may take up to 30s while the server wakes up.
          </p>
        )}

        {error && <p style={{ ...styles.error, color: t.errorText }}>{error}</p>}

        {summary && (
          <div style={{ ...styles.summaryBox, background: t.boxBg, border: `1px solid ${t.boxBorder}` }}>
            <div style={styles.summaryHeader}>
              <h2 style={{ ...styles.summaryHeading, color: t.text }}>Summary</h2>
              <button
                onClick={handleDownload}
                style={{ ...styles.downloadButton, background: t.downloadBg, border: `1px solid ${t.downloadBorder}`, color: t.text }}
              >
                ⬇ Download
              </button>
            </div>
            <div style={{ ...styles.markdown, color: t.markdownText }}>
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '48px 16px', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  card: { width: '100%', maxWidth: 640 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '2.2rem', textAlign: 'center', margin: 0, flex: 1 },
  themeToggle: { width: 40, height: 40, borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer' },
  subtitle: { textAlign: 'center', marginTop: 8, marginBottom: 28 },
  uploadRow: { display: 'flex', justifyContent: 'center', marginBottom: 16 },
  fileLabel: { borderRadius: 10, padding: '12px 20px', cursor: 'pointer', fontSize: '0.95rem', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  select: { borderRadius: 10, padding: '10px 16px', fontSize: '0.9rem', cursor: 'pointer' },
  button: { display: 'block', margin: '0 auto', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: '1rem', fontWeight: 600 },
  note: { textAlign: 'center', fontSize: '0.85rem', marginTop: 12 },
  error: { textAlign: 'center', marginTop: 16 },
  summaryBox: { marginTop: 32, borderRadius: 14, padding: '24px 28px' },
  summaryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryHeading: { margin: 0, fontSize: '1.3rem' },
  downloadButton: { borderRadius: 8, padding: '6px 14px', fontSize: '0.85rem', cursor: 'pointer' },
  markdown: { lineHeight: 1.7, fontSize: '0.98rem' },
};

export default App;
import { useState } from 'react';

interface Result {
  id: string;
  title: string;
  body: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setMessage('Please enter a search query.');
      return;
    }

    setLoading(true);
    setMessage('');
    setResults([]);
    setSummary('');

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Something went wrong');
      } else if (data.results.length === 0) {
        setMessage(data.message || 'No matches found');
      } else {
        setResults(data.results);
        setSummary(data.summary);
      }
    } catch (error) {
      setMessage('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Mini Full-Stack Search</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border rounded p-2 w-64"
          placeholder="Enter search term..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {message && <p className="text-gray-600 mt-2">{message}</p>}

      {results.length > 0 && (
        <div className="mt-6 w-full max-w-lg">
          <h2 className="font-semibold text-lg mb-2">Top Results:</h2>
          {results.map((r) => (
            <div key={r.id} className="border rounded p-3 mb-3">
              <h3 className="font-bold">{r.title}</h3>
              <p className="text-sm text-gray-700">{r.body}</p>
            </div>
          ))}
          <div className="mt-4">
            <h3 className="font-semibold">Summary:</h3>
            <p className="text-sm text-gray-700">{summary}</p>
          </div>
        </div>
      )}
    </main>
  );
}

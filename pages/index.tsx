import { useState } from 'react';
import { motion } from "framer-motion";

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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-8 border border-gray-100 dark:border-gray-700 transition-all">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          🔍 Mini Full-Stack Search
        </h1>

        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-800 dark:text-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Enter search term..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className={`px-5 py-2 rounded-lg text-white font-medium transition-all ${
              loading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2 mb-4">{message}</p>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-4 space-y-4">
            <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200">
              Top Results
            </h2>

            {results.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md dark:hover:shadow-gray-700/30 transition-shadow bg-gray-50 dark:bg-gray-800"
              >
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                  {r.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 leading-relaxed">
                  {r.body}
                </p>
              </motion.div>
            ))}

            {/* Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 p-4 rounded-xl mt-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Summary</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {summary}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-gray-500 dark:text-gray-400 text-xs text-center mt-6">
          © {new Date().getFullYear()} Mini Full-Stack Search • Next.js + TypeScript
        </footer>
      </div>
    </main>
  );
}

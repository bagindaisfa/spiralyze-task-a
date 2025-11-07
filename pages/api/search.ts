import type { NextApiRequest, NextApiResponse } from 'next';
import faqs from '../../data/faqs.json';

interface Faq {
  id: string;
  title: string;
  body: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({ message: 'Query cannot be empty' });
  }

  const lowerQuery = query.toLowerCase();

  const scored = (faqs as Faq[]).map((faq) => {
    const titleMatch = faq.title.toLowerCase().includes(lowerQuery) ? 1 : 0;
    const bodyMatch = faq.body.toLowerCase().includes(lowerQuery) ? 0.5 : 0;
    const score = titleMatch + bodyMatch;
    return { ...faq, score };
  });

  const results = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (results.length === 0) {
    return res.status(200).json({
      message: 'No matches found',
      results: [],
    });
  }

  const summary = results
    .map((r) => r.body)
    .join(' ')
    .split('. ')
    .slice(0, 3)
    .join('. ') + '.';

  const sources = results.map((r) => r.id);

  return res.status(200).json({
    results,
    summary,
    sources,
  });
}

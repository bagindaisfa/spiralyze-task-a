import type { NextApiRequest, NextApiResponse } from 'next';
import faqs from '../../data/faqs.json';

/**
 * FAQ item structure from the dataset
 */
interface Faq {
  id: string;
  title: string;
  body: string;
}

/**
 * API Route: /api/search
 *
 * Handles search requests over a local JSON dataset (faqs.json).
 * The search uses a simple scoring system:
 *   - +1 point if the query appears in the title
 *   - +0.5 points if the query appears in the body
 *
 * Returns the top 3 matching results, a combined summary,
 * and the list of matched IDs as sources.
 *
 * Method: POST
 * Request body: { query: string }
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Extract the query from the request body
  const { query } = req.body;

  // Validate query: must be a non-empty string
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({ message: 'Query cannot be empty' });
  }

  // Normalize query for case-insensitive comparison
  const lowerQuery = query.toLowerCase();

  /**
   * Step 1: Score each FAQ entry
   * --------------------------------
   * - +1 if the query term is found in the title
   * - +0.5 if the query term is found in the body
   * The result is an array of FAQ objects with an added `score` field.
   */
  const scored = (faqs as Faq[]).map((faq) => {
    const titleMatch = faq.title.toLowerCase().includes(lowerQuery) ? 1 : 0;
    const bodyMatch = faq.body.toLowerCase().includes(lowerQuery) ? 0.5 : 0;
    const score = titleMatch + bodyMatch;
    return { ...faq, score };
  });

  /**
   * Step 2: Filter and sort results
   * --------------------------------
   * - Keep only items with a score > 0
   * - Sort descending by score (highest relevance first)
   * - Limit to the top 3 matches
   */
  const results = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // If no matches found, return an empty array with a message
  if (results.length === 0) {
    return res.status(200).json({
      message: 'No matches found',
      results: [],
    });
  }

  /**
   * Step 3: Generate a short summary (bonus)
   * --------------------------------
   * Combine the first few sentences from the top results' bodies.
   * This acts as a brief text summary for the frontend.
   */
  const summary = results
    .map((r) => r.body)
    .join(' ')
    .split('. ')
    .slice(0, 3)
    .join('. ') + '.';

  /**
   * Step 4: Collect the IDs of the matched results (bonus)
   * --------------------------------
   * Useful for traceability or referencing the original dataset.
   */
  const sources = results.map((r) => r.id);

  /**
   * Step 5: Return the final response
   * --------------------------------
   * Includes:
   *  - results: top 3 matches
   *  - summary: combined snippet
   *  - sources: array of IDs
   */
  return res.status(200).json({
    results,
    summary,
    sources,
  });
}

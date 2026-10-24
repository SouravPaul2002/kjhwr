/**
 * API service for UK Wind Forecast Analytics.
 * Connects to the FastAPI backend at /api/analysis.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Fetch forecast vs actual wind generation analysis.
 *
 * @param {Object} params
 * @param {string} params.dateFrom - First delivery date (YYYY-MM-DD)
 * @param {string} params.dateTo - Last delivery date (YYYY-MM-DD)
 * @param {number} params.cutoffHourUtc - Assumed cutoff hour in UTC (0-23)
 * @param {AbortSignal} [params.signal] - Optional abort signal
 * @returns {Promise<Object>} AnalysisResponse schema
 */
export async function fetchAnalysis({ dateFrom, dateTo, cutoffHourUtc, signal }) {
  const url = new URL('/api/analysis', API_BASE_URL);
  url.searchParams.set('date_from', dateFrom);
  url.searchParams.set('date_to', dateTo);
  url.searchParams.set('cutoff_hour_utc', String(cutoffHourUtc));

  let response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    throw new Error(
      `Unable to connect to the backend API at ${API_BASE_URL}. Please ensure the FastAPI server is running.`
    );
  }

  if (!response.ok) {
    let errorDetail = `Server returned HTTP ${response.status} (${response.statusText})`;
    try {
      const errorJson = await response.json();
      if (errorJson?.detail) {
        errorDetail = errorJson.detail;
      }
    } catch {
      // response body was not valid JSON
    }
    throw new Error(errorDetail);
  }

  const data = await response.json();

  // Basic validation of expected schema fields
  if (!data || typeof data !== 'object') {
    throw new Error('Received an invalid or empty response structure from backend.');
  }

  return {
    date_from: data.date_from,
    date_to: data.date_to,
    cutoff_rule: data.cutoff_rule,
    metrics: data.metrics || null,
    matched_records: Array.isArray(data.matched_records) ? data.matched_records : [],
    message: data.message || '',
  };
}

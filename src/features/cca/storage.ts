import { parseSummary, type Summary } from './contracts';

export function writeResults(results: Summary[]): boolean {
  try {
    localStorage.setItem(
      'devpro:cca:results',
      JSON.stringify(results.slice(0, 30).map(parseSummary))
    );
    return true;
  } catch {
    return false;
  }
}

import internalSource from "./internal.js";
import leetcodeSource from "./leetcode.js";
import codingNinjasSource from "./codingninjas.js";
import gfgSource from "./gfg.js";
import hackerrankSource from "./hackerrank.js";
import codeforcesSource from "./codeforces.js";

/**
 * Problem Source Plugin Registry
 *
 * Each source adapter must implement:
 *   - name: string — unique identifier
 *   - label: string — display name
 *   - isExternal: boolean — whether problems come from outside our DB
 *   - fetchProblems(filters): Promise<Problem[]> — list problems
 *   - fetchProblemById(id): Promise<Problem|null> — get a specific problem
 *   - searchProblems(query, filters): Promise<Problem[]> — search problems
 *
 * To add a new source:
 *   1. Create a new file in this directory following the adapter contract
 *   2. Import it here
 *   3. Add it to the SOURCES registry below
 */
const SOURCES = {
  internal: internalSource,
  leetcode: leetcodeSource,
  codingninjas: codingNinjasSource,
  gfg: gfgSource,
  hackerrank: hackerrankSource,
  codeforces: codeforcesSource,
};

/**
 * Get a problem source adapter by name
 * @param {string} sourceName - One of the registered source keys
 * @returns {object} Source adapter
 */
export const getSource = (sourceName) => {
  const source = SOURCES[sourceName];
  if (!source) {
    console.warn(`Unknown problem source: "${sourceName}", falling back to internal`);
    return SOURCES.internal;
  }
  return source;
};

/**
 * Get list of all available source names and labels
 */
export const getAvailableSources = () =>
  Object.entries(SOURCES).map(([key, src]) => ({
    value: key,
    label: src.label,
    isExternal: src.isExternal,
  }));

export default SOURCES;

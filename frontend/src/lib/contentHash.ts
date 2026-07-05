/**
 * Generate a hash of content for staleness detection.
 * Uses a simple hash that's fast to compute and good enough for change detection.
 */
// skipcq: JS-0067
export async function generateContentHash(content: string): Promise<string> {
  // Use SubtleCrypto for SHA-256 hashing (available in all modern browsers)
  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  } catch {
    // Fallback to simple hash for environments without SubtleCrypto
    return simpleHash(content);
  }
}

/**
 * Simple hash function as fallback (djb2 algorithm)
 */
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Check if a highlight is stale by comparing content hashes.
 * Returns true if the content has changed since the highlight was created.
 */
export function isHighlightStale(
  highlightHash: string | undefined,
  currentHash: string
): boolean {
  if (!highlightHash) return false; // No hash stored, can't determine staleness
  return highlightHash !== currentHash;
}

/**
 * Extract the text content from a container element.
 * This should match how we calculate offsets for highlights.
 */
export function getContentText(container: HTMLElement): string {
  return container.textContent || "";
}

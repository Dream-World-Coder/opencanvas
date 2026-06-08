import { logger } from "./logger.js";

/**
 * Retry a function with exponential backoff.
 * Throws the last error if all retries fail.
 *
 * @param {() => Promise<any>} fn
 * @param {{ retries?: number, baseDelay?: number, label?: string }} opts
 */
export async function withRetry(
    fn,
    { retries = 3, baseDelay = 1000, label = "operation" } = {},
) {
    let lastErr;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            if (attempt < retries) {
                const delay = baseDelay * Math.pow(2, attempt - 1);
                logger.warn(
                    `${label}: attempt ${attempt}/${retries} failed (${err.message}) -- retrying in ${delay}ms`,
                );
                await sleep(delay);
            }
        }
    }
    throw lastErr;
}

export function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

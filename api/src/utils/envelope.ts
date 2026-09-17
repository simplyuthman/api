/**
 * Envelope factories — the ONLY place in the codebase where response shapes are constructed.
 *
 * Every controller must import and use these functions.
 * Never construct { data, meta } or { error } shapes inline in a controller.
 * (AGENTS.md §4, PRD §5.3)
 */

export interface Meta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface SuccessEnvelope<T> {
  data: T;
  meta?: Meta;
}

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Wraps a list result in the standard { data, meta } envelope.
 */
export function buildSuccess<T>(data: T, meta?: Meta): SuccessEnvelope<T> {
  if (meta !== undefined) {
    return { data, meta };
  }
  return { data };
}

/**
 * Wraps an error in the standard { error: { code, message } } envelope.
 */
export function buildError(code: string, message: string): ErrorEnvelope {
  return { error: { code, message } };
}

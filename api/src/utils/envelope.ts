export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface SuccessEnvelope<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
  };
}

export function buildSuccess<T>(data: T, meta?: PaginationMeta): SuccessEnvelope<T> {
  if (meta !== undefined) {
    return { data, meta };
  }
  return { data };
}

export function buildError(code: string, message: string): ErrorEnvelope {
  return {
    error: {
      code,
      message,
    },
  };
}

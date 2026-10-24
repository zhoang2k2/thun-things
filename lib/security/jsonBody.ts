// Reads a small JSON request body. Undefined for bodies over the limit or that are not JSON, so
// route handlers answer one generic 400 without echoing input.

export const MAX_JSON_BODY_BYTES = 1_024;

export const readJsonBody = async (
  request: Request,
  maxBytes = MAX_JSON_BODY_BYTES,
): Promise<unknown> => {
  const text = await request.text();
  if (text.length > maxBytes) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
};

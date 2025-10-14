export class FetchTimeoutError extends Error {
  constructor(message = 'A requisição demorou muito para responder.') {
    super(message);
    this.name = 'FetchTimeoutError';
  }
}

export const fetchWithTimeout = async (resource: RequestInfo | URL, options: RequestInit = {}, timeout = 15000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new FetchTimeoutError();
    }
    throw error;
  }
};

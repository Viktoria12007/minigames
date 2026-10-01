const API_BASE_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api';

export type ApiResponse<T, M> = {
  data: T;
  meta: M;
};

export async function getApi<T, M = undefined>(
  path: string,
): Promise<ApiResponse<T, M>> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

  const body: unknown = await response.json();
  if (typeof body !== 'object' || body === null || !('data' in body)) {
    throw new Error('The server returned an unexpected response');
  }
  return body as ApiResponse<T, M>;
}

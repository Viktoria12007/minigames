import { getApi, postApi } from './api';
import { jest } from '@jest/globals';

const fetchMock =
  jest.fn<() => Promise<{ ok: boolean; status?: number; json?: () => Promise<unknown> }>>();
Object.defineProperty(globalThis, 'fetch', { configurable: true, value: fetchMock });

describe('API client', () => {
  beforeEach(() => fetchMock.mockReset());

  it('returns a valid GET response and sends the requested path', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: ['game'], meta: { page: 1 } }),
    });

    await expect(getApi<string[], { page: number }>('/games?page=1')).resolves.toEqual({
      data: ['game'],
      meta: { page: 1 },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api/games?page=1',
    );
  });

  it('sends JSON payloads for POST requests and rejects failed responses', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(postApi('/comments', { text: 'Hello' })).rejects.toThrow('status 401');

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { commentId: '1' } }) });
    await postApi('/comments', { text: 'Hello' });
    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/comments'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello' }),
    });
  });

  it('rejects malformed server bodies', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ result: [] }) });
    await expect(getApi('/games')).rejects.toThrow('unexpected response');
  });
});

export class HttpApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = '/api') {
        this.baseUrl = baseUrl;
    }

    private async request<T>(method: string, endpoint: string, body?: any): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const config: RequestInit = {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, config);

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.error || `Request failed with status ${response.status}`);
        }

        // Handle empty responses (e.g. 200 OK with no content)
        const text = await response.text();
        return text ? JSON.parse(text) : {} as T;
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>('GET', endpoint);
    }

    async post<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>('POST', endpoint, body);
    }

    async put<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>('PUT', endpoint, body);
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>('DELETE', endpoint);
    }
}

export const apiClient = new HttpApiClient('http://127.0.0.1:3000');

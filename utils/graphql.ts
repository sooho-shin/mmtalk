export const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://assignment.mobile.mmtalk.kr/graphql';
export const API_TOKEN = process.env.NEXT_PUBLIC_MMTALK_API_TOKEN || '2G8QgQ5RCM';

export async function fetchGraphQL<T>(
    query: string,
    variables: Record<string, any> = {},
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${API_TOKEN}`,
            ...options.headers,
        },
        body: JSON.stringify({
            query,
            variables,
        }),
        cache: 'no-store',
        ...options,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error('GraphQL error');
    }

    return result.data;
}

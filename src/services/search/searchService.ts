import apiClient from "../../util/apiClient";

export type SearchResultType = "news" | "announcement";

export interface SearchResult {
    type: SearchResultType;
    id: number;
    title: string | null;
    is_active: boolean;
    image?: string | null;
    created_at: string | null;
}

export interface SearchResponse {
    results: SearchResult[];
    news: SearchResult[];
    announcements: SearchResult[];
    total: number;
}

export const searchContent = async (
    query: string,
    lang: string = "az",
    limit: number = 10,
): Promise<SearchResponse | "ERROR"> => {
    try {
        const response = await apiClient.get("/api/search/admin", {
            params: { q: query, lang, limit },
        });

        if (response.data.status_code === 200) {
            return {
                results: (response.data.results ?? []) as SearchResult[],
                news: (response.data.news ?? []) as SearchResult[],
                announcements: (response.data.announcements ?? []) as SearchResult[],
                total: (response.data.total ?? 0) as number,
            };
        }
        return "ERROR";
    } catch {
        return "ERROR";
    }
};

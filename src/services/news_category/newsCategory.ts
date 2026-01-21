import apiClient from "../../util/apiClient";

export interface NewsCategoryInterface {
    category_id: number;
    title: string;
}

export const getNewCategories = async (
    lang_code?: string,
    sendAs: "query" | "header" = "query"
) => {
    try {
        const config: any = {};

        if (lang_code) {
            if (sendAs === "query") {
                config.params = {
                    lang_code,
                };
            } else {
                config.headers = {
                    "Accept-Language": lang_code,
                };
            }
        }

        const response = await apiClient.get(
            "/api/news-category/all",
            config
        );
        
        if (response.data.status_code === 200) {
            return response.data.news_categories;
        }

        if (response.data.status_code === 204) {
            return "NO_CONTENT";
        }

        return "ERROR";
    } catch (err) {
        return "ERROR";
    }
};

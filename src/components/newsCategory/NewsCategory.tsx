import { useEffect, useState } from "react";
import { getNewCategories, NewsCategoryInterface } from "../../services/news_category/newsCategory";

export default function NewsCategory() {
    const [newsCategories, setNewsCategories] = useState<NewsCategoryInterface[]>([]);
    const lang_code = "az";

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await getNewCategories(lang_code);
                if (Array.isArray(result)) {
                    setNewsCategories(result);
                } else {
                    setNewsCategories([]);
                }
            } catch (err) {
                setNewsCategories([]);
            }
        };

        fetchCategories();
    }, []);

    console.log(newsCategories);

    return (
        <div>
            {newsCategories.map((newCategory, idx) => (
                <div key={idx}>{newCategory.title}</div>
            ))}
        </div>
    );
}

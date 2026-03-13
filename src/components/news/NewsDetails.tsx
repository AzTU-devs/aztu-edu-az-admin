import Label from "../form/Label";
import Editor from "../editor/Editor";
import Input from "../form/input/InputField";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getNewsDetails, NewsDetail } from "../../services/news/newsService";

export default function NewsDetails() {
    const lang = "az";
    const { news_id } = useParams<{ news_id: string }>();
    const [news, setNews] = useState<NewsDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        setLoading(true);
        setNotFound(false);
        getNewsDetails(news_id ?? "", lang)
            .then((res) => {
                if (typeof res === "object") {
                    setNews(res as NewsDetail);
                } else if (res === "NOT FOUND") {
                    setNotFound(true);
                    setNews(null);
                } else {
                    setNews(null);
                }
            })
            .finally(() => setLoading(false));
    }, [news_id]);

    if (notFound) {
        return (
            <div className="p-5 text-center text-red-500 dark:text-red-400 text-lg">
                Xəbər tapılmadı
            </div>
        );
    }

    return (
        <div className="p-5 space-y-6">
            {/* Meta info */}
            <div className="flex gap-4 flex-wrap">
                <div>
                    <Label className="text-[14px] text-gray-400">Xəbər ID</Label>
                    {loading ? (
                        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 animate-pulse rounded mt-1"></div>
                    ) : (
                        <p className="text-gray-700 dark:text-gray-200 font-mono">{news?.news_id}</p>
                    )}
                </div>
                <div>
                    <Label className="text-[14px] text-gray-400">Kateqoriya ID</Label>
                    {loading ? (
                        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 animate-pulse rounded mt-1"></div>
                    ) : (
                        <p className="text-gray-700 dark:text-gray-200 font-mono">{news?.cateogry_id}</p>
                    )}
                </div>
                <div>
                    <Label className="text-[14px] text-gray-400">Sıra</Label>
                    {loading ? (
                        <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 animate-pulse rounded mt-1"></div>
                    ) : (
                        <p className="text-gray-700 dark:text-gray-200">{news?.display_order}</p>
                    )}
                </div>
                <div>
                    <Label className="text-[14px] text-gray-400">Status</Label>
                    {loading ? (
                        <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 animate-pulse rounded mt-1"></div>
                    ) : (
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                news?.is_active
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}
                        >
                            {news?.is_active ? "Aktiv" : "Deaktiv"}
                        </span>
                    )}
                </div>
                <div>
                    <Label className="text-[14px] text-gray-400">Əlavə tarixi</Label>
                    {loading ? (
                        <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 animate-pulse rounded mt-1"></div>
                    ) : (
                        <p className="text-gray-700 dark:text-gray-200">
                            {news?.created_at
                                ? new Date(news.created_at).toLocaleString("az-AZ")
                                : "—"}
                        </p>
                    )}
                </div>
            </div>

            {/* AZ content */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- AZ --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Başlıq</Label>
                    {loading ? (
                        <div className="h-8 w-full bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                    ) : (
                        <Input placeholder="Başlıq" value={news?.title || ""} readOnly />
                    )}
                </div>
                {news?.desc !== undefined && (
                    <div className="mb-[10px]">
                        <Label className="text-[17px]">Təsvir</Label>
                        {loading ? (
                            <div className="h-8 w-full bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                        ) : (
                            <Input placeholder="Təsvir" value={news?.desc || ""} readOnly />
                        )}
                    </div>
                )}
                {loading ? (
                    <div className="h-24 w-full bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                ) : news?.html_content ? (
                    <Editor readOnlyContent={news.html_content} />
                ) : null}
            </div>
        </div>
    );
}

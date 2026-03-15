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
            <div className="flex flex-col items-center justify-center py-16 px-5">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Xəbər tapılmadı</p>
                <p className="text-xs text-gray-400 mt-1">Bu ID-yə uyğun xəbər mövcud deyil</p>
            </div>
        );
    }

    return (
        <div className="p-5 sm:p-6 space-y-5">
            {/* Meta info */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Meta məlumatlar</span>
                </div>
                <div className="p-5 flex flex-wrap gap-4">
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-1.5">
                                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
                                <div className="h-7 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Xəbər ID</span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono text-sm font-semibold">#{news?.news_id}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Kateqoriya</span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-mono text-sm font-semibold">#{news?.category_id}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Sıra</span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold">{news?.display_order}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${news?.is_active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${news?.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                                    {news?.is_active ? "Aktiv" : "Deaktiv"}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Əlavə tarixi</span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm">
                                    {news?.created_at ? new Date(news.created_at).toLocaleString("az-AZ") : "—"}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* AZ content */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide">AZ</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Azərbaycan dili</span>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Başlıq</Label>
                        {loading ? (
                            <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
                        ) : (
                            <Input placeholder="Başlıq" value={news?.title || ""} readOnly />
                        )}
                    </div>
                    {(loading || news?.desc !== undefined) && (
                        <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Təsvir</Label>
                            {loading ? (
                                <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
                            ) : (
                                <Input placeholder="Təsvir" value={news?.desc || ""} readOnly />
                            )}
                        </div>
                    )}
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Məzmun</Label>
                        {loading ? (
                            <div className="h-32 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
                        ) : news?.html_content ? (
                            <Editor readOnlyContent={news.html_content} />
                        ) : (
                            <p className="text-sm text-gray-400 italic">Məzmun yoxdur</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

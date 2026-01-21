import Editor from "../editor/Editor";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getNewsDetails, NewsDetailsInterface } from "../../services/news/newsService";

export default function NewsDetails() {

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [news, setNews] = useState<NewsDetailsInterface>();
    const BASE_URL = import.meta.env.VITE_BASE_URL;


    const { news_id } = useParams<{ news_id: string }>();

    useEffect(() => {
        setLoading(true);
        const fetchNewsDetails = async () => {
            try {
                const res = await getNewsDetails(news_id ? + news_id : 0);

                if (typeof res === "object") {
                    setNews(res);
                } else if (res === "NOT_FOUND") {
                    setError("Axtarılan xəbər mövcud deyil.");
                } else {
                    setError("Gözlənilməz xəta baş verdi.");
                }
            } catch (err: unknown) {
                setError("Gözlənilməz xəta baş verdi.");
            } finally {
                setLoading(false);
            }
        };

        fetchNewsDetails();
    }, []);

    console.log(news);

    if (loading) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    return (
        <div>
            <div>
                <img src={`${BASE_URL}/${news?.cover_image}`} alt={news?.az_title} className="w-[100%] rounded-[10px]" />
            </div>
            <div>
                <p className="text-gray-400 my-[20px]">-- AZ --</p>
                <h2 className="mb-[20px]">
                    <span className="mr-[10px] font-bold">Başlıq:</span>
                    {news?.az_title}
                </h2>
                <div>
                    <Editor readOnlyContent={news?.az_html_content} />
                </div>
            </div>

            <div>
                <p className="text-gray-400 my-[20px]">-- EN --</p>
                <h2 className="mb-[20px]">
                    <span className="mr-[10px] font-bold">Title:</span>
                    {news?.en_title}
                </h2>
                <div>
                    <Editor readOnlyContent={news?.en_html_content} />
                </div>
            </div>
            <div className="mt-[20px]">
                <h2 className="font-bold mb-[20px] text-[25px]">Qalereya</h2>
                <div className="flex items-center justify-start">
                    {news?.gallery_images.map((image, idx) => {
                        return (
                            <div className="mr-[10px]" key={idx}>
                                <img className="w-[200px] h-[200px] rounded-[10px]" src={`${BASE_URL}/${image.image}`} alt="" />
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

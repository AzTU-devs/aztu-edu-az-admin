import { useEffect, useRef, useState, type RefObject } from "react";
import { useNavigate } from "react-router";
import { searchContent, type SearchResult } from "../../services/search/searchService";

interface GlobalSearchProps {
    variant?: "desktop" | "mobile";
    inputRef?: RefObject<HTMLInputElement | null>;
    autoFocus?: boolean;
    /** Called after navigating to a result (e.g. to close the mobile search bar). */
    onNavigate?: () => void;
}

const SearchIcon = () => (
    <span className="absolute -translate-y-1/2 pointer-events-none left-3.5 top-1/2 text-gray-400">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                fill="currentColor"
            />
        </svg>
    </span>
);

function ResultRow({ result, onSelect }: { result: SearchResult; onSelect: (r: SearchResult) => void }) {
    const isNews = result.type === "news";
    return (
        <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(result)}
            className="flex items-center w-full gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
        >
            <span
                className={`shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg ${
                    isNews
                        ? "bg-brand-50 text-brand-500 dark:bg-brand-500/15"
                        : "bg-amber-50 text-amber-500 dark:bg-amber-500/15"
                }`}
            >
                {isNews ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 5h16v14H4zM8 9h8M8 13h8M8 17h5" strokeLinecap="round" />
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 11l18-5v12L3 14v-3zM11.6 16.8a3 3 0 01-5.8-1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-gray-800 truncate dark:text-white/90">
                    {result.title || "—"}
                </span>
                <span className="block text-xs text-gray-400">
                    {isNews ? "Xəbər" : "Elan"}
                </span>
            </span>
            {!result.is_active && (
                <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                    Deaktiv
                </span>
            )}
        </button>
    );
}

export default function GlobalSearch({
    variant = "desktop",
    inputRef,
    autoFocus = false,
    onNavigate,
}: GlobalSearchProps) {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const reqId = useRef(0);

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    // Debounced search — ignores out-of-order responses via reqId.
    useEffect(() => {
        const term = query.trim();
        if (term.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const id = ++reqId.current;
        const handle = setTimeout(async () => {
            const res = await searchContent(term, "az");
            if (id !== reqId.current) return; // a newer request superseded this one
            setResults(res === "ERROR" ? [] : res.results);
            setLoading(false);
        }, 300);
        return () => clearTimeout(handle);
    }, [query]);

    // Close the dropdown when clicking outside.
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleSelect = (r: SearchResult) => {
        setOpen(false);
        setQuery("");
        setResults([]);
        onNavigate?.();
        navigate(r.type === "news" ? `/news/${r.id}` : `/announcements/${r.id}`);
    };

    const newsResults = results.filter((r) => r.type === "news");
    const announcementResults = results.filter((r) => r.type === "announcement");
    const showDropdown = open && query.trim().length >= 2;

    const inputClasses =
        variant === "desktop"
            ? "h-9 w-[280px] xl:w-[340px] rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 transition-all duration-200 dark:border-gray-700 dark:bg-gray-800/80 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-700"
            : "h-10 w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90";

    return (
        <div ref={containerRef} className="relative">
            <SearchIcon />
            <input
                ref={inputRef}
                type="text"
                autoFocus={autoFocus}
                value={query}
                placeholder="Xəbər və elanlarda axtar..."
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={(e) => {
                    if (e.key === "Escape") {
                        setOpen(false);
                        (e.target as HTMLInputElement).blur();
                    }
                }}
                className={inputClasses}
            />
            {variant === "desktop" && (
                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded-md border border-gray-200 bg-white px-1.5 py-[3px] text-[10px] font-medium text-gray-400 shadow-sm dark:border-gray-700 dark:bg-gray-700 dark:text-gray-500">
                    ⌘K
                </kbd>
            )}

            {showDropdown && (
                <div className="absolute left-0 right-0 z-99999 mt-2 max-h-[420px] overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    {loading && (
                        <div className="px-3 py-4 text-sm text-center text-gray-400">Axtarılır...</div>
                    )}

                    {!loading && results.length === 0 && (
                        <div className="px-3 py-4 text-sm text-center text-gray-400">Nəticə tapılmadı</div>
                    )}

                    {!loading && newsResults.length > 0 && (
                        <div className="mb-1">
                            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                Xəbərlər
                            </div>
                            {newsResults.map((r) => (
                                <ResultRow key={`news-${r.id}`} result={r} onSelect={handleSelect} />
                            ))}
                        </div>
                    )}

                    {!loading && announcementResults.length > 0 && (
                        <div>
                            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                Elanlar
                            </div>
                            {announcementResults.map((r) => (
                                <ResultRow key={`ann-${r.id}`} result={r} onSelect={handleSelect} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

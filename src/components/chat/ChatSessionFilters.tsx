import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import type { ChatSessionListQuery, ChatSessionSortBy, ChatSortDir } from "../../types/chat";

export type ChatSessionFilterState = {
  date_from: string;
  date_to: string;
  q: string;
  sort_by: ChatSessionSortBy;
  sort_dir: ChatSortDir;
};

export const EMPTY_CHAT_FILTERS: ChatSessionFilterState = {
  date_from: "",
  date_to: "",
  q: "",
  sort_by: "last_active_at",
  sort_dir: "desc",
};

/** Blank fields are dropped; sort always travels, since it has a real default. */
export const toChatSessionQuery = (state: ChatSessionFilterState): ChatSessionListQuery => {
  const query: ChatSessionListQuery = {
    sort_by: state.sort_by,
    sort_dir: state.sort_dir,
  };
  if (state.date_from) query.date_from = state.date_from;
  if (state.date_to) query.date_to = state.date_to;
  if (state.q.trim()) query.q = state.q.trim();
  return query;
};

export const countActiveChatFilters = (state: ChatSessionFilterState): number =>
  [state.date_from, state.date_to, state.q].filter((value) => value !== "").length;

const selectClass =
  "h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-9 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";

interface ChatSessionFiltersProps {
  value: ChatSessionFilterState;
  onChange: (value: ChatSessionFilterState) => void;
  onReset: () => void;
  loading?: boolean;
}

export default function ChatSessionFilters({
  value,
  onChange,
  onReset,
  loading = false,
}: ChatSessionFiltersProps) {
  const set = (field: keyof ChatSessionFilterState) => (next: string) =>
    onChange({ ...value, [field]: next } as ChatSessionFilterState);

  const activeCount = countActiveChatFilters(value);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <Label htmlFor="chat-from">Başlanğıc tarix</Label>
          <Input
            id="chat-from"
            type="date"
            value={value.date_from}
            max={value.date_to || undefined}
            disabled={loading}
            onChange={(event) => set("date_from")(event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="chat-to">Son tarix</Label>
          <Input
            id="chat-to"
            type="date"
            value={value.date_to}
            min={value.date_from || undefined}
            disabled={loading}
            onChange={(event) => set("date_to")(event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="chat-sort-by">Sıralama</Label>
          <select
            id="chat-sort-by"
            className={selectClass}
            value={value.sort_by}
            disabled={loading}
            onChange={(event) => set("sort_by")(event.target.value)}
          >
            <option value="last_active_at" className="dark:bg-gray-900">
              Son aktivlik
            </option>
            <option value="started_at" className="dark:bg-gray-900">
              Başlama vaxtı
            </option>
          </select>
        </div>

        <div>
          <Label htmlFor="chat-sort-dir">İstiqamət</Label>
          <select
            id="chat-sort-dir"
            className={selectClass}
            value={value.sort_dir}
            disabled={loading}
            onChange={(event) => set("sort_dir")(event.target.value)}
          >
            <option value="desc" className="dark:bg-gray-900">
              Əvvəlcə yeni
            </option>
            <option value="asc" className="dark:bg-gray-900">
              Əvvəlcə köhnə
            </option>
          </select>
        </div>

        <div className="sm:col-span-2 xl:col-span-4">
          <Label htmlFor="chat-q">Axtarış</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon fontSize="small" />
            </span>
            <input
              id="chat-q"
              type="text"
              value={value.q}
              disabled={loading}
              placeholder="Mesaj mətnində axtar"
              onChange={(event) => set("q")(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
        </div>
      </div>

      {activeCount > 0 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {activeCount} filtr tətbiq olunub
          </span>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
          >
            <RestartAltIcon sx={{ fontSize: 16 }} />
            Filtrləri sıfırla
          </button>
        </div>
      )}
    </div>
  );
}

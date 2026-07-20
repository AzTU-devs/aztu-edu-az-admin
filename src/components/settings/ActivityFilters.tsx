import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import type {
  ActivityFilters as ActivityFilterOptions,
  ActivityListQuery,
  ActivityOutcome,
} from "../../types/rbac";

export type ActivityFilterState = {
  admin_user_id: string;
  domain: string;
  action_key: string;
  outcome: string;
  date_from: string;
  date_to: string;
  q: string;
};

export const EMPTY_ACTIVITY_FILTERS: ActivityFilterState = {
  admin_user_id: "",
  domain: "",
  action_key: "",
  outcome: "",
  date_from: "",
  date_to: "",
  q: "",
};

/** Blank fields are dropped rather than sent as "" — the API treats absent as "no filter". */
export const toActivityQuery = (state: ActivityFilterState): ActivityListQuery => {
  const query: ActivityListQuery = {};
  if (state.admin_user_id) query.admin_user_id = Number(state.admin_user_id);
  if (state.domain) query.domain = state.domain;
  if (state.action_key) query.action_key = state.action_key;
  if (state.outcome) query.outcome = state.outcome as ActivityOutcome;
  if (state.date_from) query.date_from = state.date_from;
  if (state.date_to) query.date_to = state.date_to;
  if (state.q.trim()) query.q = state.q.trim();
  return query;
};

export const countActiveFilters = (state: ActivityFilterState): number =>
  Object.values(state).filter((value) => value !== "").length;

const selectClass =
  "h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-9 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";

interface ActivityFiltersProps {
  value: ActivityFilterState;
  onChange: (value: ActivityFilterState) => void;
  onReset: () => void;
  options: ActivityFilterOptions | null;
  loading?: boolean;
}

export default function ActivityFilters({
  value,
  onChange,
  onReset,
  options,
  loading = false,
}: ActivityFiltersProps) {
  const set = (field: keyof ActivityFilterState) => (next: string) =>
    onChange({ ...value, [field]: next });

  /** Narrowing by domain first makes the ~123-key action list usable. */
  const actions = (options?.actions ?? []).filter(
    (action) => !value.domain || action.key.startsWith(`${value.domain}.`)
  );

  const activeCount = countActiveFilters(value);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <Label htmlFor="activity-admin">Admin</Label>
          <select
            id="activity-admin"
            className={selectClass}
            value={value.admin_user_id}
            disabled={loading}
            onChange={(event) => set("admin_user_id")(event.target.value)}
          >
            <option value="" className="dark:bg-gray-900">
              Hamısı
            </option>
            {(options?.admins ?? []).map((admin) => (
              <option key={admin.id} value={admin.id} className="dark:bg-gray-900">
                {admin.username}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="activity-domain">Bölmə</Label>
          <select
            id="activity-domain"
            className={selectClass}
            value={value.domain}
            disabled={loading}
            onChange={(event) =>
              onChange({ ...value, domain: event.target.value, action_key: "" })
            }
          >
            <option value="" className="dark:bg-gray-900">
              Hamısı
            </option>
            {(options?.domains ?? []).map((domain) => (
              <option key={domain.key} value={domain.key} className="dark:bg-gray-900">
                {domain.label_az}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="activity-action">Əməliyyat</Label>
          <select
            id="activity-action"
            className={selectClass}
            value={value.action_key}
            disabled={loading}
            onChange={(event) => set("action_key")(event.target.value)}
          >
            <option value="" className="dark:bg-gray-900">
              Hamısı
            </option>
            {actions.map((action) => (
              <option key={action.key} value={action.key} className="dark:bg-gray-900">
                {action.label_az}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="activity-outcome">Nəticə</Label>
          <select
            id="activity-outcome"
            className={selectClass}
            value={value.outcome}
            disabled={loading}
            onChange={(event) => set("outcome")(event.target.value)}
          >
            <option value="" className="dark:bg-gray-900">
              Hamısı
            </option>
            <option value="success" className="dark:bg-gray-900">
              Uğurlu
            </option>
            <option value="denied" className="dark:bg-gray-900">
              İcazə verilmədi
            </option>
          </select>
        </div>

        <div>
          <Label htmlFor="activity-from">Başlanğıc tarix</Label>
          <Input
            id="activity-from"
            type="date"
            value={value.date_from}
            max={value.date_to || undefined}
            disabled={loading}
            onChange={(event) => set("date_from")(event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="activity-to">Son tarix</Label>
          <Input
            id="activity-to"
            type="date"
            value={value.date_to}
            min={value.date_from || undefined}
            disabled={loading}
            onChange={(event) => set("date_to")(event.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="activity-q">Axtarış</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon fontSize="small" />
            </span>
            <input
              id="activity-q"
              type="text"
              value={value.q}
              disabled={loading}
              placeholder="Obyekt adı, ünvan və ya IP"
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

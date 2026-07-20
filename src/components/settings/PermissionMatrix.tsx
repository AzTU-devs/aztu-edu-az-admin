import { useMemo, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockIcon from "@mui/icons-material/Lock";
import Checkbox from "../form/input/Checkbox";
import Input from "../form/input/InputField";
import type { PermissionDomainGroup } from "../../types/rbac";

interface PermissionMatrixProps {
  domains: PermissionDomainGroup[];
  selected: string[];
  onChange: (keys: string[]) => void;
  /**
   * super_admin. It holds zero grant rows by design and the server answers 409
   * to any edit (invariant R2), so the matrix renders all-checked and read-only
   * — the refusal is stated here rather than arriving as a surprise error.
   */
  lockedAll?: boolean;
  disabled?: boolean;
}

const normalize = (value: string) =>
  value.toLocaleLowerCase("az").normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function PermissionMatrix({
  domains,
  selected,
  onChange,
  lockedAll = false,
  disabled = false,
}: PermissionMatrixProps) {
  const [open, setOpen] = useState<string[]>(() => domains.slice(0, 1).map((d) => d.domain));
  const [query, setQuery] = useState("");

  const readOnly = lockedAll || disabled;
  const granted = useMemo(() => new Set(selected), [selected]);

  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return domains;

    return domains
      .map((group) => {
        if (normalize(group.label_az).includes(needle)) return group;
        const permissions = group.permissions.filter(
          (permission) =>
            normalize(permission.label_az).includes(needle) ||
            permission.key.toLowerCase().includes(needle)
        );
        return { ...group, permissions };
      })
      .filter((group) => group.permissions.length > 0);
  }, [domains, query]);

  const totalCount = useMemo(
    () => domains.reduce((sum, group) => sum + group.permissions.length, 0),
    [domains]
  );

  const toggleOpen = (domain: string) =>
    setOpen((current) =>
      current.includes(domain) ? current.filter((d) => d !== domain) : [...current, domain]
    );

  const togglePermission = (key: string, checked: boolean) => {
    if (readOnly) return;
    onChange(checked ? [...selected, key] : selected.filter((k) => k !== key));
  };

  const toggleDomain = (group: PermissionDomainGroup, checked: boolean) => {
    if (readOnly) return;
    const keys = group.permissions.map((permission) => permission.key);
    onChange(
      checked
        ? Array.from(new Set([...selected, ...keys]))
        : selected.filter((key) => !keys.includes(key))
    );
  };

  const toggleAll = (checked: boolean) => {
    if (readOnly) return;
    onChange(checked ? domains.flatMap((g) => g.permissions.map((p) => p.key)) : []);
  };

  const selectedCount = lockedAll ? totalCount : granted.size;

  return (
    <div className="space-y-4">
      {lockedAll && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-500/30 dark:bg-warning-500/10">
          <LockIcon fontSize="small" className="mt-0.5 text-warning-500" />
          <div>
            <p className="text-sm font-semibold text-warning-700 dark:text-orange-300">
              Super admin bütün icazələrə sahibdir
            </p>
            <p className="mt-1 text-xs leading-relaxed text-warning-600 dark:text-orange-200/80">
              Bu rolun icazələri məhdudlaşdırıla bilməz — sistemin heç bir halda idarəolunmaz
              qalmaması üçün icazə yoxlaması bu rol üçün tamamilə keçilir. Dəyişiklik cəhdi
              server tərəfindən rədd ediləcək.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="İcazə axtar..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {selectedCount} / {totalCount} icazə
          </span>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
                onClick={() => toggleAll(true)}
              >
                Hamısını seç
              </button>
              <button
                type="button"
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                onClick={() => toggleAll(false)}
              >
                Təmizlə
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {visible.map((group) => {
          const keys = group.permissions.map((permission) => permission.key);
          const domainSelected = lockedAll
            ? keys.length
            : keys.filter((key) => granted.has(key)).length;
          const allSelected = keys.length > 0 && domainSelected === keys.length;
          const isOpen = open.includes(group.domain) || Boolean(query.trim());

          return (
            <div
              key={group.domain}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center gap-3 bg-gray-50/80 px-4 py-3 dark:bg-gray-800/50">
                <button
                  type="button"
                  className="flex flex-1 items-center gap-2 text-left"
                  onClick={() => toggleOpen(group.domain)}
                >
                  <ExpandMoreIcon
                    fontSize="small"
                    className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {group.label_az}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      allSelected
                        ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                        : domainSelected > 0
                        ? "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
                        : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                    }`}
                  >
                    {domainSelected}/{keys.length}
                  </span>
                </button>
                <Checkbox
                  label="hamısını seç"
                  checked={lockedAll || allSelected}
                  disabled={readOnly}
                  onChange={(checked) => toggleDomain(group, checked)}
                />
              </div>

              {isOpen && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.permissions.map((permission) => (
                    <div key={permission.key} className="flex items-start gap-3">
                      <Checkbox
                        checked={lockedAll || granted.has(permission.key)}
                        disabled={readOnly}
                        onChange={(checked) => togglePermission(permission.key, checked)}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                          {permission.label_az}
                        </p>
                        <p className="truncate font-mono text-[11px] text-gray-400 dark:text-gray-500">
                          {permission.key}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 py-12 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              İcazə tapılmadı
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Axtarış şərtini dəyişin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

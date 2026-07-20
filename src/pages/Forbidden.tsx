import { Link, useLocation } from "react-router";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PageMeta from "../components/common/PageMeta";
import usePermissions from "../hooks/usePermissions";

type ForbiddenState = {
  from?: string;
  required?: string | string[];
};

export default function Forbidden() {
  const location = useLocation();
  const { roleName } = usePermissions();
  const state = (location.state ?? {}) as ForbiddenState;

  return (
    <>
      <PageMeta title="İcazə yoxdur | AZTU İdarəetmə Paneli" description="" />
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-warning-50 text-warning-500 dark:bg-warning-500/10">
          <LockOutlinedIcon fontSize="large" />
        </div>

        <h1 className="mb-3 font-semibold text-gray-800 text-title-sm dark:text-white/90">
          Bu bölməyə icazəniz yoxdur
        </h1>

        <p className="mb-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
          {roleName
            ? `Cari rolunuz — ${roleName} — bu səhifəyə giriş hüququ vermir.`
            : "Bu səhifəyə giriş hüququnuz yoxdur."}
          {" "}
          Giriş lazımdırsa, administratorla əlaqə saxlayın.
        </p>

        {state.from ? (
          <p className="mb-8 text-xs text-gray-400 dark:text-gray-500">
            Ünvan: <span className="font-mono">{state.from}</span>
          </p>
        ) : (
          <span className="mb-8" />
        )}

        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Əsas səhifəyə qayıt
        </Link>
      </div>
    </>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import authService from "../../services/auth/authService";
import { loginSuccess, logout, setSession } from "../../redux/slices/authSlice";

const fieldBase =
  "h-12 w-full rounded-xl border bg-white px-4 text-sm text-gray-800 shadow-theme-xs transition-colors placeholder:text-gray-400 focus:outline-hidden focus:ring-3 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30";

const fieldState = (invalid: boolean) =>
  invalid
    ? "border-error-500 focus:border-error-400 focus:ring-error-500/20 dark:border-error-500 dark:focus:border-error-400"
    : "border-gray-300 focus:border-brand-400 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-500";

const labelClass =
  "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login(username, password);
      // The token has to land in the store first — apiClient reads it from there
      // to authorise the /auth/me call that follows.
      dispatch(loginSuccess({ token: data.access_token }));

      try {
        const me = await authService.me();
        dispatch(setSession(me));
      } catch {
        dispatch(logout());
        setError("Sessiya məlumatları alınmadı. Yenidən cəhd edin.");
        return;
      }

      navigate("/");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } };
      const status = axiosErr.response?.status;

      if (status === 401) {
        setError("İstifadəçi adı və ya şifrə yanlışdır.");
      } else if (status === 403) {
        setError("Hesabınız deaktiv edilmişdir. Zəhmət olmasa administratorla əlaqə saxlayın.");
      } else if (status === 429) {
        setError("Çox sayda cəhd. Bir müddət sonra yenidən cəhd edin.");
      } else {
        setError("Xəta baş verdi. Yenidən cəhd edin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up mx-auto">
      <div className="mb-8">
        <h1 className="text-title-sm font-semibold text-gray-900 dark:text-white">
          Daxil olun
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          AZTU İdarəetmə Panelinə daxil olmaq üçün məlumatlarınızı daxil edin.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <label htmlFor="signin-username" className={labelClass}>
              E-poçt ünvanı <span className="text-error-500">*</span>
            </label>
            {/*
              Staff sign in with name.surname@aztu.edu.az, but the field stays
              type="text" on purpose: type="email" would add a browser-side
              format check, and the backend is the only thing that decides what
              a valid account identifier is.
            */}
            <input
              id="signin-username"
              name="username"
              type="text"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              disabled={loading}
              placeholder="ad.soyad@aztu.edu.az"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "signin-error" : undefined}
              className={`${fieldBase} ${fieldState(Boolean(error))}`}
            />
          </div>

          <div>
            <label htmlFor="signin-password" className={labelClass}>
              Şifrə <span className="text-error-500">*</span>
            </label>
            <div className="relative">
              <input
                id="signin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={loading}
                placeholder="Şifrənizi daxil edin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "signin-error" : undefined}
                className={`${fieldBase} ${fieldState(Boolean(error))} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
                aria-pressed={showPassword}
                aria-controls="signin-password"
                className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeIcon className="size-5 fill-current" />
                ) : (
                  <EyeCloseIcon className="size-5 fill-current" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p
              id="signin-error"
              role="alert"
              className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-semibold text-white shadow-theme-xs transition-colors hover:bg-brand-600 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-brand-300 dark:focus-visible:ring-offset-gray-900 dark:disabled:bg-brand-500/40"
          >
            {loading && (
              <svg
                className="size-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                />
              </svg>
            )}
            {loading ? "Gözləyin..." : "Daxil ol"}
          </button>
        </div>
      </form>
    </div>
  );
}

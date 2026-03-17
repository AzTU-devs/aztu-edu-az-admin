import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import authService from "../../services/auth/authService";
import { loginSuccess } from "../../redux/slices/authSlice";

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
      dispatch(loginSuccess({ token: data.access_token }));
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
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-6 sm:px-0">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Daxil olun
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AZTU İdarəetmə Panelinə daxil olmaq üçün məlumatlarınızı daxil edin.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  İstifadəçi adı <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="İstifadəçi adınızı daxil edin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>
                  Şifrə <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifrənizi daxil edin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <Button className="w-full" size="sm" disabled={loading}>
                  {loading ? "Gözləyin..." : "Daxil ol"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

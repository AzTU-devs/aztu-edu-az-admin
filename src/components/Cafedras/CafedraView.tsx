import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { CircularProgress } from "@mui/material";
import { getCafedraDetails, CafedraDetail } from "../../services/cafedra/cafedraService";
import Button from "../ui/button/Button";

export default function CafedraView() {
  const { cafedra_code } = useParams();
  const navigate = useNavigate();
  const [cafedra, setCafedra] = useState<CafedraDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cafedra_code) {
      setError("Kafedra kodu müəyyən edilmədi");
      setLoading(false);
      return;
    }

    setLoading(true);
    getCafedraDetails(cafedra_code)
      .then((res) => {
        if (res && typeof res === "object" && "cafedra_code" in res) {
          setCafedra(res as CafedraDetail);
        } else if (res === "NOT FOUND") {
          setError("Kafedra tapılmadı");
        } else {
          setError("Kafedra yüklənərkən xəta baş verdi");
        }
      })
      .catch((err) => {
        console.error("CafedraView load error", err);
        setError("Kafedra yüklənərkən xəta baş verdi");
      })
      .finally(() => setLoading(false));
  }, [cafedra_code]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  const renderDetailList = (title: string, list: any[]) => {
    if (!list || list.length === 0) return null;
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 space-y-4">
        <p className="font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-2">{title}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{item.az?.title || item.en?.title || `Maddə #${idx + 1}`}</p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">{item.az?.description || item.en?.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPersonnelSection = (title: string, list: any[]) => {
    if (!list || list.length === 0) return null;
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 space-y-4">
        <p className="font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-2">{title}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-3 p-4 rounded-xl border border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
              <div className="flex items-center gap-3">
                {item.profile_image ? (
                  <img src={item.profile_image} alt={item.first_name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{item.first_name} {item.last_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.az?.duty || item.en?.duty || "Əməkdaş"}</p>
                </div>
              </div>
              <div className="space-y-1">
                {item.email && <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1"><span className="font-semibold">Email:</span> {item.email}</p>}
                {item.phone && <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1"><span className="font-semibold">Tel:</span> {item.phone}</p>}
                {(item.az?.scientific_name || item.az?.scientific_degree) && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span className="font-semibold">Elmi ad/dərəcə:</span> {item.az?.scientific_name} {item.az?.scientific_degree}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLaboratories = (list: any[]) => {
    if (!list || list.length === 0) return null;
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 space-y-4">
        <p className="font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-2">Laboratoriyalar</p>
        <div className="grid gap-6 md:grid-cols-1">
          {list.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 flex flex-col md:flex-row gap-6">
              {item.image_url && (
                <img src={item.image_url} alt={item.az?.title} className="w-full md:w-48 h-32 object-cover rounded-xl border border-gray-200" />
              )}
              <div className="flex-1">
                <p className="text-base font-bold text-gray-900 dark:text-white">{item.az?.title || item.en?.title}</p>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.az?.description || item.en?.description || "" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Kafedra detalları</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kod: {cafedra?.cafedra_code} | Fakültə: {cafedra?.faculty_code}</p>
        </div>
        <div className="flex gap-2">
            <Button className="w-full sm:w-auto" type="button" onClick={() => navigate(`/cafedras/edit/${cafedra?.cafedra_code}`)}>Redaktə et</Button>
            <Button className="w-full sm:w-auto" variant="outline" type="button" onClick={() => navigate("/cafedras")}>Geri</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">AZ adı</p>
            <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">{cafedra?.az?.title || "–"}</p>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cafedra?.az?.html_content || "" }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">EN name</p>
            <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">{cafedra?.en?.title || "–"}</p>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cafedra?.en?.html_content || "" }} />
          </div>
        </div>

        {cafedra?.director ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-950">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">Müdir (Director)</p>
            <div className="flex flex-col md:flex-row gap-6">
              {cafedra.director.profile_image && (
                <img src={cafedra.director.profile_image} alt="Director" className="w-32 h-32 rounded-2xl object-cover border-2 border-white shadow-sm" />
              )}
              <div className="flex-1 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ad Soyad Ata adı</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{cafedra.director.first_name} {cafedra.director.last_name} {cafedra.director.father_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Elmi dərəcə / Titul (AZ)</p>
                  <p className="text-sm text-gray-900 dark:text-white">{cafedra.director.az?.scientific_degree} / {cafedra.director.az?.scientific_title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm text-gray-900 dark:text-white">{cafedra.director.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Telefon</p>
                  <p className="text-sm text-gray-900 dark:text-white">{cafedra.director.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Otaq</p>
                  <p className="text-sm text-gray-900 dark:text-white">{cafedra.director.room_number}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Elmi tədqiqat sahələri</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {cafedra.director.az?.scientific_research_fields?.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-100 dark:border-blue-800">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Bioqrafiya (AZ)</p>
                <div className="text-xs text-gray-600 dark:text-gray-400 prose prose-xs dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cafedra.director.az?.bio || "" }} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Biography (EN)</p>
                <div className="text-xs text-gray-600 dark:text-gray-400 prose prose-xs dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cafedra.director.en?.bio || "" }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">Müdir məlumatları mövcud deyil.</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Bakalavr proqramları</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{cafedra?.bachelor_programs_count ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Magistr proqramları</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{cafedra?.master_programs_count ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">PhD proqramları</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{cafedra?.phd_programs_count ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Laboratoriyalar</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{cafedra?.laboratories_count ?? 0}</p>
          </div>
        </div>

        {cafedra?.sdgs && cafedra.sdgs.length > 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">SDG (Dayanıqlı İnkişaf Məqsədləri)</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {cafedra.sdgs.map((num) => (
                <span key={`view-sdg-${num}`} className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs font-bold">
                  SDG {num}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {renderLaboratories(cafedra?.laboratories || [])}
      {renderPersonnelSection("Müavinlər", cafedra?.deputy_deans || [])}
      {renderPersonnelSection("Elmi Şura", cafedra?.scientific_council || [])}
      {renderPersonnelSection("İşçilər", cafedra?.workers || [])}

      {renderDetailList("Eyni vaxtında Tədbirləri", cafedra?.directions_of_action || [])}
      {renderDetailList("Elmi-tədqiqat işləri", cafedra?.research_works || [])}
      {renderDetailList("Tərəfdaş şirkətlər", cafedra?.partner_companies || [])}
      {renderDetailList("Məqsədlər", cafedra?.objectives || [])}
      {renderDetailList("Vəzifələr", cafedra?.duties || [])}
      {renderDetailList("Layihələr", cafedra?.projects || [])}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { CircularProgress } from "@mui/material";
import { getFacultyDetails, FacultyDetail } from "../../services/faculty/facultyService";
import Button from "../ui/button/Button";

export default function FacultyView() {
  const { faculty_code } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<FacultyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!faculty_code) {
      setError("Fakültə kodu müəyyən edilmədi");
      setLoading(false);
      return;
    }

    setLoading(true);
    getFacultyDetails(faculty_code)
      .then((res) => {
        if (res && typeof res === "object" && "faculty_code" in res) {
          setFaculty(res as FacultyDetail);
        } else if (res === "NOT FOUND") {
          setError("Fakültə tapılmadı");
        } else {
          setError("Fakültə yüklənərkən xəta baş verdi");
        }
      })
      .catch((err) => {
        console.error("FacultyView load error", err);
        setError("Fakültə yüklənərkən xəta baş verdi");
      })
      .finally(() => setLoading(false));
  }, [faculty_code]);

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

  const facultyData = faculty as FacultyDetail & { title?: string; html_content?: string };

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Fakültə detalları</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kod: {faculty?.faculty_code}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="w-full sm:w-auto" 
            type="button" 
            onClick={() => navigate(`/faculties/${faculty_code}`)}
          >
            Redaktə et
          </Button>
          <Button className="w-full sm:w-auto" variant="outline" type="button" onClick={() => navigate("/faculties")}>Geri</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">AZ adı</p>
            <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">{facultyData?.az?.title || "–"}</p>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: facultyData?.az?.html_content || "" }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">EN name</p>
            <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">{facultyData?.en?.title || "–"}</p>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: facultyData?.en?.html_content || "" }} />
          </div>
        </div>

        {faculty?.director ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-950">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">Direktor</p>
            <div className="flex flex-col md:flex-row gap-6">
              {faculty.director.profile_image && (
                <img src={faculty.director.profile_image} alt="Director" className="w-32 h-32 rounded-2xl object-cover border-2 border-white shadow-sm" />
              )}
              <div className="flex-1 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ad Soyad Ata adı</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{faculty.director.first_name} {faculty.director.last_name} {faculty.director.father_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Elmi dərəcə / Titul (AZ)</p>
                  <p className="text-sm text-gray-900 dark:text-white">{faculty.director.az?.scientific_degree} / {faculty.director.az?.scientific_title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm text-gray-900 dark:text-white">{faculty.director.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Telefon</p>
                  <p className="text-sm text-gray-900 dark:text-white">{faculty.director.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Otaq</p>
                  <p className="text-sm text-gray-900 dark:text-white">{faculty.director.room_number}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Elmi tədqiqat sahələri</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {faculty.director.az?.scientific_research_fields?.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-100 dark:border-blue-800">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Bioqrafiya (AZ)</p>
                <div className="text-xs text-gray-600 dark:text-gray-400 prose prose-xs dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: faculty.director.az?.bio || "" }} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Biography (EN)</p>
                <div className="text-xs text-gray-600 dark:text-gray-400 prose prose-xs dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: faculty.director.en?.bio || "" }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">Direktor məlumatları mövcud deyil.</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Bakalavr proqramları</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{faculty?.bachelor_programs_count ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Magistr proqramları</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{faculty?.master_programs_count ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">PhD proqramları</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{faculty?.phd_programs_count ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Beynəlxalq əməkdaşlıqlar</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{faculty?.international_collaborations_count ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Laboratoriyalar (stat)</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{faculty?.laboratories_count ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Layihələr/Patentlər</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{faculty?.projects_patents_count ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Sənaye əməkdaşlıqları</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{faculty?.industrial_collaborations_count ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Laboratoriyalar (list)</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{faculty?.laboratories?.length ?? 0}</p>
          </div>
        </div>

        {faculty?.sdgs && faculty.sdgs.length > 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">SDG (Dayanıqlı İnkişaf Məqsədləri)</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {faculty.sdgs.map((num) => (
                <span key={`view-sdg-${num}`} className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs font-bold">
                  SDG {num}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {renderPersonnelSection("Dekan Müavinləri", faculty?.deputy_deans || [])}
      {renderPersonnelSection("Elmi Şura Üzvləri", faculty?.scientific_council || [])}
      {renderPersonnelSection("İşçilər", faculty?.workers || [])}

      {renderDetailList("Laboratoriyalar", faculty?.laboratories || [])}
      {renderDetailList("Tədqiqat işləri", faculty?.research_works || [])}
      {renderDetailList("Partnyor şirkətlər", faculty?.partner_companies || [])}
      {renderDetailList("Məqsədlər", faculty?.objectives || [])}
      {renderDetailList("Vəzifələr", faculty?.duties || [])}
      {renderDetailList("Layihələr", faculty?.projects || [])}
      {renderDetailList("Fəaliyyət istiqamətləri", faculty?.directions_of_action || [])}
    </div>
  );
}

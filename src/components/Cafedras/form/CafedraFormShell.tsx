import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import Button from "../../ui/button/Button";
import BasicTab from "./tabs/BasicTab";
import ContentTab from "./tabs/ContentTab";
import DirectorTab from "./tabs/DirectorTab";
import LaboratoriesTab from "./tabs/LaboratoriesTab";
import PersonnelTab from "./tabs/PersonnelTab";
import ScientificActivityTab from "./tabs/ScientificActivityTab";
import StatsTab from "./tabs/StatsTab";
import LockedPanel from "./fields/LockedPanel";
import { PersonnelListKey, blankDirector, normalizeCafedraPayload, stripUids, useCafedraPayload } from "./useCafedraPayload";
import { sectionCard, stickyBar, tabBtnActive, tabBtnBase, tabBtnIdle } from "./formStyles";
import {
  CafedraDetail,
  CreateCafedraPayload,
  uploadCafedraDirectorImage,
  uploadCafedraWorkerImage,
  uploadLaboratoryGalleryImage,
  uploadLaboratoryImage,
} from "../../../services/cafedra/cafedraService";
import { Faculty, getFaculties } from "../../../services/faculty/facultyService";

const TABS = [
  { id: "basic", label: "Əsas", icon: "M4 6h16M4 12h16M4 18h10" },
  { id: "content", label: "Bölmələr", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { id: "stats", label: "Statistika & SDG", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { id: "director", label: "Kafedra müdiri", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { id: "personnel", label: "Əməkdaşlar", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "labs", label: "Laboratoriyalar", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
  { id: "scientific", label: "Elmi fəaliyyət", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface CafedraFormShellProps {
  initialValue?: CafedraDetail | null;
  onSubmit: (payload: CreateCafedraPayload) => Promise<{ status: string; cafedra?: CafedraDetail }>;
  submitLabel: string;
  /** Edit mode manages people, laboratories and the scientific area through
   *  per-item endpoints, so those keys are omitted from the bulk payload. */
  isEdit?: boolean;
  /** Refetch hook so per-item panels can refresh the cafedra. */
  onChanged?: () => void;
}

const emptyPersonnelImages = (): Record<PersonnelListKey, Record<string, File>> => ({
  workers: {},
  deputy_deans: {},
  scientific_council: {},
});

export default function CafedraFormShell({
  initialValue = null,
  onSubmit,
  submitLabel,
  isEdit = false,
  onChanged,
}: CafedraFormShellProps) {
  const navigate = useNavigate();
  const api = useCafedraPayload(initialValue);
  const { payload, setPayload } = api;

  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [saving, setSaving] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [useDirector, setUseDirector] = useState<boolean>(Boolean(initialValue?.director));
  const [formKey, setFormKey] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [directorImage, setDirectorImage] = useState<File | null>(null);
  const [personnelImages, setPersonnelImages] = useState(emptyPersonnelImages);
  const [labImages, setLabImages] = useState<Record<string, File>>({});
  const [labGalleryFiles, setLabGalleryFiles] = useState<Record<string, File[]>>({});

  const pristineRef = useRef<string>("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const normalized = normalizeCafedraPayload(initialValue);
    setPayload(normalized);
    setUseDirector(Boolean(initialValue?.director));
    setDirectorImage(null);
    setPersonnelImages(emptyPersonnelImages());
    setLabImages({});
    setLabGalleryFiles({});
    pristineRef.current = JSON.stringify(stripUids(normalized));
    setDirty(false);
    setFormKey((k) => k + 1);
  }, [initialValue, setPayload]);

  useEffect(() => {
    getFaculties(0, 100).then((res) => {
      if (res && typeof res === "object" && "faculties" in res) setFaculties(res.faculties);
    });
  }, []);

  const pendingFileCount =
    (directorImage ? 1 : 0) +
    Object.values(personnelImages).reduce((sum, map) => sum + Object.keys(map).length, 0) +
    Object.keys(labImages).length +
    Object.values(labGalleryFiles).reduce((sum, files) => sum + files.length, 0);

  useEffect(() => {
    const current = JSON.stringify(stripUids(payload));
    setDirty(pristineRef.current !== "" && (current !== pristineRef.current || pendingFileCount > 0));
  }, [payload, pendingFileCount]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const setPersonnelImage = (listKey: PersonnelListKey, uid: string, file: File | null) => {
    setPersonnelImages((prev) => {
      const map = { ...prev[listKey] };
      if (file) map[uid] = file;
      else delete map[uid];
      return { ...prev, [listKey]: map };
    });
  };

  const setLabImage = (uid: string, file: File | null) => {
    setLabImages((prev) => {
      const next = { ...prev };
      if (file) next[uid] = file;
      else delete next[uid];
      return next;
    });
  };

  const setLabGallery = (uid: string, files: File[]) => {
    setLabGalleryFiles((prev) => ({ ...prev, [uid]: files }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!payload.faculty_code) next.faculty_code = "Fakültə seçilməlidir.";
    if (!payload.az.title.trim()) next.az_title = "Kafedra adı tələb olunur.";
    if (!payload.en.title.trim()) next.en_title = "Cafedra name is required.";
    setErrors(next);
    return next;
  };

  const tabErrorCount = useMemo(() => {
    const map: Partial<Record<TabId, number>> = {};
    const basic = ["faculty_code", "az_title", "en_title"].filter((key) => errors[key]).length;
    if (basic > 0) map.basic = basic;
    return map;
  }, [errors]);

  const tabBadge = (id: TabId): string | undefined => {
    if (isEdit) {
      if (id === "personnel" || id === "labs" || id === "scientific") return undefined;
    }
    if (id === "personnel") {
      const total = payload.workers.length + payload.deputy_deans.length + payload.scientific_council.length;
      return total > 0 ? String(total) : undefined;
    }
    if (id === "labs") return payload.laboratories.length > 0 ? String(payload.laboratories.length) : undefined;
    if (id === "content") {
      const total = payload.directions_of_action.length + payload.objectives.length + payload.duties.length;
      return total > 0 ? String(total) : undefined;
    }
    if (id === "stats") return payload.sdgs.length > 0 ? String(payload.sdgs.length) : undefined;
    return undefined;
  };

  const handleSave = async () => {
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setActiveTab("basic");
      Swal.fire({ icon: "warning", title: "Xahiş olunur", text: Object.values(validation)[0] });
      return;
    }

    setSaving(true);

    const submittedWorkers = payload.workers as any[];
    const submittedDeputies = payload.deputy_deans as any[];
    const submittedCouncil = payload.scientific_council as any[];
    const submittedLabs = payload.laboratories as any[];

    const payloadToSend: any = stripUids({
      ...payload,
      director: useDirector ? payload.director ?? blankDirector() : null,
    });

    // Edit mode: these lists are managed incrementally via their own endpoints,
    // so never send them through the bulk update — it would delete & recreate
    // every row, orphaning ids and uploaded images.
    if (isEdit) {
      delete payloadToSend.deputy_deans;
      delete payloadToSend.scientific_council;
      delete payloadToSend.workers;
      delete payloadToSend.laboratories;
      delete payloadToSend.research_works;
      delete payloadToSend.partner_companies;
      delete payloadToSend.projects;
    }

    const result = await onSubmit(payloadToSend);

    if (result.status === "SUCCESS") {
      // The create endpoint returns the full cafedra (with sub-entity ids) so
      // freshly added rows can get their images uploaded; update does not.
      const savedCafedra = result.cafedra;

      const imageErrors: string[] = [];
      const track = (res: string) => {
        if (res !== "SUCCESS") imageErrors.push(res);
      };

      if (savedCafedra) {
        if (directorImage) track(await uploadCafedraDirectorImage(savedCafedra.cafedra_code, directorImage));

        // The saved lists come back in submission order, so a row's uid maps to
        // the saved entity at the same index.
        const uploadPersonnel = async (rows: any[], saved: any[] | undefined, map: Record<string, File>) => {
          for (let index = 0; index < rows.length; index += 1) {
            const file = map[rows[index].uid];
            const person = saved?.[index];
            if (file && person?.id) track(await uploadCafedraWorkerImage(person.id, file));
          }
        };

        await uploadPersonnel(submittedWorkers, savedCafedra.workers, personnelImages.workers);
        await uploadPersonnel(submittedDeputies, (savedCafedra as any).deputy_deans, personnelImages.deputy_deans);
        await uploadPersonnel(submittedCouncil, (savedCafedra as any).scientific_council, personnelImages.scientific_council);

        for (let index = 0; index < submittedLabs.length; index += 1) {
          const lab = savedCafedra.laboratories?.[index];
          if (!lab?.id) continue;
          const cover = labImages[submittedLabs[index].uid];
          if (cover) await uploadLaboratoryImage(lab.id, cover);
          for (const file of labGalleryFiles[submittedLabs[index].uid] ?? []) {
            await uploadLaboratoryGalleryImage(lab.id, file);
          }
        }
      } else if (directorImage && initialValue) {
        track(await uploadCafedraDirectorImage(initialValue.cafedra_code, directorImage));
      }

      pristineRef.current = JSON.stringify(stripUids(payload));
      setDirty(false);

      if (imageErrors.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Məlumatlar saxlanıldı, lakin şəkil yüklənmədi",
          text: imageErrors[0],
        }).then(() => navigate("/cafedras"));
      } else {
        Swal.fire({
          icon: "success",
          title: "Uğurlu",
          text: "Məlumatlar uğurla yadda saxlanıldı!",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => navigate("/cafedras"));
      }
    } else if (result.status === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Kafedra tapılmadı" });
    } else {
      Swal.fire({ icon: "error", title: "Xəta", text: "Kafedra qeyd edərkən səhv baş verdi." });
    }
    setSaving(false);
  };

  const handleCancel = async () => {
    if (dirty) {
      const confirm = await Swal.fire({
        title: "Yadda saxlanılmamış dəyişikliklər var",
        text: "Səhifədən çıxsanız dəyişikliklər itəcək.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Bəli, çıx",
        cancelButtonText: "İmtina",
        reverseButtons: true,
      });
      if (!confirm.isConfirmed) return;
    }
    navigate("/cafedras");
  };

  const cafedraCode = initialValue?.cafedra_code;
  const refetch = onChanged ?? (() => undefined);

  return (
    <div className="space-y-5">
      <div className={sectionCard}>
        <div className="flex flex-wrap gap-1 p-2">
          {TABS.map((tab) => {
            const badge = tabBadge(tab.id);
            const hasError = Boolean(tabErrorCount[tab.id]);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`${tabBtnBase} ${activeTab === tab.id ? tabBtnActive : tabBtnIdle}`}
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                <span className="hidden sm:inline">{tab.label}</span>
                {badge ? (
                  <span
                    className={`rounded-full px-1.5 text-[11px] font-semibold ${
                      activeTab === tab.id ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {badge}
                  </span>
                ) : null}
                {hasError ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "basic" && <BasicTab api={api} faculties={faculties} formKey={formKey} errors={errors} />}
      {activeTab === "content" && <ContentTab api={api} />}
      {activeTab === "stats" && <StatsTab api={api} />}
      {activeTab === "director" && (
        <DirectorTab
          api={api}
          useDirector={useDirector}
          setUseDirector={setUseDirector}
          directorImage={directorImage}
          setDirectorImage={setDirectorImage}
        />
      )}
      {activeTab === "personnel" && (
        <PersonnelTab
          api={api}
          isEdit={isEdit}
          cafedraCode={cafedraCode}
          cafedra={initialValue}
          onChanged={refetch}
          images={personnelImages}
          setImage={setPersonnelImage}
        />
      )}
      {activeTab === "labs" && (
        <LaboratoriesTab
          api={api}
          isEdit={isEdit}
          cafedraCode={cafedraCode}
          cafedra={initialValue}
          onChanged={refetch}
          formKey={formKey}
          images={labImages}
          setImage={setLabImage}
          galleryFiles={labGalleryFiles}
          setGalleryFiles={setLabGallery}
        />
      )}
      {activeTab === "scientific" &&
        (isEdit && cafedraCode ? (
          <ScientificActivityTab cafedraCode={cafedraCode} onGoToLaboratories={() => setActiveTab("labs")} />
        ) : (
          <LockedPanel title="Elmi fəaliyyət" description="Elmi istiqamətlər, layihələr, nəşrlər və əməkdaşlıqlar." />
        ))}

      <div className={stickyBar}>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {dirty ? "Yadda saxlanılmamış dəyişikliklər" : "Bütün dəyişikliklər yadda saxlanılıb"}
        </span>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
            Ləğv et
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

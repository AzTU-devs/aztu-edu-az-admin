import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { CircularProgress } from "@mui/material";
import Swal from "sweetalert2";

import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import AboutPersonForm, {
  emptyPersonValue,
  personToFormValue,
  type AboutPersonFormValue,
} from "../../components/About/AboutPersonForm";
import {
  createAboutPerson,
  deleteAboutPerson,
  getAboutPage,
  updateAboutPerson,
  uploadAboutPersonImage,
  type AboutPageDetail,
  type AboutSection,
} from "../../services/about/aboutService";

/**
 * A person's own editing screen, mirroring the public site.
 *
 * On aztu.edu.az a vice-rector is a card that opens a full detail page — the
 * biography, contact block and education history only exist there. Editing that
 * inside a modal misrepresented the structure and gave a long biography a tiny
 * box, so the dashboard now has the same two levels: cards on the page editor,
 * and this screen behind them.
 */
export default function AboutPersonPage() {
  const { page_key: pageKey = "", person_id: personId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isNew = personId === "new";
  const sectionIdParam = Number(searchParams.get("section") ?? "0");

  const [page, setPage] = useState<AboutPageDetail | null>(null);
  const [section, setSection] = useState<AboutSection | null>(null);
  const [value, setValue] = useState<AboutPersonFormValue>(emptyPersonValue);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // `RichTextField` seeds its content once at mount; bump on load to re-seed.
  const [formKey, setFormKey] = useState(0);

  const backTo = `/about-pages/${pageKey}`;

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAboutPage(pageKey);

    if (result === "ERROR" || result === "NOT FOUND") {
      setPage(null);
      setLoading(false);
      return;
    }

    setPage(result);

    if (isNew) {
      const target =
        result.sections.find((entry) => entry.id === sectionIdParam) ??
        result.sections.find((entry) => entry.section_type === "people") ??
        null;
      setSection(target);
      setValue(emptyPersonValue());
    } else {
      const numericId = Number(personId);
      const owner = result.sections.find((entry) =>
        entry.people.some((candidate) => candidate.id === numericId)
      );
      const found = owner?.people.find((candidate) => candidate.id === numericId) ?? null;
      setSection(owner ?? null);
      setValue(found ? personToFormValue(found) : emptyPersonValue());
    }

    setFormKey((key) => key + 1);
    setLoading(false);
  }, [pageKey, personId, isNew, sectionIdParam]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!section) return;
    if (value.az.full_name.trim() === "" && value.en.full_name.trim() === "") {
      Swal.fire({ icon: "warning", title: "Xahiş olunur", text: "Ən azı bir dildə ad tələb olunur." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        slug: value.slug,
        email: value.email,
        phone: value.phone,
        phone_internal: value.phone_internal,
        room_number: value.room_number,
        az: value.az,
        en: value.en,
        educations: value.educations.map((education, index) => ({
          period: education.period,
          display_order: index,
          az: education.az,
          en: education.en,
        })),
      };

      let targetId: number;
      if (isNew) {
        const created = await createAboutPerson(section.id, payload);
        if (created.status !== "SUCCESS") {
          Swal.fire({ icon: "error", title: "Xəta", text: "Şəxs əlavə edilə bilmədi." });
          return;
        }
        targetId = created.id;
      } else {
        const updated = await updateAboutPerson(Number(personId), payload);
        if (updated !== "SUCCESS") {
          Swal.fire({ icon: "error", title: "Xəta", text: "Dəyişikliklər saxlanmadı." });
          return;
        }
        targetId = Number(personId);
      }

      // The row has to exist before a file can hang off it, so the photo goes up
      // after the save rather than with it.
      if (value.imageFile) {
        const upload = await uploadAboutPersonImage(targetId, value.imageFile);
        if (upload !== "SUCCESS") {
          Swal.fire({
            icon: "warning",
            title: "Məlumat saxlanıldı, lakin şəkil yüklənmədi",
            text: value.imageFile.name,
          });
          navigate(backTo);
          return;
        }
      }

      Swal.fire({ icon: "success", title: "Yadda saxlanıldı", showConfirmButton: false, timer: 1200 });
      navigate(backTo);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: "Silmək istədiyinizə əminsiniz?",
      text: "Bu əməliyyat geri alına bilməz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    const result = await deleteAboutPerson(Number(personId));
    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Silinərkən xəta baş verdi." });
      return;
    }
    Swal.fire({ icon: "success", title: "Silindi", showConfirmButton: false, timer: 1200 });
    navigate(backTo);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <CircularProgress />
      </div>
    );
  }

  if (!page || !section) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">
          {page ? "Bu səhifədə şəxs bölməsi tapılmadı." : "Səhifə tapılmadı."}
        </p>
        <div className="mt-4 flex justify-center">
          <Link
            to={backTo}
            className="rounded-lg bg-brand-500 px-4 py-3 text-sm text-white hover:bg-brand-600"
          >
            Səhifəyə qayıt
          </Link>
        </div>
      </div>
    );
  }

  const pageTitle = page.az?.title || page.en?.title || page.page_key;
  const personName =
    value.az.full_name || value.en.full_name || (isNew ? "Yeni şəxs" : "Şəxs");

  return (
    <>
      <PageMeta title={`${personName} | AzTU Admin`} description="Şəxsin məlumatları" />
      <PageBreadcrumb pageTitle={personName} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <Link to={backTo} className="text-brand-500 hover:underline">
            {pageTitle}
          </Link>{" "}
          · {section.az?.title || section.en?.title || section.section_key}
        </p>
        <div className="flex items-center gap-3">
          <Link
            to={backTo}
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Geri
          </Link>
          {!isNew ? (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-500 px-4 py-3 text-sm text-white transition hover:bg-red-600"
            >
              Sil
            </button>
          ) : null}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saxlanılır…" : "Yadda saxla"}
          </Button>
        </div>
      </div>

      <ComponentCard
        title={isNew ? "Yeni şəxs" : personName}
        desc="Saytda bu məlumatlar şəxsin ayrıca detal səhifəsində göstərilir."
      >
        <AboutPersonForm value={value} onChange={setValue} remountKey={formKey} />
      </ComponentCard>
    </>
  );
}

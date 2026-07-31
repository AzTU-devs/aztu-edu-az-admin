import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import Swal from "sweetalert2";

import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import RichTextField from "../../components/Cafedras/form/fields/RichTextField";
import {
  getAboutPage,
  publishAboutPage,
  updateAboutPage,
  uploadAboutDocument,
  uploadAboutFile,
  uploadAboutImage,
  type AboutPageDetail,
} from "../../services/about/aboutService";
import { getImageUrl } from "../../util/imageUrl";

/**
 * Edits one About screen.
 *
 * The whole page is one form with one Save button, matching how it saves on the
 * server. Everything the website hard-codes — the hero video, the card icons,
 * the SEO tags — is deliberately absent here.
 */

type Lang = "az" | "en";

interface Bilingual {
  az: string;
  en: string;
}

interface BlockForm {
  block_key: string;
  title: Bilingual;
  body: Bilingual;
}

interface LinkForm {
  url: string;
  label: Bilingual;
}

interface PillarForm {
  title: Bilingual;
  description: Bilingual;
  /** Edited one per line; stored as an array. */
  tags: Bilingual;
}

interface PersonForm {
  email: string;
  phone: string;
  phone_code: string;
  image_url: string;
  /** Former-rectors page: the years in office. */
  year_start: string;
  year_end: string;
  name: Bilingual;
  surname: Bilingual;
  degree: Bilingual;
  position: Bilingual;
  bio: Bilingual;
}

const emptyPerson = (): PersonForm => ({
  email: "",
  phone: "",
  phone_code: "",
  image_url: "",
  year_start: "",
  year_end: "",
  name: { az: "", en: "" },
  surname: { az: "", en: "" },
  degree: { az: "", en: "" },
  position: { az: "", en: "" },
  bio: { az: "", en: "" },
});

interface ListForm {
  list_key: string;
  style: string;
  title: Bilingual;
  /** Edited one per line; stored as an array. */
  items: Bilingual;
}

interface MilestoneForm {
  year: string;
  title: Bilingual;
  description: Bilingual;
}

/** One person on a council — a member or a secretariat member. */
interface CouncilMemberForm {
  name: Bilingual;
  surname: Bilingual;
  position: Bilingual;
}

interface CouncilForm {
  name: Bilingual;
  members: CouncilMemberForm[];
  secretaries: CouncilMemberForm[];
}

/** Which of a council's two rosters a member edit targets. */
type Roster = "members" | "secretaries";

const emptyMember = (): CouncilMemberForm => ({
  name: { az: "", en: "" },
  surname: { az: "", en: "" },
  position: { az: "", en: "" },
});

/** A document category on a regulatory-documents page. */
interface DocCategoryForm {
  /** Stable, page-local key a document references. */
  category_key: string;
  name: Bilingual;
}

/** One downloadable document card. */
interface DocumentForm {
  /** The chosen category's key, or "" for uncategorized. */
  category_key: string;
  /** An uploaded file's path or a pasted URL — any format. */
  file_url: string;
  name: Bilingual;
}

/** A fresh, stable page-local key for a new category. */
const makeCategoryKey = () => `c-${Math.random().toString(36).slice(2, 9)}`;

// ── MBA page (Akademik → Təhsil və proqramlar) ──────────────────────────────
// The MBA page assembles fixed, named sections out of the generic block/list
// children. These keys are the contract with the seed migration and the
// website; the editor renders one labelled section per key.
const MBA_BLOCK_KEYS = ["doctoral", "contact"] as const;
const MBA_LIST_DEFS: { key: string; style: string }[] = [
  { key: "highlights", style: "number" },
  { key: "languages", style: "bullet" },
  { key: "program_structure", style: "bullet" },
  { key: "doctoral_formats", style: "bullet" },
  { key: "phd", style: "bullet" },
  { key: "doctor_of_sciences", style: "bullet" },
  { key: "phones", style: "bullet" },
  { key: "emails", style: "bullet" },
];
// Lists whose items read the same in every language (numbers, phones, e-mails):
// edited once and written to both languages on save.
const MBA_NEUTRAL_LISTS = new Set(["highlights", "phones", "emails"]);
// The 4 highlight slots have fixed labels on the website; only the numbers are
// editable, and they keep their position (an empty slot is kept, not dropped).
const MBA_HIGHLIGHT_LABELS = [
  "Tədris sahələri",
  "İxtisaslaşma",
  "Tədris dili",
  "Qeydiyyatlı tələbələr",
];

/** Guarantees the MBA page's fixed blocks/lists exist in the form, so the
 *  editor always renders every section even if a seed row is missing. */
const ensureMbaScaffold = (form: PageForm): PageForm => {
  const blocks = [...form.blocks];
  for (const key of MBA_BLOCK_KEYS) {
    if (!blocks.some((b) => b.block_key === key)) {
      blocks.push({ block_key: key, title: { az: "", en: "" }, body: { az: "", en: "" } });
    }
  }
  const lists = [...form.lists];
  for (const def of MBA_LIST_DEFS) {
    if (!lists.some((l) => l.list_key === def.key)) {
      lists.push({
        list_key: def.key,
        style: def.style,
        title: { az: "", en: "" },
        items: { az: "", en: "" },
      });
    }
  }
  return { ...form, blocks, lists };
};

interface PageForm {
  title: Bilingual;
  description: Bilingual;
  links_title: Bilingual;
  document_label: Bilingual;
  pillars_title: Bilingual;
  document_url: string;
  // Rector page.
  degree: Bilingual;
  position: Bilingual;
  message: Bilingual;
  about: Bilingual;
  experience: string;
  email: string;
  image_url: string;
  /** The gallery strip — ordered image paths/URLs. */
  images: string[];
  pillars: PillarForm[];
  lists: ListForm[];
  blocks: BlockForm[];
  links: LinkForm[];
  milestones: MilestoneForm[];
  domains: Bilingual;
  section_title: Bilingual;
  section_body: Bilingual;
  persons: PersonForm[];
  councils_title: Bilingual;
  councils: CouncilForm[];
  doc_categories: DocCategoryForm[];
  documents: DocumentForm[];
}

const str = (value: string | null | undefined) => value ?? "";
/** A person row worth saving — anything typed into it counts. Used to drop the
 *  auto-seeded blank director and empty rows the editor added but never filled. */
const personHasContent = (p: PersonForm) =>
  [
    p.name.az, p.name.en, p.surname.az, p.surname.en, p.degree.az, p.degree.en,
    p.position.az, p.position.en, p.bio.az, p.bio.en, p.email, p.phone,
    p.phone_code, p.image_url, p.year_start, p.year_end,
  ].some((value) => value.trim());
/** JSONB string arrays are edited as one-per-line text. */
const linesOf = (values: string[] | null | undefined) => (values ?? []).join("\n");
const toLines = (text: string) =>
  text.split("\n").map((line) => line.trim()).filter(Boolean);

const toForm = (page: AboutPageDetail): PageForm => {
  const base: PageForm = {
  title: { az: str(page.az?.title), en: str(page.en?.title) },
  description: { az: str(page.az?.description), en: str(page.en?.description) },
  links_title: { az: str(page.az?.links_title), en: str(page.en?.links_title) },
  document_label: {
    az: str(page.az?.document_label),
    en: str(page.en?.document_label),
  },
  pillars_title: { az: str(page.az?.pillars_title), en: str(page.en?.pillars_title) },
  document_url: str(page.document_url),
  degree: { az: str(page.az?.degree), en: str(page.en?.degree) },
  position: { az: str(page.az?.position), en: str(page.en?.position) },
  message: { az: str(page.az?.message), en: str(page.en?.message) },
  about: { az: str(page.az?.about), en: str(page.en?.about) },
  experience: str(page.experience),
  email: str(page.email),
  image_url: str(page.image_url),
  images: page.images.map((image) => str(image.image_url)).filter(Boolean),
  pillars: page.pillars.map((pillar) => ({
    title: { az: str(pillar.az?.title), en: str(pillar.en?.title) },
    description: { az: str(pillar.az?.description), en: str(pillar.en?.description) },
    tags: { az: linesOf(pillar.az?.tags), en: linesOf(pillar.en?.tags) },
  })),
  lists: page.lists.map((entry) => ({
    list_key: entry.list_key,
    style: entry.style,
    title: { az: str(entry.az?.title), en: str(entry.en?.title) },
    items: { az: linesOf(entry.az?.items), en: linesOf(entry.en?.items) },
  })),
  blocks: page.blocks.map((block) => ({
    block_key: block.block_key,
    title: { az: str(block.az?.title), en: str(block.en?.title) },
    body: { az: str(block.az?.body), en: str(block.en?.body) },
  })),
  links: page.links.map((link) => ({
    url: str(link.url),
    label: { az: str(link.az?.label), en: str(link.en?.label) },
  })),
  domains: { az: str(page.az?.domains), en: str(page.en?.domains) },
  section_title: { az: str(page.az?.section_title), en: str(page.en?.section_title) },
  section_body: { az: str(page.az?.section_body), en: str(page.en?.section_body) },
  // A partner institution has exactly one person — its director — so seed a
  // blank card when none is stored yet, giving the single director form
  // something to bind to.
  persons:
    page.persons.length === 0 && page.template === "partner-institution"
      ? [emptyPerson()]
      : page.persons.map((person) => ({
          email: str(person.email),
          phone: str(person.phone),
          phone_code: str(person.phone_code),
          image_url: str(person.image_url),
          year_start: str(person.year_start),
          year_end: str(person.year_end),
          name: { az: str(person.az?.name), en: str(person.en?.name) },
          surname: { az: str(person.az?.surname), en: str(person.en?.surname) },
          degree: { az: str(person.az?.degree), en: str(person.en?.degree) },
          position: { az: str(person.az?.position), en: str(person.en?.position) },
          bio: { az: str(person.az?.bio), en: str(person.en?.bio) },
        })),
  councils_title: { az: str(page.az?.councils_title), en: str(page.en?.councils_title) },
  councils: page.councils.map((council) => ({
    name: { az: str(council.az?.name), en: str(council.en?.name) },
    members: council.members.map((member) => ({
      name: { az: str(member.az?.name), en: str(member.en?.name) },
      surname: { az: str(member.az?.surname), en: str(member.en?.surname) },
      position: { az: str(member.az?.position), en: str(member.en?.position) },
    })),
    secretaries: council.secretaries.map((member) => ({
      name: { az: str(member.az?.name), en: str(member.en?.name) },
      surname: { az: str(member.az?.surname), en: str(member.en?.surname) },
      position: { az: str(member.az?.position), en: str(member.en?.position) },
    })),
  })),
  doc_categories: page.doc_categories.map((category) => ({
    category_key: category.category_key,
    name: { az: str(category.az?.name), en: str(category.en?.name) },
  })),
  documents: page.documents.map((document) => ({
    category_key: str(document.category_key),
    file_url: str(document.file_url),
    name: { az: str(document.az?.name), en: str(document.en?.name) },
  })),
  milestones: page.milestones.map((milestone) => ({
    year: str(milestone.year),
    title: { az: str(milestone.az?.title), en: str(milestone.en?.title) },
    description: {
      az: str(milestone.az?.description),
      en: str(milestone.en?.description),
    },
  })),
  };
  return page.template === "mba" ? ensureMbaScaffold(base) : base;
};

/** Azerbaijani first — this dashboard is Azerbaijani. */
const LANGS: { code: Lang; label: string }[] = [
  { code: "az", label: "Azərbaycanca" },
  { code: "en", label: "English" },
];

export default function AboutPageEditor() {
  const { page_key: pageKey = "vision-mission-goal" } = useParams();

  const [page, setPage] = useState<AboutPageDetail | null>(null);
  const [form, setForm] = useState<PageForm | null>(null);
  const [lang, setLang] = useState<Lang>("az");
  // Admin-side filter over the document cards — a page can list many.
  const [docSearch, setDocSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  // `RichTextField` seeds its content once at mount, so every language switch
  // and refetch has to remount it or the editors keep showing the old text.
  const [formKey, setFormKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAboutPage(pageKey);

    if (result === "ERROR" || result === "NOT FOUND") {
      setMissing(result === "NOT FOUND");
      setPage(null);
      setForm(null);
    } else {
      setMissing(false);
      setPage(result);
      setForm(toForm(result));
      setFormKey((key) => key + 1);
    }
    setLoading(false);
  }, [pageKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const setField = (
    field:
      | "title"
      | "description"
      | "links_title"
      | "degree"
      | "position"
      | "message"
      | "about",
    value: string
  ) =>
    setForm((prev) => (prev ? { ...prev, [field]: { ...prev[field], [lang]: value } } : prev));

  // Language-neutral single-value fields (experience, email, portrait).
  const setPlain = (field: "experience" | "email" | "image_url", value: string) =>
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const removeGalleryImage = (index: number) =>
    setForm((prev) =>
      prev ? { ...prev, images: prev.images.filter((_, i) => i !== index) } : prev
    );

  const moveGalleryImage = (index: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const target = index + delta;
      if (target < 0 || target >= prev.images.length) return prev;
      const images = [...prev.images];
      [images[index], images[target]] = [images[target], images[index]];
      return { ...prev, images };
    });

  const setBlock = (index: number, field: "title" | "body", value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            blocks: prev.blocks.map((block, i) =>
              i === index ? { ...block, [field]: { ...block[field], [lang]: value } } : block
            ),
          }
        : prev
    );

  const setLink = (index: number, field: "url" | "label", value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            links: prev.links.map((link, i) =>
              i !== index
                ? link
                : field === "url"
                ? { ...link, url: value }
                : { ...link, label: { ...link.label, [lang]: value } }
            ),
          }
        : prev
    );

  const addLink = () =>
    setForm((prev) =>
      prev ? { ...prev, links: [...prev.links, { url: "", label: { az: "", en: "" } }] } : prev
    );

  const removeLink = (index: number) =>
    setForm((prev) =>
      prev ? { ...prev, links: prev.links.filter((_, i) => i !== index) } : prev
    );

  const moveLink = (index: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const target = index + delta;
      if (target < 0 || target >= prev.links.length) return prev;
      const links = [...prev.links];
      [links[index], links[target]] = [links[target], links[index]];
      return { ...prev, links };
    });

  const setMilestone = (
    index: number,
    field: "year" | "title" | "description",
    value: string
  ) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            milestones: prev.milestones.map((milestone, i) =>
              i !== index
                ? milestone
                : field === "year"
                ? { ...milestone, year: value }
                : { ...milestone, [field]: { ...milestone[field], [lang]: value } }
            ),
          }
        : prev
    );

  const addMilestone = () =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            milestones: [
              ...prev.milestones,
              { year: "", title: { az: "", en: "" }, description: { az: "", en: "" } },
            ],
          }
        : prev
    );

  const removeMilestone = (index: number) =>
    setForm((prev) =>
      prev
        ? { ...prev, milestones: prev.milestones.filter((_, i) => i !== index) }
        : prev
    );

  const setPillar = (
    index: number,
    field: "title" | "description" | "tags",
    value: string
  ) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            pillars: prev.pillars.map((pillar, i) =>
              i === index
                ? { ...pillar, [field]: { ...pillar[field], [lang]: value } }
                : pillar
            ),
          }
        : prev
    );

  const addPillar = () =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            pillars: [
              ...prev.pillars,
              {
                title: { az: "", en: "" },
                description: { az: "", en: "" },
                tags: { az: "", en: "" },
              },
            ],
          }
        : prev
    );

  const removePillar = (index: number) =>
    setForm((prev) =>
      prev ? { ...prev, pillars: prev.pillars.filter((_, i) => i !== index) } : prev
    );

  const movePillar = (index: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const target = index + delta;
      if (target < 0 || target >= prev.pillars.length) return prev;
      const pillars = [...prev.pillars];
      [pillars[index], pillars[target]] = [pillars[target], pillars[index]];
      return { ...prev, pillars };
    });

  const setList = (index: number, field: "title" | "items", value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            lists: prev.lists.map((entry, i) =>
              i === index ? { ...entry, [field]: { ...entry[field], [lang]: value } } : entry
            ),
          }
        : prev
    );

  // ── Regulatory documents: categories ───────────────────────────────────────
  const setCategoryName = (ci: number, value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            doc_categories: prev.doc_categories.map((category, i) =>
              i === ci ? { ...category, name: { ...category.name, [lang]: value } } : category
            ),
          }
        : prev
    );

  const addCategory = () =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            doc_categories: [
              ...prev.doc_categories,
              { category_key: makeCategoryKey(), name: { az: "", en: "" } },
            ],
          }
        : prev
    );

  const removeCategory = (ci: number) =>
    setForm((prev) =>
      prev
        ? { ...prev, doc_categories: prev.doc_categories.filter((_, i) => i !== ci) }
        : prev
    );

  const moveCategory = (ci: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const target = ci + delta;
      if (target < 0 || target >= prev.doc_categories.length) return prev;
      const doc_categories = [...prev.doc_categories];
      [doc_categories[ci], doc_categories[target]] = [doc_categories[target], doc_categories[ci]];
      return { ...prev, doc_categories };
    });

  // ── Regulatory documents: document cards ────────────────────────────────────
  const setDocumentField = (di: number, field: "category_key" | "file_url", value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            documents: prev.documents.map((document, i) =>
              i === di ? { ...document, [field]: value } : document
            ),
          }
        : prev
    );

  const setDocumentName = (di: number, value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            documents: prev.documents.map((document, i) =>
              i === di ? { ...document, name: { ...document.name, [lang]: value } } : document
            ),
          }
        : prev
    );

  const addDocument = () =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            documents: [
              ...prev.documents,
              { category_key: "", file_url: "", name: { az: "", en: "" } },
            ],
          }
        : prev
    );

  const removeDocument = (di: number) =>
    setForm((prev) =>
      prev ? { ...prev, documents: prev.documents.filter((_, i) => i !== di) } : prev
    );

  const moveDocument = (di: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const target = di + delta;
      if (target < 0 || target >= prev.documents.length) return prev;
      const documents = [...prev.documents];
      [documents[di], documents[target]] = [documents[target], documents[di]];
      return { ...prev, documents };
    });

  const handleDocumentFileUpload = async (di: number, file: File | null) => {
    if (!file) return;
    setSaving(true);
    try {
      const result = await uploadAboutFile(pageKey, file);
      if (result.status !== "SUCCESS") {
        Swal.fire({ icon: "error", title: "Xəta", text: "Fayl yüklənmədi." });
        return;
      }
      // The endpoint only stored the file; the path lands in the card's
      // file_url and the whole-page save persists it.
      setDocumentField(di, "file_url", result.path);
      Swal.fire({ icon: "success", title: "Fayl yükləndi", showConfirmButton: false, timer: 1000 });
    } finally {
      setSaving(false);
    }
  };

  // ── MBA page: keyed block/list editing ─────────────────────────────────────
  const setListTitleByKey = (key: string, value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            lists: prev.lists.map((entry) =>
              entry.list_key === key
                ? { ...entry, title: { ...entry.title, [lang]: value } }
                : entry
            ),
          }
        : prev
    );

  const setListItemsByKey = (key: string, value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            lists: prev.lists.map((entry) =>
              entry.list_key === key
                ? { ...entry, items: { ...entry.items, [lang]: value } }
                : entry
            ),
          }
        : prev
    );

  // Language-neutral list: the same value is written to both languages.
  const setNeutralListItems = (key: string, value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            lists: prev.lists.map((entry) =>
              entry.list_key === key ? { ...entry, items: { az: value, en: value } } : entry
            ),
          }
        : prev
    );

  const listItemsText = (key: string) => {
    const entry = form?.lists.find((l) => l.list_key === key);
    if (!entry) return "";
    return MBA_NEUTRAL_LISTS.has(key) ? entry.items.az || entry.items.en : entry.items[lang];
  };

  const highlightValues = (): string[] => {
    const raw = listItemsText("highlights");
    const arr = raw.split("\n");
    while (arr.length < 4) arr.push("");
    return arr.slice(0, 4);
  };

  const setHighlight = (slot: number, value: string) => {
    const four = highlightValues();
    four[slot] = value;
    setNeutralListItems("highlights", four.join("\n"));
  };

  const setBlockByKey = (key: string, field: "title" | "body", value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            blocks: prev.blocks.map((block) =>
              block.block_key === key
                ? { ...block, [field]: { ...block[field], [lang]: value } }
                : block
            ),
          }
        : prev
    );

  const blockValue = (key: string, field: "title" | "body") =>
    form?.blocks.find((b) => b.block_key === key)?.[field][lang] ?? "";

  /** One council roster (members or secretariat) as an add/remove/reorder list. */
  const renderRoster = (
    council: CouncilForm,
    ci: number,
    roster: Roster,
    label: string
  ) => (
    <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/40">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-300">{label}</span>
        <button
          type="button"
          onClick={() => addCouncilMember(ci, roster)}
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          + Əlavə et
        </button>
      </div>
      {council[roster].length === 0 ? (
        <p className="text-xs text-gray-400">Hələ əlavə edilməyib.</p>
      ) : (
        <div className="space-y-3">
          {council[roster].map((member, mi) => (
            <div
              key={mi}
              className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">#{mi + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveCouncilMember(ci, roster, mi, -1)}
                    disabled={mi === 0}
                    title="Yuxarı"
                    className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCouncilMember(ci, roster, mi, 1)}
                    disabled={mi === council[roster].length - 1}
                    title="Aşağı"
                    className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCouncilMember(ci, roster, mi)}
                    className="ml-2 text-xs text-red-500 hover:text-red-600"
                  >
                    Sil
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <Label>Ad</Label>
                  <Input
                    value={member.name[lang]}
                    onChange={(event) => setCouncilMember(ci, roster, mi, "name", event.target.value)}
                    placeholder="Ad"
                  />
                </div>
                <div>
                  <Label>Soyad</Label>
                  <Input
                    value={member.surname[lang]}
                    onChange={(event) => setCouncilMember(ci, roster, mi, "surname", event.target.value)}
                    placeholder="Soyad"
                  />
                </div>
                <div>
                  <Label>Vəzifə</Label>
                  <Input
                    value={member.position[lang]}
                    onChange={(event) => setCouncilMember(ci, roster, mi, "position", event.target.value)}
                    placeholder="Sədr"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const handleDocumentUpload = async (file: File | null) => {
    if (!file) return;
    setSaving(true);
    try {
      const result = await uploadAboutDocument(pageKey, file);
      if (result !== "SUCCESS") {
        Swal.fire({ icon: "error", title: "Xəta", text: "Sənəd yüklənmədi." });
        return;
      }
      Swal.fire({ icon: "success", title: "Sənəd yükləndi", showConfirmButton: false, timer: 1200 });
      await load();
    } finally {
      setSaving(false);
    }
  };

  // The upload endpoint only stores the file and returns its path; the path is
  // held in form state and persisted by the next Save (the portrait or the
  // gallery strip), so an unsaved upload never leaves a dangling row.
  const handlePortraitUpload = async (file: File | null) => {
    if (!file) return;
    setSaving(true);
    try {
      const result = await uploadAboutImage(pageKey, file);
      if (result.status !== "SUCCESS") {
        Swal.fire({ icon: "error", title: "Xəta", text: "Şəkil yüklənmədi." });
        return;
      }
      setPlain("image_url", result.path);
    } finally {
      setSaving(false);
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setSaving(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadAboutImage(pageKey, file);
        if (result.status === "SUCCESS") uploaded.push(result.path);
      }
      if (uploaded.length === 0) {
        Swal.fire({ icon: "error", title: "Xəta", text: "Şəkillər yüklənmədi." });
        return;
      }
      setForm((prev) => (prev ? { ...prev, images: [...prev.images, ...uploaded] } : prev));
    } finally {
      setSaving(false);
    }
  };

  const setBilingualField = (
    field: "domains" | "section_title" | "section_body" | "councils_title",
    value: string
  ) =>
    setForm((prev) =>
      prev ? { ...prev, [field]: { ...prev[field], [lang]: value } } : prev
    );

  // ── Scientific-board councils ──────────────────────────────────────────────
  const setCouncilName = (ci: number, value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            councils: prev.councils.map((council, i) =>
              i === ci
                ? { ...council, name: { ...council.name, [lang]: value } }
                : council
            ),
          }
        : prev
    );

  const addCouncil = () =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            councils: [
              ...prev.councils,
              { name: { az: "", en: "" }, members: [], secretaries: [] },
            ],
          }
        : prev
    );

  const removeCouncil = (ci: number) =>
    setForm((prev) =>
      prev ? { ...prev, councils: prev.councils.filter((_, i) => i !== ci) } : prev
    );

  const moveCouncil = (ci: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const target = ci + delta;
      if (target < 0 || target >= prev.councils.length) return prev;
      const councils = [...prev.councils];
      [councils[ci], councils[target]] = [councils[target], councils[ci]];
      return { ...prev, councils };
    });

  const addCouncilMember = (ci: number, roster: Roster) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            councils: prev.councils.map((council, i) =>
              i === ci
                ? { ...council, [roster]: [...council[roster], emptyMember()] }
                : council
            ),
          }
        : prev
    );

  const removeCouncilMember = (ci: number, roster: Roster, mi: number) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            councils: prev.councils.map((council, i) =>
              i === ci
                ? { ...council, [roster]: council[roster].filter((_, j) => j !== mi) }
                : council
            ),
          }
        : prev
    );

  const moveCouncilMember = (ci: number, roster: Roster, mi: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        councils: prev.councils.map((council, i) => {
          if (i !== ci) return council;
          const target = mi + delta;
          if (target < 0 || target >= council[roster].length) return council;
          const roster_ = [...council[roster]];
          [roster_[mi], roster_[target]] = [roster_[target], roster_[mi]];
          return { ...council, [roster]: roster_ };
        }),
      };
    });

  const setCouncilMember = (
    ci: number,
    roster: Roster,
    mi: number,
    field: "name" | "surname" | "position",
    value: string
  ) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            councils: prev.councils.map((council, i) =>
              i !== ci
                ? council
                : {
                    ...council,
                    [roster]: council[roster].map((member, j) =>
                      j !== mi
                        ? member
                        : { ...member, [field]: { ...member[field], [lang]: value } }
                    ),
                  }
            ),
          }
        : prev
    );

  const setPerson = (
    index: number,
    field: "email" | "phone" | "phone_code" | "image_url" | "year_start" | "year_end",
    value: string
  ) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            persons: prev.persons.map((person, i) =>
              i === index ? { ...person, [field]: value } : person
            ),
          }
        : prev
    );

  const setPersonTr = (
    index: number,
    field: "name" | "surname" | "degree" | "position" | "bio",
    value: string
  ) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            persons: prev.persons.map((person, i) =>
              i === index
                ? { ...person, [field]: { ...person[field], [lang]: value } }
                : person
            ),
          }
        : prev
    );

  const addPerson = () =>
    setForm((prev) =>
      prev ? { ...prev, persons: [...prev.persons, emptyPerson()] } : prev
    );

  const removePerson = (index: number) =>
    setForm((prev) =>
      prev ? { ...prev, persons: prev.persons.filter((_, i) => i !== index) } : prev
    );

  const movePerson = (index: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const target = index + delta;
      if (target < 0 || target >= prev.persons.length) return prev;
      const persons = [...prev.persons];
      [persons[index], persons[target]] = [persons[target], persons[index]];
      return { ...prev, persons };
    });

  const handlePersonImageUpload = async (index: number, file: File | null) => {
    if (!file) return;
    const result = await uploadAboutImage(pageKey, file);
    if (result.status !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Şəkil yüklənmədi." });
      return;
    }
    // The endpoint only stored the file; the returned path lands in the
    // person's image_url and the whole-page save persists it.
    setPerson(index, "image_url", result.path);
    Swal.fire({ icon: "success", title: "Şəkil yükləndi", showConfirmButton: false, timer: 1000 });
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const result = await updateAboutPage(pageKey, {
        document_url: form.document_url,
        experience: form.experience,
        email: form.email,
        image_url: form.image_url,
        az: {
          title: form.title.az,
          description: form.description.az,
          links_title: form.links_title.az,
          document_label: form.document_label.az,
          pillars_title: form.pillars_title.az,
          degree: form.degree.az,
          position: form.position.az,
          message: form.message.az,
          about: form.about.az,
          section_title: form.section_title.az,
          section_body: form.section_body.az,
          domains: form.domains.az,
          councils_title: form.councils_title.az,
        },
        en: {
          title: form.title.en,
          description: form.description.en,
          links_title: form.links_title.en,
          document_label: form.document_label.en,
          pillars_title: form.pillars_title.en,
          degree: form.degree.en,
          position: form.position.en,
          message: form.message.en,
          about: form.about.en,
          section_title: form.section_title.en,
          section_body: form.section_body.en,
          domains: form.domains.en,
          councils_title: form.councils_title.en,
        },
        // A blank image row was never filled in and should not reach the site.
        images: form.images
          .map((url) => url.trim())
          .filter(Boolean)
          .map((url) => ({ image_url: url })),
        // A card with no heading in either language was never filled in.
        pillars: form.pillars
          .filter((pillar) => pillar.title.az.trim() || pillar.title.en.trim())
          .map((pillar) => ({
            az: {
              title: pillar.title.az,
              description: pillar.description.az,
              tags: toLines(pillar.tags.az),
            },
            en: {
              title: pillar.title.en,
              description: pillar.description.en,
              tags: toLines(pillar.tags.en),
            },
          })),
        lists: form.lists.map((entry) => {
          // The 4 MBA highlight numbers keep their fixed positions (an empty
          // slot stays "", it is not dropped) and read the same in both langs.
          if (entry.list_key === "highlights") {
            const four = (entry.items.az || entry.items.en).split("\n").map((s) => s.trim());
            while (four.length < 4) four.push("");
            const items = four.slice(0, 4);
            return { list_key: entry.list_key, style: entry.style, az: { title: entry.title.az, items }, en: { title: entry.title.en, items } };
          }
          // Phones and e-mails are language-neutral: one list, written to both.
          if (entry.list_key === "phones" || entry.list_key === "emails") {
            const items = toLines(entry.items.az || entry.items.en);
            return { list_key: entry.list_key, style: entry.style, az: { title: entry.title.az, items }, en: { title: entry.title.en, items } };
          }
          return {
            list_key: entry.list_key,
            style: entry.style,
            az: { title: entry.title.az, items: toLines(entry.items.az) },
            en: { title: entry.title.en, items: toLines(entry.items.en) },
          };
        }),
        blocks: form.blocks.map((block) => ({
          block_key: block.block_key,
          az: { title: block.title.az, body: block.body.az },
          en: { title: block.title.en, body: block.body.en },
        })),
        // A button with neither a label nor a URL is an empty row the editor
        // added and never filled in; it should not reach the website.
        links: form.links
          .filter((link) => link.url.trim() || link.label.az.trim() || link.label.en.trim())
          .map((link) => ({
            url: link.url,
            az: { label: link.label.az },
            en: { label: link.label.en },
          })),
        // A completely blank card (e.g. the auto-seeded partner director before
        // it is filled in) should not persist.
        persons: form.persons
          .filter(personHasContent)
          .map((person) => ({
            email: person.email,
            phone: person.phone,
            phone_code: person.phone_code,
            image_url: person.image_url,
            year_start: person.year_start,
            year_end: person.year_end,
            az: {
              name: person.name.az,
              surname: person.surname.az,
              degree: person.degree.az,
              position: person.position.az,
              bio: person.bio.az,
            },
            en: {
              name: person.name.en,
              surname: person.surname.en,
              degree: person.degree.en,
              position: person.position.en,
              bio: person.bio.en,
            },
          })),
        // A council with no name and no people is an empty row the editor added
        // and never filled in; likewise a member with no name/surname.
        councils: form.councils
          .filter(
            (council) =>
              council.name.az.trim() ||
              council.name.en.trim() ||
              council.members.length > 0 ||
              council.secretaries.length > 0
          )
          .map((council) => {
            const cleanRoster = (roster: CouncilMemberForm[]) =>
              roster
                .filter(
                  (member) =>
                    member.name.az.trim() ||
                    member.name.en.trim() ||
                    member.surname.az.trim() ||
                    member.surname.en.trim()
                )
                .map((member) => ({
                  az: {
                    name: member.name.az,
                    surname: member.surname.az,
                    position: member.position.az,
                  },
                  en: {
                    name: member.name.en,
                    surname: member.surname.en,
                    position: member.position.en,
                  },
                }));
            return {
              az: { name: council.name.az },
              en: { name: council.name.en },
              members: cleanRoster(council.members),
              secretaries: cleanRoster(council.secretaries),
            };
          }),
        // A category with no name in either language was never filled in.
        doc_categories: form.doc_categories
          .filter((category) => category.name.az.trim() || category.name.en.trim())
          .map((category) => ({
            category_key: category.category_key,
            az: { name: category.name.az },
            en: { name: category.name.en },
          })),
        // A document with no name and no file is an empty row the editor added.
        documents: form.documents
          .filter(
            (document) =>
              document.name.az.trim() || document.name.en.trim() || document.file_url.trim()
          )
          .map((document) => ({
            category_key: document.category_key,
            file_url: document.file_url,
            az: { name: document.name.az },
            en: { name: document.name.en },
          })),
        // A milestone with no year and no text is an empty row the editor
        // added and never filled in; it should not reach the website.
        milestones: form.milestones
          .filter(
            (milestone) =>
              milestone.year.trim() ||
              milestone.title.az.trim() ||
              milestone.title.en.trim()
          )
          .map((milestone) => ({
            year: milestone.year,
            az: { title: milestone.title.az, description: milestone.description.az },
            en: { title: milestone.title.en, description: milestone.description.en },
          })),
      });

      if (result !== "SUCCESS") {
        Swal.fire({ icon: "error", title: "Xəta", text: "Dəyişikliklər saxlanmadı." });
        return;
      }
      Swal.fire({
        icon: "success",
        title: "Yadda saxlanıldı",
        showConfirmButton: false,
        timer: 1200,
      });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!page) return;
    const next = !page.is_active;

    if (!next) {
      const confirm = await Swal.fire({
        title: "Səhifəni dərcdən çıxarmaq?",
        text: "Səhifə saytda görünməyəcək.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Bəli",
        cancelButtonText: "İmtina",
        reverseButtons: true,
      });
      if (!confirm.isConfirmed) return;
    }

    const result = await publishAboutPage(pageKey, next);
    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Əməliyyat alınmadı." });
      return;
    }
    await load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <CircularProgress />
      </div>
    );
  }

  if (!page || !form) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="font-medium text-gray-700 dark:text-gray-200">
          {missing ? "Səhifə tapılmadı." : "Səhifə yüklənə bilmədi."}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {missing ? (
            <>
              Verilənlər bazasında{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">
                migrations_about.sql
              </code>{" "}
              faylını icra edin.
            </>
          ) : (
            "API cavab vermir. Backend-i yoxlayıb yenidən cəhd edin."
          )}
        </p>
        <div className="mt-4 flex justify-center">
          <Button size="sm" variant="outline" onClick={() => void load()}>
            Yenidən cəhd et
          </Button>
        </div>
      </div>
    );
  }

  const title = form.title.az || form.title.en || page.page_key;
  // The About pages are not all the same shape; the page says which form it is.
  const isTimeline = page.template === "timeline";
  const isStrategicPlan = page.template === "strategic_plan";
  const isViceRector = page.template === "vice-rector";
  const isRector = page.template === "rector";
  const isScientificBoard = page.template === "scientific-board";
  const isFormerRectors = page.template === "former-rectors";
  const isPartner = page.template === "partner-institution";
  // Both document libraries; only the categorized one shows a categories editor.
  const isDocuments = page.template === "documents" || page.template === "documents-simple";
  const hasDocCategories = page.template === "documents";
  const isMba = page.template === "mba";
  // The rector page's single 'offices' list is edited as one textarea per
  // language, so it is pulled out of the generic `lists` machinery here.
  const officesIndex = form.lists.findIndex((entry) => entry.list_key === "offices");

  return (
    <>
      <PageMeta title={`${title} | AzTU Admin`} description="Haqqımızda səhifəsi" />
      <PageBreadcrumb pageTitle={title} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              page.is_active
                ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {page.is_active ? "Dərc olunub" : "Qaralama"}
          </span>
          <span className="text-xs text-gray-400">
            /{lang === "az" ? page.slug_az : page.slug_en}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={handlePublish}>
            {page.is_active ? "Dərcdən çıxar" : "Dərc et"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Yadda saxla
          </Button>
        </div>
      </div>

      {/* One language at a time: the fields are long, and a side-by-side
          layout would halve the width of every editor. */}
      <div className="mb-6 inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            onClick={() => {
              setLang(code);
              setFormKey((key) => key + 1);
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              lang === code
                ? "bg-brand-500 text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <ComponentCard
          title="Başlıq bölməsi"
          desc={
            isRector
              ? "Səhifənin yuxarısındakı bölmə. Şəkil və başlıqların dizaynı saytda sabitdir."
              : isScientificBoard || isFormerRectors || isPartner || isDocuments || isMba
              ? "Səhifənin yuxarısındakı başlıq bölməsi."
              : "Səhifənin yuxarısındakı video bölməsində göstərilir. Video saytda sabitdir."
          }
        >
          <div className="space-y-4">
            <div>
              <Label>{isRector ? "Ad və Soyad" : "Başlıq"}</Label>
              <Input
                value={form.title[lang]}
                onChange={(event) => setField("title", event.target.value)}
                placeholder={isRector ? "Vilayət Vəliyev" : "Vizyon, Missiya və Məqsəd"}
              />
            </div>
            <RichTextField
              label="Qısa təsvir"
              value={form.description[lang]}
              onChange={(next) => setField("description", next)}
              remountKey={`${formKey}-desc-${lang}`}
            />
          </div>
        </ComponentCard>

        {isRector && (
          <ComponentCard
            title="Rektor məlumatları"
            desc="Başlıq bölməsindəki kartlarda göstərilir. Etiketlər (Doktorluq, Elmi ad, Təcrübə) saytda sabitdir."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Elmi dərəcə</Label>
                  <Input
                    value={form.degree[lang]}
                    onChange={(event) => setField("degree", event.target.value)}
                    placeholder="Texniki elmlər"
                  />
                </div>
                <div>
                  <Label>Elmi ad</Label>
                  <Input
                    value={form.position[lang]}
                    onChange={(event) => setField("position", event.target.value)}
                    placeholder="Professor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Təcrübə</Label>
                  <Input
                    value={form.experience}
                    onChange={(event) => setPlain("experience", event.target.value)}
                    placeholder="30+ Years"
                  />
                  <p className="mt-1 text-xs text-gray-400">Bütün dillərdə eyni göstərilir.</p>
                </div>
                <div>
                  <Label>E-poçt</Label>
                  <Input
                    value={form.email}
                    onChange={(event) => setPlain("email", event.target.value)}
                    placeholder="rector@aztu.edu.az"
                  />
                </div>
              </div>

              <div>
                <Label>Rektorun şəkli</Label>
                <div className="flex flex-wrap items-center gap-4">
                  {form.image_url ? (
                    <img
                      src={getImageUrl(form.image_url)}
                      alt="Rektor"
                      className="h-28 w-28 rounded-xl border border-gray-200 object-cover dark:border-gray-700"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs text-gray-400 dark:border-gray-700">
                      Şəkil yoxdur
                    </div>
                  )}
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => void handlePortraitUpload(event.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
                    />
                    {form.image_url ? (
                      <button
                        type="button"
                        onClick={() => setPlain("image_url", "")}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Şəkli sil
                      </button>
                    ) : null}
                    <p className="text-xs text-gray-400">
                      Yüklədikdən sonra dəyişikliyi saxlamaq üçün “Yadda saxla”ya basın.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ComponentCard>
        )}

        {isRector && (
          <ComponentCard
            title="Rektorun müraciəti"
            desc="Redaktorda sətirlər arasına boşluq (sətir hündürlüyü) əlavə edə bilərsiniz."
          >
            <RichTextField
              label="Mətn"
              value={form.message[lang]}
              onChange={(next) => setField("message", next)}
              remountKey={`${formKey}-message-${lang}`}
            />
          </ComponentCard>
        )}

        {isRector && (
          <ComponentCard title="Rektor haqqında" desc="Tərcümeyi-hal mətni.">
            <RichTextField
              label="Mətn"
              value={form.about[lang]}
              onChange={(next) => setField("about", next)}
              remountKey={`${formKey}-about-${lang}`}
            />
          </ComponentCard>
        )}

        {isRector && officesIndex !== -1 && (
          <ComponentCard
            title="Rektora tabe olan bölmələr"
            desc="Hər sətirdə bir bölmə. Sayı məhdud deyil."
          >
            <div>
              <Label>Bölmələr</Label>
              <textarea
                value={form.lists[officesIndex].items[lang]}
                onChange={(event) => setList(officesIndex, "items", event.target.value)}
                rows={8}
                placeholder={"Rektor Aparatı\nElm və İnnovasiyalar üzrə Departament"}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              <p className="mt-1 text-xs text-gray-400">Hər sətirdə bir bölmə.</p>
            </div>
          </ComponentCard>
        )}

        {isRector && (
          <ComponentCard title="Qalereya" desc="Rektorun şəkilləri. Sayı məhdud deyil.">
            <div className="space-y-4">
              {form.images.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hələ şəkil əlavə edilməyib.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {form.images.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`Qalereya ${index + 1}`}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/50 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(index, -1)}
                            disabled={index === 0}
                            title="Sola"
                            className="px-1 text-white disabled:opacity-30"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(index, 1)}
                            disabled={index === form.images.length - 1}
                            title="Sağa"
                            className="px-1 text-white disabled:opacity-30"
                          >
                            →
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="text-xs font-medium text-red-300 hover:text-red-200"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label>Şəkil əlavə et</Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => void handleGalleryUpload(event.target.files)}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Bir neçə şəkil seçə bilərsiniz. Dəyişikliyi saxlamaq üçün “Yadda saxla”ya basın.
                </p>
              </div>
            </div>
          </ComponentCard>
        )}

        {isViceRector && (
          <ComponentCard
            title="Kateqoriyalar və ikinci bölmə"
            desc="Başlığın altındakı kateqoriya sətri və 'İcraçı Rəhbərlik' bölməsi."
          >
            <div className="space-y-4">
              <div>
                <Label>Kateqoriyalar (vergüllə və ya · ilə ayırın)</Label>
                <Input
                  value={form.domains[lang]}
                  onChange={(event) => setBilingualField("domains", event.target.value)}
                  placeholder="Akademik · Elm · Beynəlxalq · Maliyyə"
                />
              </div>
              <div>
                <Label>İkinci bölmənin başlığı</Label>
                <Input
                  value={form.section_title[lang]}
                  onChange={(event) => setBilingualField("section_title", event.target.value)}
                  placeholder="İcraçı Rəhbərlik"
                />
              </div>
              <RichTextField
                label="İkinci bölmənin təsviri"
                value={form.section_body[lang]}
                onChange={(next) => setBilingualField("section_body", next)}
                remountKey={`${formKey}-sectionbody-${lang}`}
              />
            </div>
          </ComponentCard>
        )}

        {isViceRector && (
          <ComponentCard
            title="Prorektorlar"
            desc="Şəxs kartları. Sayı məhdud deyil. Daxili kod istisna olmaqla bütün sahələr hər iki dildə tələb olunur."
          >
            <div className="space-y-4">
              {form.persons.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hələ prorektor əlavə edilməyib.
                </p>
              ) : (
                <div className="space-y-4">
                  {form.persons.map((person, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">
                          #{index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => movePerson(index, -1)} disabled={index === 0} title="Yuxarı" className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↑</button>
                          <button type="button" onClick={() => movePerson(index, 1)} disabled={index === form.persons.length - 1} title="Aşağı" className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↓</button>
                          <button type="button" onClick={() => removePerson(index)} className="ml-2 text-xs text-red-500 hover:text-red-600">Sil</button>
                        </div>
                      </div>

                      <div className="mb-3 flex items-center gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                          {person.image_url ? (
                            <img
                              src={getImageUrl(person.image_url)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                              Şəkil yoxdur
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <Label>Şəkil</Label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              void handlePersonImageUpload(index, event.target.files?.[0] ?? null)
                            }
                            className="block w-full text-xs text-gray-500 file:mr-2 file:rounded-md file:border-0 file:bg-brand-50 file:px-2 file:py-1 file:text-xs file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
                          />
                          <Input
                            value={person.image_url}
                            onChange={(event) => setPerson(index, "image_url", event.target.value)}
                            placeholder="və ya keçid yapışdırın"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <Label>Ad və elmi ad</Label>
                        <Input
                          value={person.name[lang]}
                          onChange={(event) => setPersonTr(index, "name", event.target.value)}
                          placeholder="Prof. Sübhan Namazov"
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Elmi dərəcə</Label>
                        <Input
                          value={person.degree[lang]}
                          onChange={(event) => setPersonTr(index, "degree", event.target.value)}
                          placeholder="Texnika elmləri doktoru, professor"
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Vəzifə</Label>
                        <Input
                          value={person.position[lang]}
                          onChange={(event) => setPersonTr(index, "position", event.target.value)}
                          placeholder="Tədris işləri üzrə prorektor"
                        />
                      </div>

                      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <Label>E-poçt</Label>
                          <Input
                            value={person.email}
                            onChange={(event) => setPerson(index, "email", event.target.value)}
                            placeholder="ad@aztu.edu.az"
                          />
                        </div>
                        <div>
                          <Label>Telefon</Label>
                          <Input
                            value={person.phone}
                            onChange={(event) => setPerson(index, "phone", event.target.value)}
                            placeholder="+994 12 538 00 00"
                          />
                        </div>
                        <div>
                          <Label>Daxili kod (istəyə bağlı)</Label>
                          <Input
                            value={person.phone_code}
                            onChange={(event) => setPerson(index, "phone_code", event.target.value)}
                            placeholder="1204"
                          />
                        </div>
                      </div>

                      <RichTextField
                        label="Profil (böyük təsvir)"
                        value={person.bio[lang]}
                        onChange={(next) => setPersonTr(index, "bio", next)}
                        remountKey={`${formKey}-bio-${index}-${lang}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button size="sm" variant="outline" onClick={addPerson}>
                + Prorektor əlavə et
              </Button>
            </div>
          </ComponentCard>
        )}

        {(isScientificBoard || isPartner || isMba) && (
          <ComponentCard
            title={isMba ? "MBA haqqında" : isPartner ? "Haqqında bölməsi" : "İkinci bölmə"}
            desc="Başlığın altındakı ikinci başlıq və təsvir."
          >
            <div className="space-y-4">
              <div>
                <Label>İkinci başlıq</Label>
                <Input
                  value={form.section_title[lang]}
                  onChange={(event) => setBilingualField("section_title", event.target.value)}
                  placeholder={
                    isMba
                      ? "MBA Proqramı haqqında"
                      : isPartner
                      ? "Universitet haqqında"
                      : "Şura Haqqında"
                  }
                />
              </div>
              <RichTextField
                label="İkinci təsvir"
                value={form.section_body[lang]}
                onChange={(next) => setBilingualField("section_body", next)}
                remountKey={`${formKey}-sb-body-${lang}`}
              />
            </div>
          </ComponentCard>
        )}

        {isScientificBoard && (
          <ComponentCard
            title="Şuralar"
            desc="Şuraların siyahısı. Sayı məhdud deyil. Hər şuranın üzvləri və katiblik heyəti var."
          >
            <div className="space-y-4">
              <div>
                <Label>Bölmənin başlığı</Label>
                <Input
                  value={form.councils_title[lang]}
                  onChange={(event) => setBilingualField("councils_title", event.target.value)}
                  placeholder="Şuralar"
                />
              </div>

              {form.councils.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hələ şura əlavə edilməyib.
                </p>
              ) : (
                <div className="space-y-4">
                  {form.councils.map((council, ci) => (
                    <div
                      key={ci}
                      className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">
                          Şura #{ci + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveCouncil(ci, -1)}
                            disabled={ci === 0}
                            title="Yuxarı"
                            className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveCouncil(ci, 1)}
                            disabled={ci === form.councils.length - 1}
                            title="Aşağı"
                            className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCouncil(ci)}
                            className="ml-2 text-xs text-red-500 hover:text-red-600"
                          >
                            Sil
                          </button>
                        </div>
                      </div>

                      <div className="mb-1">
                        <Label>Şuranın adı</Label>
                        <Input
                          value={council.name[lang]}
                          onChange={(event) => setCouncilName(ci, event.target.value)}
                          placeholder="Böyük Elmi Şura"
                        />
                      </div>

                      {renderRoster(council, ci, "members", "Üzvlər")}
                      {renderRoster(council, ci, "secretaries", "Katiblik heyəti")}
                    </div>
                  ))}
                </div>
              )}

              <Button size="sm" variant="outline" onClick={addCouncil}>
                + Şura əlavə et
              </Button>
            </div>
          </ComponentCard>
        )}

        {isFormerRectors && (
          <ComponentCard
            title="Sabiq Rektorlar"
            desc="Sabiq rektorların kartları. Sayı məhdud deyil."
          >
            <div className="space-y-4">
              {form.persons.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hələ sabiq rektor əlavə edilməyib.
                </p>
              ) : (
                <div className="space-y-4">
                  {form.persons.map((person, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">#{index + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => movePerson(index, -1)} disabled={index === 0} title="Yuxarı" className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↑</button>
                          <button type="button" onClick={() => movePerson(index, 1)} disabled={index === form.persons.length - 1} title="Aşağı" className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↓</button>
                          <button type="button" onClick={() => removePerson(index)} className="ml-2 text-xs text-red-500 hover:text-red-600">Sil</button>
                        </div>
                      </div>

                      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <Label>Ad</Label>
                          <Input value={person.name[lang]} onChange={(event) => setPersonTr(index, "name", event.target.value)} placeholder="Əli" />
                        </div>
                        <div>
                          <Label>Soyad</Label>
                          <Input value={person.surname[lang]} onChange={(event) => setPersonTr(index, "surname", event.target.value)} placeholder="Məmmədov" />
                        </div>
                      </div>

                      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <Label>Vəzifə başlanğıc ili</Label>
                          <Input value={person.year_start} onChange={(event) => setPerson(index, "year_start", event.target.value)} placeholder="1950" />
                          <p className="mt-1 text-xs text-gray-400">Bütün dillərdə eyni.</p>
                        </div>
                        <div>
                          <Label>Vəzifə bitmə ili</Label>
                          <Input value={person.year_end} onChange={(event) => setPerson(index, "year_end", event.target.value)} placeholder="1959" />
                        </div>
                      </div>

                      <RichTextField
                        label="Təsvir"
                        value={person.bio[lang]}
                        onChange={(next) => setPersonTr(index, "bio", next)}
                        remountKey={`${formKey}-frbio-${index}-${lang}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button size="sm" variant="outline" onClick={addPerson}>
                + Sabiq rektor əlavə et
              </Button>
            </div>
          </ComponentCard>
        )}

        {isPartner && (
          <ComponentCard
            title="Vebsayt düyməsi"
            desc="Qurumun rəsmi saytına keçid düyməsi."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Düymənin mətni</Label>
                <Input
                  value={form.document_label[lang]}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, document_label: { ...prev.document_label, [lang]: event.target.value } }
                        : prev
                    )
                  }
                  placeholder="Vebsayta keç"
                />
              </div>
              <div>
                <Label>Keçid (URL)</Label>
                <Input
                  value={form.document_url}
                  onChange={(event) =>
                    setForm((prev) => (prev ? { ...prev, document_url: event.target.value } : prev))
                  }
                  placeholder="https://…"
                />
              </div>
            </div>
          </ComponentCard>
        )}

        {isPartner && (
          <ComponentCard title="Loqo (istəyə bağlı)" desc="Qurumun loqosu.">
            <div className="flex flex-wrap items-center gap-4">
              {form.image_url ? (
                <img
                  src={getImageUrl(form.image_url)}
                  alt="Loqo"
                  className="h-24 w-24 rounded-xl border border-gray-200 object-contain p-2 dark:border-gray-700"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs text-gray-400 dark:border-gray-700">
                  Loqo yoxdur
                </div>
              )}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handlePortraitUpload(event.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
                />
                <Input
                  value={form.image_url}
                  onChange={(event) => setPlain("image_url", event.target.value)}
                  placeholder="və ya keçid yapışdırın"
                />
                {form.image_url ? (
                  <button
                    type="button"
                    onClick={() => setPlain("image_url", "")}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Loqonu sil
                  </button>
                ) : null}
              </div>
            </div>
          </ComponentCard>
        )}

        {isPartner && form.persons[0] && (
          <ComponentCard title="Rektor / Direktor" desc="Bu qurumun rəhbəri.">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  {form.persons[0].image_url ? (
                    <img src={getImageUrl(form.persons[0].image_url)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                      Şəkil yoxdur
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Label>Şəkil</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => void handlePersonImageUpload(0, event.target.files?.[0] ?? null)}
                    className="block w-full text-xs text-gray-500 file:mr-2 file:rounded-md file:border-0 file:bg-brand-50 file:px-2 file:py-1 file:text-xs file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
                  />
                  <Input
                    value={form.persons[0].image_url}
                    onChange={(event) => setPerson(0, "image_url", event.target.value)}
                    placeholder="və ya keçid yapışdırın"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Ad</Label>
                  <Input value={form.persons[0].name[lang]} onChange={(event) => setPersonTr(0, "name", event.target.value)} placeholder="Ramin" />
                </div>
                <div>
                  <Label>Soyad</Label>
                  <Input value={form.persons[0].surname[lang]} onChange={(event) => setPersonTr(0, "surname", event.target.value)} placeholder="Məmmədov" />
                </div>
              </div>
              <div>
                <Label>Elmi ad</Label>
                <Input value={form.persons[0].degree[lang]} onChange={(event) => setPersonTr(0, "degree", event.target.value)} placeholder="Professor" />
              </div>
            </div>
          </ComponentCard>
        )}

        {isPartner && (
          <ComponentCard
            title="Tədqiqat sahələri (istəyə bağlı)"
            desc="Qurumun tədqiqat sahələri. Sayı məhdud deyil."
          >
            <div className="space-y-4">
              {form.pillars.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hələ tədqiqat sahəsi əlavə edilməyib.
                </p>
              ) : (
                <div className="space-y-4">
                  {form.pillars.map((pillar, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">#{index + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => movePillar(index, -1)} disabled={index === 0} title="Yuxarı" className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↑</button>
                          <button type="button" onClick={() => movePillar(index, 1)} disabled={index === form.pillars.length - 1} title="Aşağı" className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↓</button>
                          <button type="button" onClick={() => removePillar(index)} className="ml-2 text-xs text-red-500 hover:text-red-600">Sil</button>
                        </div>
                      </div>
                      <div className="mb-3">
                        <Label>Başlıq</Label>
                        <Input value={pillar.title[lang]} onChange={(event) => setPillar(index, "title", event.target.value)} placeholder="Süni intellekt" />
                      </div>
                      <RichTextField
                        label="Təsvir"
                        value={pillar.description[lang]}
                        onChange={(next) => setPillar(index, "description", next)}
                        remountKey={`${formKey}-parea-${index}-${lang}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button size="sm" variant="outline" onClick={addPillar}>
                + Tədqiqat sahəsi əlavə et
              </Button>
            </div>
          </ComponentCard>
        )}

        {hasDocCategories && (
          <ComponentCard
            title="Kateqoriyalar"
            desc="Sənəd kateqoriyaları. Sənəd yaradarkən bunlardan biri seçilir."
          >
            <div className="space-y-4">
              {form.doc_categories.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hələ kateqoriya əlavə edilməyib.
                </p>
              ) : (
                <div className="space-y-3">
                  {form.doc_categories.map((category, ci) => (
                    <div
                      key={category.category_key}
                      className="flex items-center gap-2 rounded-xl border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <Input
                          value={category.name[lang]}
                          onChange={(event) => setCategoryName(ci, event.target.value)}
                          placeholder="Etika"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => moveCategory(ci, -1)} disabled={ci === 0} title="Yuxarı" className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↑</button>
                        <button type="button" onClick={() => moveCategory(ci, 1)} disabled={ci === form.doc_categories.length - 1} title="Aşağı" className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↓</button>
                        <button type="button" onClick={() => removeCategory(ci)} className="ml-1 text-xs text-red-500 hover:text-red-600">Sil</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button size="sm" variant="outline" onClick={addCategory}>
                + Kateqoriya əlavə et
              </Button>
            </div>
          </ComponentCard>
        )}

        {isDocuments && (
          <ComponentCard
            title="Sənədlər"
            desc="Sənəd kartları. Sayı məhdud deyil. Faylı yükləyin və ya keçid yapışdırın (bütün formatlar)."
          >
            <div className="space-y-4">
              <div>
                <Input
                  value={docSearch}
                  onChange={(event) => setDocSearch(event.target.value)}
                  placeholder="Sənədləri ada görə axtar…"
                />
              </div>

              {form.documents.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hələ sənəd əlavə edilməyib.
                </p>
              ) : (
                <div className="space-y-4">
                  {form.documents.map((document, di) => {
                    const needle = docSearch.trim().toLowerCase();
                    if (
                      needle &&
                      !`${document.name.az} ${document.name.en}`.toLowerCase().includes(needle)
                    ) {
                      return null;
                    }
                    return (
                      <div
                        key={di}
                        className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-400">#{di + 1}</span>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveDocument(di, -1)} disabled={di === 0} title="Yuxarı" className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↑</button>
                            <button type="button" onClick={() => moveDocument(di, 1)} disabled={di === form.documents.length - 1} title="Aşağı" className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↓</button>
                            <button type="button" onClick={() => removeDocument(di)} className="ml-2 text-xs text-red-500 hover:text-red-600">Sil</button>
                          </div>
                        </div>

                        {hasDocCategories && (
                          <div className="mb-3">
                            <Label>Kateqoriya</Label>
                            <select
                              value={document.category_key}
                              onChange={(event) => setDocumentField(di, "category_key", event.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            >
                              <option value="">Kateqoriyasız</option>
                              {form.doc_categories.map((category) => (
                                <option key={category.category_key} value={category.category_key}>
                                  {category.name[lang] || category.name.az || category.name.en || "(adsız)"}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="mb-3">
                          <Label>Sənədin adı</Label>
                          <Input
                            value={document.name[lang]}
                            onChange={(event) => setDocumentName(di, event.target.value)}
                            placeholder="Etik Davranış Qaydaları"
                          />
                        </div>

                        <div>
                          <Label>Fayl və ya keçid</Label>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <input
                              type="file"
                              onChange={(event) => void handleDocumentFileUpload(di, event.target.files?.[0] ?? null)}
                              className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
                            />
                            <Input
                              value={document.file_url}
                              onChange={(event) => setDocumentField(di, "file_url", event.target.value)}
                              placeholder="və ya https://…"
                            />
                          </div>
                          {document.file_url ? (
                            <a
                              href={getImageUrl(document.file_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-block text-xs text-brand-600 hover:text-brand-700"
                            >
                              Faylı aç
                            </a>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Button size="sm" variant="outline" onClick={addDocument}>
                + Sənəd əlavə et
              </Button>
            </div>
          </ComponentCard>
        )}

        {isMba && (
          <ComponentCard
            title="Proqramın əsas göstəriciləri"
            desc="Bölmənin başlığı və 4 göstəricinin rəqəmləri. Etiketlər saytda sabitdir."
          >
            <div className="space-y-4">
              <div>
                <Label>Bölmənin başlığı</Label>
                <Input
                  value={form.pillars_title[lang]}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, pillars_title: { ...prev.pillars_title, [lang]: event.target.value } }
                        : prev
                    )
                  }
                  placeholder="Proqramın əsas göstəriciləri"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {MBA_HIGHLIGHT_LABELS.map((label, slot) => (
                  <div key={slot}>
                    <Label>{label}</Label>
                    <Input
                      value={highlightValues()[slot]}
                      onChange={(event) => setHighlight(slot, event.target.value)}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">Rəqəmlər bütün dillərdə eyni göstərilir.</p>
            </div>
          </ComponentCard>
        )}

        {isMba && (
          <ComponentCard
            title="Tədris dilləri və Proqram strukturu"
            desc="Hər iki siyahının başlığı və bəndləri."
          >
            <div className="space-y-6">
              {[
                { key: "languages", placeholder: "Azərbaycan\nİngilis\nAlman\nRus" },
                { key: "program_structure", placeholder: "Strateji idarəetmə və liderlik" },
              ].map(({ key, placeholder }) => (
                <div key={key}>
                  <div className="mb-2">
                    <Label>Başlıq</Label>
                    <Input
                      value={form.lists.find((l) => l.list_key === key)?.title[lang] ?? ""}
                      onChange={(event) => setListTitleByKey(key, event.target.value)}
                    />
                  </div>
                  <Label>Bəndlər</Label>
                  <textarea
                    value={listItemsText(key)}
                    onChange={(event) => setListItemsByKey(key, event.target.value)}
                    rows={5}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                  <p className="mt-1 text-xs text-gray-400">Hər sətirdə bir bənd.</p>
                </div>
              ))}
            </div>
          </ComponentCard>
        )}

        {isMba && (
          <ComponentCard
            title="Doktorantura yolları"
            desc="Başlıq, təsvir, format kartları və iki dərəcə kartı."
          >
            <div className="space-y-5">
              <div>
                <Label>Başlıq</Label>
                <Input
                  value={blockValue("doctoral", "title")}
                  onChange={(event) => setBlockByKey("doctoral", "title", event.target.value)}
                  placeholder="Doktorantura yolları"
                />
              </div>
              <RichTextField
                label="Təsvir"
                value={blockValue("doctoral", "body")}
                onChange={(next) => setBlockByKey("doctoral", "body", next)}
                remountKey={`${formKey}-mba-doctoral-${lang}`}
              />
              <div>
                <Label>Format kartları</Label>
                <textarea
                  value={listItemsText("doctoral_formats")}
                  onChange={(event) => setListItemsByKey("doctoral_formats", event.target.value)}
                  rows={3}
                  placeholder={"Əyani (istehsalatdan ayrılmaqla)\nQiyabi (istehsalatdan ayrılmadan)\nDissertant"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
                <p className="mt-1 text-xs text-gray-400">Hər sətirdə bir format.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[
                  { key: "phd", placeholder: "Əyani: 3 il\nQiyabi: 4 il\nDissertant: 4 il" },
                  {
                    key: "doctor_of_sciences",
                    placeholder: "Əyani: 4 il\nQiyabi: 5 il\nDissertant: 5 il",
                  },
                ].map(({ key, placeholder }) => (
                  <div key={key} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="mb-2">
                      <Label>Kartın başlığı</Label>
                      <Input
                        value={form.lists.find((l) => l.list_key === key)?.title[lang] ?? ""}
                        onChange={(event) => setListTitleByKey(key, event.target.value)}
                      />
                    </div>
                    <Label>Bəndlər</Label>
                    <textarea
                      value={listItemsText(key)}
                      onChange={(event) => setListItemsByKey(key, event.target.value)}
                      rows={4}
                      placeholder={placeholder}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    />
                    <p className="mt-1 text-xs text-gray-400">Hər sətirdə bir bənd.</p>
                  </div>
                ))}
              </div>
            </div>
          </ComponentCard>
        )}

        {isMba && (
          <ComponentCard title="Əlaqə" desc="Ünvan, telefon nömrələri və e-poçt ünvanları.">
            <div className="space-y-4">
              <div>
                <Label>Ünvan</Label>
                <textarea
                  value={blockValue("contact", "body")}
                  onChange={(event) => setBlockByKey("contact", "body", event.target.value)}
                  rows={2}
                  placeholder="Bakı ş., H.Cavid pr. 25"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>
              <div>
                <Label>Telefon nömrələri</Label>
                <textarea
                  value={listItemsText("phones")}
                  onChange={(event) => setNeutralListItems("phones", event.target.value)}
                  rows={3}
                  placeholder={"+994 12 538 00 00\n+994 12 539 00 00"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
                <p className="mt-1 text-xs text-gray-400">Hər sətirdə bir nömrə. Bütün dillərdə eyni.</p>
              </div>
              <div>
                <Label>E-poçt ünvanları</Label>
                <textarea
                  value={listItemsText("emails")}
                  onChange={(event) => setNeutralListItems("emails", event.target.value)}
                  rows={2}
                  placeholder={"mba@aztu.edu.az"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
                <p className="mt-1 text-xs text-gray-400">Hər sətirdə bir e-poçt. Bütün dillərdə eyni.</p>
              </div>
            </div>
          </ComponentCard>
        )}

        {isStrategicPlan && (
          <ComponentCard
            title="Sənəd"
            desc="Başlığın altındakı yükləmə düyməsi. Fayl yükləyin və ya hazır keçid yapışdırın — hər ikisi işləyir."
          >
            <div className="space-y-4">
              <div>
                <Label>Düymənin mətni</Label>
                <Input
                  value={form.document_label[lang]}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            document_label: {
                              ...prev.document_label,
                              [lang]: event.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  placeholder="Sənədi yüklə"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Fayl yüklə</Label>
                  <input
                    type="file"
                    onChange={(event) => void handleDocumentUpload(event.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Yükləndikdə aşağıdakı ünvan avtomatik yenilənir.
                  </p>
                </div>
                <div>
                  <Label>və ya keçid</Label>
                  <Input
                    value={form.document_url}
                    onChange={(event) =>
                      setForm((prev) =>
                        prev ? { ...prev, document_url: event.target.value } : prev
                      )
                    }
                    placeholder="https://…"
                  />
                </div>
              </div>
            </div>
          </ComponentCard>
        )}

        {isStrategicPlan && (
          <ComponentCard
            title="Strateji Sütunlar"
            desc="Nömrələnmiş kartlar. Sayı məhdud deyil; nömrə və ikon saytda sabitdir."
          >
            <div className="space-y-4">
              <div>
                <Label>Bölmənin başlığı</Label>
                <Input
                  value={form.pillars_title[lang]}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            pillars_title: { ...prev.pillars_title, [lang]: event.target.value },
                          }
                        : prev
                    )
                  }
                  placeholder="Strateji Sütunlar"
                />
              </div>

              {form.pillars.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hələ sütun əlavə edilməyib.
                </p>
              ) : (
                <div className="space-y-4">
                  {form.pillars.map((pillar, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => movePillar(index, -1)}
                            disabled={index === 0}
                            title="Yuxarı"
                            className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => movePillar(index, 1)}
                            disabled={index === form.pillars.length - 1}
                            title="Aşağı"
                            className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removePillar(index)}
                            className="ml-2 text-xs text-red-500 hover:text-red-600"
                          >
                            Sil
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <Label>Başlıq</Label>
                        <Input
                          value={pillar.title[lang]}
                          onChange={(event) => setPillar(index, "title", event.target.value)}
                          placeholder="Təhsildə Mükəmməllik"
                        />
                      </div>

                      <div className="mb-3">
                        <RichTextField
                          label="Qısa təsvir"
                          value={pillar.description[lang]}
                          onChange={(next) => setPillar(index, "description", next)}
                          remountKey={`${formKey}-pillar-${index}-${lang}`}
                        />
                      </div>

                      <div>
                        <Label>Etiketlər</Label>
                        <textarea
                          value={pillar.tags[lang]}
                          onChange={(event) => setPillar(index, "tags", event.target.value)}
                          rows={3}
                          placeholder={"Modernləşdirilmiş kurikulum\nBeynəlxalq akkreditasiya"}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        />
                        <p className="mt-1 text-xs text-gray-400">Hər sətirdə bir etiket.</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button size="sm" variant="outline" onClick={addPillar}>
                + Sütun əlavə et
              </Button>
            </div>
          </ComponentCard>
        )}

        {isStrategicPlan &&
          form.lists.map((entry, index) => (
            <ComponentCard
              key={entry.list_key}
              title={entry.title[lang] || entry.list_key}
              desc={
                entry.style === "number"
                  ? "Saytda nömrələnmiş siyahı kimi göstərilir."
                  : "Saytda markerli siyahı kimi göstərilir."
              }
            >
              <div className="space-y-4">
                <div>
                  <Label>Bölmənin başlığı</Label>
                  <Input
                    value={entry.title[lang]}
                    onChange={(event) => setList(index, "title", event.target.value)}
                  />
                </div>
                <div>
                  <Label>Bəndlər</Label>
                  <textarea
                    value={entry.items[lang]}
                    onChange={(event) => setList(index, "items", event.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                  <p className="mt-1 text-xs text-gray-400">Hər sətirdə bir bənd.</p>
                </div>
              </div>
            </ComponentCard>
          ))}

        {isTimeline ? (
          <ComponentCard
            title="Tarixçə"
            desc="İllər saytda yenidən köhnəyə doğru sıralanır — burada sıralamaq lazım deyil."
          >
            <div className="space-y-4">
              {form.milestones.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hələ il əlavə edilməyib.
                </p>
              ) : (
                <div className="space-y-4">
                  {form.milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <div className="w-40">
                          <Label>İl</Label>
                          <Input
                            value={milestone.year}
                            onChange={(event) =>
                              setMilestone(index, "year", event.target.value)
                            }
                            placeholder="1950"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="mt-5 text-xs text-red-500 hover:text-red-600"
                        >
                          Sil
                        </button>
                      </div>

                      <div className="mb-3">
                        <Label>Başlıq</Label>
                        <Input
                          value={milestone.title[lang]}
                          onChange={(event) =>
                            setMilestone(index, "title", event.target.value)
                          }
                        />
                      </div>

                      <RichTextField
                        label="Təsvir"
                        value={milestone.description[lang]}
                        onChange={(next) => setMilestone(index, "description", next)}
                        remountKey={`${formKey}-ms-${index}-${lang}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button size="sm" variant="outline" onClick={addMilestone}>
                + İl əlavə et
              </Button>
            </div>
          </ComponentCard>
        ) : null}

        {!isTimeline && !isStrategicPlan && !isRector && !isMba && form.blocks.map((block, index) => (
          <ComponentCard
            key={block.block_key}
            title={block.title[lang] || block.block_key}
            desc="Kartın ikonu saytda sabitdir."
          >
            <div className="space-y-4">
              <div>
                <Label>Başlıq</Label>
                <Input
                  value={block.title[lang]}
                  onChange={(event) => setBlock(index, "title", event.target.value)}
                />
              </div>
              <RichTextField
                label="Mətn"
                value={block.body[lang]}
                onChange={(next) => setBlock(index, "body", next)}
                remountKey={`${formKey}-${block.block_key}-${lang}`}
              />
            </div>
          </ComponentCard>
        ))}

        <ComponentCard
          title="Bölmədə daha çox"
          desc="Səhifənin altındakı düymələr. Sayı məhdud deyil."
        >
          <div className="space-y-4">
            <div>
              <Label>Bölmənin başlığı</Label>
              <Input
                value={form.links_title[lang]}
                onChange={(event) => setField("links_title", event.target.value)}
                placeholder="Bölmədə daha çox"
              />
            </div>

            {form.links.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Hələ düymə əlavə edilməyib.</p>
            ) : (
              <div className="space-y-3">
                {form.links.map((link, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">#{index + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveLink(index, -1)}
                          disabled={index === 0}
                          title="Yuxarı"
                          className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(index, 1)}
                          disabled={index === form.links.length - 1}
                          title="Aşağı"
                          className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="ml-2 text-xs text-red-500 hover:text-red-600"
                        >
                          Sil
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Düymənin mətni</Label>
                        <Input
                          value={link.label[lang]}
                          onChange={(event) => setLink(index, "label", event.target.value)}
                          placeholder="Strateji Plan"
                        />
                      </div>
                      <div>
                        <Label>Ünvan</Label>
                        <Input
                          value={link.url}
                          onChange={(event) => setLink(index, "url", event.target.value)}
                          placeholder="/haqqimizda/vizyon-ve-missiya/strateji-plan"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button size="sm" variant="outline" onClick={addLink}>
              + Düymə əlavə et
            </Button>
          </div>
        </ComponentCard>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Yadda saxla
          </Button>
        </div>
      </div>
    </>
  );
}

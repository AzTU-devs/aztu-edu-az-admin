import type { SectionType } from "../../services/about/aboutService";

/**
 * What each block type is made of.
 *
 * The About pages were hand-built screens, each with its own fields — a
 * timeline row has a year, a ranking row has a position, a policy row has a
 * separate AZ and EN PDF. Rather than one form with every column on it, each
 * `section_type` declares exactly the fields its rows carry, and the item form
 * renders that list. Adding a field to a block type is a one-line change here.
 *
 * `scope` decides where the value lands:
 *   "row" — language-neutral, stored on the item itself (a year, a URL, a logo)
 *   "tr"  — translated, stored once per language (a heading, a caption)
 */

export type FieldKind =
  | "text"
  | "textarea"
  | "rich"
  | "url"
  | "email"
  | "image"
  | "file"
  | "lines";

export interface ItemFieldSpec {
  /** Column name on `AboutItem` (scope "row") or on its translation (scope "tr"). */
  key: string;
  scope: "row" | "tr";
  label: string;
  kind: FieldKind;
  placeholder?: string;
  hint?: string;
}

/** Section-level fields, keyed the same way. Every type gets `title` for free. */
export interface SectionFieldSpec {
  key: string;
  scope: "row" | "tr";
  label: string;
  kind: FieldKind;
  placeholder?: string;
  hint?: string;
}

export interface SectionTypeMeta {
  label: string;
  description: string;
  /** People-shaped blocks manage `section.people`; everything else uses `items`. */
  usesPeople?: boolean;
  /** Blocks whose whole content lives on the section — no rows at all. */
  itemless?: boolean;
  itemLabel: string;
  sectionFields: SectionFieldSpec[];
  itemFields: ItemFieldSpec[];
}

const TITLE: SectionFieldSpec = { key: "title", scope: "tr", label: "Başlıq", kind: "text" };
const SUBTITLE: SectionFieldSpec = { key: "subtitle", scope: "tr", label: "Alt başlıq", kind: "textarea" };
const DESCRIPTION: SectionFieldSpec = {
  key: "description",
  scope: "tr",
  label: "Giriş mətni",
  kind: "textarea",
  hint: "Siyahının üstündə göstərilən izah.",
};
const NOTE: SectionFieldSpec = { key: "note", scope: "tr", label: "Qeyd", kind: "textarea" };
const FOOTER: SectionFieldSpec = { key: "footer", scope: "tr", label: "Altdakı mətn", kind: "textarea" };
const BODY: SectionFieldSpec = { key: "body_html", scope: "tr", label: "Mətn", kind: "rich" };
const CTA: SectionFieldSpec = { key: "cta_label", scope: "tr", label: "Düymə mətni", kind: "text" };

const ITEM_TITLE: ItemFieldSpec = { key: "title", scope: "tr", label: "Başlıq", kind: "text" };
const ITEM_DESCRIPTION: ItemFieldSpec = {
  key: "description",
  scope: "tr",
  label: "Təsvir",
  kind: "textarea",
};

export const SECTION_TYPES: Record<SectionType, SectionTypeMeta> = {
  paragraphs: {
    label: "Mətn bloku",
    description: "Sərbəst mətn — abzaslar, siyahılar, keçidlər.",
    itemless: true,
    itemLabel: "Element",
    sectionFields: [TITLE, SUBTITLE, BODY, NOTE, FOOTER],
    itemFields: [],
  },

  quote: {
    label: "Sitat / bəyanat",
    description: "Vizyon və missiya bəyanatları kimi vurğulanan tək mətn.",
    itemless: true,
    itemLabel: "Element",
    sectionFields: [TITLE, BODY],
    itemFields: [],
  },

  video: {
    label: "Video",
    description: "YouTube və ya birbaşa video keçidi.",
    itemless: true,
    itemLabel: "Element",
    sectionFields: [
      TITLE,
      SUBTITLE,
      BODY,
      {
        key: "video_url",
        scope: "tr",
        label: "YouTube keçidi",
        kind: "url",
        hint: "Hər dil üçün ayrıca — filmin AZ və EN versiyaları fərqli ola bilər.",
      },
      {
        key: "video_url",
        scope: "row",
        label: "Ümumi video keçidi (istəyə bağlı)",
        kind: "url",
        hint: "Yalnız hər iki dildə eyni video olduqda doldurun.",
      },
    ],
    itemFields: [],
  },

  list: {
    label: "Siyahı",
    description: "Sadalanan bəndlər — istiqamətlər, öhdəliklər, dəyərlər.",
    itemLabel: "Bənd",
    sectionFields: [
      TITLE,
      SUBTITLE,
      DESCRIPTION,
      { key: "list_intro", scope: "tr", label: "Giriş mətni", kind: "rich" },
      NOTE,
      FOOTER,
    ],
    itemFields: [
      ITEM_TITLE,
      ITEM_DESCRIPTION,
      { key: "item_key", scope: "row", label: "Açar (istəyə bağlı)", kind: "text", hint: "Yalnız daxili qruplaşdırma üçün." },
    ],
  },

  stats: {
    label: "Rəqəmlər",
    description: "Böyük rəqəm və onun altındakı ad — 75+, 25,000+.",
    itemLabel: "Göstərici",
    sectionFields: [TITLE, SUBTITLE],
    itemFields: [
      { key: "value", scope: "row", label: "Rəqəm", kind: "text", placeholder: "25,000+" },
      { key: "label", scope: "tr", label: "Ad", kind: "text", placeholder: "Məzun" },
      { key: "icon", scope: "row", label: "İkon (istəyə bağlı)", kind: "text" },
    ],
  },

  timeline: {
    label: "Xronologiya",
    description: "İl → hadisə. AzTU-nun tarixi səhifəsi.",
    itemLabel: "Mərhələ",
    sectionFields: [TITLE, SUBTITLE],
    itemFields: [
      { key: "year", scope: "row", label: "İl", kind: "text", placeholder: "1950" },
      ITEM_TITLE,
      ITEM_DESCRIPTION,
    ],
  },

  pillars: {
    label: "Strateji sütunlar",
    description: "Nömrələnmiş kart — başlıq, təsvir və hədəf etiketləri.",
    itemLabel: "Sütun",
    sectionFields: [TITLE, SUBTITLE, DESCRIPTION],
    itemFields: [
      { key: "num", scope: "row", label: "Nömrə", kind: "text", placeholder: "01" },
      ITEM_TITLE,
      ITEM_DESCRIPTION,
      {
        key: "extra",
        scope: "tr",
        label: "Hədəflər",
        kind: "lines",
        hint: "Hər sətirdə bir hədəf.",
      },
    ],
  },

  cards: {
    label: "Kartlar",
    description: "Şəkilli kart siyahısı.",
    itemLabel: "Kart",
    sectionFields: [TITLE, SUBTITLE, DESCRIPTION],
    itemFields: [
      { key: "image_url", scope: "row", label: "Şəkil", kind: "image" },
      ITEM_TITLE,
      ITEM_DESCRIPTION,
      { key: "link_url", scope: "row", label: "Keçid", kind: "url" },
    ],
  },

  facts: {
    label: "Qısa məlumat",
    description: "Ad → dəyər cütləri: Təsis ili, Məkan, Tələbə sayı.",
    itemLabel: "Sətir",
    sectionFields: [TITLE, SUBTITLE],
    itemFields: [
      { key: "label", scope: "tr", label: "Ad", kind: "text", placeholder: "Təsis ili" },
      { key: "value_text", scope: "tr", label: "Dəyər", kind: "text", placeholder: "2024" },
    ],
  },

  contact: {
    label: "Əlaqə",
    description: "Ünvan, telefon, e-poçt, iş saatları.",
    itemLabel: "Əlaqə sətri",
    sectionFields: [TITLE, SUBTITLE, NOTE],
    itemFields: [
      { key: "label", scope: "tr", label: "Ad", kind: "text", placeholder: "Ünvan" },
      { key: "value_text", scope: "tr", label: "Dəyər", kind: "text" },
      { key: "email", scope: "row", label: "E-poçt", kind: "email" },
      { key: "phone", scope: "row", label: "Telefon", kind: "text" },
      { key: "link_url", scope: "row", label: "Keçid", kind: "url" },
      { key: "icon", scope: "row", label: "İkon", kind: "text" },
    ],
  },

  links: {
    label: "Keçidlər",
    description: "“Bölmədə daha çox” blokları və xarici keçidlər.",
    itemLabel: "Keçid",
    sectionFields: [TITLE, SUBTITLE],
    itemFields: [
      ITEM_TITLE,
      { key: "link_url", scope: "row", label: "Ünvan", kind: "url", placeholder: "/haqqimizda/..." },
      { key: "link_label", scope: "tr", label: "Düymə mətni (istəyə bağlı)", kind: "text" },
    ],
  },

  documents: {
    label: "Sənədlər",
    description:
      "PDF kitabxanası. Sənədin dilə görə ayrı faylı varsa, AZ və EN fayllarını ayrıca yükləyin.",
    itemLabel: "Sənəd",
    sectionFields: [TITLE, SUBTITLE, DESCRIPTION, NOTE, CTA],
    itemFields: [
      ITEM_TITLE,
      {
        key: "item_key",
        scope: "row",
        label: "Kateqoriya",
        kind: "text",
        hint: "Kateqoriya bölməsindəki açarla eyni olmalıdır.",
      },
      {
        key: "pdf_url",
        scope: "row",
        label: "Fayl (hər iki dil üçün)",
        kind: "file",
        hint: "Sənəd dildən asılı deyilsə burada saxlayın.",
      },
      {
        key: "file_url",
        scope: "tr",
        label: "Dilə aid fayl",
        kind: "file",
        hint: "AZ və EN üçün ayrı sənəd varsa.",
      },
      { key: "link_url", scope: "row", label: "Xarici keçid", kind: "url" },
    ],
  },

  gallery: {
    label: "Qalereya",
    description: "Şəkil və altyazı.",
    itemLabel: "Şəkil",
    sectionFields: [TITLE, SUBTITLE],
    itemFields: [
      { key: "image_url", scope: "row", label: "Şəkil", kind: "image" },
      ITEM_TITLE,
      { key: "caption", scope: "tr", label: "Altyazı", kind: "textarea" },
    ],
  },

  table: {
    label: "Cədvəl",
    description: "Sütun adları bölmədə, hər sətir isə ayrıca element kimi saxlanılır.",
    itemLabel: "Sətir",
    sectionFields: [
      TITLE,
      SUBTITLE,
      {
        key: "headers",
        scope: "tr",
        label: "Sütun adları",
        kind: "lines",
        hint: "Hər sətirdə bir sütun adı: №, S.A.A., Vəzifəsi.",
      },
      NOTE,
    ],
    itemFields: [
      {
        key: "extra",
        scope: "tr",
        label: "Sətir xanaları",
        kind: "lines",
        hint: "Hər sətirdə bir xana — sütun adları ilə eyni sırada.",
      },
    ],
  },

  ranking_systems: {
    label: "Reytinq sistemləri",
    description: "QS, THE, GreenMetric — meyarlar, metodologiya, loqo.",
    itemLabel: "Sistem",
    sectionFields: [TITLE, SUBTITLE],
    itemFields: [
      ITEM_TITLE,
      { key: "description", scope: "tr", label: "Meyarlar", kind: "textarea" },
      { key: "link_url", scope: "row", label: "Metodologiya keçidi", kind: "url" },
      { key: "image_url", scope: "row", label: "Loqo", kind: "image" },
    ],
  },

  ranking_positions: {
    label: "Reytinq mövqeləri",
    description: "Reytinqin adı və universitetin mövqeyi.",
    itemLabel: "Mövqe",
    sectionFields: [TITLE, SUBTITLE],
    itemFields: [
      ITEM_TITLE,
      { key: "value", scope: "row", label: "Mövqe", kind: "text", placeholder: "851-900" },
      { key: "year", scope: "row", label: "İl", kind: "text" },
    ],
  },

  group_list: {
    label: "Qruplaşdırılmış siyahı",
    description: "Başlıq və onun altındakı sətirlər — məsələn təhsil müddəti.",
    itemLabel: "Qrup",
    sectionFields: [TITLE, SUBTITLE, DESCRIPTION, FOOTER],
    itemFields: [
      { key: "item_key", scope: "row", label: "Açar", kind: "text", placeholder: "phd" },
      ITEM_TITLE,
      {
        key: "extra",
        scope: "tr",
        label: "Sətirlər",
        kind: "lines",
        hint: "Hər sətirdə bir bənd: Əyani: 3 il.",
      },
    ],
  },

  people: {
    label: "Şəxslər",
    description: "Rektor, prorektorlar, direktor və əməkdaşlar.",
    usesPeople: true,
    itemLabel: "Şəxs",
    sectionFields: [TITLE, SUBTITLE, DESCRIPTION, CTA, NOTE],
    itemFields: [],
  },
};

export const SECTION_TYPE_OPTIONS = (Object.keys(SECTION_TYPES) as SectionType[]).map((value) => ({
  value,
  label: SECTION_TYPES[value].label,
}));

/** Falls back to a plain text block if the API ever reports an unknown type. */
export const metaFor = (type: string): SectionTypeMeta =>
  SECTION_TYPES[type as SectionType] ?? SECTION_TYPES.paragraphs;

/** `extra`/`headers` round-trip as string arrays; the form edits them as text. */
export const linesToText = (value: unknown): string =>
  Array.isArray(value) ? value.map((entry) => String(entry ?? "")).join("\n") : "";

export const textToLines = (value: string): string[] =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

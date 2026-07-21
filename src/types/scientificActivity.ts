export type ScientificSectionKey =
  | "research_areas" | "projects_grants" | "laboratories"
  | "publications" | "patents" | "industry_cooperation" | "international_cooperation";

export type PublicationIndex = "Scopus" | "Web of Science" | "Scopus / Web of Science";
export type PublicationQuartile = "Q1" | "Q2" | "Q3" | "Q4";

export interface ResearchAreaItem { id: number; title: string | null; html_content: string | null; description: string | null; }
export interface ProjectGrantItem { id: number; title: string | null; description: string | null; url: string | null; }
export interface LaboratoryRefItem {
  id: number; title: string | null; html_content: string | null; image_url: string | null;
  room_number: string | null; authorized_person: string | null; email: string | null; phone_number: string | null;
}
export interface PublicationYearBucket { year: number | null; count: number; }
export interface PublicationItem {
  id: number; no: number; year: number | null;
  title: string | null; authors: string | null; journal: string | null;
  country: string | null; index: PublicationIndex; quartile: PublicationQuartile | null;
  date: string | null; url: string | null;
}
export interface PatentItem {
  id: number; no: number; year: number | null;
  patent_number: string | null;
  title: string | null; authors: string | null; url: string | null;
}
export interface IndustryPartnerItem {
  id: number; title: string | null; description: string | null;
  logo_url: string | null; website_url: string | null;
}

export interface ScientificSection<T> {
  key: ScientificSectionKey; has_data: boolean; intro_html: string | null; items: T[];
}

export interface PublicationsSection extends ScientificSection<PublicationItem> {
  years: PublicationYearBucket[];
}

/** Same year-bucketed shape as publications. */
export interface PatentsSection extends ScientificSection<PatentItem> {
  years: PublicationYearBucket[];
}

export interface CafedraScientificActivity {
  cafedra_code: string;
  lang_code: "az" | "en";
  available: ScientificSectionKey[];
  sections: {
    research_areas: ScientificSection<ResearchAreaItem>;
    projects_grants: ScientificSection<ProjectGrantItem>;
    laboratories: ScientificSection<LaboratoryRefItem>;
    publications: PublicationsSection;
    patents: PatentsSection;
    industry_cooperation: ScientificSection<IndustryPartnerItem>;
    international_cooperation: ScientificSection<never>;
  };
}

export type IntroKey = "research_areas_intro" | "projects_grants_intro" | "publications_intro"
                     | "patents_intro" | "industry_cooperation_intro" | "international_cooperation_intro";

export interface RichTextRowValue { uid: string; id?: number; az: { title: string; html_content: string }; en: { title: string; html_content: string }; }
export interface ProjectRowValue   { uid: string; id?: number; url: string; az: { title: string; description: string }; en: { title: string; description: string }; }
export interface PartnerRowValue   { uid: string; id?: number; website_url: string; logo_url?: string | null; az: { title: string; description: string }; en: { title: string; description: string }; }
export interface PublicationRowValue {
  uid: string; id?: number;
  index: PublicationIndex; quartile: PublicationQuartile | ""; year: number | ""; date: string; url: string;
  az: { title: string; authors: string; journal: string; country: string };
  en: { title: string; authors: string; journal: string; country: string };
}
export interface PatentRowValue {
  uid: string; id?: number;
  patent_number: string; year: number | ""; url: string;
  az: { title: string; authors: string };
  en: { title: string; authors: string };
}
export interface ScientificIntrosValue { az: Record<IntroKey, string>; en: Record<IntroKey, string>; }

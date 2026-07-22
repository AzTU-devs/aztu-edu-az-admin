import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { AboutField, LanguageTabs } from "./AboutFields";
import type { AboutPerson } from "../../services/about/aboutService";

/**
 * Editor for a named individual on a leadership page.
 *
 * Carries every field the static pages showed: identity and contact on the
 * language-neutral half, and name, degree, position, office, hours, biography,
 * achievements and research interests per language — plus an education history
 * that is sent whole on save.
 */

export interface AboutEducationFormValue {
  period: string;
  az: { degree: string; institution: string };
  en: { degree: string; institution: string };
}

export interface AboutPersonFormValue {
  slug: string;
  /** Already-stored path, so the form can preview it without the source row. */
  image_url: string;
  email: string;
  phone: string;
  phone_internal: string;
  room_number: string;
  az: PersonTr;
  en: PersonTr;
  educations: AboutEducationFormValue[];
  imageFile: File | null;
}

interface PersonTr {
  full_name: string;
  degree: string;
  position: string;
  office: string;
  hours: string;
  bio_html: string;
  achievements: string;
  research_interests: string;
}

const emptyTr = (): PersonTr => ({
  full_name: "",
  degree: "",
  position: "",
  office: "",
  hours: "",
  bio_html: "",
  achievements: "",
  research_interests: "",
});

export const emptyPersonValue = (): AboutPersonFormValue => ({
  slug: "",
  image_url: "",
  email: "",
  phone: "",
  phone_internal: "",
  room_number: "",
  az: emptyTr(),
  en: emptyTr(),
  educations: [],
  imageFile: null,
});

const str = (value: string | null | undefined) => value ?? "";

export const personToFormValue = (person: AboutPerson): AboutPersonFormValue => ({
  slug: str(person.slug),
  image_url: str(person.image_url),
  email: str(person.email),
  phone: str(person.phone),
  phone_internal: str(person.phone_internal),
  room_number: str(person.room_number),
  az: {
    full_name: str(person.az?.full_name),
    degree: str(person.az?.degree),
    position: str(person.az?.position),
    office: str(person.az?.office),
    hours: str(person.az?.hours),
    bio_html: str(person.az?.bio_html),
    achievements: str(person.az?.achievements),
    research_interests: str(person.az?.research_interests),
  },
  en: {
    full_name: str(person.en?.full_name),
    degree: str(person.en?.degree),
    position: str(person.en?.position),
    office: str(person.en?.office),
    hours: str(person.en?.hours),
    bio_html: str(person.en?.bio_html),
    achievements: str(person.en?.achievements),
    research_interests: str(person.en?.research_interests),
  },
  educations: (person.educations ?? []).map((education) => ({
    period: str(education.period),
    az: { degree: str(education.az?.degree), institution: str(education.az?.institution) },
    en: { degree: str(education.en?.degree), institution: str(education.en?.institution) },
  })),
  imageFile: null,
});

interface AboutPersonFormProps {
  value: AboutPersonFormValue;
  onChange: (next: AboutPersonFormValue) => void;
  remountKey: number;
}

export default function AboutPersonForm({
  value,
  onChange,
  remountKey,
}: AboutPersonFormProps) {
  const setField = (key: keyof AboutPersonFormValue, next: string) =>
    onChange({ ...value, [key]: next });

  const setTr = (lang: "az" | "en", key: keyof PersonTr, next: string) =>
    onChange({ ...value, [lang]: { ...value[lang], [key]: next } });

  const setEducation = (index: number, next: AboutEducationFormValue) =>
    onChange({
      ...value,
      educations: value.educations.map((entry, i) => (i === index ? next : entry)),
    });

  const addEducation = () =>
    onChange({
      ...value,
      educations: [
        ...value.educations,
        { period: "", az: { degree: "", institution: "" }, en: { degree: "", institution: "" } },
      ],
    });

  const removeEducation = (index: number) =>
    onChange({ ...value, educations: value.educations.filter((_, i) => i !== index) });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AboutField
          kind="image"
          label="Şəkil"
          value=""
          onChange={() => {}}
          onFileSelect={(file) => onChange({ ...value, imageFile: file })}
          selectedFileName={value.imageFile?.name}
          currentPath={value.image_url || null}
        />
        <div>
          <Label>Slug (detal səhifəsi üçün)</Label>
          <Input
            value={value.slug}
            onChange={(event) => setField("slug", event.target.value)}
            placeholder="subhan-namazov"
          />
          <p className="mt-1 text-xs text-gray-400">
            Yalnız ayrıca detal səhifəsi olan şəxslər üçün — prorektorlar kimi.
          </p>
        </div>
        <div>
          <Label>E-poçt</Label>
          <Input
            type="email"
            value={value.email}
            onChange={(event) => setField("email", event.target.value)}
          />
        </div>
        <div>
          <Label>Telefon</Label>
          <Input value={value.phone} onChange={(event) => setField("phone", event.target.value)} />
        </div>
        <div>
          <Label>Daxili nömrə</Label>
          <Input
            value={value.phone_internal}
            onChange={(event) => setField("phone_internal", event.target.value)}
            placeholder="3201"
          />
        </div>
        <div>
          <Label>Otaq</Label>
          <Input
            value={value.room_number}
            onChange={(event) => setField("room_number", event.target.value)}
            placeholder="206"
          />
        </div>
      </div>

      <LanguageTabs>
        {(lang) => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Ad, soyad</Label>
                <Input
                  value={value[lang].full_name}
                  onChange={(event) => setTr(lang, "full_name", event.target.value)}
                />
              </div>
              <div>
                <Label>Elmi dərəcə</Label>
                <Input
                  value={value[lang].degree}
                  onChange={(event) => setTr(lang, "degree", event.target.value)}
                  placeholder="Texnika elmləri doktoru, professor"
                />
              </div>
              <div>
                <Label>Vəzifə</Label>
                <Input
                  value={value[lang].position}
                  onChange={(event) => setTr(lang, "position", event.target.value)}
                  placeholder="Tədris məsələləri üzrə prorektor"
                />
              </div>
              <div>
                <Label>Kabinet</Label>
                <Input
                  value={value[lang].office}
                  onChange={(event) => setTr(lang, "office", event.target.value)}
                  placeholder="I tədris binası, 206 nömrəli otaq"
                />
              </div>
              <div>
                <Label>Qəbul saatları</Label>
                <Input
                  value={value[lang].hours}
                  onChange={(event) => setTr(lang, "hours", event.target.value)}
                  placeholder="Cümə, 15:00-19:00"
                />
              </div>
            </div>

            <AboutField
              kind="rich"
              label="Bioqrafiya"
              value={value[lang].bio_html}
              onChange={(next) => setTr(lang, "bio_html", next)}
              remountKey={`${remountKey}-${lang}`}
            />
            <AboutField
              kind="textarea"
              label="Nailiyyətlər və təltiflər"
              value={value[lang].achievements}
              onChange={(next) => setTr(lang, "achievements", next)}
            />
            <AboutField
              kind="lines"
              label="Elmi-tədqiqat sahələri"
              hint="Hər sətirdə bir sahə."
              value={value[lang].research_interests}
              onChange={(next) => setTr(lang, "research_interests", next)}
            />
          </div>
        )}
      </LanguageTabs>

      <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Təhsil</p>
          <Button size="sm" variant="outline" onClick={addEducation}>
            + Təhsil əlavə et
          </Button>
        </div>

        {value.educations.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Hələ təhsil qeydi yoxdur.</p>
        ) : null}

        <div className="space-y-4">
          {value.educations.map((education, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-100 p-3 dark:border-gray-800"
            >
              <div className="mb-3 flex items-center justify-between">
                <Label className="mb-0">#{index + 1}</Label>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Sil
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <Label>İllər</Label>
                  <Input
                    value={education.period}
                    onChange={(event) =>
                      setEducation(index, { ...education, period: event.target.value })
                    }
                    placeholder="2012-2016"
                  />
                </div>
                <div>
                  <Label>Dərəcə (AZ)</Label>
                  <Input
                    value={education.az.degree}
                    onChange={(event) =>
                      setEducation(index, {
                        ...education,
                        az: { ...education.az, degree: event.target.value },
                      })
                    }
                    placeholder="Magistratura"
                  />
                </div>
                <div>
                  <Label>Dərəcə (EN)</Label>
                  <Input
                    value={education.en.degree}
                    onChange={(event) =>
                      setEducation(index, {
                        ...education,
                        en: { ...education.en, degree: event.target.value },
                      })
                    }
                    placeholder="Master's"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Label>Təhsil müəssisəsi (AZ)</Label>
                  <Input
                    value={education.az.institution}
                    onChange={(event) =>
                      setEducation(index, {
                        ...education,
                        az: { ...education.az, institution: event.target.value },
                      })
                    }
                  />
                </div>
                <div className="sm:col-span-3">
                  <Label>Təhsil müəssisəsi (EN)</Label>
                  <Input
                    value={education.en.institution}
                    onChange={(event) =>
                      setEducation(index, {
                        ...education,
                        en: { ...education.en, institution: event.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

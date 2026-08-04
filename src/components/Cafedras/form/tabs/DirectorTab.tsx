import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import TextArea from "../../../form/input/TextArea";
import ImageField from "../fields/ImageField";
import LangPair from "../fields/LangPair";
import { CafedraPayloadApi, blankEducation, blankWorkingHour } from "../useCafedraPayload";
import {
  addBtnClass,
  emptyText,
  fieldLabel,
  removeLinkClass,
  sectionCard,
  sectionDesc,
  sectionHeaderBetween,
  sectionTitle,
  subRowCard,
} from "../formStyles";

interface DirectorTabProps {
  api: CafedraPayloadApi;
  useDirector: boolean;
  setUseDirector: (value: boolean) => void;
  directorImage: File | null;
  setDirectorImage: (file: File | null) => void;
}

export default function DirectorTab({
  api,
  useDirector,
  setUseDirector,
  directorImage,
  setDirectorImage,
}: DirectorTabProps) {
  const {
    payload,
    changeDirectorField,
    changeDirectorLanguageField,
    updateDirectorResearchFields,
    addDirectorArrayItem,
    removeDirectorArrayItem,
    updateDirectorArrayItem,
    updateDirectorLanguageArrayItem,
  } = api;

  const director = payload.director;
  const workingHours = (director?.working_hours ?? []) as any[];
  const educations = (director?.educations ?? []) as any[];

  return (
    <div className="space-y-5">
      <div className={sectionCard}>
        <div className={sectionHeaderBetween}>
          <div>
            <p className={sectionTitle}>Kafedra müdiri</p>
            <p className={sectionDesc}>Müdir təyin edilməyibsə bu bölməni söndürün.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={useDirector}
              onChange={(e) => setUseDirector(e.target.checked)}
              className="form-checkbox h-4 w-4 rounded border-gray-300 text-brand-600 dark:border-gray-700"
            />
            Aktivdir
          </label>
        </div>

        {useDirector ? (
          <div className="space-y-5 p-5">
            <ImageField
              label="Şəkil"
              imageUrl={director?.profile_image}
              files={directorImage ? [directorImage] : []}
              onSelect={(files) => setDirectorImage(files[0] ?? null)}
              onRemovePending={() => setDirectorImage(null)}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className={fieldLabel}>Ad</Label>
                <Input placeholder="Ad" value={director?.first_name ?? ""} onChange={(e) => changeDirectorField("first_name", e.target.value)} />
              </div>
              <div>
                <Label className={fieldLabel}>Soyad</Label>
                <Input placeholder="Soyad" value={director?.last_name ?? ""} onChange={(e) => changeDirectorField("last_name", e.target.value)} />
              </div>
              <div>
                <Label className={fieldLabel}>Ata adı</Label>
                <Input placeholder="Ata adı" value={director?.father_name ?? ""} onChange={(e) => changeDirectorField("father_name", e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className={fieldLabel}>Email</Label>
                <Input placeholder="email@aztu.edu.az" value={director?.email ?? ""} onChange={(e) => changeDirectorField("email", e.target.value)} />
              </div>
              <div>
                <Label className={fieldLabel}>Telefon</Label>
                <Input placeholder="+994501234567" value={director?.phone ?? ""} onChange={(e) => changeDirectorField("phone", e.target.value)} />
              </div>
              <div>
                <Label className={fieldLabel}>Daxili nömrə</Label>
                <Input placeholder="1234" value={director?.phone_code ?? ""} onChange={(e) => changeDirectorField("phone_code", e.target.value)} />
              </div>
            </div>

            <LangPair
              az={
                <>
                  <div>
                    <Label className={fieldLabel}>Elmi dərəcə</Label>
                    <Input placeholder="Texnika elmləri doktoru" value={director?.az.scientific_degree ?? ""} onChange={(e) => changeDirectorLanguageField("az", "scientific_degree", e.target.value)} />
                  </div>
                  <div>
                    <Label className={fieldLabel}>Elmi titul</Label>
                    <Input placeholder="Professor" value={director?.az.scientific_title ?? ""} onChange={(e) => changeDirectorLanguageField("az", "scientific_title", e.target.value)} />
                  </div>
                  <div>
                    <Label className={fieldLabel}>Elmi tədqiqat sahələri (vergüllə ayırın)</Label>
                    <Input placeholder="Süni intellekt, Maşın öyrənməsi" value={(director?.az.scientific_research_fields ?? []).join(", ")} onChange={(e) => updateDirectorResearchFields("az", e.target.value)} />
                  </div>
                  <div>
                    <Label className={fieldLabel}>Otaq nömrəsi</Label>
                    <Input placeholder="B-101" value={director?.az.room ?? ""} onChange={(e) => changeDirectorLanguageField("az", "room", e.target.value)} />
                  </div>
                  <div>
                    <Label className={fieldLabel}>Bioqrafiya</Label>
                    <TextArea rows={5} placeholder="Müdir haqqında mətn" value={director?.az.bio ?? ""} onChange={(value) => changeDirectorLanguageField("az", "bio", value)} />
                  </div>
                </>
              }
              en={
                <>
                  <div>
                    <Label className={fieldLabel}>Scientific degree</Label>
                    <Input placeholder="Doctor of Technical Sciences" value={director?.en.scientific_degree ?? ""} onChange={(e) => changeDirectorLanguageField("en", "scientific_degree", e.target.value)} />
                  </div>
                  <div>
                    <Label className={fieldLabel}>Scientific title</Label>
                    <Input placeholder="Professor" value={director?.en.scientific_title ?? ""} onChange={(e) => changeDirectorLanguageField("en", "scientific_title", e.target.value)} />
                  </div>
                  <div>
                    <Label className={fieldLabel}>Scientific research fields (separate with comma)</Label>
                    <Input placeholder="Artificial Intelligence, Machine Learning" value={(director?.en.scientific_research_fields ?? []).join(", ")} onChange={(e) => updateDirectorResearchFields("en", e.target.value)} />
                  </div>
                  <div>
                    <Label className={fieldLabel}>Room number</Label>
                    <Input placeholder="B-101" value={director?.en.room ?? ""} onChange={(e) => changeDirectorLanguageField("en", "room", e.target.value)} />
                  </div>
                  <div>
                    <Label className={fieldLabel}>Biography</Label>
                    <TextArea rows={5} placeholder="Text about director" value={director?.en.bio ?? ""} onChange={(value) => changeDirectorLanguageField("en", "bio", value)} />
                  </div>
                </>
              }
            />
          </div>
        ) : (
          <div className="p-5 text-sm text-gray-500 dark:text-gray-400">Müdir məlumatları əlavə edilməyib.</div>
        )}
      </div>

      {useDirector && (
        <>
          <div className={sectionCard}>
            <div className={sectionHeaderBetween}>
              <div>
                <p className={sectionTitle}>İş saatları</p>
                <p className={sectionDesc}>Qəbul günləri və saat aralığı.</p>
              </div>
              <button type="button" className={addBtnClass} onClick={() => addDirectorArrayItem("working_hours", blankWorkingHour())}>
                + Yeni əlavə et
              </button>
            </div>
            <div className="space-y-3 p-5">
              {workingHours.length === 0 && <p className={emptyText}>İş saatı əlavə edilməyib.</p>}
              {workingHours.map((item) => (
                <div key={item.uid} className={subRowCard}>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <Label className={fieldLabel}>Gün (AZ)</Label>
                      <Input placeholder="Bazar ertəsi" value={item.az.day} onChange={(e) => updateDirectorLanguageArrayItem("working_hours", item.uid, "az", "day", e.target.value)} />
                    </div>
                    <div>
                      <Label className={fieldLabel}>Day (EN)</Label>
                      <Input placeholder="Monday" value={item.en.day} onChange={(e) => updateDirectorLanguageArrayItem("working_hours", item.uid, "en", "day", e.target.value)} />
                    </div>
                    <div>
                      <Label className={fieldLabel}>Saat aralığı</Label>
                      <Input placeholder="09:00-17:00" value={item.time_range} onChange={(e) => updateDirectorArrayItem("working_hours", item.uid, "time_range", e.target.value)} />
                    </div>
                  </div>
                  <button type="button" className={removeLinkClass} onClick={() => removeDirectorArrayItem("working_hours", item.uid)}>
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={sectionCard}>
            <div className={sectionHeaderBetween}>
              <div>
                <p className={sectionTitle}>Təhsillər</p>
                <p className={sectionDesc}>Diplom, universitet və illər.</p>
              </div>
              <button type="button" className={addBtnClass} onClick={() => addDirectorArrayItem("educations", blankEducation())}>
                + Yeni əlavə et
              </button>
            </div>
            <div className="space-y-3 p-5">
              {educations.length === 0 && <p className={emptyText}>Təhsil əlavə edilməyib.</p>}
              {educations.map((item) => (
                <div key={item.uid} className={subRowCard}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label className={fieldLabel}>Diplom (AZ)</Label>
                      <Input placeholder="Bakalavr" value={item.az.degree} onChange={(e) => updateDirectorLanguageArrayItem("educations", item.uid, "az", "degree", e.target.value)} />
                    </div>
                    <div>
                      <Label className={fieldLabel}>Degree (EN)</Label>
                      <Input placeholder="Bachelor" value={item.en.degree} onChange={(e) => updateDirectorLanguageArrayItem("educations", item.uid, "en", "degree", e.target.value)} />
                    </div>
                    <div>
                      <Label className={fieldLabel}>Universitet (AZ)</Label>
                      <Input placeholder="AZTU" value={item.az.university} onChange={(e) => updateDirectorLanguageArrayItem("educations", item.uid, "az", "university", e.target.value)} />
                    </div>
                    <div>
                      <Label className={fieldLabel}>University (EN)</Label>
                      <Input placeholder="AZTU" value={item.en.university} onChange={(e) => updateDirectorLanguageArrayItem("educations", item.uid, "en", "university", e.target.value)} />
                    </div>
                    <div>
                      <Label className={fieldLabel}>Başlama ili</Label>
                      <Input placeholder="2000" value={item.start_year} onChange={(e) => updateDirectorArrayItem("educations", item.uid, "start_year", e.target.value)} />
                    </div>
                    <div>
                      <Label className={fieldLabel}>Bitmə ili</Label>
                      <Input placeholder="2004" value={item.end_year} onChange={(e) => updateDirectorArrayItem("educations", item.uid, "end_year", e.target.value)} />
                    </div>
                  </div>
                  <button type="button" className={removeLinkClass} onClick={() => removeDirectorArrayItem("educations", item.uid)}>
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

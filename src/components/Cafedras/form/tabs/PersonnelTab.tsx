import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import CollapsibleRow from "../fields/CollapsibleRow";
import ImageField from "../fields/ImageField";
import LangPair from "../fields/LangPair";
import SubEntityManager from "../../../common/subentity/SubEntityManager";
import { PersonFormValue } from "../../../common/subentity/PersonForm";
import { getImageUrl } from "../../../../util/imageUrl";
import {
  createCafedraDeputyDirector,
  createCafedraScientificCouncilMember,
  createCafedraWorker,
  deleteCafedraDeputyDirector,
  deleteCafedraScientificCouncilMember,
  deleteCafedraWorker,
  updateCafedraDeputyDirector,
  updateCafedraScientificCouncilMember,
  updateCafedraWorker,
  uploadCafedraDeputyDirectorImage,
  uploadCafedraWorkerImage,
} from "../../../../services/cafedra/cafedraService";
import { CafedraPayloadApi, PersonnelListKey, blankPersonnelItem } from "../useCafedraPayload";
import {
  addBtnClass,
  emptyText,
  fieldLabel,
  sectionCard,
  sectionDesc,
  sectionHeaderBetween,
  sectionTitle,
} from "../formStyles";

const personToForm = (p: any): PersonFormValue => ({
  email: p.email ?? "",
  phone: p.phone ?? "",
  phone_code: p.phone_code ?? "",
  az: {
    first_name: p.az?.first_name ?? "",
    last_name: p.az?.last_name ?? "",
    duty: p.az?.duty ?? "",
    scientific_name: p.az?.scientific_name ?? "",
    scientific_degree: p.az?.scientific_degree ?? "",
    room: p.az?.room ?? "",
    working_hours: p.az?.working_hours ?? "",
  },
  en: {
    first_name: p.en?.first_name ?? "",
    last_name: p.en?.last_name ?? "",
    duty: p.en?.duty ?? "",
    scientific_name: p.en?.scientific_name ?? "",
    scientific_degree: p.en?.scientific_degree ?? "",
    room: p.en?.room ?? "",
    working_hours: p.en?.working_hours ?? "",
  },
  profile_image: p.profile_image ?? "",
});

interface PersonnelTabProps {
  api: CafedraPayloadApi;
  isEdit: boolean;
  cafedraCode?: string;
  cafedra?: any;
  onChanged: () => void;
  images: Record<PersonnelListKey, Record<string, File>>;
  setImage: (listKey: PersonnelListKey, uid: string, file: File | null) => void;
}

const SECTIONS: { key: PersonnelListKey; title: string; description: string }[] = [
  { key: "workers", title: "İşçilər", description: "Kafedra işçiləri məlumatları." },
  { key: "deputy_deans", title: "Müavinlər", description: "Kafedra müdir müavinləri." },
  { key: "scientific_council", title: "Elmi Şura", description: "Kafedra elmi şurasının üzvləri." },
];

export default function PersonnelTab({
  api,
  isEdit,
  cafedraCode,
  cafedra,
  onChanged,
  images,
  setImage,
}: PersonnelTabProps) {
  const { payload, addListItem, removeListItem, updateListItem, updateTranslatedListItem } = api;

  // Edit mode: rows are created/updated one at a time so ids and uploaded
  // photos survive; the bulk arrays are omitted from the save payload.
  if (isEdit && cafedraCode) {
    return (
      <div className="space-y-5">
        <SubEntityManager
          title="İşçilər"
          description="Kafedra işçilərini ayrıca əlavə edin, redaktə edin və silin."
          items={(cafedra?.workers ?? []) as any[]}
          getId={(w) => w.id}
          getName={(w) => `${w.az?.first_name ?? ""} ${w.az?.last_name ?? ""}`.trim()}
          getSubtitle={(w) => w.az?.duty ?? ""}
          getImage={(w) => w.profile_image}
          toFormValue={personToForm}
          onCreate={(v) => createCafedraWorker(cafedraCode, v)}
          onUpdate={(id, v) => updateCafedraWorker(id, v)}
          onDelete={(id) => deleteCafedraWorker(id)}
          onUploadImage={(id, file) => uploadCafedraWorkerImage(id, file)}
          onChanged={onChanged}
        />

        <SubEntityManager
          title="Müavinlər"
          description="Kafedra müdir müavinlərini ayrıca idarə edin."
          items={(cafedra?.deputy_directors ?? []) as any[]}
          getId={(d) => d.id}
          getName={(d) => `${d.az?.first_name ?? ""} ${d.az?.last_name ?? ""}`.trim()}
          getSubtitle={(d) => d.az?.duty ?? ""}
          getImage={(d) => d.profile_image}
          toFormValue={personToForm}
          onCreate={(v) => createCafedraDeputyDirector(cafedraCode, v)}
          onUpdate={(id, v) => updateCafedraDeputyDirector(id, v)}
          onDelete={(id) => deleteCafedraDeputyDirector(id)}
          onUploadImage={(id, file) => uploadCafedraDeputyDirectorImage(id, file)}
          onChanged={onChanged}
        />

        <SubEntityManager
          title="Elmi Şura Üzvləri"
          description="Elmi şura üzvlərini ayrıca idarə edin."
          items={(cafedra?.scientific_council ?? []) as any[]}
          getId={(m) => m.id}
          getName={(m) => `${m.az?.first_name ?? ""} ${m.az?.last_name ?? ""}`.trim()}
          getSubtitle={(m) => m.az?.duty ?? ""}
          showImage={false}
          toFormValue={personToForm}
          onCreate={(v) => createCafedraScientificCouncilMember(cafedraCode, v)}
          onUpdate={(id, v) => updateCafedraScientificCouncilMember(id, v)}
          onDelete={(id) => deleteCafedraScientificCouncilMember(id)}
          onChanged={onChanged}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {SECTIONS.map((section) => {
        const list = (payload[section.key] ?? []) as any[];
        return (
          <div key={section.key} className={sectionCard}>
            <div className={sectionHeaderBetween}>
              <div>
                <p className={sectionTitle}>{section.title}</p>
                <p className={sectionDesc}>{section.description}</p>
              </div>
              <button type="button" className={addBtnClass} onClick={() => addListItem(section.key, blankPersonnelItem())}>
                + Yeni əlavə et
              </button>
            </div>
            <div className="space-y-3 p-5">
              {list.length === 0 && <p className={emptyText}>Heç bir maddə yoxdur.</p>}
              {list.map((item, idx) => {
                const pending = images[section.key][item.uid];
                return (
                  <CollapsibleRow
                    key={item.uid}
                    index={idx}
                    title={`${item.az.first_name} ${item.az.last_name}`.trim()}
                    fallbackTitle="Adsız əməkdaş"
                    subtitle={item.az.duty}
                    thumbUrl={pending ? undefined : getImageUrl(item.profile_image)}
                    onRemove={() => removeListItem(section.key, item.uid)}
                  >
                    <ImageField
                      label="Şəkil"
                      imageUrl={item.profile_image}
                      files={pending ? [pending] : []}
                      onSelect={(files) => setImage(section.key, item.uid, files[0] ?? null)}
                      onRemovePending={() => setImage(section.key, item.uid, null)}
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className={fieldLabel}>Email</Label>
                        <Input value={item.email} placeholder="email@example.com" onChange={(e) => updateListItem(section.key, item.uid, "email", e.target.value)} />
                      </div>
                      <div>
                        <Label className={fieldLabel}>Telefon</Label>
                        <Input value={item.phone} placeholder="+994501234567" onChange={(e) => updateListItem(section.key, item.uid, "phone", e.target.value)} />
                      </div>
                      <div>
                        <Label className={fieldLabel}>Daxili nömrə</Label>
                        <Input value={item.phone_code} placeholder="1234" onChange={(e) => updateListItem(section.key, item.uid, "phone_code", e.target.value)} />
                      </div>
                    </div>

                    <LangPair
                      az={
                        <>
                          <div>
                            <Label className={fieldLabel}>Ad</Label>
                            <Input value={item.az.first_name} placeholder="Ad" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "az", "first_name", e.target.value)} />
                          </div>
                          <div>
                            <Label className={fieldLabel}>Soyad</Label>
                            <Input value={item.az.last_name} placeholder="Soyad" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "az", "last_name", e.target.value)} />
                          </div>
                          <div>
                            <Label className={fieldLabel}>Vəzifə</Label>
                            <Input value={item.az.duty} placeholder="Müəllim" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "az", "duty", e.target.value)} />
                          </div>
                          <div>
                            <Label className={fieldLabel}>Elmi ad</Label>
                            <Input value={item.az.scientific_name} placeholder="Dosent" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "az", "scientific_name", e.target.value)} />
                          </div>
                          <div>
                            <Label className={fieldLabel}>Elmi dərəcə</Label>
                            <Input value={item.az.scientific_degree} placeholder="Fəlsəfə doktoru" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "az", "scientific_degree", e.target.value)} />
                          </div>
                          <div>
                            <Label className={fieldLabel}>Otaq nömrəsi</Label>
                            <Input value={item.az.room} placeholder="B-101" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "az", "room", e.target.value)} />
                          </div>
                          <div>
                            <Label className={fieldLabel}>İş saatları</Label>
                            <Input value={item.az.working_hours} placeholder="B.e - Cümə, 09:00 - 17:00" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "az", "working_hours", e.target.value)} />
                          </div>
                        </>
                      }
                      en={
                        <>
                          <div>
                            <Label className={fieldLabel}>Name</Label>
                            <Input value={item.en.first_name} placeholder="Name" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "en", "first_name", e.target.value)} />
                          </div>
                          <div>
                            <Label className={fieldLabel}>Surname</Label>
                            <Input value={item.en.last_name} placeholder="Surname" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "en", "last_name", e.target.value)} />
                          </div>
                          <div>
                            <Label className={fieldLabel}>Duty</Label>
                            <Input value={item.en.duty} placeholder="Lecturer" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "en", "duty", e.target.value)} />
                          </div>
                          <div>
                            <Label className={fieldLabel}>Scientific name</Label>
                            <Input value={item.en.scientific_name} placeholder="Associate Professor" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "en", "scientific_name", e.target.value)} />
                          </div>
                          <div>
                            <Label className={fieldLabel}>Scientific degree</Label>
                            <Input value={item.en.scientific_degree} placeholder="PhD" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "en", "scientific_degree", e.target.value)} />
                          </div>
                          <div>
                            <Label className={fieldLabel}>Room number</Label>
                            <Input value={item.en.room} placeholder="B-101" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "en", "room", e.target.value)} />
                          </div>
                          <div>
                            <Label className={fieldLabel}>Working hours</Label>
                            <Input value={item.en.working_hours} placeholder="Mon - Fri, 09:00 - 17:00" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "en", "working_hours", e.target.value)} />
                          </div>
                        </>
                      }
                    />
                  </CollapsibleRow>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

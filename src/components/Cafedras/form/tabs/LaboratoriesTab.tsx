import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import CollapsibleRow from "../fields/CollapsibleRow";
import ImageField from "../fields/ImageField";
import LangPair from "../fields/LangPair";
import RichTextField from "../fields/RichTextField";
import LaboratoryManager from "../../LaboratoryManager";
import { CafedraPayloadApi, blankLaboratory } from "../useCafedraPayload";
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

interface LaboratoriesTabProps {
  api: CafedraPayloadApi;
  isEdit: boolean;
  cafedraCode?: string;
  cafedra?: any;
  onChanged: () => void;
  formKey: number;
  images: Record<string, File>;
  setImage: (uid: string, file: File | null) => void;
  galleryFiles: Record<string, File[]>;
  setGalleryFiles: (uid: string, files: File[]) => void;
}

export default function LaboratoriesTab({
  api,
  isEdit,
  cafedraCode,
  cafedra,
  onChanged,
  formKey,
  images,
  setImage,
  galleryFiles,
  setGalleryFiles,
}: LaboratoriesTabProps) {
  const {
    payload,
    addListItem,
    removeListItem,
    updateLabField,
    updateLabTranslatedField,
    addLabObjective,
    removeLabObjective,
    updateLabObjective,
  } = api;

  if (isEdit && cafedraCode) {
    return (
      <LaboratoryManager
        cafedraCode={cafedraCode}
        laboratories={(cafedra?.laboratories ?? []) as any[]}
        onChanged={onChanged}
      />
    );
  }

  const list = (payload.laboratories ?? []) as any[];

  return (
    <div className={sectionCard}>
      <div className={sectionHeaderBetween}>
        <div>
          <p className={sectionTitle}>Laboratoriyalar</p>
          <p className={sectionDesc}>Başlıq, şəkil, əlaqə məlumatları, məqsədlər və qalereya.</p>
        </div>
        <button type="button" className={addBtnClass} onClick={() => addListItem("laboratories", blankLaboratory())}>
          + Yeni əlavə et
        </button>
      </div>
      <div className="space-y-3 p-5">
        {list.length === 0 && <p className={emptyText}>Heç bir laboratoriya yoxdur.</p>}
        {list.map((item, idx) => {
          const objectives = (item.objectives ?? []) as any[];
          const pendingGallery = galleryFiles[item.uid] ?? [];
          return (
            <CollapsibleRow
              key={item.uid}
              index={idx}
              title={item.az.title}
              fallbackTitle="Adsız laboratoriya"
              subtitle={item.room_number}
              badge={objectives.length > 0 ? `${objectives.length} məqsəd` : undefined}
              onRemove={() => removeListItem("laboratories", item.uid)}
            >
              <ImageField
                label="Əsas şəkil"
                imageUrl={item.image_url}
                files={images[item.uid] ? [images[item.uid]] : []}
                onSelect={(files) => setImage(item.uid, files[0] ?? null)}
                onRemovePending={() => setImage(item.uid, null)}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className={fieldLabel}>Otaq nömrəsi</Label>
                  <Input value={item.room_number ?? ""} placeholder="1-307" onChange={(e) => updateLabField(item.uid, "room_number", e.target.value)} />
                </div>
                <div>
                  <Label className={fieldLabel}>Email</Label>
                  <Input value={item.email ?? ""} placeholder="lab@aztu.edu.az" onChange={(e) => updateLabField(item.uid, "email", e.target.value)} />
                </div>
                <div>
                  <Label className={fieldLabel}>Telefon</Label>
                  <Input value={item.phone_number ?? ""} placeholder="+994 12 539 10 91" onChange={(e) => updateLabField(item.uid, "phone_number", e.target.value)} />
                </div>
              </div>

              <LangPair
                az={
                  <>
                    <div>
                      <Label className={fieldLabel}>Başlıq</Label>
                      <Input value={item.az.title} placeholder="Başlıq" onChange={(e) => updateLabTranslatedField(item.uid, "az", "title", e.target.value)} />
                    </div>
                    <RichTextField
                      label="Ətraflı məlumat"
                      value={item.az.html_content ?? ""}
                      remountKey={`${item.uid}-az-${formKey}`}
                      onChange={(html) => updateLabTranslatedField(item.uid, "az", "html_content", html)}
                    />
                  </>
                }
                en={
                  <>
                    <div>
                      <Label className={fieldLabel}>Title</Label>
                      <Input value={item.en.title} placeholder="Title" onChange={(e) => updateLabTranslatedField(item.uid, "en", "title", e.target.value)} />
                    </div>
                    <RichTextField
                      label="Content"
                      value={item.en.html_content ?? ""}
                      remountKey={`${item.uid}-en-${formKey}`}
                      onChange={(html) => updateLabTranslatedField(item.uid, "en", "html_content", html)}
                    />
                  </>
                }
              />

              <div className={subRowCard}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Məqsədlər</p>
                  <button type="button" className={addBtnClass} onClick={() => addLabObjective(item.uid)}>
                    + Məqsəd əlavə et
                  </button>
                </div>
                {objectives.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400">Məqsəd əlavə edilməyib.</p>}
                {objectives.map((obj) => (
                  <div key={obj.uid} className="grid items-end gap-3 border-b border-dashed border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-800 md:grid-cols-2">
                    <div>
                      <Label className={fieldLabel}>Məqsəd (AZ)</Label>
                      <Input value={obj.az.title} placeholder="Məqsəd başlığı" onChange={(e) => updateLabObjective(item.uid, obj.uid, "az", e.target.value)} />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label className={fieldLabel}>Objective (EN)</Label>
                        <Input value={obj.en.title} placeholder="Objective title" onChange={(e) => updateLabObjective(item.uid, obj.uid, "en", e.target.value)} />
                      </div>
                      <button type="button" className={`${removeLinkClass} mb-2`} onClick={() => removeLabObjective(item.uid, obj.uid)}>
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <ImageField
                label="Qalereya şəkilləri"
                multiple
                files={pendingGallery}
                hint="Laboratoriya yaradıldıqdan sonra yüklənəcək"
                onSelect={(files) => setGalleryFiles(item.uid, [...pendingGallery, ...files])}
                onRemovePending={(index) => setGalleryFiles(item.uid, pendingGallery.filter((_, i) => i !== index))}
              />
            </CollapsibleRow>
          );
        })}
      </div>
    </div>
  );
}

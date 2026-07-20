import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import TextArea from "../../../form/input/TextArea";
import CollapsibleRow from "../fields/CollapsibleRow";
import LangPair from "../fields/LangPair";
import { CafedraPayloadApi, TranslatedListKey, blankTranslatedItem } from "../useCafedraPayload";
import {
  addBtnClass,
  emptyText,
  fieldLabel,
  sectionCard,
  sectionDesc,
  sectionHeaderBetween,
  sectionTitle,
} from "../formStyles";

const SECTIONS: { key: TranslatedListKey; title: string; description: string }[] = [
  { key: "directions_of_action", title: "Fəaliyyət istiqamətləri", description: "Kafedranın fəaliyyət istiqamətləri." },
  { key: "objectives", title: "Məqsədlər", description: "Kafedranın qarşısına qoyduğu məqsədlər." },
  { key: "duties", title: "Vəzifələr", description: "Kafedranın vəzifələri." },
];

interface ContentTabProps {
  api: CafedraPayloadApi;
}

export default function ContentTab({ api }: ContentTabProps) {
  const { payload, addListItem, removeListItem, updateTranslatedListItem } = api;

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
              <button type="button" className={addBtnClass} onClick={() => addListItem(section.key, blankTranslatedItem())}>
                + Yeni əlavə et
              </button>
            </div>
            <div className="space-y-3 p-5">
              {list.length === 0 && <p className={emptyText}>Heç bir maddə yoxdur.</p>}
              {list.map((item, idx) => (
                <CollapsibleRow
                  key={item.uid}
                  index={idx}
                  title={item.az.title}
                  onRemove={() => removeListItem(section.key, item.uid)}
                >
                  <LangPair
                    az={
                      <>
                        <div>
                          <Label className={fieldLabel}>Başlıq</Label>
                          <Input value={item.az.title} placeholder="Başlıq" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "az", "title", e.target.value)} />
                        </div>
                        <div>
                          <Label className={fieldLabel}>İzahat</Label>
                          <TextArea rows={4} value={item.az.description} placeholder="Açıqlama" onChange={(value) => updateTranslatedListItem(section.key, item.uid, "az", "description", value)} />
                        </div>
                      </>
                    }
                    en={
                      <>
                        <div>
                          <Label className={fieldLabel}>Title</Label>
                          <Input value={item.en.title} placeholder="Title" onChange={(e) => updateTranslatedListItem(section.key, item.uid, "en", "title", e.target.value)} />
                        </div>
                        <div>
                          <Label className={fieldLabel}>Description</Label>
                          <TextArea rows={4} value={item.en.description} placeholder="Description" onChange={(value) => updateTranslatedListItem(section.key, item.uid, "en", "description", value)} />
                        </div>
                      </>
                    }
                  />
                </CollapsibleRow>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

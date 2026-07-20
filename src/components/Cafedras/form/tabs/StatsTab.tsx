import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import MultiSelect from "../../../form/MultiSelect";
import { CreateCafedraPayload } from "../../../../services/cafedra/cafedraService";
import { CafedraPayloadApi } from "../useCafedraPayload";
import { fieldLabel, sectionCard, sectionDesc, sectionHeader, sectionTitle } from "../formStyles";

const STAT_FIELDS: { key: keyof CreateCafedraPayload; label: string }[] = [
  { key: "deputy_dean_count", label: "Müavin sayı" },
  { key: "bachelor_programs_count", label: "Bakalavr proqramları" },
  { key: "master_programs_count", label: "Magistr proqramları" },
  { key: "phd_programs_count", label: "PhD proqramları" },
  { key: "international_collaborations_count", label: "Beynəlxalq əməkdaşlıqlar" },
  { key: "laboratories_count", label: "Laboratoriyalar" },
  { key: "projects_patents_count", label: "Layihələr/Patentlər" },
  { key: "industrial_collaborations_count", label: "Sənaye əməkdaşlıqları" },
];

const SDG_OPTIONS = Array.from({ length: 17 }, (_, i) => ({ value: String(i + 1), text: `SDG ${i + 1}` }));

interface StatsTabProps {
  api: CafedraPayloadApi;
}

export default function StatsTab({ api }: StatsTabProps) {
  const { payload, changeStatField, setSDGs } = api;

  return (
    <div className="space-y-5">
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <div>
            <p className={sectionTitle}>Statistikalar</p>
            <p className={sectionDesc}>Kafedranın əsas göstəriciləri.</p>
          </div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_FIELDS.map((field) => (
            <div key={field.key}>
              <Label className={fieldLabel}>{field.label}</Label>
              <Input
                type="number"
                min="0"
                value={(payload[field.key] as number) ?? 0}
                onChange={(e) => changeStatField(field.key, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={sectionCard}>
        <div className={sectionHeader}>
          <div>
            <p className={sectionTitle}>SDG (Dayanıqlı İnkişaf Məqsədləri)</p>
            <p className={sectionDesc}>Kafedranın töhfə verdiyi məqsədləri seçin (1-17).</p>
          </div>
        </div>
        <div className="p-5">
          <MultiSelect
            label="Seçilmiş məqsədlər"
            options={SDG_OPTIONS}
            value={(payload.sdgs ?? []).map(String)}
            onChange={(selected) => setSDGs(selected.map(Number).filter((n) => !Number.isNaN(n)))}
            placeholder="SDG seçin"
          />
        </div>
      </div>
    </div>
  );
}

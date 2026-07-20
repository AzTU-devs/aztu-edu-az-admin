import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import LangPair from "../fields/LangPair";
import RichTextField from "../fields/RichTextField";
import { Faculty } from "../../../../services/faculty/facultyService";
import { CafedraPayloadApi } from "../useCafedraPayload";
import { fieldLabel, sectionCard, sectionDesc, sectionHeader, sectionTitle, selectClass, selectErrorClass } from "../formStyles";

interface BasicTabProps {
  api: CafedraPayloadApi;
  faculties: Faculty[];
  formKey: number;
  errors: Record<string, string>;
}

export default function BasicTab({ api, faculties, formKey, errors }: BasicTabProps) {
  const { payload, changeField, setFacultyCode } = api;

  return (
    <div className="space-y-5">
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <div>
            <p className={sectionTitle}>Fakültə</p>
            <p className={sectionDesc}>Kafedranın aid olduğu fakültəni seçin.</p>
          </div>
        </div>
        <div className="p-5">
          <Label className={fieldLabel}>Fakültə</Label>
          {/* Hand-rolled: the `Select` primitive keeps its own state and cannot be
              driven from the payload. */}
          <select
            className={errors.faculty_code ? selectErrorClass : selectClass}
            value={payload.faculty_code}
            onChange={(e) => setFacultyCode(e.target.value)}
          >
            <option value="">-- Fakültə seçin --</option>
            {faculties.map((f) => (
              <option key={f.faculty_code} value={f.faculty_code}>
                {f.title} ({f.faculty_code})
              </option>
            ))}
          </select>
          {errors.faculty_code ? <p className="mt-1.5 text-xs text-red-500">{errors.faculty_code}</p> : null}
        </div>
      </div>

      <div className={sectionCard}>
        <div className={sectionHeader}>
          <div>
            <p className={sectionTitle}>Kafedra adı və məzmunu</p>
            <p className={sectionDesc}>Hər iki dildə doldurulmalıdır.</p>
          </div>
        </div>
        <div className="p-5">
          <LangPair
            az={
              <>
                <div>
                  <Label className={fieldLabel}>Kafedra adı</Label>
                  <Input
                    placeholder="Kafedra adını daxil edin"
                    value={payload.az.title}
                    error={Boolean(errors.az_title)}
                    onChange={(e) => changeField("az", "title", e.target.value)}
                  />
                  {errors.az_title ? <p className="mt-1.5 text-xs text-red-500">{errors.az_title}</p> : null}
                </div>
                <RichTextField
                  label="Ətraflı məlumat"
                  value={payload.az.html_content ?? ""}
                  remountKey={`az-${formKey}`}
                  onChange={(html) => changeField("az", "html_content", html)}
                />
              </>
            }
            en={
              <>
                <div>
                  <Label className={fieldLabel}>Cafedra name</Label>
                  <Input
                    placeholder="Enter cafedra name"
                    value={payload.en.title}
                    error={Boolean(errors.en_title)}
                    onChange={(e) => changeField("en", "title", e.target.value)}
                  />
                  {errors.en_title ? <p className="mt-1.5 text-xs text-red-500">{errors.en_title}</p> : null}
                </div>
                <RichTextField
                  label="Content"
                  value={payload.en.html_content ?? ""}
                  remountKey={`en-${formKey}`}
                  onChange={(html) => changeField("en", "html_content", html)}
                />
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}

import Input from "../../form/input/InputField";
import Label from "../../form/Label";

export interface PersonFormValue {
  first_name: string;
  last_name: string;
  father_name: string;
  email: string;
  phone: string;
  az: { duty: string; scientific_name: string; scientific_degree: string };
  en: { duty: string; scientific_name: string; scientific_degree: string };
  profile_image?: string;
}

export const emptyPersonValue = (): PersonFormValue => ({
  first_name: "",
  last_name: "",
  father_name: "",
  email: "",
  phone: "",
  az: { duty: "", scientific_name: "", scientific_degree: "" },
  en: { duty: "", scientific_name: "", scientific_degree: "" },
  profile_image: "",
});

interface PersonFormProps {
  value: PersonFormValue;
  onChange: (next: PersonFormValue) => void;
  onImageSelect?: (file: File | null) => void;
  /** Currently selected (not yet uploaded) image file name, for feedback. */
  selectedImageName?: string;
  showImage?: boolean;
}

export default function PersonForm({
  value,
  onChange,
  onImageSelect,
  selectedImageName,
  showImage = true,
}: PersonFormProps) {
  const setField = (field: keyof PersonFormValue, v: string) => {
    onChange({ ...value, [field]: v });
  };
  const setTr = (
    lang: "az" | "en",
    field: "duty" | "scientific_name" | "scientific_degree",
    v: string
  ) => {
    onChange({ ...value, [lang]: { ...value[lang], [field]: v } });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label>Ad</Label>
          <Input value={value.first_name} onChange={(e) => setField("first_name", e.target.value)} placeholder="Ad" />
        </div>
        <div>
          <Label>Soyad</Label>
          <Input value={value.last_name} onChange={(e) => setField("last_name", e.target.value)} placeholder="Soyad" />
        </div>
        <div>
          <Label>Ata adı</Label>
          <Input value={value.father_name} onChange={(e) => setField("father_name", e.target.value)} placeholder="Ata adı" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Email</Label>
          <Input type="email" value={value.email} onChange={(e) => setField("email", e.target.value)} placeholder="email@aztu.edu.az" />
        </div>
        <div>
          <Label>Telefon</Label>
          <Input value={value.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+994 ..." />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">AZ</p>
          <div className="space-y-3">
            <div>
              <Label>Vəzifə</Label>
              <Input value={value.az.duty} onChange={(e) => setTr("az", "duty", e.target.value)} placeholder="Vəzifə" />
            </div>
            <div>
              <Label>Elmi ad</Label>
              <Input value={value.az.scientific_name} onChange={(e) => setTr("az", "scientific_name", e.target.value)} placeholder="Elmi ad" />
            </div>
            <div>
              <Label>Elmi dərəcə</Label>
              <Input value={value.az.scientific_degree} onChange={(e) => setTr("az", "scientific_degree", e.target.value)} placeholder="Elmi dərəcə" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">EN</p>
          <div className="space-y-3">
            <div>
              <Label>Duty</Label>
              <Input value={value.en.duty} onChange={(e) => setTr("en", "duty", e.target.value)} placeholder="Duty" />
            </div>
            <div>
              <Label>Scientific name</Label>
              <Input value={value.en.scientific_name} onChange={(e) => setTr("en", "scientific_name", e.target.value)} placeholder="Scientific name" />
            </div>
            <div>
              <Label>Scientific degree</Label>
              <Input value={value.en.scientific_degree} onChange={(e) => setTr("en", "scientific_degree", e.target.value)} placeholder="Scientific degree" />
            </div>
          </div>
        </div>
      </div>

      {showImage && (
        <div>
          <Label>Şəkil</Label>
          <div className="flex flex-wrap items-center gap-4">
            {value.profile_image ? (
              <img src={value.profile_image} alt="" className="h-14 w-14 rounded-full border border-gray-200 object-cover" />
            ) : null}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => onImageSelect?.(e.target.files?.[0] ?? null)}
              className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-white hover:file:bg-brand-600 dark:text-gray-300"
            />
            {selectedImageName ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">Seçildi: {selectedImageName}</span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-gray-400">Şəkil yadda saxlandıqdan sonra yüklənəcək.</p>
        </div>
      )}
    </div>
  );
}

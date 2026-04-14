import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Editor from "../editor/Editor";
import {
  CreateResearchInstitute,
  ResearchInstituteDetail,
  uploadInstituteImage,
  uploadDirectorImage,
  uploadStaffImage,
  Objective,
  ResearchDirection,
  ResearchArea,
  StaffMember,
  EducationEntry,
} from "../../services/researchInstitute/researchInstituteService";

interface ResearchInstituteFormProps {
  initialValue?: ResearchInstituteDetail | null;
  onSubmit: (payload: CreateResearchInstitute) => Promise<{ status: string; institute?: ResearchInstituteDetail }>;
  submitLabel: string;
}

const blankObjective = (): Objective => ({
  az: { content: "" },
  en: { content: "" },
  display_order: 0,
});

const blankResearchDirection = (): ResearchDirection => ({
  az: { content: "" },
  en: { content: "" },
  display_order: 0,
});

const blankResearchArea = (): ResearchArea => ({
  az: { content: "" },
  en: { content: "" },
  display_order: 0,
});

const blankEducation = (): EducationEntry => ({
  az: { university: "", degree: "" },
  en: { university: "", degree: "" },
  start_year: "",
  end_year: null,
  display_order: 0,
});

const blankStaff = (): StaffMember => ({
  full_name: "",
  email: "",
  phone: "",
  display_order: 0,
  az: { title: "" },
  en: { title: "" },
});

const blankDirector = () => ({
  full_name: "",
  email: "",
  office: "",
  az: { title: "", biography: "" },
  en: { title: "", biography: "" },
  educations: [],
  research_areas: [],
});

const blankInstitutePayload: CreateResearchInstitute = {
  institute_code: "",
  az: { name: "", about: "", vision: "", mission: "" },
  en: { name: "", about: "", vision: "", mission: "" },
  director: blankDirector(),
  objectives: [],
  research_directions: [],
  staff: [],
};

export default function ResearchInstituteForm({ initialValue, onSubmit, submitLabel }: ResearchInstituteFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateResearchInstitute>(blankInstitutePayload);
  
  // Pending images state
  const [instituteImage, setInstituteImage] = useState<File | null>(null);
  const [directorImage, setDirectorImage] = useState<File | null>(null);
  const [staffImages, setStaffImages] = useState<{ [key: number]: File }>({});

  useEffect(() => {
    if (initialValue) {
      setFormData({
        institute_code: initialValue.institute_code,
        image_url: initialValue.image_url,
        az: initialValue.az,
        en: initialValue.en,
        director: {
          ...initialValue.director,
          educations: initialValue.director.educations || [],
          research_areas: initialValue.director.research_areas || [],
        },
        objectives: initialValue.objectives || [],
        research_directions: initialValue.research_directions || [],
        staff: initialValue.staff || [],
      });
    }
  }, [initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await onSubmit(formData);

    if (result.status === "SUCCESS" && result.institute) {
      const created = result.institute;
      const uploads: Promise<any>[] = [];

      // 1. Upload Institute Image
      if (instituteImage) {
        uploads.push(uploadInstituteImage(created.institute_code, instituteImage));
      }

      // 2. Upload Director Image
      if (directorImage && created.director.id) {
        uploads.push(uploadDirectorImage(created.director.id, directorImage));
      }

      // 3. Upload Staff Images
      // We map our pending images by index to the created staff members
      Object.entries(staffImages).forEach(([idx, file]) => {
        const staffId = created.staff[Number(idx)]?.id;
        if (staffId) {
          uploads.push(uploadStaffImage(staffId, file));
        }
      });

      if (uploads.length > 0) {
        await Promise.all(uploads);
      }

      setLoading(false);
      Swal.fire({ icon: "success", title: "Uğurla yadda saxlanıldı", showConfirmButton: false, timer: 1500 });
      
      if (!initialValue) {
        navigate(`/research-institutes/${created.institute_code}`);
      } else {
        // Refresh page or update state to show new images
        window.location.reload();
      }
    } else {
      setLoading(false);
      Swal.fire({ icon: "error", title: "Xəta baş verdi", text: "Zəhmət olmasa biraz sonra yenidən cəhd edin" });
    }
  };

  const handleImmediateUpload = async (type: "institute" | "director" | "staff", file: File, id?: string | number) => {
    // Only used for individual updates after creation
    if (!initialValue) return;

    setLoading(true);
    let result = "";
    if (type === "institute") {
      result = await uploadInstituteImage(initialValue.institute_code, file);
    } else if (type === "director" && initialValue.director.id) {
      result = await uploadDirectorImage(initialValue.director.id, file);
    } else if (type === "staff" && id) {
      result = await uploadStaffImage(Number(id), file);
    }
    setLoading(false);

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Şəkil yükləndi", showConfirmButton: false, timer: 1500 });
      // Update preview
      if (type === "institute") setFormData(prev => ({ ...prev, image_url: URL.createObjectURL(file) }));
      else if (type === "director") setFormData(prev => ({ ...prev, director: { ...prev.director, image_url: URL.createObjectURL(file) } }));
    } else {
      Swal.fire({ icon: "error", title: "Xəta", text: "Şəkil yüklənərkən xəta baş verdi" });
    }
  };

  const addObjective = () => setFormData({ ...formData, objectives: [...formData.objectives, blankObjective()] });
  const addDirection = () => setFormData({ ...formData, research_directions: [...formData.research_directions, blankResearchDirection()] });
  const addStaff = () => setFormData({ ...formData, staff: [...formData.staff, blankStaff()] });
  const addResearchArea = () => setFormData({ ...formData, director: { ...formData.director, research_areas: [...formData.director.research_areas, blankResearchArea()] } });
  const addEducation = () => setFormData({ ...formData, director: { ...formData.director, educations: [...formData.director.educations, blankEducation()] } });

  const ImageUploadField = ({ label, onFileSelect, currentImage, pendingFile }: { label: string, onFileSelect: (file: File) => void, currentImage?: string, pendingFile?: File | null }) => {
    const previewUrl = pendingFile ? URL.createObjectURL(pendingFile) : currentImage;

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0 flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            )}
          </div>
          <div className="flex-grow">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelect(file);
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400 cursor-pointer"
            />
            <p className="mt-1.5 text-[11px] text-gray-400">Yadda saxlayan zaman yüklənəcək</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Basic Info & Institute Image */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2">Əsas Məlumatlar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>İnstitut Kodu</Label>
              <Input value={formData.institute_code} onChange={(e) => setFormData({ ...formData, institute_code: e.target.value })} placeholder="RI-001" disabled={!!initialValue} />
            </div>
          </div>
          <ImageUploadField 
            label="İnstitut Şəkli" 
            onFileSelect={(file) => {
                if (initialValue) handleImmediateUpload("institute", file);
                else setInstituteImage(file);
            }} 
            currentImage={formData.image_url}
            pendingFile={instituteImage}
          />
        </div>
      </div>

      {/* Multilingual Info (AZ) */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2 flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold">AZ</span>
          İnstitut Məlumatları
        </h3>
        <div className="space-y-4">
          <div>
            <Label>Ad (AZ)</Label>
<<<<<<< HEAD
            <Input value={formData.az.name} onChange={(e) => setFormData({ ...formData, az: { ...formData.az, name: e.target.value } })} placeholder="İnstitutun adı" />
=======
            <Input value={formData.az.name} onChange={(e) => setFormData({ ...formData, az: { ...formData.az, name: e.target.value } })} placeholder="İnstitutun adı"  />
>>>>>>> d2c0092 (fix: update html_content field in normalizeCafedraPayload and adjust FacultyForm onSubmit type)
          </div>
          <div>
            <Label>Haqqında (AZ)</Label>
            <Editor initialContent={formData.az.about} onUpdate={(html) => setFormData({ ...formData, az: { ...formData.az, about: html } })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Vizyon (AZ)</Label>
              <Editor initialContent={formData.az.vision} onUpdate={(html) => setFormData({ ...formData, az: { ...formData.az, vision: html } })} />
            </div>
            <div>
              <Label>Missiya (AZ)</Label>
              <Editor initialContent={formData.az.mission} onUpdate={(html) => setFormData({ ...formData, az: { ...formData.az, mission: html } })} />
            </div>
          </div>
        </div>
      </div>

      {/* Multilingual Info (EN) */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2 flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">EN</span>
          Institute Information
        </h3>
        <div className="space-y-4">
          <div>
            <Label>Name (EN)</Label>
<<<<<<< HEAD
            <Input value={formData.en.name} onChange={(e) => setFormData({ ...formData, en: { ...formData.en, name: e.target.value } })} placeholder="Institute Name" />
=======
            <Input value={formData.en.name} onChange={(e) => setFormData({ ...formData, en: { ...formData.en, name: e.target.value } })} placeholder="Institute name"  />
>>>>>>> d2c0092 (fix: update html_content field in normalizeCafedraPayload and adjust FacultyForm onSubmit type)
          </div>
          <div>
            <Label>About (EN)</Label>
            <Editor initialContent={formData.en.about} onUpdate={(html) => setFormData({ ...formData, en: { ...formData.en, about: html } })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Vision (EN)</Label>
              <Editor initialContent={formData.en.vision} onUpdate={(html) => setFormData({ ...formData, en: { ...formData.en, vision: html } })} />
            </div>
            <div>
              <Label>Mission (EN)</Label>
              <Editor initialContent={formData.en.mission} onUpdate={(html) => setFormData({ ...formData, en: { ...formData.en, mission: html } })} />
            </div>
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
<<<<<<< HEAD
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Məqsədlər</h3>
          <Button type="button" onClick={addObjective} size="sm" variant="outline">Məqsəd əlavə et</Button>
        </div>
        <div className="space-y-4">
          {formData.objectives.map((obj, idx) => (
            <div key={idx} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3 relative bg-gray-50/30 dark:bg-gray-800/20">
=======
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2">Direktor Məlumatları</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Ad</Label>
            <Input value={formData.director.first_name} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, first_name: e.target.value } })}  />
          </div>
          <div>
            <Label>Soyad</Label>
            <Input value={formData.director.last_name} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, last_name: e.target.value } })}  />
          </div>
          <div>
            <Label>Ata adı</Label>
            <Input value={formData.director.father_name} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, father_name: e.target.value } })}  />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={formData.director.email} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, email: e.target.value } })}  />
          </div>
          <div>
            <Label>Otaq nömrəsi</Label>
            <Input value={formData.director.room_number} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, room_number: e.target.value } })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Direktor (AZ)</h4>
            <div>
              <Label>Elmi ad</Label>
              <Input value={formData.director.az.scientific_name} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, az: { ...formData.director.az, scientific_name: e.target.value } } })} />
            </div>
            <div>
              <Label>Elmi dərəcə</Label>
              <Input value={formData.director.az.scientific_degree} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, az: { ...formData.director.az, scientific_degree: e.target.value } } })} />
            </div>
            <div>
              <Label>Tədqiqat sahələri</Label>
              <Input value={formData.director.az.researcher_areas} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, az: { ...formData.director.az, researcher_areas: e.target.value } } })} />
            </div>
            <div>
              <Label>Bioqrafiya</Label>
              <Editor initialContent={formData.director.az.bio} onUpdate={(html) => setFormData({ ...formData, director: { ...formData.director, az: { ...formData.director.az, bio: html } } })} />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Director (EN)</h4>
            <div>
              <Label>Scientific name</Label>
              <Input value={formData.director.en.scientific_name} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, en: { ...formData.director.en, scientific_name: e.target.value } } })} />
            </div>
            <div>
              <Label>Scientific degree</Label>
              <Input value={formData.director.en.scientific_degree} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, en: { ...formData.director.en, scientific_degree: e.target.value } } })} />
            </div>
            <div>
              <Label>Research areas</Label>
              <Input value={formData.director.en.researcher_areas} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, en: { ...formData.director.en, researcher_areas: e.target.value } } })} />
            </div>
            <div>
              <Label>Biography</Label>
              <Editor initialContent={formData.director.en.bio} onUpdate={(html) => setFormData({ ...formData, director: { ...formData.director, en: { ...formData.director.en, bio: html } } })} />
            </div>
          </div>
        </div>

        {/* Educations */}
        <div className="pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Təhsil Məlumatları</h4>
            <Button type="button" onClick={() => setFormData({ ...formData, director: { ...formData.director, educations: [...formData.director.educations, blankEducation] } })} size="sm" variant="outline">
              Təhsil əlavə et
            </Button>
          </div>
          {formData.director.educations.map((edu, idx) => (
            <div key={idx} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3 relative">
>>>>>>> d2c0092 (fix: update html_content field in normalizeCafedraPayload and adjust FacultyForm onSubmit type)
              <button type="button" onClick={() => {
                const newObjs = [...formData.objectives];
                newObjs.splice(idx, 1);
                setFormData({ ...formData, objectives: newObjs });
              }} className="absolute top-2 right-2 text-red-500 hover:text-red-700">Sil</button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Məqsəd (AZ)</Label>
                  <Input value={obj.az.content} onChange={(e) => {
                    const newObjs = [...formData.objectives];
                    newObjs[idx] = { ...obj, az: { content: e.target.value } };
                    setFormData({ ...formData, objectives: newObjs });
                  }} />
                </div>
                <div>
                  <Label>Objective (EN)</Label>
                  <Input value={obj.en.content} onChange={(e) => {
                    const newObjs = [...formData.objectives];
                    newObjs[idx] = { ...obj, en: { content: e.target.value } };
                    setFormData({ ...formData, objectives: newObjs });
                  }} />
                </div>
              </div>
              <div className="w-32">
                <Label>Sıralama</Label>
                <Input type="number" value={obj.display_order} onChange={(e) => {
                  const newObjs = [...formData.objectives];
                  newObjs[idx] = { ...obj, display_order: Number(e.target.value) };
                  setFormData({ ...formData, objectives: newObjs });
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Research Directions */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Tədqiqat İstiqamətləri</h3>
          <Button type="button" onClick={addDirection} size="sm" variant="outline">İstiqamət əlavə et</Button>
        </div>
        <div className="space-y-4">
          {formData.research_directions.map((dir, idx) => (
            <div key={idx} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3 relative bg-gray-50/30 dark:bg-gray-800/20">
              <button type="button" onClick={() => {
                const newDirs = [...formData.research_directions];
                newDirs.splice(idx, 1);
                setFormData({ ...formData, research_directions: newDirs });
              }} className="absolute top-2 right-2 text-red-500 hover:text-red-700">Sil</button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>İstiqamət (AZ)</Label>
                  <Input value={dir.az.content} onChange={(e) => {
                    const newDirs = [...formData.research_directions];
                    newDirs[idx] = { ...dir, az: { content: e.target.value } };
                    setFormData({ ...formData, research_directions: newDirs });
                  }} />
                </div>
                <div>
                  <Label>Direction (EN)</Label>
                  <Input value={dir.en.content} onChange={(e) => {
                    const newDirs = [...formData.research_directions];
                    newDirs[idx] = { ...dir, en: { content: e.target.value } };
                    setFormData({ ...formData, research_directions: newDirs });
                  }} />
                </div>
              </div>
              <div className="w-32">
                <Label>Sıralama</Label>
                <Input type="number" value={dir.display_order} onChange={(e) => {
                  const newDirs = [...formData.research_directions];
                  newDirs[idx] = { ...dir, display_order: Number(e.target.value) };
                  setFormData({ ...formData, research_directions: newDirs });
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Director Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2">Direktor Məlumatları</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Tam Ad</Label>
                <Input value={formData.director.full_name} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, full_name: e.target.value } })} placeholder="John Doe" />
              </div>
              <div>
                <Label>Otaq/Ofis</Label>
                <Input value={formData.director.office} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, office: e.target.value } })} placeholder="Room 101" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={formData.director.email} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, email: e.target.value } })} placeholder="john.doe@aztu.edu.az" />
              </div>
            </div>
          </div>
          <ImageUploadField 
            label="Direktor Şəkli" 
            onFileSelect={(file) => {
                if (initialValue) handleImmediateUpload("director", file);
                else setDirectorImage(file);
            }} 
            currentImage={formData.director.image_url}
            pendingFile={directorImage}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Director AZ */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-2">Məlumatlar (AZ)</h4>
            <div>
              <Label>Vəzifə (AZ)</Label>
              <Input value={formData.director.az.title} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, az: { ...formData.director.az, title: e.target.value } } })} />
            </div>
            <div>
              <Label>Bioqrafiya (AZ)</Label>
              <Editor initialContent={formData.director.az.biography} onUpdate={(html) => setFormData({ ...formData, director: { ...formData.director, az: { ...formData.director.az, biography: html } } })} />
            </div>
          </div>
          {/* Director EN */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-2">Information (EN)</h4>
            <div>
              <Label>Title (EN)</Label>
              <Input value={formData.director.en.title} onChange={(e) => setFormData({ ...formData, director: { ...formData.director, en: { ...formData.director.en, title: e.target.value } } })} />
            </div>
            <div>
              <Label>Biography (EN)</Label>
              <Editor initialContent={formData.director.en.biography} onUpdate={(html) => setFormData({ ...formData, director: { ...formData.director, en: { ...formData.director.en, biography: html } } })} />
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Təhsil Məlumatları (Direktor)</h4>
            <Button type="button" onClick={addEducation} size="sm" variant="outline">Təhsil əlavə et</Button>
          </div>
          <div className="space-y-4">
            {formData.director.educations.map((edu, idx) => (
              <div key={idx} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3 relative bg-gray-50/20">
                <button type="button" onClick={() => {
                  const newEdus = [...formData.director.educations];
                  newEdus.splice(idx, 1);
                  setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
                }} className="absolute top-2 right-2 text-red-500 hover:text-red-700">Sil</button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-3">
                     <h5 className="text-xs font-bold uppercase text-gray-400">Azərbaycan dilində</h5>
                     <div>
                       <Label>Universitet (AZ)</Label>
                       <Input value={edu.az.university} onChange={(e) => {
                         const newEdus = [...formData.director.educations];
                         newEdus[idx] = { ...edu, az: { ...edu.az, university: e.target.value } };
                         setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
                       }} />
                     </div>
                     <div>
                       <Label>Dərəcə (AZ)</Label>
                       <Input value={edu.az.degree} onChange={(e) => {
                         const newEdus = [...formData.director.educations];
                         newEdus[idx] = { ...edu, az: { ...edu.az, degree: e.target.value } };
                         setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
                       }} />
                     </div>
                   </div>
                   <div className="space-y-3">
                     <h5 className="text-xs font-bold uppercase text-gray-400">In English</h5>
                     <div>
                       <Label>University (EN)</Label>
                       <Input value={edu.en.university} onChange={(e) => {
                         const newEdus = [...formData.director.educations];
                         newEdus[idx] = { ...edu, en: { ...edu.en, university: e.target.value } };
                         setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
                       }} />
                     </div>
                     <div>
                       <Label>Degree (EN)</Label>
                       <Input value={edu.en.degree} onChange={(e) => {
                         const newEdus = [...formData.director.educations];
                         newEdus[idx] = { ...edu, en: { ...edu.en, degree: e.target.value } };
                         setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
                       }} />
                     </div>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Başlama ili</Label>
                    <Input value={edu.start_year} onChange={(e) => {
                      const newEdus = [...formData.director.educations];
                      newEdus[idx] = { ...edu, start_year: e.target.value };
                      setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
                    }} placeholder="2010" />
                  </div>
                  <div>
                    <Label>Bitmə ili</Label>
                    <Input value={edu.end_year || ""} onChange={(e) => {
                      const newEdus = [...formData.director.educations];
                      newEdus[idx] = { ...edu, end_year: e.target.value || null };
                      setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
                    }} placeholder="2014 və ya boş" />
                  </div>
                  <div>
                    <Label>Sıralama</Label>
                    <Input type="number" value={edu.display_order} onChange={(e) => {
                      const newEdus = [...formData.director.educations];
                      newEdus[idx] = { ...edu, display_order: Number(e.target.value) };
                      setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Research Areas */}
        <div className="pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Tədqiqat Sahələri (Direktor)</h4>
            <Button type="button" onClick={addResearchArea} size="sm" variant="outline">Sahə əlavə et</Button>
          </div>
          <div className="space-y-3">
            {formData.director.research_areas.map((area, idx) => (
              <div key={idx} className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl relative bg-gray-50/20">
                <button type="button" onClick={() => {
                  const newAreas = [...formData.director.research_areas];
                  newAreas.splice(idx, 1);
                  setFormData({ ...formData, director: { ...formData.director, research_areas: newAreas } });
                }} className="absolute top-2 right-2 text-red-500 hover:text-red-700">Sil</button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Sahə (AZ)</Label>
                    <Input value={area.az.content} onChange={(e) => {
                      const newAreas = [...formData.director.research_areas];
                      newAreas[idx] = { ...area, az: { content: e.target.value } };
                      setFormData({ ...formData, director: { ...formData.director, research_areas: newAreas } });
                    }} />
                  </div>
                  <div>
                    <Label>Research Area (EN)</Label>
                    <Input value={area.en.content} onChange={(e) => {
                      const newAreas = [...formData.director.research_areas];
                      newAreas[idx] = { ...area, en: { content: e.target.value } };
                      setFormData({ ...formData, director: { ...formData.director, research_areas: newAreas } });
                    }} />
                  </div>
                </div>
                <div className="w-32 mt-2">
                   <Label>Sıralama</Label>
                   <Input type="number" value={area.display_order} onChange={(e) => {
                     const newAreas = [...formData.director.research_areas];
                     newAreas[idx] = { ...area, display_order: Number(e.target.value) };
                     setFormData({ ...formData, director: { ...formData.director, research_areas: newAreas } });
                   }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">İşçi Heyəti</h3>
          <Button type="button" onClick={addStaff} size="sm" variant="outline">İşçi əlavə et</Button>
        </div>
        <div className="space-y-6">
          {formData.staff.map((member, idx) => (
            <div key={idx} className="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/30 dark:bg-gray-800/20 space-y-6 relative">
              <button type="button" onClick={() => {
                const newStaff = [...formData.staff];
                newStaff.splice(idx, 1);
                setFormData({ ...formData, staff: newStaff });
              }} className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-medium">Sil</button>
              
<<<<<<< HEAD
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Tam Ad</Label>
                      <Input value={member.full_name} onChange={(e) => {
                        const newStaff = [...formData.staff];
                        newStaff[idx] = { ...member, full_name: e.target.value };
                        setFormData({ ...formData, staff: newStaff });
                      }} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={member.email} onChange={(e) => {
                        const newStaff = [...formData.staff];
                        newStaff[idx] = { ...member, email: e.target.value };
                        setFormData({ ...formData, staff: newStaff });
                      }} />
                    </div>
                    <div>
                      <Label>Telefon</Label>
                      <Input value={member.phone} onChange={(e) => {
                        const newStaff = [...formData.staff];
                        newStaff[idx] = { ...member, phone: e.target.value };
                        setFormData({ ...formData, staff: newStaff });
                      }} />
                    </div>
                  </div>
=======
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Ad</Label>
                  <Input value={member.first_name} onChange={(e) => {
                    const newStaff = [...formData.staff];
                    newStaff[idx] = { ...member, first_name: e.target.value };
                    setFormData({ ...formData, staff: newStaff });
                  }}  />
                </div>
                <div>
                  <Label>Soyad</Label>
                  <Input value={member.last_name} onChange={(e) => {
                    const newStaff = [...formData.staff];
                    newStaff[idx] = { ...member, last_name: e.target.value };
                    setFormData({ ...formData, staff: newStaff });
                  }}  />
                </div>
                <div>
                  <Label>Ata adı</Label>
                  <Input value={member.father_name} onChange={(e) => {
                    const newStaff = [...formData.staff];
                    newStaff[idx] = { ...member, father_name: e.target.value };
                    setFormData({ ...formData, staff: newStaff });
                  }}  />
>>>>>>> d2c0092 (fix: update html_content field in normalizeCafedraPayload and adjust FacultyForm onSubmit type)
                </div>
                <ImageUploadField 
                  label="İşçi Şəkli" 
                  onFileSelect={(file) => {
                      if (member.id) handleImmediateUpload("staff", file, member.id);
                      else setStaffImages(prev => ({ ...prev, [idx]: file }));
                  }} 
                  currentImage={member.image_url}
                  pendingFile={staffImages[idx]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Sıralama</Label>
                  <Input type="number" value={member.display_order} onChange={(e) => {
                    const newStaff = [...formData.staff];
<<<<<<< HEAD
                    newStaff[idx] = { ...member, display_order: Number(e.target.value) };
=======
                    newStaff[idx] = { ...member, email: e.target.value };
                    setFormData({ ...formData, staff: newStaff });
                  }}  />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input value={member.phone_number} onChange={(e) => {
                    const newStaff = [...formData.staff];
                    newStaff[idx] = { ...member, phone_number: e.target.value };
>>>>>>> d2c0092 (fix: update html_content field in normalizeCafedraPayload and adjust FacultyForm onSubmit type)
                    setFormData({ ...formData, staff: newStaff });
                  }} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Vəzifə (AZ)</Label>
                  <Input value={member.az.title} onChange={(e) => {
                    const newStaff = [...formData.staff];
                    newStaff[idx] = { ...member, az: { title: e.target.value } };
                    setFormData({ ...formData, staff: newStaff });
                  }} />
                </div>
                <div>
                  <Label>Title (EN)</Label>
                  <Input value={member.en.title} onChange={(e) => {
                    const newStaff = [...formData.staff];
                    newStaff[idx] = { ...member, en: { title: e.target.value } };
                    setFormData({ ...formData, staff: newStaff });
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg">
        <Button type="submit" disabled={loading} className="w-full md:w-auto px-12 h-11 flex items-center justify-center">
          {loading ? (
            <span className="flex items-center gap-2">
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Gözləyin...
            </span>
          ) : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate("/research-institutes")} className="w-full md:w-auto px-12 h-11">
          İmtina
        </Button>
      </div>
    </form>
  );
}

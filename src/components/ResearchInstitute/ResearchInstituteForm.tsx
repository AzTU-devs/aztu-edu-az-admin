import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Editor from "../editor/Editor";
import {
  CreateInstitutePayload,
  DirectorSection,
  EducationSection,
  StaffSection,
  ResearchInstituteDetail,
  uploadInstituteImage,
  uploadDirectorImage,
  uploadStaffImage,
} from "../../services/researchInstitute/researchInstituteService";

interface ResearchInstituteFormProps {
  initialValue?: ResearchInstituteDetail | null;
  onSubmit: (payload: CreateInstitutePayload) => Promise<{ status: string; institute?: ResearchInstituteDetail }>;
  submitLabel: string;
}

const blankEducation: EducationSection = {
  university_name: "",
  start_year: "",
  end_year: "",
  az: { degree: "" },
  en: { degree: "" },
};

const blankStaff: StaffSection = {
  first_name: "",
  last_name: "",
  father_name: "",
  email: "",
  phone_number: "",
  az: { scientific_name: "", scientific_degree: "" },
  en: { scientific_name: "", scientific_degree: "" },
};

const blankDirector: DirectorSection = {
  first_name: "",
  last_name: "",
  father_name: "",
  email: "",
  room_number: "",
  az: { scientific_name: "", scientific_degree: "", bio: "", researcher_areas: "" },
  en: { scientific_name: "", scientific_degree: "", bio: "", researcher_areas: "" },
  educations: [],
};

const blankInstitutePayload: CreateInstitutePayload = {
  az: { name: "", about_html: "", vision_html: "", mission_html: "", goals_html: "", direction_html: "" },
  en: { name: "", about_html: "", vision_html: "", mission_html: "", goals_html: "", direction_html: "" },
  director: blankDirector,
  staff: [],
};

export default function ResearchInstituteForm({ initialValue, onSubmit, submitLabel }: ResearchInstituteFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateInstitutePayload>(blankInstitutePayload);

  useEffect(() => {
    if (initialValue) {
      setFormData({
        az: initialValue.az,
        en: initialValue.en,
        director: initialValue.director,
        staff: initialValue.staff || [],
      });
    }
  }, [initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await onSubmit(formData);
    setLoading(false);

    if (result.status === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurla yadda saxlanıldı", showConfirmButton: false, timer: 1500 });
      navigate("/research-institutes");
    } else {
      Swal.fire({ icon: "error", title: "Xəta baş verdi", text: "Zəhmət olmasa biraz sonra yenidən cəhd edin" });
    }
  };

  const handleImageUpload = async (type: "institute" | "director" | "staff", file: File, id?: string | number) => {
    if (!initialValue) {
      Swal.fire({ icon: "info", title: "Məlumat", text: "Şəkil yükləmək üçün əvvəlcə institutu yaradın" });
      return;
    }

    let result = "";
    if (type === "institute") {
      result = await uploadInstituteImage(initialValue.institute_code, file);
    } else if (type === "director") {
      result = await uploadDirectorImage(initialValue.institute_code, file);
    } else if (type === "staff" && id) {
      result = await uploadStaffImage(Number(id), file);
    }

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Şəkil yükləndi", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Xəta", text: "Şəkil yüklənərkən xəta baş verdi" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Institute Info AZ */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2">İnstitut Məlumatları (AZ)</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Ad (AZ)</Label>
            <Input value={formData.az.name} onChange={(e) => setFormData({ ...formData, az: { ...formData.az, name: e.target.value } })} placeholder="İnstitutun adı"  />
          </div>
          <div>
            <Label>Haqqında (AZ)</Label>
            <Editor initialContent={formData.az.about_html} onUpdate={(html) => setFormData({ ...formData, az: { ...formData.az, about_html: html } })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Vizyon (AZ)</Label>
              <Editor initialContent={formData.az.vision_html} onUpdate={(html) => setFormData({ ...formData, az: { ...formData.az, vision_html: html } })} />
            </div>
            <div>
              <Label>Missiya (AZ)</Label>
              <Editor initialContent={formData.az.mission_html} onUpdate={(html) => setFormData({ ...formData, az: { ...formData.az, mission_html: html } })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Məqsədlər (AZ)</Label>
              <Editor initialContent={formData.az.goals_html} onUpdate={(html) => setFormData({ ...formData, az: { ...formData.az, goals_html: html } })} />
            </div>
            <div>
              <Label>Fəaliyyət istiqamətləri (AZ)</Label>
              <Editor initialContent={formData.az.direction_html} onUpdate={(html) => setFormData({ ...formData, az: { ...formData.az, direction_html: html } })} />
            </div>
          </div>
        </div>
        {initialValue && (
          <div className="mt-4">
            <Label>İnstitut Şəkli</Label>
            <input type="file" onChange={(e) => e.target.files?.[0] && handleImageUpload("institute", e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
        )}
      </div>

      {/* Institute Info EN */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2">Institute Information (EN)</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Name (EN)</Label>
            <Input value={formData.en.name} onChange={(e) => setFormData({ ...formData, en: { ...formData.en, name: e.target.value } })} placeholder="Institute name"  />
          </div>
          <div>
            <Label>About (EN)</Label>
            <Editor initialContent={formData.en.about_html} onUpdate={(html) => setFormData({ ...formData, en: { ...formData.en, about_html: html } })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Vision (EN)</Label>
              <Editor initialContent={formData.en.vision_html} onUpdate={(html) => setFormData({ ...formData, en: { ...formData.en, vision_html: html } })} />
            </div>
            <div>
              <Label>Mission (EN)</Label>
              <Editor initialContent={formData.en.mission_html} onUpdate={(html) => setFormData({ ...formData, en: { ...formData.en, mission_html: html } })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Goals (EN)</Label>
              <Editor initialContent={formData.en.goals_html} onUpdate={(html) => setFormData({ ...formData, en: { ...formData.en, goals_html: html } })} />
            </div>
            <div>
              <Label>Activity directions (EN)</Label>
              <Editor initialContent={formData.en.direction_html} onUpdate={(html) => setFormData({ ...formData, en: { ...formData.en, direction_html: html } })} />
            </div>
          </div>
        </div>
      </div>

      {/* Director Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
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
              <button type="button" onClick={() => {
                const newEdus = [...formData.director.educations];
                newEdus.splice(idx, 1);
                setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
              }} className="absolute top-2 right-2 text-red-500 hover:text-red-700">Sil</button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Label>Universitet</Label>
                  <Input value={edu.university_name} onChange={(e) => {
                    const newEdus = [...formData.director.educations];
                    newEdus[idx] = { ...edu, university_name: e.target.value };
                    setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
                  }} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Başlama</Label>
                    <Input value={edu.start_year} onChange={(e) => {
                      const newEdus = [...formData.director.educations];
                      newEdus[idx] = { ...edu, start_year: e.target.value };
                      setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
                    }} />
                  </div>
                  <div>
                    <Label>Bitmə</Label>
                    <Input value={edu.end_year} onChange={(e) => {
                      const newEdus = [...formData.director.educations];
                      newEdus[idx] = { ...edu, end_year: e.target.value };
                      setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
                    }} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Dərəcə (AZ)</Label>
                  <Input value={edu.az.degree} onChange={(e) => {
                    const newEdus = [...formData.director.educations];
                    newEdus[idx] = { ...edu, az: { degree: e.target.value } };
                    setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
                  }} />
                </div>
                <div>
                  <Label>Degree (EN)</Label>
                  <Input value={edu.en.degree} onChange={(e) => {
                    const newEdus = [...formData.director.educations];
                    newEdus[idx] = { ...edu, en: { degree: e.target.value } };
                    setFormData({ ...formData, director: { ...formData.director, educations: newEdus } });
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {initialValue && (
          <div className="mt-4">
            <Label>Direktor Şəkli</Label>
            <input type="file" onChange={(e) => e.target.files?.[0] && handleImageUpload("director", e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
        )}
      </div>

      {/* Staff Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">İşçi Heyəti</h3>
          <Button type="button" onClick={() => setFormData({ ...formData, staff: [...formData.staff, blankStaff] })} size="sm" variant="outline">
            İşçi əlavə et
          </Button>
        </div>
        <div className="space-y-6">
          {formData.staff.map((member, idx) => (
            <div key={idx} className="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/30 dark:bg-gray-800/20 space-y-4 relative">
              <button type="button" onClick={() => {
                const newStaff = [...formData.staff];
                newStaff.splice(idx, 1);
                setFormData({ ...formData, staff: newStaff });
              }} className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-medium">Sil</button>
              
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
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input value={member.email} onChange={(e) => {
                    const newStaff = [...formData.staff];
                    newStaff[idx] = { ...member, email: e.target.value };
                    setFormData({ ...formData, staff: newStaff });
                  }}  />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input value={member.phone_number} onChange={(e) => {
                    const newStaff = [...formData.staff];
                    newStaff[idx] = { ...member, phone_number: e.target.value };
                    setFormData({ ...formData, staff: newStaff });
                  }} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase text-gray-400">Azərbaycan dilində</h5>
                  <div>
                    <Label>Elmi ad</Label>
                    <Input value={member.az.scientific_name} onChange={(e) => {
                      const newStaff = [...formData.staff];
                      newStaff[idx] = { ...member, az: { ...member.az, scientific_name: e.target.value } };
                      setFormData({ ...formData, staff: newStaff });
                    }} />
                  </div>
                  <div>
                    <Label>Elmi dərəcə</Label>
                    <Input value={member.az.scientific_degree} onChange={(e) => {
                      const newStaff = [...formData.staff];
                      newStaff[idx] = { ...member, az: { ...member.az, scientific_degree: e.target.value } };
                      setFormData({ ...formData, staff: newStaff });
                    }} />
                  </div>
                </div>
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase text-gray-400">In English</h5>
                  <div>
                    <Label>Scientific name</Label>
                    <Input value={member.en.scientific_name} onChange={(e) => {
                      const newStaff = [...formData.staff];
                      newStaff[idx] = { ...member, en: { ...member.en, scientific_name: e.target.value } };
                      setFormData({ ...formData, staff: newStaff });
                    }} />
                  </div>
                  <div>
                    <Label>Scientific degree</Label>
                    <Input value={member.en.scientific_degree} onChange={(e) => {
                      const newStaff = [...formData.staff];
                      newStaff[idx] = { ...member, en: { ...member.en, scientific_degree: e.target.value } };
                      setFormData({ ...formData, staff: newStaff });
                    }} />
                  </div>
                </div>
              </div>
              {member.id && (
                <div>
                  <Label>İşçi Şəkli</Label>
                  <input type="file" onChange={(e) => e.target.files?.[0] && handleImageUpload("staff", e.target.files[0], member.id)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading} className="w-full md:w-auto px-12">
          {loading ? "Gözləyin..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate("/research-institutes")} className="w-full md:w-auto px-12">
          İmtina
        </Button>
      </div>
    </form>
  );
}

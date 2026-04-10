import re

file_path = "src/components/Cafedras/CafedraForm.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace the specific worker updates with generic ones
worker_updates_old = """  const updateWorker = (index: number, field: string, value: string) => {
    setPayload((prev) => {
      const list = [...prev.workers];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, workers: list };
    });
  };

  const updateWorkerLanguageField = (index: number, lang: "az" | "en", field: string, value: string) => {
    setPayload((prev) => {
      const list = [...prev.workers];
      list[index] = {
        ...list[index],
        [lang]: {
          ...list[index][lang],
          [field]: value,
        },
      };
      return { ...prev, workers: list };
    });
  };"""

personnel_updates_new = """  const updatePersonnel = (listKey: "workers" | "deputy_deans" | "scientific_council", index: number, field: string, value: string) => {
    setPayload((prev) => {
      const list = [...prev[listKey]];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [listKey]: list };
    });
  };

  const updatePersonnelLanguageField = (listKey: "workers" | "deputy_deans" | "scientific_council", index: number, lang: "az" | "en", field: string, value: string) => {
    setPayload((prev) => {
      const list = [...prev[listKey]];
      list[index] = {
        ...list[index],
        [lang]: {
          ...list[index][lang],
          [field]: value,
        },
      };
      return { ...prev, [listKey]: list };
    });
  };

  const renderPersonnelSection = (
    title: string,
    description: string,
    listKey: "workers" | "deputy_deans" | "scientific_council",
    imageMap: { [index: number]: File },
    setImageMap: React.Dispatch<React.SetStateAction<{ [index: number]: File }>>
  ) => {
    const list = payload[listKey];
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm mb-5">
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          </div>
          <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addListItem(listKey, {
            first_name: "", last_name: "", father_name: "", email: "", phone: "",
            az: { duty: "", scientific_name: "", scientific_degree: "" },
            en: { duty: "", scientific_name: "", scientific_degree: "" },
          })}>
            Yeni əlavə et
          </Button>
        </div>
        <div className="p-5 space-y-4">
          {list.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Heç bir maddə yoxdur.</p>}
          {list.map((item, idx) => (
            <div key={`${listKey}-${idx}`} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Maddə #{idx + 1}</p>
                <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => removeListItem(listKey, idx)}>
                  Sil
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-1">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Şəkil</Label>
                  <input type="file" onChange={(e) => setImageMap(prev => ({ ...prev, [idx]: e.target.files?.[0] as File }))} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {item.profile_image && !imageMap[idx] && (
                    <div className="mt-2">
                      <img src={item.profile_image} alt="Profile" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ad</Label>
                  <Input value={item.first_name} onChange={(e) => updatePersonnel(listKey, idx, "first_name", e.target.value)} placeholder="Ad" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Soyad</Label>
                  <Input value={item.last_name} onChange={(e) => updatePersonnel(listKey, idx, "last_name", e.target.value)} placeholder="Soyad" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ata adı</Label>
                  <Input value={item.father_name} onChange={(e) => updatePersonnel(listKey, idx, "father_name", e.target.value)} placeholder="Ata adı" />
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Email</Label>
                  <Input value={item.email} onChange={(e) => updatePersonnel(listKey, idx, "email", e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Telefon</Label>
                  <Input value={item.phone} onChange={(e) => updatePersonnel(listKey, idx, "phone", e.target.value)} placeholder="+994501234567" />
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ - Vəzifə</Label>
                  <Input value={item.az.duty} onChange={(e) => updatePersonnelLanguageField(listKey, idx, "az", "duty", e.target.value)} placeholder="Müəllim" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ - Elmi ad</Label>
                  <Input value={item.az.scientific_name} onChange={(e) => updatePersonnelLanguageField(listKey, idx, "az", "scientific_name", e.target.value)} placeholder="Dosent" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ - Elmi dərəcə</Label>
                  <Input value={item.az.scientific_degree} onChange={(e) => updatePersonnelLanguageField(listKey, idx, "az", "scientific_degree", e.target.value)} placeholder="Fəlsəfə doktoru" />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN - Duty</Label>
                  <Input value={item.en.duty} onChange={(e) => updatePersonnelLanguageField(listKey, idx, "en", "duty", e.target.value)} placeholder="Lecturer" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN - Scientific name</Label>
                  <Input value={item.en.scientific_name} onChange={(e) => updatePersonnelLanguageField(listKey, idx, "en", "scientific_name", e.target.value)} placeholder="Associate Professor" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN - Scientific degree</Label>
                  <Input value={item.en.scientific_degree} onChange={(e) => updatePersonnelLanguageField(listKey, idx, "en", "scientific_degree", e.target.value)} placeholder="PhD" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };"""

content = content.replace(worker_updates_old, personnel_updates_new)

# 2. Add deputy_dean_count to stats section
stat_old = """          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bakalavr proqramları</Label>
            <Input type="number" value={payload.bachelor_programs_count} onChange={(e) => changeStatField("bachelor_programs_count", parseInt(e.target.value) || 0)} />
          </div>"""

stat_new = """          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Müavin sayı</Label>
            <Input type="number" value={payload.deputy_dean_count} onChange={(e) => changeStatField("deputy_dean_count", parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bakalavr proqramları</Label>
            <Input type="number" value={payload.bachelor_programs_count} onChange={(e) => changeStatField("bachelor_programs_count", parseInt(e.target.value) || 0)} />
          </div>"""

content = content.replace(stat_old, stat_new)

# 3. Replace hardcoded workers JSX with calls to renderPersonnelSection and add the other sections
workers_jsx_old = """      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">İşçilər</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Kafedra işçisi məlumatları əlavə edin.</p>
          </div>
          <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addListItem("workers", {
            first_name: "",
            last_name: "",
            father_name: "",
            email: "",
            phone: "",
            az: { duty: "", scientific_name: "", scientific_degree: "" },
            en: { duty: "", scientific_name: "", scientific_degree: "" },
          })}>
            Yeni əlavə et
          </Button>
        </div>
        <div className="p-5 space-y-4">
          {payload.workers.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Heç bir maddə yoxdur.</p>}
          {payload.workers.map((item, idx) => (
            <div key={`worker-${idx}`} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">İşçi #{idx + 1}</p>
                <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => removeListItem("workers", idx)}>
                  Sil
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-1">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Şəkil</Label>
                  <input type="file" onChange={(e) => setWorkerImages(prev => ({ ...prev, [idx]: e.target.files?.[0] as File }))} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {item.profile_image && !workerImages[idx] && (
                    <div className="mt-2">
                      <img src={item.profile_image} alt="Worker" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ad</Label>
                  <Input value={item.first_name} onChange={(e) => updateWorker(idx, "first_name", e.target.value)} placeholder="Ad" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Soyad</Label>
                  <Input value={item.last_name} onChange={(e) => updateWorker(idx, "last_name", e.target.value)} placeholder="Soyad" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ata adı</Label>
                  <Input value={item.father_name} onChange={(e) => updateWorker(idx, "father_name", e.target.value)} placeholder="Ata adı" />
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Email</Label>
                  <Input value={item.email} onChange={(e) => updateWorker(idx, "email", e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Telefon</Label>
                  <Input value={item.phone} onChange={(e) => updateWorker(idx, "phone", e.target.value)} placeholder="+994501234567" />
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ - Vəzifə</Label>
                  <Input value={item.az.duty} onChange={(e) => updateWorkerLanguageField(idx, "az", "duty", e.target.value)} placeholder="Müəllim" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ - Elmi ad</Label>
                  <Input value={item.az.scientific_name} onChange={(e) => updateWorkerLanguageField(idx, "az", "scientific_name", e.target.value)} placeholder="Dosent" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ - Elmi dərəcə</Label>
                  <Input value={item.az.scientific_degree} onChange={(e) => updateWorkerLanguageField(idx, "az", "scientific_degree", e.target.value)} placeholder="Fəlsəfə doktoru" />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN - Duty</Label>
                  <Input value={item.en.duty} onChange={(e) => updateWorkerLanguageField(idx, "en", "duty", e.target.value)} placeholder="Lecturer" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN - Scientific name</Label>
                  <Input value={item.en.scientific_name} onChange={(e) => updateWorkerLanguageField(idx, "en", "scientific_name", e.target.value)} placeholder="Associate Professor" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN - Scientific degree</Label>
                  <Input value={item.en.scientific_degree} onChange={(e) => updateWorkerLanguageField(idx, "en", "scientific_degree", e.target.value)} placeholder="PhD" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>"""

new_sections_jsx = """      {renderPersonnelSection("Müavinlər", "Kafedra müdir müavinləri.", "deputy_deans", deputyDeanImages, setDeputyDeanImages)}
      {renderPersonnelSection("Elmi Şura", "Kafedra elmi şurasının üzvləri.", "scientific_council", councilImages, setCouncilImages)}
      {renderPersonnelSection("İşçilər", "Kafedra işçiləri məlumatları.", "workers", workerImages, setWorkerImages)}

      {renderTranslatedArraySection("Laboratoriyalar", "laboratories")}
      {renderTranslatedArraySection("Elmi-tədqiqat işləri", "research_works")}
      {renderTranslatedArraySection("Tərəfdaş şirkətlər", "partner_companies")}
      {renderTranslatedArraySection("Məqsədlər", "objectives")}
      {renderTranslatedArraySection("Vəzifələr", "duties")}
      {renderTranslatedArraySection("Layihələr", "projects")}"""

content = content.replace(workers_jsx_old, new_sections_jsx)

# 4. Handle saving new images
save_old = """      for (const indexStr in workerImages) {
        const index = parseInt(indexStr);
        const worker = result.cafedra.workers[index];
        if (worker && worker.id) {
          await uploadCafedraWorkerImage(worker.id, workerImages[index]);
        }
      }"""

save_new = """      for (const indexStr in workerImages) {
        const index = parseInt(indexStr);
        const worker = result.cafedra.workers[index];
        if (worker && worker.id) {
          await uploadCafedraWorkerImage(worker.id, workerImages[index]);
        }
      }
      for (const indexStr in deputyDeanImages) {
        const index = parseInt(indexStr);
        const worker = result.cafedra.deputy_deans[index];
        if (worker && worker.id) {
          await uploadCafedraWorkerImage(worker.id, deputyDeanImages[index]);
        }
      }
      for (const indexStr in councilImages) {
        const index = parseInt(indexStr);
        const worker = result.cafedra.scientific_council[index];
        if (worker && worker.id) {
          await uploadCafedraWorkerImage(worker.id, councilImages[index]);
        }
      }"""

content = content.replace(save_old, save_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated CafedraForm.tsx successfully")

import re

file_path = "src/components/Faculties/FacultyForm.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update blankFacultyPayload
content = content.replace(
    '  scientific_council: [],\n  workers: [],\n  bachelor_programs_count: 0,',
    '  scientific_council: [],\n  workers: [],\n  cafedra_count: 0,\n  deputy_dean_count: 0,\n  bachelor_programs_count: 0,'
)

# 2. Update normalizeFacultyPayload
content = content.replace(
    '      },\n    })),\n    bachelor_programs_count: value.bachelor_programs_count ?? 0,',
    '      },\n    })),\n    cafedra_count: value.cafedra_count ?? 0,\n    deputy_dean_count: value.deputy_dean_count ?? 0,\n    bachelor_programs_count: value.bachelor_programs_count ?? 0,'
)

# 3. Update UI - add Cafedra count and Deputy Dean count to Stats section
ui_old = """          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bakalavr proqramları</Label>
            <Input type="number" value={payload.bachelor_programs_count} onChange={(e) => changeStatField("bachelor_programs_count", parseInt(e.target.value) || 0)} />
          </div>"""

ui_new = """          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Kafedra sayı</Label>
            <Input type="number" value={payload.cafedra_count} onChange={(e) => changeStatField("cafedra_count", parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Dekan müavini sayı</Label>
            <Input type="number" value={payload.deputy_dean_count} onChange={(e) => changeStatField("deputy_dean_count", parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bakalavr proqramları</Label>
            <Input type="number" value={payload.bachelor_programs_count} onChange={(e) => changeStatField("bachelor_programs_count", parseInt(e.target.value) || 0)} />
          </div>"""

content = content.replace(ui_old, ui_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated FacultyForm.tsx successfully")

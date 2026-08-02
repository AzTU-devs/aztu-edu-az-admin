import { useState } from "react";
import { useNavigate } from "react-router";
import { CircularProgress } from "@mui/material";
import Swal from "sweetalert2";

import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { createOffice } from "../../services/office/officeService";

/**
 * Creates a draft office from just its name. The backend derives the az/en
 * slugs from the name; everything else is filled in on the editor screen, so
 * this step navigates straight there on success.
 */
export default function NewOffice() {
  const navigate = useNavigate();
  const [nameAz, setNameAz] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!nameAz.trim() && !nameEn.trim()) {
      Swal.fire({ icon: "warning", title: "Ad tələb olunur", text: "Ən azı bir dildə ad daxil edin." });
      return;
    }
    setSaving(true);
    try {
      const result = await createOffice({ name_az: nameAz.trim(), name_en: nameEn.trim() });
      if (result.status !== "SUCCESS") {
        Swal.fire({ icon: "error", title: "Xəta", text: "Yaradıla bilmədi." });
        return;
      }
      navigate(`/offices/${result.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="Yeni ofis/mərkəz | AzTU Admin" description="Yeni ofis/mərkəz" />
      <PageBreadcrumb pageTitle="Yeni ofis/mərkəz" />

      <div className="mx-auto max-w-2xl">
        <ComponentCard
          title="Yeni ofis / mərkəz"
          desc="Adı daxil edin — slug avtomatik yaradılacaq. Qalan sahələr növbəti addımda doldurulur."
        >
          <div className="space-y-4">
            <div>
              <Label>Ad (Azərbaycanca)</Label>
              <Input
                value={nameAz}
                onChange={(event) => setNameAz(event.target.value)}
                placeholder="Beynəlxalq Əlaqələr Şöbəsi"
              />
            </div>
            <div>
              <Label>Ad (English)</Label>
              <Input
                value={nameEn}
                onChange={(event) => setNameEn(event.target.value)}
                placeholder="International Relations Office"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button size="sm" variant="outline" onClick={() => navigate("/offices")}>
                İmtina
              </Button>
              <Button
                onClick={handleCreate}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
              >
                Yarat və davam et
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import CafedraForm from "./CafedraForm";
import LaboratoryManager from "./LaboratoryManager";
import SubEntityManager from "../common/subentity/SubEntityManager";
import { PersonFormValue } from "../common/subentity/PersonForm";
import {
    getCafedraDetails,
    updateCafedra,
    CafedraDetail,
    CreateCafedraPayload,
    uploadCafedraWorkerImage,
    uploadCafedraDeputyDirectorImage,
    createCafedraWorker,
    updateCafedraWorker,
    deleteCafedraWorker,
    createCafedraDeputyDirector,
    updateCafedraDeputyDirector,
    deleteCafedraDeputyDirector,
    createCafedraScientificCouncilMember,
    updateCafedraScientificCouncilMember,
    deleteCafedraScientificCouncilMember,
} from "../../services/cafedra/cafedraService";

const personToForm = (p: any): PersonFormValue => ({
    first_name: p.first_name ?? "",
    last_name: p.last_name ?? "",
    father_name: p.father_name ?? "",
    email: p.email ?? "",
    phone: p.phone ?? "",
    az: {
        duty: p.az?.duty ?? "",
        scientific_name: p.az?.scientific_name ?? "",
        scientific_degree: p.az?.scientific_degree ?? "",
    },
    en: {
        duty: p.en?.duty ?? "",
        scientific_name: p.en?.scientific_name ?? "",
        scientific_degree: p.en?.scientific_degree ?? "",
    },
    profile_image: p.profile_image ?? "",
});

export default function CafedraDetails() {
    const { cafedra_code } = useParams();

    const [cafedra, setCafedra] = useState<CafedraDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCafedra = useCallback(async () => {
        if (!cafedra_code) {
            setError("Kafedra kodu müəyyən edilmədi");
            setLoading(false);
            return;
        }
        const res = await getCafedraDetails(cafedra_code);
        if (res && typeof res === "object" && "cafedra_code" in res) {
            setCafedra(res as CafedraDetail);
            setError(null);
        } else if (res === "NOT FOUND") {
            setError("Kafedra tapılmadı");
        } else {
            setError("Kafedra yüklənərkən xəta baş verdi");
        }
    }, [cafedra_code]);

    useEffect(() => {
        setLoading(true);
        loadCafedra().finally(() => setLoading(false));
    }, [loadCafedra]);

    const handleSubmit = async (payload: CreateCafedraPayload) => {
        if (!cafedra_code) return { status: "ERROR" };
        return await updateCafedra({ cafedra_code, ...payload });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    const c = cafedra as any;

    return (
        <div className="space-y-6">
            <CafedraForm initialValue={cafedra} submitLabel="Yenilə" isEdit onSubmit={handleSubmit} />

            {cafedra_code && cafedra && (
                <div className="space-y-6 p-5 sm:p-6 pt-0">
                    <SubEntityManager
                        title="İşçilər"
                        description="Kafedra işçilərini ayrıca əlavə edin, redaktə edin və silin."
                        items={(c.workers ?? []) as any[]}
                        getId={(w) => w.id}
                        getName={(w) => `${w.first_name} ${w.last_name}`}
                        getSubtitle={(w) => w.az?.duty ?? ""}
                        getImage={(w) => w.profile_image}
                        toFormValue={personToForm}
                        onCreate={(v) => createCafedraWorker(cafedra_code, v)}
                        onUpdate={(id, v) => updateCafedraWorker(id, v)}
                        onDelete={(id) => deleteCafedraWorker(id)}
                        onUploadImage={(id, file) => uploadCafedraWorkerImage(id, file)}
                        onChanged={loadCafedra}
                    />

                    <SubEntityManager
                        title="Müavinlər"
                        description="Kafedra müdir müavinlərini ayrıca idarə edin."
                        items={(c.deputy_directors ?? []) as any[]}
                        getId={(d) => d.id}
                        getName={(d) => `${d.first_name} ${d.last_name}`}
                        getSubtitle={(d) => d.az?.duty ?? ""}
                        getImage={(d) => d.profile_image}
                        toFormValue={personToForm}
                        onCreate={(v) => createCafedraDeputyDirector(cafedra_code, v)}
                        onUpdate={(id, v) => updateCafedraDeputyDirector(id, v)}
                        onDelete={(id) => deleteCafedraDeputyDirector(id)}
                        onUploadImage={(id, file) => uploadCafedraDeputyDirectorImage(id, file)}
                        onChanged={loadCafedra}
                    />

                    <SubEntityManager
                        title="Elmi Şura Üzvləri"
                        description="Elmi şura üzvlərini ayrıca idarə edin."
                        items={(c.scientific_council ?? []) as any[]}
                        getId={(m) => m.id}
                        getName={(m) => `${m.first_name} ${m.last_name}`}
                        getSubtitle={(m) => m.az?.duty ?? ""}
                        showImage={false}
                        toFormValue={personToForm}
                        onCreate={(v) => createCafedraScientificCouncilMember(cafedra_code, v)}
                        onUpdate={(id, v) => updateCafedraScientificCouncilMember(id, v)}
                        onDelete={(id) => deleteCafedraScientificCouncilMember(id)}
                        onChanged={loadCafedra}
                    />

                    <LaboratoryManager
                        cafedraCode={cafedra_code}
                        laboratories={(c.laboratories ?? []) as any[]}
                        onChanged={loadCafedra}
                    />
                </div>
            )}
        </div>
    );
}

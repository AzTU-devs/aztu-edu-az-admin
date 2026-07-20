import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import CafedraFormShell from "./form/CafedraFormShell";
import {
    getCafedraDetails,
    updateCafedra,
    CafedraDetail,
    CreateCafedraPayload,
} from "../../services/cafedra/cafedraService";

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

    return (
        <CafedraFormShell
            initialValue={cafedra}
            submitLabel="Yenilə"
            isEdit
            onSubmit={handleSubmit}
            onChanged={loadCafedra}
        />
    );
}

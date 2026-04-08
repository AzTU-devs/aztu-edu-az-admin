import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import CafedraForm from "./CafedraForm";
import { getCafedraDetails, updateCafedra, CafedraDetail, CreateCafedraPayload } from "../../services/cafedra/cafedraService";

export default function CafedraDetails() {
    const { cafedra_code } = useParams();

    const [cafedra, setCafedra] = useState<CafedraDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!cafedra_code) {
            setError("Kafedra kodu müəyyən edilmədi");
            setLoading(false);
            return;
        }

        setLoading(true);
        getCafedraDetails(cafedra_code)
            .then((res) => {
                if (res && typeof res === "object" && "cafedra_code" in res) {
                    setCafedra(res as CafedraDetail);
                } else if (res === "NOT FOUND") {
                    setError("Kafedra tapılmadı");
                } else {
                    setError("Kafedra yüklənərkən xəta baş verdi");
                }
            })
            .catch((err) => {
                console.error("CafedraDetails load error", err);
                setError("Kafedra yüklənərkən xəta baş verdi");
            })
            .finally(() => setLoading(false));
    }, [cafedra_code]);

    const handleSubmit = async (payload: CreateCafedraPayload) => {
        if (!cafedra_code) {
            return { status: "ERROR" };
        }

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

    return <CafedraForm initialValue={cafedra} submitLabel="Yenilə" onSubmit={handleSubmit} />;
}

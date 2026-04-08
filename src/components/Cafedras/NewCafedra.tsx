import CafedraForm from "./CafedraForm";
import { createCafedra, CreateCafedraPayload } from "../../services/cafedra/cafedraService";

export default function NewCafedra() {
    const handleSubmit = async (payload: CreateCafedraPayload) => {
        return await createCafedra(payload);
    };

    return <CafedraForm submitLabel="Yadda saxla" onSubmit={handleSubmit} />;
}

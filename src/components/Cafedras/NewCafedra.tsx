import CafedraFormShell from "./form/CafedraFormShell";
import { createCafedra, CreateCafedraPayload } from "../../services/cafedra/cafedraService";

export default function NewCafedra() {
    const handleSubmit = async (payload: CreateCafedraPayload) => {
        return await createCafedra(payload);
    };

    return <CafedraFormShell submitLabel="Yadda saxla" onSubmit={handleSubmit} />;
}

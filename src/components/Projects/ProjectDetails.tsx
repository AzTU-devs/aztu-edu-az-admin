import Label from "../form/Label";
import Editor from "../editor/Editor";
import Button from "../ui/button/Button";
import { useEffect, useState } from "react";
import Input from "../form/input/InputField";
import { useParams } from "react-router-dom";
import DropzoneComponent from "../form/form-elements/DropZone";
import { getProjectDetails, Project } from "../../services/project/projectService";

export default function ProjectDetails() {
    const lang = "az";
    const { project_id } = useParams<{ project_id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getProjectDetails(project_id ? project_id : "", lang)
            .then((res) => {
                if (typeof res === "object") {
                    setProject(res);
                } else {
                    setProject(null);
                }
            })
            .finally(() => setLoading(false));
    }, [project_id]);

    console.log(project);

    return (
        <div className="p-5 space-y-6">
            <Label className="text-[17px]">
                Layihə şəkli
            </Label>
            {loading ? (
                <div className="h-6 w-48 bg-gray-300 animate-pulse rounded"></div>
            ) : (
                <img src={`http://localhost:8000/${project?.bg_image}`} alt="test" className="w-[300px] h-[300px] border-1 border-gray-200 rounded-[20px]" draggable={false} />
            )}
            {/* <DropzoneComponent onFileSelect={setSelectedFile} /> */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- AZ --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">
                        Başlıq
                    </Label>
                    {loading ? (
                        <div className="h-8 w-full bg-gray-300 animate-pulse rounded"></div>
                    ) : (
                        <Input placeholder="Başlıq" value={project?.title || ""} />
                    )}
                </div>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">
                        Təsvir
                    </Label>
                    {loading ? (
                        <div className="h-8 w-full bg-gray-300 animate-pulse rounded"></div>
                    ) : (
                        <Input placeholder="Təsvir" value={project?.desc || ""} />
                    )}
                </div>
                {loading ? (
                    <div className="h-24 w-full bg-gray-300 animate-pulse rounded"></div>
                ) : (
                    <Editor readOnlyContent={project?.html_content || ""} />
                )}
            </div>
            <Button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
                Edit
            </Button>
        </div>
    );
}
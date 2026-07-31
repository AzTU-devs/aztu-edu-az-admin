import { useRef, useState } from "react";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";
import {
    createHeroCertificate,
    CreateHeroCertificatePayload,
    FAMILY_OPTIONS,
} from "../../services/heroCertificate/heroCertificateService";

const selectClass =
    "block w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40";

const fileInputClass =
    "text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-500 file:text-white hover:file:bg-brand-600 cursor-pointer";

// Mirrors the API's ALLOWED_IMAGE_MIMES. `image/*` would let the picker offer
// SVG and iPhone HEIC, both of which the server rejects — better to filter them
// out in the file dialog than to fail the upload afterwards.
const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

const DOCUMENT_ACCEPT =
    ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default function NewHeroCertificate() {
    const navigate = useNavigate();

    const imageInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);

    // Section 1 — certificate source (at least one of the three is required)
    const [image, setImage] = useState<File | null>(null);
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [externalUrl, setExternalUrl] = useState("");

    // Section 2 — details
    const [rankLabel, setRankLabel] = useState("");
    const [family, setFamily] = useState("");
    const [issuedDate, setIssuedDate] = useState("");

    // Sections 3 & 4 — translations
    const [azTitle, setAzTitle] = useState("");
    const [azKicker, setAzKicker] = useState("");
    const [azSigner, setAzSigner] = useState("");
    const [enTitle, setEnTitle] = useState("");
    const [enKicker, setEnKicker] = useState("");
    const [enSigner, setEnSigner] = useState("");

    const [loading, setLoading] = useState(false);
    const [sourceError, setSourceError] = useState<string | null>(null);

    const hasSource = image !== null || documentFile !== null || externalUrl.trim() !== "";

    const isFormValid =
        hasSource &&
        rankLabel.trim() !== "" &&
        family !== "" &&
        azTitle.trim() !== "" &&
        enTitle.trim() !== "";

    const clearImage = () => {
        setImage(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    const clearDocument = () => {
        setDocumentFile(null);
        if (documentInputRef.current) documentInputRef.current.value = "";
    };

    const handleSubmit = async () => {
        if (!hasSource) {
            setSourceError("Şəkil, sənəd və ya xarici keçid — ən azı biri mütləq doldurulmalıdır");
            return;
        }
        setSourceError(null);

        setLoading(true);
        const payload: CreateHeroCertificatePayload = {
            rank_label: rankLabel.trim(),
            family,
            issued_date: issuedDate.trim() || undefined,
            external_url: externalUrl.trim() || undefined,
            image: image || undefined,
            document: documentFile || undefined,
            az_title: azTitle.trim(),
            en_title: enTitle.trim(),
            az_kicker: azKicker.trim() || undefined,
            en_kicker: enKicker.trim() || undefined,
            az_signer: azSigner.trim() || undefined,
            en_signer: enSigner.trim() || undefined,
        };

        const result = await createHeroCertificate(payload);
        setLoading(false);

        if (result === "SUCCESS") {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: "Sertifikat uğurla əlavə edildi!",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                navigate("/hero-certificates");
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Xəta",
                text: "Sertifikat əlavə edərkən xəta baş verdi",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    return (
        <div className="p-5 sm:p-6 space-y-5">
            {/* Certificate source */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sertifikat mənbəyi</span>
                    <span className="ml-auto text-[11px] text-red-500 font-medium">Məcburi</span>
                </div>
                <div className="p-5 space-y-5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-2">
                        Aşağıdakılardan <span className="font-semibold">ən azı biri</span> doldurulmalıdır: şəkil, sənəd və ya xarici keçid.
                        Ana səhifədə birbaşa göstərilən yalnız <span className="font-semibold">şəkil</span>dir.
                    </p>

                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                            Şəkil (ana səhifədə göstərilir)
                        </Label>
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept={IMAGE_ACCEPT}
                            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                            className={fileInputClass}
                        />
                        {image && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-blue-500 font-medium">
                                <span>Seçilmiş fayl: {image.name}</span>
                                <button type="button" onClick={clearImage} className="text-sm text-red-500 underline hover:text-red-700">
                                    Sil
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                            Sənəd (PDF / DOC)
                        </Label>
                        <input
                            ref={documentInputRef}
                            type="file"
                            accept={DOCUMENT_ACCEPT}
                            onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
                            className={fileInputClass}
                        />
                        {documentFile && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-blue-500 font-medium">
                                <span>Seçilmiş fayl: {documentFile.name}</span>
                                <button type="button" onClick={clearDocument} className="text-sm text-red-500 underline hover:text-red-700">
                                    Sil
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                            Xarici keçid
                        </Label>
                        <Input
                            placeholder="https://..."
                            value={externalUrl}
                            onChange={(e) => {
                                setExternalUrl(e.target.value);
                                if (sourceError) setSourceError(null);
                            }}
                        />
                    </div>

                    {sourceError && (
                        <p className="text-xs font-medium text-red-500">{sourceError}</p>
                    )}
                </div>
            </div>

            {/* Details */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Məlumatlar</span>
                    <span className="ml-auto text-[11px] text-red-500 font-medium">Məcburi</span>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                            Reytinq göstəricisi
                        </Label>
                        <Input
                            placeholder="=30 və ya 801-850"
                            value={rankLabel}
                            onChange={(e) => setRankLabel(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                            Kateqoriya
                        </Label>
                        <select className={selectClass} value={family} onChange={(e) => setFamily(e.target.value)}>
                            <option value="">— Seçilməyib —</option>
                            {FAMILY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                            Sertifikat tarixi
                        </Label>
                        <Input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* AZ section */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide">AZ</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Azərbaycan dili</span>
                    <span className="ml-auto text-[11px] text-red-500 font-medium">Məcburi</span>
                </div>
                <div className="p-5 space-y-5">
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Başlıq</Label>
                        <Input placeholder="QS Avropa 2026: Qərbi Asiya" value={azTitle} onChange={(e) => setAzTitle(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Üst yazı</Label>
                        <Input placeholder="AVROPA 2026 — QƏRBİ ASİYA" value={azKicker} onChange={(e) => setAzKicker(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">İmzalayan</Label>
                        <Input placeholder="Ben Sowter — Baş vitse-prezident" value={azSigner} onChange={(e) => setAzSigner(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* EN section */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide">EN</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">English</span>
                    <span className="ml-auto text-[11px] text-red-500 font-medium">Required</span>
                </div>
                <div className="p-5 space-y-5">
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Title</Label>
                        <Input placeholder="QS Europe 2026: Western Asia" value={enTitle} onChange={(e) => setEnTitle(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Kicker</Label>
                        <Input placeholder="EUROPE 2026 — WESTERN ASIA" value={enKicker} onChange={(e) => setEnKicker(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Signer</Label>
                        <Input placeholder="Ben Sowter — Senior Vice President" value={enSigner} onChange={(e) => setEnSigner(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
                <Button
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={loading || !isFormValid}
                >
                    {loading ? "Yadda saxlanılır..." : "Yadda saxla"}
                </Button>
            </div>
        </div>
    );
}

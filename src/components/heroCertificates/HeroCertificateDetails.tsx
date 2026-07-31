import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { API_BASE_URL } from "../../util/apiClient";
import {
    getHeroCertificateDetail,
    updateHeroCertificate,
    FAMILY_OPTIONS,
    ISSUER_OPTIONS,
    HeroCertificateDetail,
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

/** Stored paths are relative to the API host; absolute URLs are passed through. */
function resolveFileUrl(path?: string | null): string {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export default function HeroCertificateDetails() {
    const { certificate_id } = useParams<{ certificate_id: string }>();
    const navigate = useNavigate();

    const [certificate, setCertificate] = useState<HeroCertificateDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!certificate_id) return;
        setLoading(true);
        getHeroCertificateDetail(Number(certificate_id))
            .then((res) => {
                if (res === "NOT FOUND") {
                    setError("Sertifikat tapılmadı");
                } else if (res === "ERROR") {
                    setError("Sertifikat yüklənərkən xəta baş verdi");
                } else {
                    setCertificate(res);
                }
            })
            .finally(() => setLoading(false));
    }, [certificate_id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <CircularProgress />
            </div>
        );
    }

    if (error || !certificate) {
        return <div className="text-center text-red-500 py-10">{error ?? "Sertifikat tapılmadı"}</div>;
    }

    // The form is only mounted once the loaded record is in hand, so its
    // initial state can be seeded straight from the fetched certificate.
    return <HeroCertificateEditForm certificate={certificate} navigate={navigate} />;
}

interface EditFormProps {
    certificate: HeroCertificateDetail;
    navigate: ReturnType<typeof useNavigate>;
}

function HeroCertificateEditForm({ certificate, navigate }: EditFormProps) {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);

    // Section 1 — certificate source
    const [image, setImage] = useState<File | null>(null);
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [removeDocument, setRemoveDocument] = useState(false);
    const [externalUrl, setExternalUrl] = useState(certificate.external_url ?? "");

    // Section 2 — details. A record saved before the issuer column existed comes
    // back without the key, and that has always meant QS.
    const [issuer, setIssuer] = useState(certificate.issuer === "aqas" ? "aqas" : "qs");
    const [rankLabel, setRankLabel] = useState(certificate.rank_label ?? "");
    const [family, setFamily] = useState(certificate.family ?? "");
    const [issuedDate, setIssuedDate] = useState(certificate.issued_date ?? "");

    // Sections 3 & 4 — translations
    const [azTitle, setAzTitle] = useState(certificate.az?.title ?? "");
    const [azKicker, setAzKicker] = useState(certificate.az?.kicker ?? "");
    const [azSigner, setAzSigner] = useState(certificate.az?.signer ?? "");
    const [enTitle, setEnTitle] = useState(certificate.en?.title ?? "");
    const [enKicker, setEnKicker] = useState(certificate.en?.kicker ?? "");
    const [enSigner, setEnSigner] = useState(certificate.en?.signer ?? "");

    const [saving, setSaving] = useState(false);
    const [sourceError, setSourceError] = useState<string | null>(null);

    const keepsStoredImage = Boolean(certificate.image) && !removeImage;
    const keepsStoredDocument = Boolean(certificate.document) && !removeDocument;

    const hasSource =
        image !== null ||
        documentFile !== null ||
        keepsStoredImage ||
        keepsStoredDocument ||
        externalUrl.trim() !== "";

    // AQAS accredits programmes rather than ranking them, so it carries no rank
    // and no family. Every issuer test asks "is it AQAS?" so that anything else
    // keeps the original QS behaviour.
    const isAqas = issuer === "aqas";

    // Switching a stored QS record to AQAS does not just hide the two QS-only
    // fields, it empties them, so the rank that came back from the API cannot
    // survive in state behind the hidden inputs and be re-submitted.
    const changeIssuer = (next: string) => {
        setIssuer(next);
        if (next === "aqas") {
            setRankLabel("");
            setFamily("");
        }
    };

    // Mirrors the server matrix exactly, so the editor never sees a raw 422.
    const isFormValid =
        hasSource &&
        (isAqas || (rankLabel.trim() !== "" && family !== "")) &&
        azTitle.trim() !== "" &&
        enTitle.trim() !== "";

    const clearNewImage = () => {
        setImage(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    const clearNewDocument = () => {
        setDocumentFile(null);
        if (documentInputRef.current) documentInputRef.current.value = "";
    };

    const handleSave = async () => {
        if (!hasSource) {
            setSourceError("Şəkil, sənəd və ya xarici keçid — ən azı biri mütləq olmalıdır");
            return;
        }
        setSourceError(null);

        setSaving(true);
        const result = await updateHeroCertificate({
            certificate_id: certificate.certificate_id,
            issuer,
            // Flipping QS -> AQAS has to clear the stored rank and family, so
            // they are dropped from the payload rather than sent stale.
            rank_label: isAqas ? undefined : rankLabel.trim(),
            family: isAqas ? undefined : family,
            issued_date: issuedDate.trim() || undefined,
            external_url: externalUrl.trim() || undefined,
            // Uploads are sent only when the user picked a new file; otherwise
            // the stored file is kept unless explicitly removed.
            image: image || undefined,
            document: documentFile || undefined,
            remove_image: removeImage && !image ? true : undefined,
            remove_document: removeDocument && !documentFile ? true : undefined,
            az_title: azTitle.trim(),
            en_title: enTitle.trim(),
            az_kicker: azKicker.trim() || undefined,
            en_kicker: enKicker.trim() || undefined,
            az_signer: azSigner.trim() || undefined,
            en_signer: enSigner.trim() || undefined,
        });
        setSaving(false);

        if (result === "SUCCESS") {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: "Sertifikat uğurla yeniləndi!",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => navigate("/hero-certificates"));
        } else if (result === "NOT FOUND") {
            Swal.fire({ icon: "error", title: "Xəta", text: "Sertifikat tapılmadı", timer: 2000, showConfirmButton: false });
        } else {
            Swal.fire({ icon: "error", title: "Xəta", text: "Sertifikat yenilənərkən xəta baş verdi", timer: 2000, showConfirmButton: false });
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
                    <p className="text-xs rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-2">
                        Aşağıdakılardan <span className="font-semibold">ən azı biri</span> qalmalıdır: şəkil, sənəd və ya xarici keçid.
                        Ana səhifədə birbaşa göstərilən yalnız <span className="font-semibold">şəkil</span>dir.
                    </p>

                    {/* Image */}
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                            Şəkil (ana səhifədə göstərilir)
                        </Label>

                        {certificate.image && !removeImage && (
                            <div className="mb-3 flex items-center gap-3">
                                <img
                                    src={resolveFileUrl(certificate.image)}
                                    alt={certificate.az?.title ?? "Sertifikat"}
                                    className="h-20 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setRemoveImage(true)}
                                    className="text-sm text-red-500 underline hover:text-red-700"
                                >
                                    Mövcud şəkli sil
                                </button>
                            </div>
                        )}

                        {certificate.image && removeImage && (
                            <div className="mb-3 flex items-center gap-3 text-sm text-red-500">
                                <span>Mövcud şəkil yadda saxlanılarkən silinəcək</span>
                                <button
                                    type="button"
                                    onClick={() => setRemoveImage(false)}
                                    className="text-sm text-gray-500 underline hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    Ləğv et
                                </button>
                            </div>
                        )}

                        <input
                            ref={imageInputRef}
                            type="file"
                            accept={IMAGE_ACCEPT}
                            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                            className={fileInputClass}
                        />
                        {image && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-blue-500 font-medium">
                                <span>Yeni fayl: {image.name}</span>
                                <button type="button" onClick={clearNewImage} className="text-sm text-red-500 underline hover:text-red-700">
                                    Sil
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Document */}
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                            Sənəd (PDF / DOC)
                        </Label>

                        {certificate.document && !removeDocument && (
                            <div className="mb-3 flex items-center gap-3">
                                <a
                                    href={resolveFileUrl(certificate.document)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-brand-500 underline hover:text-brand-600 break-all"
                                >
                                    Mövcud sənədə bax
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setRemoveDocument(true)}
                                    className="text-sm text-red-500 underline hover:text-red-700"
                                >
                                    Sil
                                </button>
                            </div>
                        )}

                        {certificate.document && removeDocument && (
                            <div className="mb-3 flex items-center gap-3 text-sm text-red-500">
                                <span>Mövcud sənəd yadda saxlanılarkən silinəcək</span>
                                <button
                                    type="button"
                                    onClick={() => setRemoveDocument(false)}
                                    className="text-sm text-gray-500 underline hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    Ləğv et
                                </button>
                            </div>
                        )}

                        <input
                            ref={documentInputRef}
                            type="file"
                            accept={DOCUMENT_ACCEPT}
                            onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
                            className={fileInputClass}
                        />
                        {documentFile && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-blue-500 font-medium">
                                <span>Yeni fayl: {documentFile.name}</span>
                                <button type="button" onClick={clearNewDocument} className="text-sm text-red-500 underline hover:text-red-700">
                                    Sil
                                </button>
                            </div>
                        )}
                    </div>

                    {/* External URL */}
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

                    {sourceError && <p className="text-xs font-medium text-red-500">{sourceError}</p>}
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
                <div className="p-5 space-y-5">
                    {isAqas && (
                        <p className="text-xs rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 px-3 py-2">
                            AQAS proqram akkreditasiyası verir, reytinq deyil — buna görə
                            <span className="font-semibold"> reytinq göstəricisi</span> və
                            <span className="font-semibold"> kateqoriya</span> doldurulmur.
                            Ana səhifədə əsas mətn kimi <span className="font-semibold">proqramın adı</span> göstərilir.
                        </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                Sertifikatı verən
                            </Label>
                            <select className={selectClass} value={issuer} onChange={(e) => changeIssuer(e.target.value)}>
                                {ISSUER_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {!isAqas && (
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                    Reytinq göstəricisi
                                </Label>
                                <Input placeholder="=30 və ya 801-850" value={rankLabel} onChange={(e) => setRankLabel(e.target.value)} />
                            </div>
                        )}

                        {!isAqas && (
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
                        )}

                        <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                Sertifikat tarixi
                            </Label>
                            <Input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} />
                        </div>
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
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                            {isAqas ? "Proqramın adı" : "Başlıq"}
                        </Label>
                        <Input
                            placeholder={isAqas ? "Process Automation Engineering (MA)" : "QS Avropa 2026: Qərbi Asiya"}
                            value={azTitle}
                            onChange={(e) => setAzTitle(e.target.value)}
                        />
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
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                            {isAqas ? "Programme name" : "Title"}
                        </Label>
                        <Input
                            placeholder={isAqas ? "Process Automation Engineering (MA)" : "QS Europe 2026: Western Asia"}
                            value={enTitle}
                            onChange={(e) => setEnTitle(e.target.value)}
                        />
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
                    onClick={handleSave}
                    disabled={saving || !isFormValid}
                >
                    {saving ? "Yadda saxlanılır..." : "Yadda saxla"}
                </Button>
            </div>
        </div>
    );
}

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Label from "../../../form/Label";
import Editor from "../../../editor/Editor";
import { fieldLabel } from "../formStyles";

interface RichTextFieldProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  /** Bump whenever the underlying value is replaced from outside (language
   *  switch, refetch, modal reopen). `Editor` reads `initialContent` once at
   *  mount, so the only way to re-seed it is to remount it. */
  remountKey?: string | number;
  placeholder?: string;
  /** Mount the editor immediately instead of behind the click-to-edit preview. */
  eager?: boolean;
}

const isEmptyHtml = (html: string) => {
  const stripped = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return stripped === "";
};

export default function RichTextField({
  value,
  onChange,
  label,
  remountKey = 0,
  placeholder = "Mətn əlavə etmək üçün klikləyin",
  eager = false,
}: RichTextFieldProps) {
  const id = useId();
  const [active, setActive] = useState(eager);

  // `Editor` re-invokes onUpdate on every keystroke; an inline arrow would give
  // it a new identity each render and defeat the memoised toolbar.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const handleUpdate = useCallback((html: string) => onChangeRef.current(html), []);

  // A new remountKey means the value was replaced from outside: collapse back to
  // the preview so the next mount reads the fresh content.
  useEffect(() => {
    if (!eager) setActive(false);
  }, [remountKey, eager]);

  return (
    <div>
      {label ? <Label className={fieldLabel}>{label}</Label> : null}
      {active ? (
        <Editor key={`${id}-${remountKey}`} initialContent={value} onUpdate={handleUpdate} />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="w-full min-h-[88px] rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:border-brand-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          {isEmptyHtml(value ?? "") ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <span
              className="prose prose-sm dark:prose-invert max-w-none line-clamp-6"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          )}
        </button>
      )}
    </div>
  );
}

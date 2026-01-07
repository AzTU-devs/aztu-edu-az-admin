import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CodeBlock from '@tiptap/extension-code-block';
import Heading from '@tiptap/extension-heading';
import React, { useState, useEffect } from 'react';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink, FaImage, FaCode, FaTable, FaEye, FaTimes } from 'react-icons/fa';

const MenuBar = ({ editor, onPreview, onAddLink, onAddEmail }: { editor: any; onPreview: () => void; onAddLink: () => void; onAddEmail: () => void }) => {
    if (!editor) return null;

    const addImage = () => {
        const url = prompt('Enter image URL');
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run();
    };

    const buttonClass = (active: boolean) =>
        `p-2 rounded-lg ${active ? 'bg-yellow-300 dark:bg-yellow-500' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} transition-all`;

    return (
        <div className="flex flex-wrap gap-2 mb-4 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClass(editor.isActive('bold'))}><FaBold /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClass(editor.isActive('italic'))}><FaItalic /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={buttonClass(editor.isActive('underline'))}><FaUnderline /></button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClass(editor.isActive('bulletList'))}><FaListUl /></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonClass(editor.isActive('orderedList'))}><FaListOl /></button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={buttonClass(editor.isActive('heading', { level: 1 }))}>H1</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass(editor.isActive('heading', { level: 2 }))}>H2</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={buttonClass(editor.isActive('heading', { level: 3 }))}>H3</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={buttonClass(editor.isActive('heading', { level: 4 }))}>H4</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} className={buttonClass(editor.isActive('heading', { level: 5 }))}>H5</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} className={buttonClass(editor.isActive('heading', { level: 6 }))}>H6</button>
            <button onClick={onAddLink} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"><FaLink /></button>
            <button onClick={onAddEmail} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">📧</button>
            <button onClick={addImage} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"><FaImage /></button>
            <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"><FaCode /></button>
            <button onClick={addTable} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"><FaTable /></button>
            <button onClick={() => editor.chain().focus().undo().run()} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Undo</button>
            <button onClick={() => editor.chain().focus().redo().run()} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Redo</button>
            <button onClick={onPreview} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"><FaEye /></button>
        </div>
    );
};

interface EditorProps {
    onUpdate?: (html: string) => void;
    initialContent?: string;
    readOnlyContent?: string;
}

const Editor: React.FC<EditorProps> = ({ onUpdate, initialContent, readOnlyContent }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
            }),
            Underline,
            Link,
            Image,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            CodeBlock,
            Heading.configure({
                levels: [1, 2, 3, 4, 5, 6],
                HTMLAttributes: {
                    style: 'font-weight: bold;',
                },
            }),
        ],
        content: readOnlyContent ?? initialContent ?? '<p>Mətni daxil edin...</p>',
        editorProps: {
            attributes: {
                spellcheck: 'true',
            },
        },
        editable: readOnlyContent ? false : true,
    });

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkValue, setLinkValue] = useState('');
    const [linkType, setLinkType] = useState<'url' | 'email'>('url');

    useEffect(() => {
        if (!editor || !onUpdate) return;
        const updateHandler = () => {
            onUpdate(editor.getHTML());
        };
        editor.on('update', updateHandler);
        return () => {
            editor.off('update', updateHandler);
        };
    }, [editor, onUpdate]);

    useEffect(() => {
        if (editor && readOnlyContent !== undefined) {
            editor.commands.setContent(readOnlyContent);
        }
    }, [editor, readOnlyContent]);

    const openLinkModal = (type: 'url' | 'email') => {
        setLinkType(type);
        setLinkValue('');
        setShowLinkModal(true);
    };

    const confirmLink = () => {
        if (!editor) return;
        if (linkValue.trim() === '') {
            setShowLinkModal(false);
            return;
        }
        if (linkType === 'url') {
            editor.chain().focus().extendMarkRange('link').setLink({ href: linkValue }).run();
        } else if (linkType === 'email') {
            editor.chain().focus().extendMarkRange('link').setLink({ href: `mailto:${linkValue}` }).run();
        }
        setShowLinkModal(false);
    };

    const cancelLink = () => {
        setShowLinkModal(false);
    };

    return (
        <div className="w-[100%] p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md border-1 border-gray-100 flex flex-col text-gray-900 dark:text-gray-100">
            <MenuBar editor={editor} onPreview={() => setIsPreviewOpen(true)} onAddLink={() => openLinkModal('url')} onAddEmail={() => openLinkModal('email')} />
            <div
                className="flex-grow min-h-full"
                onClick={() => editor?.chain().focus().run()}
                style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}
            >
                <EditorContent
                    editor={editor}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 flex-grow prose dark:prose-invert"
                    style={{
                        outline: 'none',
                        '--tw-prose-ul-marker': 'disc',
                        '--tw-prose-ol-counter-style': 'decimal',
                        minHeight: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                    } as any}
                />
            </div>
            {isPreviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/70 dark:bg-gray-900/70">
                    <div className="bg-white/90 dark:bg-gray-800 rounded-xl p-6 w-11/12 max-w-3xl relative border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setIsPreviewOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            <FaTimes />
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Preview Content</h2>
                        <div
                            className="prose max-h-[70vh] overflow-auto dark:prose-invert"
                            style={{
                                '--tw-prose-ul-marker': 'disc',
                                '--tw-prose-ol-counter-style': 'decimal',
                                borderCollapse: 'collapse',
                            } as any}
                            dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
                        />
                    </div>
                </div>
            )}
            {showLinkModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm bg-black/40">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full shadow-lg border border-gray-300 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4">{linkType === 'url' ? 'Enter URL' : 'Enter Email Address'}</h3>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder={linkType === 'url' ? 'https://example.com' : 'email@example.com'}
                            value={linkValue}
                            onChange={(e) => setLinkValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    confirmLink();
                                } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    cancelLink();
                                }
                            }}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={cancelLink}
                                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmLink}
                                className="px-4 py-2 rounded-md bg-yellow-400 dark:bg-yellow-500 hover:bg-yellow-500 dark:hover:bg-yellow-600 transition text-white"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
        .ProseMirror ul, .prose ul { list-style-type: disc; padding-left: 1.5rem; }
        .ProseMirror ol, .prose ol { list-style-type: decimal; padding-left: 1.5rem; }
        .ProseMirror table, .prose table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .ProseMirror th, .ProseMirror td, .prose th, .prose td { border: 1px solid #d1d5db; padding: 0.5rem; text-align: left; }
        .ProseMirror th, .prose th { background-color: #f9fafb; }
        @media (prefers-color-scheme: dark) {
          .ProseMirror th, .prose th { background-color: #1f2937; }
          .ProseMirror th, .ProseMirror td, .prose th, .prose td { border-color: #374151; }
        }
      `}</style>
        </div>
    );
};

export default Editor;
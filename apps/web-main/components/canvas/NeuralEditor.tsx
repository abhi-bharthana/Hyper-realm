'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface Props {
  initialContent: string;
  onChange: (content: string) => void;
  isLight: boolean;
  onEditorReady?: (editor: any) => void; // 🚀 Named Pipeline Callback
}

export function NeuralEditor({ initialContent, onChange, isLight, onEditorReady }: Props) {
  const editor = useEditor({
    immediatelyRender: false, // NextJS SSR Sync
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Write your neural thoughts here...',
        emptyEditorClass: 'cursor-text before:content-[attr(data-placeholder)] before:absolute before:opacity-30 before:pointer-events-none before:font-medium',
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: [
          'prose prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none min-h-full pb-32 transition-all',
          isLight 
            ? 'prose-slate prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-primary' 
            : 'prose-invert prose-headings:text-white prose-p:text-zinc-400 prose-a:text-primary',
          'prose-headings:font-black prose-headings:tracking-tight',
          'prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl',
          'prose-code:font-mono prose-code:bg-primary/10 prose-code:text-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none',
          'prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic'
        ].join(' ').replace(/\s+/g, ' ').trim(),
      },
    },
  });

  // 🚀 Pass the instance up to CanvasEditor as soon as Tiptap mounts
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (editor && initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        editor.commands.setContent(parsed, false);
      } catch (e) {
        editor.commands.setContent(initialContent, false);
      }
    } else if (editor && !initialContent) {
      editor.commands.setContent('', false);
    }
  }, [initialContent, editor]);

  if (!editor) return null;

  return (
    <div className="w-full h-full px-4 md:px-8 pt-4">
      <EditorContent editor={editor} className="w-full h-full" />
    </div>
  );
}
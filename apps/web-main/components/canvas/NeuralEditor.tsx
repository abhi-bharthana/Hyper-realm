"use client";

// 🚀 FIX: Wapas Standard Import laga diya hai
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import { 
  Bold, Italic, Strikethrough, Code, 
  Heading1, Heading2, List, Quote, Plus
} from 'lucide-react';

interface Props {
  initialContent: string;
  onChange: (content: string) => void;
  isLight: boolean;
}

export function NeuralEditor({ initialContent, onChange, isLight }: Props) {
  const editor = useEditor({
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
        class: `prose prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none min-h-full pb-32 transition-all
          ${isLight 
            ? 'prose-slate prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-primary' 
            : 'prose-invert prose-headings:text-white prose-p:text-zinc-400 prose-a:text-primary'}
          prose-headings:font-black prose-headings:tracking-tight
          prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl
          prose-code:font-mono prose-code:bg-primary/10 prose-code:text-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
          prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
        `,
      },
    },
  });

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

  if (!editor) {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      
      {/* 🚀 BUBBLE MENU */}
      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 200, animation: 'shift-away' }}
          className={`flex items-center gap-1 p-1.5 rounded-2xl backdrop-blur-2xl border shadow-2xl transition-all
            ${isLight ? 'bg-white/90 border-slate-200 shadow-slate-200/50' : 'bg-[#1a1a1a]/90 border-white/10 shadow-black/50'}`}
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-xl transition-all ${editor.isActive('bold') ? 'bg-primary text-primary-foreground' : (isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-zinc-300')}`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-xl transition-all ${editor.isActive('italic') ? 'bg-primary text-primary-foreground' : (isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-zinc-300')}`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded-xl transition-all ${editor.isActive('strike') ? 'bg-primary text-primary-foreground' : (isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-zinc-300')}`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <div className={`w-[1px] h-5 mx-1 ${isLight ? 'bg-slate-300' : 'bg-white/20'}`}></div>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded-xl transition-all ${editor.isActive('code') ? 'bg-primary text-primary-foreground' : (isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-zinc-300')}`}
          >
            <Code className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )}

      {/* 🚀 FLOATING MENU */}
      {editor && (
        <FloatingMenu 
          editor={editor} 
          tippyOptions={{ duration: 200, placement: 'left' }}
          className={`flex items-center gap-1 p-1 rounded-2xl backdrop-blur-2xl border shadow-xl transition-all -ml-12
            ${isLight ? 'bg-white/90 border-slate-200' : 'bg-[#1a1a1a]/90 border-white/10'}`}
        >
          <div className={`p-1.5 shrink-0 opacity-50 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
            <Plus className="w-4 h-4" />
          </div>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-xl transition-all text-xs font-black ${editor.isActive('heading', { level: 1 }) ? 'bg-primary text-primary-foreground' : (isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-zinc-300')}`}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-xl transition-all text-xs font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground' : (isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-zinc-300')}`}
          >
            H2
          </button>
          <div className={`w-[1px] h-4 mx-0.5 ${isLight ? 'bg-slate-300' : 'bg-white/20'}`}></div>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-xl transition-all ${editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : (isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-zinc-300')}`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-xl transition-all ${editor.isActive('blockquote') ? 'bg-primary text-primary-foreground' : (isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-zinc-300')}`}
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        </FloatingMenu>
      )}

      {/* 🚀 ACTUAL EDITOR CONTENT AREA */}
      <div className="w-full h-full px-4 md:px-8 pt-4">
        <EditorContent editor={editor} className="w-full h-full" />
      </div>
      
    </div>
  );
}
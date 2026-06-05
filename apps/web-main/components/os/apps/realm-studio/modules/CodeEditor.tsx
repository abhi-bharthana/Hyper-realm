import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  activeFile: string;
  code: string;
  onChange: (value: string | undefined) => void;
  onSave: () => void; // 🚀 NAYA: Save handler
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ activeFile, code, onChange, onSave }) => {
  const editorRef = useRef<any>(null);

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('hyper-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'function', foreground: '50fa7b' },
      ],
      colors: {
        'editor.background': '#0d0d12',
        'editor.lineHighlightBackground': '#ffffff0a',
        'editorLineNumber.foreground': '#44475a',
        'editorSuggestWidget.background': '#1e1e2e',
      }
    });
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // 🚀 GOD-LEVEL: Bind Ctrl+S / Cmd+S natively inside Monaco!
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave(); 
    });
  };

  return (
    <div className="flex-1 relative bg-[#0d0d12] min-h-0">
      <Editor
        height="100%"
        width="100%"
        language={activeFile.endsWith('.json') ? 'json' : 'typescript'}
        theme="hyper-dark"
        value={code}
        onChange={onChange}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 14,
          minimap: { enabled: false },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          wordWrap: "on",
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          fontLigatures: true,
        }}
      />
    </div>
  );
};
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { executeCode } from '../api/piston';
import toast from 'react-hot-toast';
import { Play, RotateCcw, ChevronDown, X } from 'lucide-react';

export default function CodeEditorPanel({ onClose, onSubmit }) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('# Write your Python code here\n');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (newLang === 'python') {
      setCode('# Write your Python code here\n');
    } else {
      setCode('// Write your JavaScript code here\n');
    }
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setIsExecuting(true);
    setOutput('Running...');
    try {
      const result = await executeCode(language, code);
      setOutput(result || 'Program finished successfully without output.');
    } catch (err) {
      setOutput(`Error: ${err.message}`);
      toast.error('Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    if (language === 'python') {
      setCode('# Write your Python code here\n');
    } else {
      setCode('// Write your JavaScript code here\n');
    }
    setOutput('');
  };

  const handleSubmit = () => {
    let formattedAnswer = `Here is my code:\n\`\`\`${language}\n${code}\n\`\`\``;
    if (output && output !== 'Running...') {
      formattedAnswer += `\n\nOutput:\n\`\`\`text\n${output}\n\`\`\``;
    }
    onSubmit(formattedAnswer);
  };

  return (
    <div className="flex flex-col h-full bg-code-bg">
      {/* Editor Toolbar */}
      <div className="h-12 border-b border-border-subtle flex justify-between items-center px-4 bg-surface-container">
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="appearance-none bg-surface-container border border-border-subtle rounded text-body-sm font-body-sm text-on-surface py-1.5 pl-3 pr-8 hover:border-text-secondary transition-colors focus:outline-none focus:border-primary-container"
            >
              <option value="python">Python 3.9</option>
              <option value="javascript">JavaScript</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          </div>
          <button onClick={onClose} className="text-text-secondary font-mono-sm text-mono-sm hover:text-on-surface transition-colors flex items-center gap-1">
             <X size={14} /> Close
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset}
            className="text-text-secondary hover:text-on-surface p-1 transition-colors"
            title="Reset Code"
          >
            <RotateCcw size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={handleRun}
            disabled={isExecuting}
            className="px-4 py-1.5 bg-primary-container text-on-primary-container hover:bg-accent-hover font-body-sm text-body-sm rounded transition-all active:scale-[0.98] flex items-center gap-2 font-medium disabled:opacity-50"
          >
            <Play size={16} strokeWidth={2} /> {isExecuting ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            fontFamily: '"JetBrains Mono", monospace'
          }}
        />
      </div>

      {/* Terminal Output Panel */}
      <div className="h-48 border-t border-border-subtle bg-surface flex flex-col">
        <div className="h-8 border-b border-border-subtle flex items-center justify-between px-4 bg-surface-container text-body-sm font-body-sm">
          <div className="flex items-center gap-4 h-full">
            <span className="text-on-surface border-b-2 border-primary-container h-full flex items-center">Output</span>
          </div>
          <button 
            onClick={handleSubmit}
            className="text-primary-container hover:text-primary font-medium text-xs uppercase tracking-wide transition-colors"
          >
            Submit Solution
          </button>
        </div>
        <div className="flex-1 p-4 font-mono-sm text-mono-sm overflow-auto text-on-surface-variant bg-code-bg">
          <pre className="text-on-surface-variant whitespace-pre-wrap font-mono-sm text-mono-sm">
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}

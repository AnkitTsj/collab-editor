import React, { useState, useEffect, useRef } from 'react';
import { FileText, Users, Plus, Trash2, Edit3, Code, FileCode, Download, Copy, Check } from 'lucide-react';

function App() {
  const [documents, setDocuments] = useState([
    { id: '1', name: 'Project Proposal.md', content: '# Project Proposal\n\nStart writing your project proposal here...', lastEdited: new Date(), type: 'markdown' },
    { id: '2', name: 'app.js', content: '// JavaScript Code\nconst greeting = "Hello, World!";\nconsole.log(greeting);', lastEdited: new Date(), type: 'javascript' }
  ]);
  const [activeDocId, setActiveDocId] = useState('1');
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([
    { id: 'you', name: 'You', color: '#3b82f6', cursor: 0, typing: false }
  ]);
  const [userName, setUserName] = useState('You');
  const [isEditingName, setIsEditingName] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('text');
  const textareaRef = useRef(null);
  const simulatedUserTimeoutRef = useRef(null);

  const fileTemplates = {
    javascript: '// JavaScript File\n\nfunction main() {\n  console.log("Hello, World!");\n}\n\nmain();',
    python: '# Python File\n\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()',
    html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
    css: '/* CSS Stylesheet */\n\nbody {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n}',
    json: '{\n  "name": "project",\n  "version": "1.0.0",\n  "description": "Project description"\n}',
    markdown: '# Document Title\n\n## Introduction\n\nStart writing your markdown content here...',
    text: ''
  };

  const fileExtensions = {
    javascript: '.js',
    python: '.py',
    html: '.html',
    css: '.css',
    json: '.json',
    markdown: '.md',
    text: '.txt'
  };

  useEffect(() => {
    const doc = documents.find(d => d.id === activeDocId);
    if (doc) {
      setContent(doc.content);
    }
  }, [activeDocId, documents]);

  useEffect(() => {
    const simulateUser = () => {
      if (Math.random() > 0.6) {
        setUsers(prev => {
          const otherUsers = prev.filter(u => u.id !== 'you');
          if (otherUsers.length === 0 && Math.random() > 0.5) {
            return [...prev, {
              id: 'user2',
              name: 'Alex',
              color: '#10b981',
              cursor: Math.floor(Math.random() * content.length),
              typing: Math.random() > 0.5
            }];
          } else if (otherUsers.length > 0) {
            return prev.map(u => 
              u.id !== 'you' ? { ...u, typing: Math.random() > 0.5 } : u
            );
          }
          return prev;
        });
      }
    };

    simulatedUserTimeoutRef.current = setInterval(simulateUser, 3000);
    return () => clearInterval(simulatedUserTimeoutRef.current);
  }, [content.length]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    setDocuments(prev => prev.map(doc => 
      doc.id === activeDocId 
        ? { ...doc, content: newContent, lastEdited: new Date() }
        : doc
    ));

    const cursorPos = e.target.selectionStart;
    setUsers(prev => prev.map(u => 
      u.id === 'you' ? { ...u, cursor: cursorPos, typing: true } : u
    ));

    setTimeout(() => {
      setUsers(prev => prev.map(u => 
        u.id === 'you' ? { ...u, typing: false } : u
      ));
    }, 1000);
  };

  const createNewDocument = () => {
    setShowNewDocModal(true);
    setNewDocName('');
    setNewDocType('text');
  };

  const confirmCreateDocument = () => {
    if (!newDocName.trim()) return;
    
    const extension = fileExtensions[newDocType];
    const fullName = newDocName.includes('.') ? newDocName : newDocName + extension;
    
    const newDoc = {
      id: Date.now().toString(),
      name: fullName,
      content: fileTemplates[newDocType],
      lastEdited: new Date(),
      type: newDocType
    };
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
    setShowNewDocModal(false);
  };

  const deleteDocument = (docId) => {
    if (documents.length === 1) return;
    setDocuments(prev => prev.filter(d => d.id !== docId));
    if (activeDocId === docId) {
      setActiveDocId(documents[0].id === docId ? documents[1].id : documents[0].id);
    }
  };

  const renameDocument = (docId, newName) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === docId ? { ...doc, name: newName } : doc
    ));
  };

  const downloadDocument = () => {
    const doc = documents.find(d => d.id === activeDocId);
    if (!doc) return;

    const blob = new Blob([doc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeDoc = documents.find(d => d.id === activeDocId);
  const isCodeFile = activeDoc?.type !== 'text' && activeDoc?.type !== 'markdown';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* New Document Modal */}
      {showNewDocModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Create New File</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">File Name</label>
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmCreateDocument()}
                placeholder="Enter file name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
              <select
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="text">Text (.txt)</option>
                <option value="markdown">Markdown (.md)</option>
                <option value="javascript">JavaScript (.js)</option>
                <option value="python">Python (.py)</option>
                <option value="html">HTML (.html)</option>
                <option value="css">CSS (.css)</option>
                <option value="json">JSON (.json)</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmCreateDocument}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewDocModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Edit3 className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold text-gray-800">CollabEdit</h1>
          </div>
          <button
            onClick={createNewDocument}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            New File
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Files</h2>
          {documents.map(doc => {
            const isCode = doc.type !== 'text' && doc.type !== 'markdown';
            return (
              <div
                key={doc.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg mb-1 cursor-pointer transition-colors ${
                  activeDocId === doc.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => setActiveDocId(doc.id)}
              >
                {isCode ? <FileCode size={16} /> : <FileText size={16} />}
                <span className="flex-1 text-sm truncate">{doc.name}</span>
                {documents.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(doc.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Active Users</span>
          </div>
          {users.map(user => (
            <div key={user.id} className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full relative"
                style={{ backgroundColor: user.color }}
              >
                {user.typing && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              {user.id === 'you' && isEditingName ? (
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onBlur={() => {
                    setIsEditingName(false);
                    setUsers(prev => prev.map(u =>
                      u.id === 'you' ? { ...u, name: userName } : u
                    ));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingName(false);
                      setUsers(prev => prev.map(u =>
                        u.id === 'you' ? { ...u, name: userName } : u
                      ));
                    }
                  }}
                  className="text-sm flex-1 px-2 py-1 border border-blue-300 rounded"
                  autoFocus
                />
              ) : (
                <div className="flex-1">
                  <span
                    className="text-sm text-gray-600 cursor-pointer hover:text-blue-600"
                    onClick={() => user.id === 'you' && setIsEditingName(true)}
                  >
                    {user.name}
                  </span>
                  {user.typing && (
                    <span className="text-xs text-green-600 ml-1">typing...</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <input
              type="text"
              value={activeDoc?.name || ''}
              onChange={(e) => renameDocument(activeDocId, e.target.value)}
              className="text-2xl font-semibold text-gray-800 bg-transparent border-none outline-none focus:text-blue-600 w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Last edited: {activeDoc?.lastEdited.toLocaleTimeString()}
              {isCodeFile && <span className="ml-3 text-blue-600">• Code File</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={downloadDocument}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Download file"
            >
              <Download size={18} />
              Download
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              className={`w-full h-full min-h-[600px] p-6 text-gray-800 leading-relaxed resize-none focus:outline-none bg-white rounded-lg shadow-sm border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all ${
                isCodeFile ? 'font-mono text-sm' : 'text-lg'
              }`}
              placeholder={isCodeFile ? "// Start coding..." : "Start typing... Changes sync in real-time across all users."}
              style={{ fontFamily: isCodeFile ? 'monospace' : 'Georgia, serif' }}
              spellCheck={!isCodeFile}
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>{content.length} characters</span>
            <span>{content.split(/\s+/).filter(w => w.length > 0).length} words</span>
            <span>{content.split('\n').length} lines</span>
            {isCodeFile && <span className="text-blue-600">• {activeDoc?.type.toUpperCase()}</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Connected • Auto-saving</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
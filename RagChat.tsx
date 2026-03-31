// frontend/RagChat.tsx
// 完整的 RAG 知识库问答页面组件
// 依赖：React, Tailwind CSS（你现有项目已有）

import { useState, useRef, useEffect, useCallback } from 'react';

// ── 类型定义 ────────────────────────────────────────────
interface Document {
  id: number;
  filename: string;
  file_type: string;
  char_count: number;
  chunk_count: number;
  created_at: string;
}

interface Source {
  content: string;
  chunkIndex: number;
  similarity: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  loading?: boolean;
}

// ── 主组件 ────────────────────────────────────────────
export default function RagChat() {
  const [documents, setDocuments]       = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc]   = useState<Document | null>(null);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState('');
  const [uploading, setUploading]       = useState(false);
  const [sending, setSending]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [expandedSources, setExpandedSources] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);

  // 加载文档列表
  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/rag/documents');
      const data = await res.json();
      setDocuments(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // 上传文档
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress('正在解析文档...');
    try {
      const form = new FormData();
      form.append('file', file);
      setUploadProgress('正在向量化，请稍候...');
      const res  = await fetch('/api/rag/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUploadProgress(`✓ 上传完成，共切分 ${data.chunkCount} 个段落`);
      await loadDocuments();
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (err: any) {
      setUploadProgress(`✗ ${err.message}`);
      setTimeout(() => setUploadProgress(''), 4000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 删除文档
  const handleDelete = async (id: number) => {
    if (!confirm('确认删除该文档及其所有向量数据？')) return;
    await fetch(`/api/rag/documents/${id}`, { method: 'DELETE' });
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
      setMessages([]);
    }
    await loadDocuments();
  };

  // 选择文档，重置对话
  const selectDoc = (doc: Document) => {
    setSelectedDoc(doc);
    setMessages([{
      role: 'assistant',
      content: `已加载文档《${doc.filename}》，共 ${doc.chunk_count} 个段落。\n\n请直接提问，我会基于文档内容回答。`,
    }]);
  };

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || !selectedDoc || sending) return;
    const question = input.trim();
    setInput('');
    const history = messages
      .filter(m => !m.loading)
      .map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [
      ...prev,
      { role: 'user', content: question },
      { role: 'assistant', content: '', loading: true },
    ]);
    setSending(true);

    try {
      const res  = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: selectedDoc.id, question, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: data.answer, sources: data.sources },
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: `出错了：${err.message}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  // ── 渲染 ───────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-mono overflow-hidden">

      {/* ── 左侧：文档列表 ────────────────────────── */}
      <aside className="w-72 flex-shrink-0 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-sm font-bold text-blue-400 tracking-widest uppercase mb-3">
            ⟨ RAG 知识库 ⟩
          </h1>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-2 px-3 rounded border border-blue-500 text-blue-400 text-xs
                       hover:bg-blue-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? '处理中...' : '+ 上传文档'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            className="hidden"
            onChange={handleUpload}
          />
          {uploadProgress && (
            <p className={`mt-2 text-xs ${uploadProgress.startsWith('✓') ? 'text-green-400' : uploadProgress.startsWith('✗') ? 'text-red-400' : 'text-yellow-400'}`}>
              {uploadProgress}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {documents.length === 0 && (
            <p className="text-xs text-gray-600 text-center mt-8">暂无文档<br />上传 PDF / TXT / MD</p>
          )}
          {documents.map(doc => (
            <div
              key={doc.id}
              onClick={() => selectDoc(doc)}
              className={`group relative p-3 rounded cursor-pointer transition-all
                ${selectedDoc?.id === doc.id
                  ? 'bg-blue-500/20 border border-blue-500/50'
                  : 'hover:bg-gray-800 border border-transparent'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-200 truncate">{doc.filename}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {doc.chunk_count} 段 · {(doc.char_count / 1000).toFixed(1)}k 字
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(doc.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 text-xs flex-shrink-0 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── 右侧：对话区 ──────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {!selectedDoc ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <p className="text-4xl">📄</p>
              <p className="text-gray-500 text-sm">选择左侧文档开始问答</p>
              <p className="text-gray-700 text-xs">支持 PDF · TXT · Markdown</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-3 border-b border-gray-800 bg-gray-900/50">
              <p className="text-xs text-gray-400">
                <span className="text-blue-400">📄 {selectedDoc.filename}</span>
                <span className="ml-3 text-gray-600">{selectedDoc.chunk_count} 段落已向量化</span>
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded flex items-center justify-center text-xs flex-shrink-0 mt-0.5
                    ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className={`max-w-2xl space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-4 py-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap
                      ${msg.role === 'user'
                        ? 'bg-blue-600/20 border border-blue-500/30 text-gray-100'
                        : 'bg-gray-800/60 border border-gray-700/50 text-gray-200'}`}>
                      {msg.loading ? (
                        <span className="inline-flex gap-1">
                          <span className="animate-bounce" style={{animationDelay:'0ms'}}>·</span>
                          <span className="animate-bounce" style={{animationDelay:'150ms'}}>·</span>
                          <span className="animate-bounce" style={{animationDelay:'300ms'}}>·</span>
                        </span>
                      ) : msg.content}
                    </div>

                    {/* 来源展开 */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="w-full">
                        <button
                          onClick={() => setExpandedSources(expandedSources === i ? null : i)}
                          className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
                        >
                          {expandedSources === i ? '▲' : '▶'} 查看参考来源（{msg.sources.length} 段）
                        </button>
                        {expandedSources === i && (
                          <div className="mt-2 space-y-2">
                            {msg.sources.map((src, si) => (
                              <div key={si} className="p-3 bg-gray-900 border border-gray-700/50 rounded text-xs">
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className="text-blue-400">段落 {src.chunkIndex + 1}</span>
                                  <span className="text-gray-500">
                                    相似度 {Math.round(src.similarity * 100)}%
                                  </span>
                                </div>
                                <p className="text-gray-400 leading-relaxed">{src.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/30">
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="基于文档提问... (Enter 发送，Shift+Enter 换行)"
                  rows={2}
                  disabled={sending}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm
                             text-gray-100 placeholder-gray-600 resize-none outline-none
                             focus:border-blue-500/60 transition-colors disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700
                             disabled:text-gray-500 text-white text-sm rounded-lg transition-colors
                             flex-shrink-0 h-full"
                >
                  {sending ? '...' : '发送'}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

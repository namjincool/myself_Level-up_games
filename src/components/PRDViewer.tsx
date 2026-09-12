import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Layers,
  Search,
  Sparkles,
} from 'lucide-react';
import { PRD_SECTIONS } from '../data/prdContent';

const PRD_SEARCH_ALIASES: Record<string, string[]> = {
  '경험치': ['exp', 'experience'],
  '공식': ['exp', '수학 공식'],
  '퀘스트': ['quest', 'daily', 'weekly', 'epic'],
  '데이터 구조': ['data model', 'schema', '데이터 모델'],
  '수익화': ['monetization', 'freemium', 'subscription'],
  '백분위': ['percentile', 'ranking'],
};

export const PRDViewer: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('executive-summary');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchTerms = normalizedSearchQuery
    ? [
        normalizedSearchQuery,
        ...Object.entries(PRD_SEARCH_ALIASES)
          .filter(([alias]) => normalizedSearchQuery.includes(alias))
          .flatMap(([, terms]) => terms),
      ]
    : [];

  const filteredSections = PRD_SECTIONS.filter((s) => {
    if (searchTerms.length === 0) return true;
    const searchableText = `${s.title} ${s.content} ${s.category}`.toLowerCase();
    return searchTerms.some((term) => searchableText.includes(term));
  });

  const currentSection =
    filteredSections.find((s) => s.id === activeSectionId) || filteredSections[0] || null;

  useEffect(() => {
    if (filteredSections.length > 0 && !filteredSections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(filteredSections[0].id);
    }
  }, [activeSectionId, filteredSections, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAll = () => {
    const fullText = PRD_SECTIONS.map((s) => `# ${s.number}. ${s.title}\n\n${s.content}`).join(
      '\n\n---\n\n'
    );
    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'LifeRPG_Product_Requirements_Document_PRD.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderMarkdownContent = (raw: string) => {
    const lines = raw.trim().split('\n');
    let inTable = false;
    let tableHeader: string[] = [];
    let tableRows: string[][] = [];

    const elements: React.ReactNode[] = [];

    const flushTable = (keyIndex: number) => {
      if (inTable && tableHeader.length > 0) {
        elements.push(
          <div key={`table-${keyIndex}`} className="overflow-x-auto my-4 rounded-xl border border-white/10 bg-black/40 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-slate-200">
                  {tableHeader.map((h, i) => (
                    <th key={i} className="p-3 font-bold whitespace-nowrap text-orange-300">
                      {h.trim().replace(/\*\*/g, '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {tableRows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-white/5 transition">
                    {row.map((cell, ci) => (
                      <td key={ci} className="p-3 text-slate-300">
                        {cell.trim().replace(/\*\*(.*?)\*\*/g, '$1')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableHeader = [];
        tableRows = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check Table
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        if (cells.every((c) => c.startsWith('---') || c.startsWith(':---') || c.startsWith('---:'))) {
          return;
        }

        if (!inTable) {
          inTable = true;
          tableHeader = cells;
        } else {
          tableRows.push(cells);
        }
        return;
      } else {
        flushTable(idx);
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-base font-bold text-orange-400 mt-6 mb-2 flex items-center gap-2 border-b border-white/10 pb-1">
            <span className="w-1.5 h-4 bg-orange-500 rounded-full inline-block" />
            {trimmed.replace('### ', '')}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-lg font-black text-white mt-7 mb-3">
            {trimmed.replace('## ', '')}
          </h2>
        );
        return;
      }

      // Blockquotes
      if (trimmed.startsWith('> ')) {
        elements.push(
          <div key={idx} className="my-3.5 p-4 rounded-xl bg-orange-500/10 border-l-4 border-orange-500 text-orange-200 text-xs font-medium leading-relaxed">
            {trimmed.replace('> ', '')}
          </div>
        );
        return;
      }

      // Code blocks
      if (trimmed.startsWith('```')) {
        elements.push(
          <div key={idx} className="text-[10px] font-mono text-slate-500 py-0.5">
            {trimmed}
          </div>
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const clean = trimmed.substring(2);
        elements.push(
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 my-1.5 pl-2">
            <span className="text-orange-400 font-bold mt-0.5">•</span>
            <span className="leading-relaxed">{clean}</span>
          </div>
        );
        return;
      }

      // Numbered lists
      if (/^\d+\.\s/.test(trimmed)) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 my-2 pl-2">
            <span className="text-orange-400 font-bold font-mono">
              {trimmed.match(/^\d+\./)?.[0]}
            </span>
            <span className="leading-relaxed">{trimmed.replace(/^\d+\.\s*/, '')}</span>
          </div>
        );
        return;
      }

      // Standard paragraph
      if (trimmed.length > 0) {
        elements.push(
          <p key={idx} className="text-xs text-slate-300 leading-relaxed my-2">
            {trimmed}
          </p>
        );
      }
    });

    flushTable(lines.length);

    return elements;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Search & Export */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight uppercase">
                LifeRPG Master PRD Specification
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              시니어 PM 및 게임 시스템 기획자의 23개 전 영역 상세 요구 사양서
            </p>
          </div>

          <button
            onClick={handleExportAll}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-orange-400 border border-white/10 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer uppercase tracking-wider font-mono"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT PRD (.MD)</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="PRD 사양서 검색 (예: 경험치 공식, 퀘스트, 데이터 구조, 수익화, 백분위...)"
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition font-sans"
          />
        </div>
      </div>

      {/* Main PRD Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Sidebar */}
        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5 max-h-[640px] overflow-y-auto backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1 block">
            Table of Contents (23 Sections)
          </span>

          {filteredSections.length > 0 ? filteredSections.map((sec) => {
            const isActive = activeSectionId === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSectionId(sec.id)}
                className={`w-full text-left p-3 rounded-xl text-xs transition flex items-start gap-2.5 cursor-pointer ${
                  isActive
                    ? 'bg-orange-500/20 border border-orange-500/60 text-white font-bold shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5 ${
                    isActive ? 'bg-orange-500 text-black' : 'bg-black/50 text-slate-400 border border-white/10'
                  }`}
                >
                  {sec.number}
                </span>
                <div className="overflow-hidden">
                  <span className="block truncate">{sec.title}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{sec.category}</span>
                </div>
              </button>
            );
          }) : null}
        </div>

        {/* Right Section Content Viewer */}
        {currentSection ? (
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider">
                  Section #{currentSection.number} • {currentSection.category}
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-1.5">
                {currentSection.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">{currentSection.summary}</p>
            </div>

            <button
              onClick={() => handleCopy(currentSection.content, currentSection.id)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition flex items-center gap-1.5 text-xs shrink-0 cursor-pointer font-mono font-bold"
              title="이 섹션 복사"
            >
              {copiedId === currentSection.id ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY SECTION</span>
                </>
              )}
            </button>
          </div>

          {/* Formatted Content */}
          <div className="text-slate-300 leading-relaxed font-sans text-xs pt-1">
            {renderMarkdownContent(currentSection.content)}
          </div>
        </div>
        ) : (
          <div className="lg:col-span-8 flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-xs text-slate-400" role="status">
            검색 결과가 없습니다. 다른 키워드로 다시 검색해 주세요.
          </div>
        )}
      </div>
    </div>
  );
};

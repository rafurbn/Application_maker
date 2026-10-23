import React, { useRef, useState } from 'react';
import { FolderOpen, Upload, FileCode, FileText, CheckCircle2, Copy, Check, Eye, AlertCircle, ArrowRight } from 'lucide-react';
import { LoadedFolderFile, OfficialApplication } from '../types';

interface FolderUploaderProps {
  onImportFromFile?: (parsedApp: Partial<OfficialApplication>) => void;
}

export const FolderUploader: React.FC<FolderUploaderProps> = ({ onImportFromFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<LoadedFolderFile[]>([]);
  const [folderName, setFolderName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<LoadedFolderFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [appliedStatus, setAppliedStatus] = useState<string | null>(null);

  // Handle files selected via input (webkitdirectory)
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const loaded: LoadedFolderFile[] = [];
    let detectedFolder = 'Aplication';

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const relativePath = file.webkitRelativePath || file.name;
      const parts = relativePath.split('/');
      if (parts.length > 1) {
        detectedFolder = parts[0];
      }

      // Read text content for code, text, html, json, md files
      let content = '';
      if (
        file.type.startsWith('text/') ||
        file.name.endsWith('.html') ||
        file.name.endsWith('.htm') ||
        file.name.endsWith('.css') ||
        file.name.endsWith('.js') ||
        file.name.endsWith('.jsx') ||
        file.name.endsWith('.ts') ||
        file.name.endsWith('.tsx') ||
        file.name.endsWith('.json') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md')
      ) {
        try {
          content = await file.text();
        } catch {
          content = '';
        }
      }

      loaded.push({
        name: file.name,
        path: relativePath,
        size: file.size,
        type: file.type || 'text/plain',
        content,
        lastModified: file.lastModified,
      });
    }

    setFolderName(detectedFolder);
    setFiles(loaded);
    if (loaded.length > 0) {
      setSelectedFile(loaded[0]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.items) {
      const loaded: LoadedFolderFile[] = [];
      const queue: FileSystemEntry[] = [];

      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i].webkitGetAsEntry?.();
        if (item) queue.push(item);
      }

      const readEntry = async (entry: FileSystemEntry, pathPrefix = '') => {
        if (entry.isFile) {
          const fileEntry = entry as FileSystemFileEntry;
          await new Promise<void>((resolve) => {
            fileEntry.file(async (file) => {
              let content = '';
              if (
                file.type.startsWith('text/') ||
                /\.(html|htm|css|js|jsx|ts|tsx|json|txt|md)$/i.test(file.name)
              ) {
                try {
                  content = await file.text();
                } catch {
                  content = '';
                }
              }
              loaded.push({
                name: file.name,
                path: `${pathPrefix}${file.name}`,
                size: file.size,
                type: file.type || 'text/plain',
                content,
                lastModified: file.lastModified,
              });
              resolve();
            });
          });
        } else if (entry.isDirectory) {
          const dirEntry = entry as FileSystemDirectoryEntry;
          setFolderName(entry.name);
          const dirReader = dirEntry.createReader();
          const entries = await new Promise<FileSystemEntry[]>((resolve) => {
            dirReader.readEntries((ents) => resolve(ents));
          });
          for (const child of entries) {
            await readEntry(child, `${pathPrefix}${entry.name}/`);
          }
        }
      };

      for (const entry of queue) {
        await readEntry(entry);
      }

      setFiles(loaded);
      if (loaded.length > 0) {
        setSelectedFile(loaded[0]);
      }
    } else if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const parseTextToApplication = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    let subject = 'আবেদন';
    const bodyParagraphs: string[] = [];
    let closing = 'বিনীত নিবেদক,';
    let prayerText = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('বিষয়:') || line.includes('বিষয়:')) {
        subject = line.replace(/^(বিষয়:|বিষয়:)\s*/, '');
      } else if (line.startsWith('অতএব,') || line.startsWith('অতএব ')) {
        prayerText = line;
      } else if (line.includes('বিনীত নিবেদক') || line.includes('বিনীত,')) {
        closing = line;
      } else if (line.length > 30) {
        bodyParagraphs.push(line);
      }
    }

    if (onImportFromFile) {
      onImportFromFile({
        subject: subject || 'আবেদনপত্র',
        bodyParagraphs: bodyParagraphs.length > 0 ? bodyParagraphs : [text],
        prayerText: prayerText || 'অতএব, সদয় বিবেচনা করে প্রয়োজনীয় ব্যবস্থা গ্রহণের অনুরোধ রইল।',
        closing,
      });
      setAppliedStatus('সফলভাবে আবেদনপত্রে রূপান্তর করা হয়েছে! প্রিন্ট প্রিভিউ ট্যাবে দেখুন।');
      setTimeout(() => setAppliedStatus(null), 4000);
    }
  };

  const cssPatchCode = `/* এই CSS কোডটি আপনার প্রোজেক্টে যুক্ত করলেই সব আবেদনপত্র Left Aligned এবং বডি Justified হবে */
.application-wrapper,
.application-container,
.letter-sheet {
  text-align: left !important;
}

/* আবেদনপত্রের মূল বডি ও প্যারাগ্রাফ জাস্টিফাইড */
.application-body,
.letter-body,
.application-sheet p.body-text,
.application-sheet .body {
  text-align: justify !important;
  text-justify: inter-word !important;
  line-height: 1.8 !important;
}

/* প্রিন্ট প্রিভিউ নিশ্চিতকরণ */
@media print {
  @page {
    size: A4 portrait;
    margin: 20mm;
  }
  body {
    text-align: left !important;
  }
  .application-body {
    text-align: justify !important;
    text-justify: inter-word !important;
  }
}`;

  const copyCss = () => {
    navigator.clipboard.writeText(cssPatchCode);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Informative Notice Box */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-950 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div className="space-y-1.5 text-sm">
            <p className="font-bold text-emerald-950 flex items-center gap-2 flex-wrap">
              <span>আপনার নির্দিষ্ট ফোল্ডার পাথ:</span>
              <code className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-mono text-xs border border-emerald-300">
                C:\Users\pc\Downloads\Aplication\Aplication_for_Leave_and_other-branch-1
              </code>
            </p>
            <p className="text-emerald-800 text-xs leading-relaxed">
              ক্লাউড ব্রাউজার নিরাপত্তার কারণে কোনো এআই বা ক্লাউড ওয়েব অ্যাপ আপনার পিসির লোকাল ড্রাইভে স্বয়ংক্রিয়ভাবে প্রবেশ করতে পারে না। কিন্তু নিচের <strong>“📂 পিসি থেকে ফোল্ডার নির্বাচন করুন”</strong> বাটনে ক্লিক করে আপনি সরাসরি আপনার এই ফোল্ডারটি (`Aplication_for_Leave_and_other-branch-1`) সিলেক্ট করে দিলেই—এই অ্যাপ সাথে সাথে ফোল্ডারের ফাইলসমূহ পড়ে আপনার পূর্বের ইনপুট ড্যাশবোর্ডের সব ফিল্ড অ্যাপে যুক্ত করে নেবে!
            </p>
          </div>
        </div>
      </div>

      {/* Upload & Drag Drop Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all bg-white ${
          isDragging ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]' : 'border-slate-300 hover:border-emerald-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          // @ts-expect-error webkitdirectory is standard in Chromium browsers
          webkitdirectory="true"
          directory="true"
          multiple
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shadow-inner">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              <span className="text-emerald-800">Aplication_for_Leave_and_other-branch-1</span> ফোল্ডারটি নির্বাচন করুন
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা ফোল্ডার ব্রাউজ করুন (React JSX, TSX, HTML, JS, JSON ফাইলসমূহ স্বয়ংক্রিয়ভাবে শনাক্ত হবে)
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>📂 পিসি থেকে Aplication ফোল্ডার লোড করুন</span>
            </button>
          </div>
        </div>
      </div>

      {appliedStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{appliedStatus}</span>
        </div>
      )}

      {/* Files List if loaded */}
      {files.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-800">
                ফোল্ডার: <span className="text-emerald-700 font-mono">{folderName}</span> ({files.length} টি ফাইল পাওয়া গেছে)
              </h4>
            </div>
            <span className="text-xs text-slate-500">ফাইল নির্বাচন করে কন্টেন্ট দেখুন</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left: Files List */}
            <div className="border border-slate-200 rounded-lg max-h-80 overflow-y-auto divide-y divide-slate-100">
              {files.map((file, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedFile?.path === file.path ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {file.name.endsWith('.html') ? (
                      <FileCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </button>
              ))}
            </div>

            {/* Right: File Preview & Action */}
            <div className="md:col-span-2 border border-slate-200 rounded-lg p-3 bg-slate-50 flex flex-col justify-between">
              {selectedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{selectedFile.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{selectedFile.path}</div>
                    </div>
                    {selectedFile.content && (
                      <button
                        type="button"
                        onClick={() => parseTextToApplication(selectedFile.content || '')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded shadow-sm cursor-pointer"
                      >
                        <span>আবেদনপত্রে রূপান্তর করুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs font-mono max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {selectedFile.content ? selectedFile.content.slice(0, 3000) : '(বাইনারি ফাইল বা কন্টেন্ট প্রিভিউ সম্ভব নয়)'}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-slate-400">
                  বাম তালিকা থেকে একটি ফাইল নির্বাচন করুন
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Paste / Import Option */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-800">
              আবেদনপত্র সরাসরি পেস্ট করুন (Quick Text Paste)
            </h4>
          </div>
          <span className="text-xs text-slate-500">আপনার ফাইলের লেখা সরাসরি এখানে দিন</span>
        </div>

        <textarea
          rows={4}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="আপনার আবেদনপত্রের টেক্সট এখানে পেস্ট করুন (যেমন: বিষয়: ..., জনাব, ... অতএব ... বিনীত নিবেদক ...)"
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!pasteText.trim()}
            onClick={() => parseTextToApplication(pasteText)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
          >
            <span>লেফট-অ্যালাইন ও জাস্টিফাইড প্রিভিউতে যুক্ত করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CSS Snippet for their local codebase */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                আপনার প্রোজেক্টে ব্যবহারের জন্য CSS কোড (CSS Alignment Patch)
              </h4>
              <p className="text-xs text-slate-500">
                এই স্টাইলটি আপনার ফোল্ডারের কোডে যুক্ত করলে আবেদনপত্র সম্পূর্ণ Left Aligned এবং বডি Justified থাকবে।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={copyCss}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded cursor-pointer transition-colors"
          >
            {copiedCss ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCss ? 'কপি হয়েছে' : 'CSS কপি'}</span>
          </button>
        </div>

        <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
          {cssPatchCode}
        </pre>
      </div>
    </div>
  );
};

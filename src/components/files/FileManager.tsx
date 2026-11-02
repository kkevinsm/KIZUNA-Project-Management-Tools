'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Upload, Download, Trash2, File, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileItem {
  key: string;
  name: string;
  size: number;
  uploadedAt: string;
}

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isR2, setIsR2] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/storage?action=list');
      const data = await res.json();
      if (res.ok) {
        setFiles(data.files || []);
        setIsR2(data.isR2 || false);
      }
    } catch (err) {
      console.error('Failed to list files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage('Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', 'project-files');

      const res = await fetch('/api/storage', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setMessage(
        data.isR2
          ? 'File uploaded directly to Cloudflare R2 bucket!'
          : 'File uploaded to fallback storage. Configure R2 environment variables for live R2 storage.'
      );
      fetchFiles();
      setTimeout(() => setMessage(null), 5000);
    } catch (err: unknown) {
      const error = err as Error;
      setMessage(`Upload error: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await fetch(`/api/storage?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      fetchFiles();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-bold text-white">Files & Attachments</h2>
            <div
              className={`flex items-center gap-1 text-[12px] px-2.5 py-0.5 rounded-full font-medium ${
                isR2
                  ? 'bg-[#183f30] text-[#4cd195] border border-[#215340]'
                  : 'bg-[#4a3800] text-[#f7c244] border border-[#634b00]'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{isR2 ? 'Cloudflare R2 Live' : 'R2 Simulation Active'}</span>
            </div>
          </div>
          <p className="text-[13px] text-[#8a8886] mt-0.5">
            Cloudflare R2 S3-compatible object storage for project assets and attachments
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 bg-[#4573d2] hover:bg-[#3562be] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-all shadow-sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading to R2...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload to Cloudflare R2</span>
              </>
            )}
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-[#252628] border border-[#333538] rounded-xl flex items-center gap-2.5 text-[13px] text-[#f5f4f3]">
          <AlertCircle className="w-4 h-4 text-[#f5b324] flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Cloudflare R2 Configuration info callout */}
      <div className="bg-[#1c1d1f] border border-[#2e2f32] rounded-xl p-4 text-[12px] space-y-1.5 text-[#9c9a99]">
        <div className="flex items-center gap-2 font-semibold text-white text-[13px]">
          <Cloud className="w-4 h-4 text-[#f7c244]" />
          <span>Cloudflare R2 Setup Information</span>
        </div>
        <p>
          To connect your personal Cloudflare R2 bucket, supply the following keys in your{' '}
          <code className="text-[#f5f4f3] bg-[#252628] px-1.5 py-0.5 rounded">.env.local</code> or Vercel Environment Variables:
        </p>
        <div className="font-mono text-[11px] text-[#4cd195] bg-[#151617] p-2.5 rounded border border-[#262729] overflow-x-auto space-y-0.5">
          <div>CLOUDFLARE_R2_ACCOUNT_ID=your_account_id</div>
          <div>CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key</div>
          <div>CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key</div>
          <div>CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name</div>
          <div>CLOUDFLARE_R2_PUBLIC_URL=https://pub-yourbucket.r2.dev</div>
        </div>
      </div>

      {/* Files List / Table */}
      <div className="bg-[#252628] border border-[#333538] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#8a8886]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#4573d2]" />
            <p className="text-[13px]">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center text-[#8a8886]">
            <Cloud className="w-10 h-10 mx-auto mb-2 text-[#4e5054]" />
            <p className="text-[14px] font-medium text-white mb-1">No files uploaded yet</p>
            <p className="text-[12px]">Click &quot;Upload to Cloudflare R2&quot; above to store attachments.</p>
          </div>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#1e1f21] border-b border-[#333538] text-[#8a8886] font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">File Name</th>
                <th className="py-2.5 px-4">Size</th>
                <th className="py-2.5 px-4">Uploaded</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2f3135]">
              {files.map((file) => (
                <tr key={file.key} className="hover:bg-[#2a2b2e] transition-colors">
                  <td className="py-3 px-4 flex items-center gap-2.5">
                    <File className="w-4 h-4 text-[#4573d2]" />
                    <span className="font-medium text-white truncate max-w-[280px]">
                      {file.name || file.key.split('/').pop()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#8a8886]">
                    {(file.size / 1024).toFixed(1)} KB
                  </td>
                  <td className="py-3 px-4 text-[#8a8886]">
                    {new Date(file.uploadedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/api/storage?key=${encodeURIComponent(file.key)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded hover:bg-[#35373b] text-[#bdbbb9] hover:text-white"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(file.key)}
                        className="p-1.5 rounded hover:bg-[#35373b] text-[#bdbbb9] hover:text-[#ff6b72]"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


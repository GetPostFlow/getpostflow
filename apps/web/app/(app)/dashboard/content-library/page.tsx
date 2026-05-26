'use client';

import { useEffect, useState } from 'react';

interface Asset {
  id: string;
  clientId: string;
  filename: string;
  type: 'image' | 'video' | 'document';
  publicUrl: string | null;
  uploadedAt: string;
}

export default function ContentLibraryPage() {
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: 'asset-1',
      clientId: 'client-1',
      filename: 'summer-sale-banner.png',
      type: 'image',
      publicUrl: 'https://via.placeholder.com/1200x628?text=Summer+Sale+Banner',
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'asset-2',
      clientId: 'client-1',
      filename: 'acme-bakery-logo.svg',
      type: 'image',
      publicUrl: 'https://via.placeholder.com/200x200?text=Acme+Logo',
      uploadedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'asset-3',
      clientId: 'client-2',
      filename: 'sunrise-cafe-menu.pdf',
      type: 'document',
      publicUrl: 'https://via.placeholder.com/400x300?text=Menu+PDF',
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'asset-4',
      clientId: 'client-2',
      filename: 'coffee-product-video.mp4',
      type: 'video',
      publicUrl: 'https://via.placeholder.com/400x300?text=Product+Video',
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'asset-5',
      clientId: 'client-3',
      filename: 'studio-portfolio.pdf',
      type: 'document',
      publicUrl: 'https://via.placeholder.com/400x300?text=Portfolio',
      uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'asset-6',
      clientId: 'client-1',
      filename: 'instagram-template-1.png',
      type: 'image',
      publicUrl: 'https://via.placeholder.com/1080x1080?text=Instagram+Template',
      uploadedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'asset-7',
      clientId: 'client-2',
      filename: 'tiktok-trend-audio.mp3',
      type: 'video',
      publicUrl: 'https://via.placeholder.com/400x300?text=Audio+Clip',
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'asset-8',
      clientId: 'client-3',
      filename: 'brand-guidelines.pdf',
      type: 'document',
      publicUrl: 'https://via.placeholder.com/400x300?text=Brand+Guide',
      uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video' | 'document'>('all');

  const filtered = assets.filter(asset => {
    const matchesSearch = asset.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  const typeIcons: Record<string, string> = {
    image: '🖼',
    video: '🎬',
    document: '📄',
  };

  const typeColors: Record<string, string> = {
    image: '#3B82F6',
    video: '#8B5CF6',
    document: '#F59E0B',
  };

  const typeCounts = {
    all: assets.length,
    image: assets.filter(a => a.type === 'image').length,
    video: assets.filter(a => a.type === 'video').length,
    document: assets.filter(a => a.type === 'document').length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Content Library</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Organize and manage all your content assets</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90"
          style={{ background: 'var(--brand-primary)' }}
        >
          Upload
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border text-sm outline-none"
          style={{
            borderColor: 'var(--border-soft)',
            background: 'var(--bg-subtle)',
            color: 'var(--text-primary)',
          }}
        />

        {/* Type Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'image', 'video', 'document'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className="px-3 py-1 rounded-full text-xs font-medium transition"
              style={{
                background: selectedType === type ? 'var(--brand-primary)' : 'var(--bg-subtle)',
                color: selectedType === type ? 'white' : 'var(--text-secondary)',
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} ({typeCounts[type]})
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="p-6 rounded-lg border text-center" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-subtle)' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              {assets.length === 0 ? 'No assets yet. Upload your first asset to get started.' : 'No assets match your filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(asset => (
              <div
                key={asset.id}
                className="rounded-lg border overflow-hidden transition hover:shadow-md"
                style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-subtle)' }}
              >
                {/* Asset Preview */}
                <div
                  className="w-full h-40 flex items-center justify-center text-3xl"
                  style={{ background: `${typeColors[asset.type]}20` }}
                >
                  {asset.publicUrl && asset.type === 'image' ? (
                    <img src={asset.publicUrl} alt={asset.filename} className="w-full h-full object-cover" />
                  ) : (
                    typeIcons[asset.type]
                  )}
                </div>

                {/* Asset Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {asset.filename}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {new Date(asset.uploadedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="flex-1 px-2 py-1 rounded text-xs font-medium transition"
                      style={{
                        background: 'var(--brand-primary)',
                        color: 'white',
                      }}
                    >
                      Use
                    </button>
                    <button
                      className="flex-1 px-2 py-1 rounded text-xs font-medium transition"
                      style={{
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

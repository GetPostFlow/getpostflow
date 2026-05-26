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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video' | 'document'>('all');

  useEffect(() => {
    async function fetchAssets() {
      try {
        const response = await fetch('/api/demo-assets');
        if (response.ok) {
          const data = await response.json();
          setAssets(data.assets || []);
        }
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAssets();
  }, []);

  const filtered = assets.filter(asset => {
    const matchesSearch = asset.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  const typeIcons = {
    image: '🖼',
    video: '🎬',
    document: '📄',
  };

  const typeColors = {
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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Content Library</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Organize and manage all your content assets</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90"
          style={{ background: 'var(--brand-primary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H3a1 1 0 110-2h4V3a1 1 0 011-1z" />
          </svg>
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
          className="w-full px-4 py-2 rounded-lg border text-sm"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--background)',
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
                background: selectedType === type ? 'var(--brand-primary)' : 'var(--subtle)',
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
        {loading ? (
          <div className="p-6 rounded-lg border text-center" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading assets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 rounded-lg border text-center" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              {assets.length === 0 ? 'No assets yet. Upload your first asset to get started.' : 'No assets match your filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(asset => (
              <div
                key={asset.id}
                className="rounded-lg border overflow-hidden transition hover:shadow-md"
                style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
              >
                {/* Asset Preview */}
                <div
                  className="w-full h-40 flex items-center justify-center text-3xl"
                  style={{ background: `${typeColors[asset.type]}20` }}
                >
                  {asset.publicUrl ? (
                    asset.type === 'image' ? (
                      <img src={asset.publicUrl} alt={asset.filename} className="w-full h-full object-cover" />
                    ) : (
                      typeIcons[asset.type]
                    )
                  ) : (
                    typeIcons[asset.type]
                  )}
                </div>

                {/* Asset Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {asset.filename}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
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
                        background: 'var(--subtle)',
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

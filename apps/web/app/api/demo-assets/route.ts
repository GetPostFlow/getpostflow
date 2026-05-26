import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const type = searchParams.get('type');

    const demoAssets = [
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
    ];

    let filtered = demoAssets;

    if (clientId) {
      filtered = filtered.filter(a => a.clientId === clientId);
    }

    if (type) {
      filtered = filtered.filter(a => a.type === type);
    }

    return NextResponse.json({ assets: filtered });
  } catch (error) {
    console.error('Error fetching demo assets:', error);
    return NextResponse.json({ error: 'Failed to fetch demo assets' }, { status: 500 });
  }
}

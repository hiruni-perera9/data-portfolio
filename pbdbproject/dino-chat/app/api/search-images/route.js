import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { dinosaurName } = await request.json();

    if (!dinosaurName || !dinosaurName.trim()) {
      return NextResponse.json({ images: [] });
    }

    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      generator: 'search',
      gsrsearch: `${dinosaurName} dinosaur`,
      gsrlimit: '6',
      gsrnamespace: '6',
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiurlwidth: '800'
    });

    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'dino-chat/1.0 (contact: support@dinochat.local)'
        },
        cache: 'no-store'
      }
    );
    
    const data = await response.json();
    
    // Parse and return image URLs
    const images = [];
    if (data.query?.pages) {
      for (const page of Object.values(data.query.pages)) {
        if (page.imageinfo && page.imageinfo[0]) {
          images.push({
            url: page.imageinfo[0].url,
            title: page.title,
            source: 'Wikimedia Commons'
          });
        }
      }
    }
    
    return NextResponse.json({ images });
    
  } catch (error) {
    console.error('Image search error:', error);
    return NextResponse.json({ images: [] });
  }
}

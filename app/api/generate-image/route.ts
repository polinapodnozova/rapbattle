import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { topic, userSide } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'Missing topic' },
        { status: 400 }
      )
    }

    // Use the side the user is defending for more relevant images
    const searchQuery = userSide || topic.split(' vs ')[0]
    const keywords = searchQuery.toLowerCase().replace(/[^a-z\s]/g, '').trim()

    // Search Pexels for relevant image
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords + ' vibrant colorful')}&per_page=1&orientation=landscape`, {
      headers: {
        'Authorization': process.env.PEXELS_API_KEY || '',
      },
    })

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`)
    }

    const data = await response.json()
    const imageUrl = data.photos?.[0]?.src?.large2x

    if (!imageUrl) {
      throw new Error('No image found')
    }

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image', details: error.message },
      { status: 500 }
    )
  }
}

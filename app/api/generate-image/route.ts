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

    // Clean up the search query for better results
    let searchQuery = userSide || topic.split(' vs ')[0]
    
    // Add descriptive terms for better, more relevant images
    const searchMappings: { [key: string]: string } = {
      'pizza': 'delicious pizza food closeup',
      'burgers': 'juicy hamburger burger food',
      'cats': 'cute cat kitten pet',
      'dogs': 'cute dog puppy pet',
      'coffee': 'coffee cup latte espresso',
      'tea': 'tea cup beverage hot',
      'winter': 'winter snow snowy landscape',
      'summer': 'summer beach sunny day',
      'movies': 'movie theater cinema popcorn',
      'books': 'books reading library shelf',
      'beach': 'tropical beach ocean sand',
      'mountains': 'mountain peak landscape nature',
      'in-store shopping': 'shopping mall retail store',
      'online shopping': 'laptop shopping online ecommerce',
      'city life': 'city skyline urban buildings',
      'country life': 'countryside farm rural nature',
      'early bird': 'sunrise morning dawn',
      'night owl': 'night sky moon stars',
      'android': 'android phone smartphone',
      'iphone': 'iphone apple smartphone',
      'chocolate': 'chocolate dessert sweet',
      'vanilla': 'vanilla ice cream dessert',
      'video games': 'gaming controller esports',
      'sports': 'sports athlete game',
      'aliens exist': 'space galaxy stars planets',
      'no aliens': 'earth planet science',
      'pancakes': 'pancakes breakfast syrup',
      'waffles': 'waffles breakfast food',
      'superheroes': 'superhero comic hero',
      'villains': 'villain dark dramatic',
      'ai helps us': 'technology ai robot future',
      'ai threatens us': 'robot artificial intelligence tech',
      'yes pineapple': 'pineapple pizza tropical',
      'no pineapple': 'traditional pizza cheese',
      'day': 'bright sunny day blue sky',
      'night': 'night starry sky moon'
    }
    
    // Try to find a mapping, otherwise use the original
    const lowerQuery = searchQuery.toLowerCase().trim()
    searchQuery = searchMappings[lowerQuery] || `${searchQuery} colorful vibrant`
    
    searchQuery = searchQuery.toLowerCase().replace(/[^a-z\s]/g, '').trim()

    // Search Pexels for relevant image - get top result
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=3&orientation=landscape`, {
      headers: {
        'Authorization': process.env.PEXELS_API_KEY || '',
      },
    })

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Get a random image from top 3 results for variety
    const photos = data.photos || []
    if (photos.length === 0) {
      throw new Error('No image found')
    }
    
    const randomIndex = Math.floor(Math.random() * photos.length)
    const imageUrl = photos[randomIndex]?.src?.large2x

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

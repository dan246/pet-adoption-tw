import { Hono } from 'hono'

type Bindings = {
  IMAGES?: KVNamespace // Optional KV for caching
}

export const imagesRoutes = new Hono<{ Bindings: Bindings }>()

// Proxy and cache images from government API
imagesRoutes.get('/', async (c) => {
  const url = c.req.query('url')

  if (!url) {
    return c.json({ error: 'Missing url parameter' }, 400)
  }

  // Only allow images from government domains
  const allowedDomains = [
    'asms.coa.gov.tw',
    'data.moa.gov.tw',
    'www.pet.gov.tw',
  ]

  try {
    const imageUrl = new URL(url)
    const isAllowed = allowedDomains.some(domain => imageUrl.hostname.includes(domain))

    if (!isAllowed) {
      return c.json({ error: 'Domain not allowed' }, 403)
    }

    // Generate cache key
    const cacheKey = `img:${btoa(url).slice(0, 100)}`

    // Try to get from KV cache first
    if (c.env.IMAGES) {
      const cached = await c.env.IMAGES.get(cacheKey, 'arrayBuffer')
      if (cached) {
        console.log('Cache hit:', url.slice(0, 50))
        return new Response(cached, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400', // 1 day browser cache
            'X-Cache': 'HIT',
          },
        })
      }
    }

    // Fetch from original source
    console.log('Fetching:', url.slice(0, 50))
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PetAdoptionBot/1.0)',
      },
    })

    if (!response.ok) {
      return c.json({ error: 'Failed to fetch image' }, response.status)
    }

    const imageData = await response.arrayBuffer()
    const contentType = response.headers.get('Content-Type') || 'image/jpeg'

    // Store in KV cache (expires in 7 days)
    if (c.env.IMAGES) {
      await c.env.IMAGES.put(cacheKey, imageData, {
        expirationTtl: 7 * 24 * 60 * 60, // 7 days
      })
    }

    return new Response(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 1 day browser cache
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return c.json({ error: 'Failed to process image' }, 500)
  }
})

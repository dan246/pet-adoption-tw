import { Hono } from 'hono'

type Bindings = {
  GOV_API_URL: string
  CACHE?: KVNamespace
}

type Animal = {
  animal_id: number
  animal_subid: string
  animal_area_pkid: number
  animal_shelter_pkid: number
  animal_place: string
  animal_kind: string
  animal_sex: string
  animal_bodytype: string
  animal_colour: string
  animal_age: string
  animal_sterilization: string
  animal_bacterin: string
  animal_foundplace: string
  animal_title: string
  animal_status: string
  animal_remark: string
  animal_caption: string
  animal_opendate: string
  animal_closeddate: string
  animal_update: string
  animal_createtime: string
  shelter_name: string
  shelter_address: string
  shelter_tel: string
  cDate: string
  cUpdate: string
  album_file: string
  album_update: string
  [key: string]: any
}

export const animalsRoutes = new Hono<{ Bindings: Bindings }>()

// Get all animals with filtering
animalsRoutes.get('/', async (c) => {
  try {
    const govUrl = c.env.GOV_API_URL || 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL'

    // Try to get from cache first
    let data: Animal[] | null = null
    const cacheKey = 'animals-data'

    if (c.env.CACHE) {
      const cached = await c.env.CACHE.get(cacheKey)
      if (cached) {
        data = JSON.parse(cached)
      }
    }

    if (!data) {
      const response = await fetch(govUrl)
      data = await response.json() as Animal[]

      // Cache for 5 minutes
      if (c.env.CACHE) {
        await c.env.CACHE.put(cacheKey, JSON.stringify(data), {
          expirationTtl: 300,
        })
      }
    }

    // Get query parameters
    const type = c.req.query('type')
    const city = c.req.query('city')
    const sex = c.req.query('sex')
    const size = c.req.query('size')
    const age = c.req.query('age')
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')

    // Apply filters
    let filtered = [...data]

    if (type) {
      filtered = filtered.filter(a => a.animal_kind === type)
    }
    if (city) {
      filtered = filtered.filter(a =>
        a.shelter_address?.includes(city) ||
        a.shelter_name?.includes(city)
      )
    }
    if (sex) {
      filtered = filtered.filter(a => a.animal_sex === sex)
    }
    if (size) {
      filtered = filtered.filter(a => a.animal_bodytype === size)
    }
    if (age) {
      filtered = filtered.filter(a => a.animal_age === age)
    }

    // Pagination
    const total = filtered.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = filtered.slice(startIndex, endIndex)

    return c.json({
      data: paginatedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching animals:', error)
    return c.json({ error: 'Failed to fetch animals' }, 500)
  }
})

// Get single animal by ID
animalsRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const govUrl = c.env.GOV_API_URL || 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL'

    const response = await fetch(govUrl)
    const data = await response.json() as Animal[]

    const animal = data.find(a => a.animal_id === id)

    if (!animal) {
      return c.json({ error: 'Animal not found' }, 404)
    }

    return c.json(animal)
  } catch (error) {
    console.error('Error fetching animal:', error)
    return c.json({ error: 'Failed to fetch animal' }, 500)
  }
})

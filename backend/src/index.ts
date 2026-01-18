import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { animalsRoutes } from './routes/animals'
import { sheltersRoutes } from './routes/shelters'
import { fortuneRoutes } from './routes/fortune'
import { matchRoutes } from './routes/match'
import { imagesRoutes } from './routes/images'

type Bindings = {
  GOV_API_URL: string
  CACHE?: KVNamespace
  IMAGES?: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

// Health check
app.get('/', (c) => {
  return c.json({
    name: '浪浪找家 API',
    version: '1.0.0',
    status: 'healthy',
  })
})

// API routes (with /api prefix)
app.route('/api/animals', animalsRoutes)
app.route('/api/shelters', sheltersRoutes)
app.route('/api/fortune', fortuneRoutes)
app.route('/api/match', matchRoutes)
app.route('/api/images', imagesRoutes)

// Also mount without /api prefix for direct access
app.route('/images', imagesRoutes)
app.route('/animals', animalsRoutes)
app.route('/shelters', sheltersRoutes)
app.route('/fortune', fortuneRoutes)
app.route('/match', matchRoutes)

// Stats endpoint
const statsHandler = async (c: any) => {
  try {
    const govUrl = c.env.GOV_API_URL || 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL'
    const response = await fetch(govUrl)
    const data = await response.json() as any[]

    const dogs = data.filter(a => a.animal_kind === '狗').length
    const cats = data.filter(a => a.animal_kind === '貓').length
    const shelters = new Set(data.map(a => a.shelter_name)).size

    return c.json({
      total: data.length,
      dogs,
      cats,
      shelters,
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch stats' }, 500)
  }
}

app.get('/api/stats', statsHandler)
app.get('/stats', statsHandler)

export default app

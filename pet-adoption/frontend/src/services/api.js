const API_BASE = import.meta.env.PROD
  ? 'https://pet-adoption-api.your-subdomain.workers.dev'
  : '/api'

// Government API direct access for development
const GOV_API = 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL'

// Image proxy - use Cloudflare Workers to cache and serve images faster
export function getProxiedImageUrl(originalUrl) {
  if (!originalUrl) return null

  // In production, use the image proxy
  if (import.meta.env.PROD) {
    return `${API_BASE}/images?url=${encodeURIComponent(originalUrl)}`
  }

  // In development, use original URL directly
  return originalUrl
}

// Cache configuration
const CACHE_KEY = 'pet-adoption-animals-cache'
const CACHE_EXPIRY = 10 * 60 * 1000 // 10 minutes
const LAST_SIZE_KEY = 'pet-adoption-last-size'

// Progress tracking
let progressCallbacks = []
let currentProgress = { loaded: 0, total: 0, percent: 0, status: 'idle' }

export function subscribeToProgress(callback) {
  progressCallbacks.push(callback)
  callback(currentProgress) // Send current state immediately
  return () => {
    progressCallbacks = progressCallbacks.filter(cb => cb !== callback)
  }
}

function updateProgress(progress) {
  currentProgress = progress
  progressCallbacks.forEach(cb => cb(progress))
}

// Get last known response size for progress estimation
function getLastKnownSize() {
  try {
    return parseInt(localStorage.getItem(LAST_SIZE_KEY)) || 5000000 // Default ~5MB
  } catch {
    return 5000000
  }
}

function setLastKnownSize(size) {
  try {
    localStorage.setItem(LAST_SIZE_KEY, size.toString())
  } catch {}
}

// Get cached data
function getCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    const isExpired = Date.now() - timestamp > CACHE_EXPIRY

    return { data, isExpired }
  } catch {
    return null
  }
}

// Set cache
function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.warn('Failed to cache data:', e)
  }
}

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json()
}

// Get cached data for placeholder (synchronous)
export function getCachedAnimals() {
  const cached = getCache()
  return cached?.data || null
}

// Fetch animals directly from government API with progress tracking
export async function fetchAnimalsFromGov() {
  // Check cache first
  const cached = getCache()

  // If we have fresh cache, return it
  if (cached && !cached.isExpired) {
    console.log('📦 Using cached data (fresh)')
    updateProgress({ loaded: 0, total: 0, percent: 100, status: 'cached' })
    return cached.data
  }

  // Fetch fresh data from API with progress tracking
  console.log('🔄 Fetching fresh data from API...')
  updateProgress({ loaded: 0, total: 0, percent: 0, status: 'loading' })

  try {
    const response = await fetch(GOV_API)
    if (!response.ok) {
      throw new Error('Failed to fetch from government API')
    }

    // Get content length or use estimated size
    const contentLength = response.headers.get('Content-Length')
    const totalSize = contentLength ? parseInt(contentLength) : getLastKnownSize()

    // Read the response body as a stream to track progress
    const reader = response.body.getReader()
    const chunks = []
    let receivedLength = 0

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      chunks.push(value)
      receivedLength += value.length

      // Calculate and report progress
      const percent = Math.min(Math.round((receivedLength / totalSize) * 100), 99)
      updateProgress({
        loaded: receivedLength,
        total: totalSize,
        percent,
        status: 'loading'
      })
    }

    // Save actual size for future estimates
    setLastKnownSize(receivedLength)

    // Combine chunks and parse JSON
    const allChunks = new Uint8Array(receivedLength)
    let position = 0
    for (const chunk of chunks) {
      allChunks.set(chunk, position)
      position += chunk.length
    }

    const text = new TextDecoder('utf-8').decode(allChunks)
    const data = JSON.parse(text)

    setCache(data)
    updateProgress({ loaded: receivedLength, total: receivedLength, percent: 100, status: 'done' })
    console.log('✅ Fresh data cached:', data.length, 'animals')

    // Reset to idle after 2 seconds
    setTimeout(() => {
      updateProgress({ loaded: 0, total: 0, percent: 0, status: 'idle' })
    }, 2000)

    return data
  } catch (error) {
    updateProgress({ loaded: 0, total: 0, percent: 0, status: 'error' })
    // If fetch fails but we have stale cache, use it
    if (cached) {
      console.log('⚠️ API failed, using stale cache')
      updateProgress({ loaded: 0, total: 0, percent: 100, status: 'cached' })
      return cached.data
    }
    throw error
  }
}

// Animals API
export async function fetchAnimals(filters = {}) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value)
  })

  const queryString = params.toString()

  try {
    return await fetchAPI(`/animals${queryString ? `?${queryString}` : ''}`)
  } catch (error) {
    // Fallback to direct government API
    console.log('Using government API directly...')
    const data = await fetchAnimalsFromGov()
    return filterAnimals(data, filters)
  }
}

export async function fetchAnimalById(id) {
  try {
    return await fetchAPI(`/animals/${id}`)
  } catch {
    const data = await fetchAnimalsFromGov()
    return data.find(animal => animal.animal_id === parseInt(id))
  }
}

// Shelters API
export async function fetchShelters() {
  try {
    return await fetchAPI('/shelters')
  } catch {
    // Return static shelter data
    return getShelterData()
  }
}

// Fortune API
export async function fetchFortune() {
  try {
    return await fetchAPI('/fortune/today')
  } catch {
    // Generate local fortune
    const data = await fetchAnimalsFromGov()
    return generateFortune(data)
  }
}

// Match API
export async function submitMatch(answers) {
  try {
    return await fetchAPI('/match', {
      method: 'POST',
      body: JSON.stringify(answers),
    })
  } catch {
    const data = await fetchAnimalsFromGov()
    return calculateMatch(data, answers)
  }
}

// Stats API
export async function fetchStats() {
  try {
    return await fetchAPI('/stats')
  } catch {
    const data = await fetchAnimalsFromGov()
    return calculateStats(data)
  }
}

// Helper functions
function filterAnimals(data, filters) {
  let filtered = [...data]

  if (filters.type) {
    filtered = filtered.filter(a => a.animal_kind === filters.type)
  }
  if (filters.city) {
    filtered = filtered.filter(a => a.shelter_address?.includes(filters.city))
  }
  if (filters.sex) {
    filtered = filtered.filter(a => a.animal_sex === filters.sex)
  }
  if (filters.size) {
    filtered = filtered.filter(a => a.animal_bodytype === filters.size)
  }
  if (filters.age) {
    filtered = filtered.filter(a => a.animal_age === filters.age)
  }

  return {
    data: filtered.slice(0, filters.limit || 20),
    total: filtered.length,
    page: filters.page || 1,
  }
}

function calculateStats(data) {
  const dogs = data.filter(a => a.animal_kind === '狗').length
  const cats = data.filter(a => a.animal_kind === '貓').length
  const shelters = new Set(data.map(a => a.shelter_name)).size

  return {
    total: data.length,
    dogs,
    cats,
    shelters,
    adopted: Math.floor(data.length * 0.3), // Estimated
  }
}

const fortuneTypes = [
  { type: '大吉', message: '今天超級幸運！這隻毛孩與你特別有緣，說不定就是命中注定！', color: '#FFB4A2' },
  { type: '中吉', message: '緣分指數很高！這隻毛孩的個性很適合你，值得認識一下！', color: '#B5E2D8' },
  { type: '小吉', message: '有著小小的緣分，也許聊聊天就會發現驚喜！', color: '#FFE5B4' },
  { type: '吉', message: '今日宜認養！打開心房，幸福就會來敲門。', color: '#F5EBE0' },
]

const fortunePoems = [
  '毛茸茸的緣分，在此刻悄悄萌芽',
  '汪汪叫的幸福，正等著與你相遇',
  '喵喵的呼喚，是命運的輕聲細語',
  '四隻腳的天使，已在遠方向你招手',
  '愛的種子，在收容所裡靜靜等待',
  '溫暖的掌心，終將遇見毛絨絨的依賴',
]

function generateFortune(data) {
  const today = new Date().toDateString()
  const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0)

  const validAnimals = data.filter(a => a.album_file)
  const randomIndex = seed % validAnimals.length
  const animal = validAnimals[randomIndex] || data[0]

  const fortuneIndex = seed % fortuneTypes.length
  const poemIndex = seed % fortunePoems.length

  return {
    animal,
    fortune: fortuneTypes[fortuneIndex],
    poem: fortunePoems[poemIndex],
    date: today,
  }
}

function calculateMatch(data, answers) {
  const { space, activity, experience, time, preference } = answers

  let filteredType = preference === 'any' ? null : preference

  // Score animals based on answers
  const scored = data
    .filter(a => a.album_file && (!filteredType || a.animal_kind === filteredType))
    .map(animal => {
      let score = 50 // Base score

      // Space matching
      if (space === 'large' && animal.animal_bodytype === 'BIG') score += 20
      if (space === 'medium' && animal.animal_bodytype === 'MEDIUM') score += 20
      if (space === 'small' && animal.animal_bodytype === 'SMALL') score += 20

      // Activity level
      if (activity === 'high' && animal.animal_kind === '狗') score += 15
      if (activity === 'low' && animal.animal_kind === '貓') score += 15

      // Experience
      if (experience === 'none' && animal.animal_age === 'ADULT') score += 10
      if (experience === 'some') score += 5
      if (experience === 'experienced') score += 10

      // Time
      if (time === 'plenty') score += 10
      if (time === 'moderate') score += 5

      return { ...animal, matchScore: Math.min(score, 100) }
    })
    .sort((a, b) => b.matchScore - a.matchScore)

  return {
    matches: scored.slice(0, 6),
    topMatch: scored[0],
  }
}

function getShelterData() {
  return [
    { id: 1, name: '臺北市動物之家', address: '臺北市內湖區潭美街852號', lat: 25.0657, lng: 121.5833, city: '臺北市' },
    { id: 2, name: '新北市板橋動物之家', address: '新北市板橋區板城路28-1號', lat: 24.9975, lng: 121.4494, city: '新北市' },
    { id: 3, name: '桃園市動物保護教育園區', address: '桃園市新屋區永興里三鄰大坡腳32-2號', lat: 24.9744, lng: 121.0861, city: '桃園市' },
    { id: 4, name: '臺中市動物之家南屯園區', address: '臺中市南屯區中台路601號', lat: 24.1322, lng: 120.6167, city: '臺中市' },
    { id: 5, name: '臺中市動物之家后里園區', address: '臺中市后里區堤防路370號', lat: 24.2889, lng: 120.7278, city: '臺中市' },
    { id: 6, name: '臺南市動物之家灣裡站', address: '臺南市南區省躬里15鄰萬年路580巷92號', lat: 22.9372, lng: 120.1800, city: '臺南市' },
    { id: 7, name: '臺南市動物之家善化站', address: '臺南市善化區昌隆里東勢寮1-19號', lat: 23.1361, lng: 120.2931, city: '臺南市' },
    { id: 8, name: '高雄市壽山動物保護教育園區', address: '高雄市鼓山區萬壽路350號', lat: 22.6411, lng: 120.2733, city: '高雄市' },
    { id: 9, name: '高雄市燕巢動物保護關愛園區', address: '高雄市燕巢區師大路98號', lat: 22.7836, lng: 120.3972, city: '高雄市' },
    { id: 10, name: '基隆市寵物銀行', address: '基隆市七堵區大德路1號', lat: 25.1031, lng: 121.7244, city: '基隆市' },
    { id: 11, name: '新竹市動物保護教育園區', address: '新竹市南寮里海濱路250號', lat: 24.8472, lng: 120.9217, city: '新竹市' },
    { id: 12, name: '新竹縣動物保護教育園區', address: '新竹縣竹北市縣政五街192號', lat: 24.8361, lng: 121.0119, city: '新竹縣' },
    { id: 13, name: '苗栗縣生態保育教育中心', address: '苗栗縣銅鑼鄉朝陽村6鄰朝北55-1號', lat: 24.4636, lng: 120.7917, city: '苗栗縣' },
    { id: 14, name: '彰化縣流浪狗中途之家', address: '彰化縣員林市大明里山腳路3段451巷100號', lat: 23.9667, lng: 120.5833, city: '彰化縣' },
    { id: 15, name: '南投縣公立動物收容所', address: '南投縣南投市嶺興路36-1號', lat: 23.9167, lng: 120.6833, city: '南投縣' },
    { id: 16, name: '雲林縣流浪動物收容所', address: '雲林縣斗六市雲林路二段517號', lat: 23.7075, lng: 120.5414, city: '雲林縣' },
    { id: 17, name: '嘉義市動物保護教育園區', address: '嘉義市東區彌陀路2-1號', lat: 23.4867, lng: 120.4633, city: '嘉義市' },
    { id: 18, name: '嘉義縣流浪犬中途之家', address: '嘉義縣民雄鄉北斗村63-21號', lat: 23.5458, lng: 120.4314, city: '嘉義縣' },
    { id: 19, name: '屏東縣公立犬貓中途之家', address: '屏東縣內埔鄉學府路1號', lat: 22.6167, lng: 120.5667, city: '屏東縣' },
    { id: 20, name: '宜蘭縣流浪動物中途之家', address: '宜蘭縣五結鄉成興村利寶路60號', lat: 24.6833, lng: 121.7833, city: '宜蘭縣' },
    { id: 21, name: '花蓮縣狗貓躍動園區', address: '花蓮縣鳳林鎮林榮里永豐路255號', lat: 23.7500, lng: 121.4500, city: '花蓮縣' },
    { id: 22, name: '臺東縣動物收容中心', address: '臺東縣臺東市中華路四段999巷20號', lat: 22.7583, lng: 121.1444, city: '臺東縣' },
    { id: 23, name: '澎湖縣流浪動物收容中心', address: '澎湖縣馬公市烏崁里260號', lat: 23.5667, lng: 119.5833, city: '澎湖縣' },
    { id: 24, name: '金門縣動物收容中心', address: '金門縣金湖鎮裕民農莊內', lat: 24.4333, lng: 118.3833, city: '金門縣' },
    { id: 25, name: '連江縣流浪犬收容中心', address: '連江縣南竿鄉復興村216號', lat: 26.1583, lng: 119.9333, city: '連江縣' },
  ]
}

export { getShelterData }

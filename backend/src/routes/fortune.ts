import { Hono } from 'hono'

type Bindings = {
  GOV_API_URL: string
}

type Animal = {
  animal_id: number
  animal_kind: string
  album_file: string
  shelter_name: string
  [key: string]: any
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
  '有緣千里來相會，牠就是你的命定',
  '善良的心，將被毛孩溫柔以待',
  '今日緣分已至，不妨去看看牠',
  '幸福的開始，從認識這隻毛孩開始',
]

export const fortuneRoutes = new Hono<{ Bindings: Bindings }>()

// Get today's fortune
fortuneRoutes.get('/today', async (c) => {
  try {
    const govUrl = c.env.GOV_API_URL || 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL'

    const response = await fetch(govUrl)
    const data = await response.json() as Animal[]

    // Generate deterministic random based on today's date
    const today = new Date().toDateString()
    const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0)

    // Filter animals with images
    const validAnimals = data.filter(a => a.album_file)

    if (validAnimals.length === 0) {
      return c.json({ error: 'No animals available' }, 404)
    }

    // Select random animal based on seed
    const randomIndex = seed % validAnimals.length
    const animal = validAnimals[randomIndex]

    // Select fortune type and poem
    const fortuneIndex = seed % fortuneTypes.length
    const poemIndex = (seed * 7) % fortunePoems.length

    return c.json({
      animal,
      fortune: fortuneTypes[fortuneIndex],
      poem: fortunePoems[poemIndex],
      date: today,
    })
  } catch (error) {
    console.error('Error generating fortune:', error)
    return c.json({ error: 'Failed to generate fortune' }, 500)
  }
})

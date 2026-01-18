import { Hono } from 'hono'

type Bindings = {
  GOV_API_URL: string
  AI: any // Workers AI binding
}

type Animal = {
  animal_id: number
  animal_kind: string
  animal_sex: string
  animal_bodytype: string
  animal_age: string
  album_file: string
  shelter_name: string
  animal_colour: string
  animal_sterilization: string
  [key: string]: any
}

type MatchAnswers = {
  space: 'large' | 'medium' | 'small'
  activity: 'high' | 'moderate' | 'low'
  experience: 'experienced' | 'some' | 'none'
  time: 'plenty' | 'moderate' | 'limited'
  preference: '狗' | '貓' | 'any'
}

type ScoredAnimal = Animal & {
  matchScore: number
  aiReason?: string
}

export const matchRoutes = new Hono<{ Bindings: Bindings }>()

// Calculate match score for an animal based on answers
function calculateScore(animal: Animal, answers: MatchAnswers): number {
  let score = 50 // Base score

  // Space matching
  if (answers.space === 'large') {
    if (animal.animal_bodytype === 'BIG') score += 20
    else if (animal.animal_bodytype === 'MEDIUM') score += 10
  } else if (answers.space === 'medium') {
    if (animal.animal_bodytype === 'MEDIUM') score += 20
    else if (animal.animal_bodytype === 'SMALL') score += 15
    else if (animal.animal_bodytype === 'BIG') score += 5
  } else if (answers.space === 'small') {
    if (animal.animal_bodytype === 'SMALL') score += 20
    else if (animal.animal_bodytype === 'MEDIUM') score += 10
  }

  // Activity level matching
  if (answers.activity === 'high') {
    if (animal.animal_kind === '狗') score += 15
    if (animal.animal_age === 'CHILD') score += 5
  } else if (answers.activity === 'moderate') {
    score += 10
  } else if (answers.activity === 'low') {
    if (animal.animal_kind === '貓') score += 15
    if (animal.animal_age === 'ADULT') score += 5
  }

  // Experience matching
  if (answers.experience === 'experienced') {
    score += 10
  } else if (answers.experience === 'some') {
    score += 5
    if (animal.animal_age === 'ADULT') score += 5
  } else if (answers.experience === 'none') {
    if (animal.animal_age === 'ADULT') score += 10
    if (animal.animal_bodytype === 'SMALL') score += 5
    if (animal.animal_kind === '貓') score += 5
  }

  // Time availability matching
  if (answers.time === 'plenty') {
    score += 10
    if (animal.animal_kind === '狗') score += 5
    if (animal.animal_age === 'CHILD') score += 5
  } else if (answers.time === 'moderate') {
    score += 5
  } else if (answers.time === 'limited') {
    if (animal.animal_kind === '貓') score += 10
    if (animal.animal_age === 'ADULT') score += 5
  }

  return Math.min(score, 100)
}

// Generate AI explanation for a match
async function generateAIReason(
  ai: any,
  animal: Animal,
  answers: MatchAnswers,
  score: number
): Promise<string> {
  const spaceMap = { large: '大', medium: '中等', small: '小' }
  const activityMap = { high: '高', moderate: '中等', low: '低' }
  const expMap = { experienced: '有經驗', some: '有一些', none: '沒有' }
  const timeMap = { plenty: '充裕', moderate: '中等', limited: '有限' }
  const sizeMap: Record<string, string> = { BIG: '大型', MEDIUM: '中型', SMALL: '小型' }
  const ageMap: Record<string, string> = { ADULT: '成年', CHILD: '幼年' }
  const sexMap: Record<string, string> = { M: '男生', F: '女生', N: '未知' }

  const prompt = `你是一位專業的寵物配對顧問。請用繁體中文，用溫暖親切的語氣，說明為什麼這隻動物適合這位用戶。回答限制在50字以內。

用戶條件：
- 居住空間：${spaceMap[answers.space]}
- 活動量：${activityMap[answers.activity]}
- 養寵物經驗：${expMap[answers.experience]}
- 可照顧時間：${timeMap[answers.time]}

動物資訊：
- 種類：${animal.animal_kind}
- 性別：${sexMap[animal.animal_sex] || '未知'}
- 體型：${sizeMap[animal.animal_bodytype] || '未知'}
- 年齡：${ageMap[animal.animal_age] || '未知'}
- 毛色：${animal.animal_colour || '未知'}
- 絕育：${animal.animal_sterilization === 'T' ? '已絕育' : '未絕育'}

匹配度：${score}%

請直接給出推薦理由，不要重複上述資訊：`

  try {
    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt,
      max_tokens: 100,
    })
    return response.response?.trim() || '這隻毛孩很適合你！'
  } catch (error) {
    console.error('AI generation error:', error)
    return '這隻毛孩的條件與你很匹配！'
  }
}

// POST match endpoint
matchRoutes.post('/', async (c) => {
  try {
    const answers = await c.req.json() as MatchAnswers
    const govUrl = c.env.GOV_API_URL || 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL'

    const response = await fetch(govUrl)
    const data = await response.json() as Animal[]

    // Filter by preference and ensure has image
    let filtered = data.filter(a => a.album_file)

    if (answers.preference !== 'any') {
      filtered = filtered.filter(a => a.animal_kind === answers.preference)
    }

    // Calculate scores for all animals
    const scored: ScoredAnimal[] = filtered.map(animal => ({
      ...animal,
      matchScore: calculateScore(animal, answers),
    }))

    // Sort by score descending
    scored.sort((a, b) => b.matchScore - a.matchScore)

    // Get top 6 matches
    const topMatches = scored.slice(0, 6)

    // Generate AI reasons for top 3 matches (to save API calls)
    if (c.env.AI) {
      const aiPromises = topMatches.slice(0, 3).map(async (animal) => {
        animal.aiReason = await generateAIReason(c.env.AI, animal, answers, animal.matchScore)
        return animal
      })
      await Promise.all(aiPromises)
    }

    return c.json({
      matches: topMatches,
      topMatch: topMatches[0] || null,
      totalConsidered: filtered.length,
    })
  } catch (error) {
    console.error('Error calculating match:', error)
    return c.json({ error: 'Failed to calculate match' }, 500)
  }
})

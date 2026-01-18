import { Hono } from 'hono'

type Bindings = {
  GOV_API_URL: string
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
    // Experienced owners can handle any animal
  } else if (answers.experience === 'some') {
    score += 5
    if (animal.animal_age === 'ADULT') score += 5
  } else if (answers.experience === 'none') {
    // New owners better with adult, smaller animals
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

  // Cap score at 100
  return Math.min(score, 100)
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

    // Return top matches
    const topMatches = scored.slice(0, 10)

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

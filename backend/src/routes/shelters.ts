import { Hono } from 'hono'

type Bindings = {
  GOV_API_URL: string
}

export const sheltersRoutes = new Hono<{ Bindings: Bindings }>()

// Taiwan shelter data with coordinates
const shelterData = [
  { id: 1, name: '臺北市動物之家', address: '臺北市內湖區潭美街852號', lat: 25.0657, lng: 121.5833, city: '臺北市', tel: '02-87913254' },
  { id: 2, name: '新北市板橋動物之家', address: '新北市板橋區板城路28-1號', lat: 24.9975, lng: 121.4494, city: '新北市', tel: '02-29596353' },
  { id: 3, name: '新北市中和動物之家', address: '新北市中和區興南路三段100號', lat: 24.9667, lng: 121.4833, city: '新北市', tel: '02-86685547' },
  { id: 4, name: '新北市新店動物之家', address: '新北市新店區安康路三段600巷205號', lat: 24.9500, lng: 121.5333, city: '新北市', tel: '02-82112980' },
  { id: 5, name: '新北市淡水動物之家', address: '新北市淡水區下圭柔山91之3號', lat: 25.1833, lng: 121.4500, city: '新北市', tel: '02-26368442' },
  { id: 6, name: '新北市瑞芳動物之家', address: '新北市瑞芳區靜安路四段1-55號', lat: 25.1000, lng: 121.8333, city: '新北市', tel: '02-24975167' },
  { id: 7, name: '新北市五股動物之家', address: '新北市五股區外寮路9-9號', lat: 25.0833, lng: 121.4333, city: '新北市', tel: '02-82925001' },
  { id: 8, name: '新北市八里動物之家', address: '新北市八里區長坑里長坑道路36號', lat: 25.1333, lng: 121.4000, city: '新北市', tel: '02-26194428' },
  { id: 9, name: '新北市三芝動物之家', address: '新北市三芝區福德里橫山55-1號', lat: 25.2333, lng: 121.5000, city: '新北市', tel: '02-26365002' },
  { id: 10, name: '桃園市動物保護教育園區', address: '桃園市新屋區永興里三鄰大坡腳32-2號', lat: 24.9744, lng: 121.0861, city: '桃園市', tel: '03-4861760' },
  { id: 11, name: '臺中市動物之家南屯園區', address: '臺中市南屯區中台路601號', lat: 24.1322, lng: 120.6167, city: '臺中市', tel: '04-23850976' },
  { id: 12, name: '臺中市動物之家后里園區', address: '臺中市后里區堤防路370號', lat: 24.2889, lng: 120.7278, city: '臺中市', tel: '04-25588024' },
  { id: 13, name: '臺南市動物之家灣裡站', address: '臺南市南區省躬里15鄰萬年路580巷92號', lat: 22.9372, lng: 120.1800, city: '臺南市', tel: '06-2964439' },
  { id: 14, name: '臺南市動物之家善化站', address: '臺南市善化區昌隆里東勢寮1-19號', lat: 23.1361, lng: 120.2931, city: '臺南市', tel: '06-5832399' },
  { id: 15, name: '高雄市壽山動物保護教育園區', address: '高雄市鼓山區萬壽路350號', lat: 22.6411, lng: 120.2733, city: '高雄市', tel: '07-5519059' },
  { id: 16, name: '高雄市燕巢動物保護關愛園區', address: '高雄市燕巢區師大路98號', lat: 22.7836, lng: 120.3972, city: '高雄市', tel: '07-6051002' },
  { id: 17, name: '基隆市寵物銀行', address: '基隆市七堵區大德路1號', lat: 25.1031, lng: 121.7244, city: '基隆市', tel: '02-24560148' },
  { id: 18, name: '新竹市動物保護教育園區', address: '新竹市南寮里海濱路250號', lat: 24.8472, lng: 120.9217, city: '新竹市', tel: '03-5368329' },
  { id: 19, name: '新竹縣動物保護教育園區', address: '新竹縣竹北市縣政五街192號', lat: 24.8361, lng: 121.0119, city: '新竹縣', tel: '03-5519548' },
  { id: 20, name: '苗栗縣生態保育教育中心', address: '苗栗縣銅鑼鄉朝陽村6鄰朝北55-1號', lat: 24.4636, lng: 120.7917, city: '苗栗縣', tel: '037-558228' },
  { id: 21, name: '彰化縣流浪狗中途之家', address: '彰化縣員林市大明里山腳路3段451巷100號', lat: 23.9667, lng: 120.5833, city: '彰化縣', tel: '04-8590638' },
  { id: 22, name: '南投縣公立動物收容所', address: '南投縣南投市嶺興路36-1號', lat: 23.9167, lng: 120.6833, city: '南投縣', tel: '049-2225440' },
  { id: 23, name: '雲林縣流浪動物收容所', address: '雲林縣斗六市雲林路二段517號', lat: 23.7075, lng: 120.5414, city: '雲林縣', tel: '05-5523300' },
  { id: 24, name: '嘉義市動物保護教育園區', address: '嘉義市東區彌陀路2-1號', lat: 23.4867, lng: 120.4633, city: '嘉義市', tel: '05-2168661' },
  { id: 25, name: '嘉義縣流浪犬中途之家', address: '嘉義縣民雄鄉北斗村63-21號', lat: 23.5458, lng: 120.4314, city: '嘉義縣', tel: '05-2262922' },
  { id: 26, name: '屏東縣公立犬貓中途之家', address: '屏東縣內埔鄉學府路1號', lat: 22.6167, lng: 120.5667, city: '屏東縣', tel: '08-7740588' },
  { id: 27, name: '宜蘭縣流浪動物中途之家', address: '宜蘭縣五結鄉成興村利寶路60號', lat: 24.6833, lng: 121.7833, city: '宜蘭縣', tel: '039-602350' },
  { id: 28, name: '花蓮縣狗貓躍動園區', address: '花蓮縣鳳林鎮林榮里永豐路255號', lat: 23.7500, lng: 121.4500, city: '花蓮縣', tel: '03-8421452' },
  { id: 29, name: '臺東縣動物收容中心', address: '臺東縣臺東市中華路四段999巷20號', lat: 22.7583, lng: 121.1444, city: '臺東縣', tel: '089-362011' },
  { id: 30, name: '澎湖縣流浪動物收容中心', address: '澎湖縣馬公市烏崁里260號', lat: 23.5667, lng: 119.5833, city: '澎湖縣', tel: '06-9213559' },
  { id: 31, name: '金門縣動物收容中心', address: '金門縣金湖鎮裕民農莊內', lat: 24.4333, lng: 118.3833, city: '金門縣', tel: '082-336625' },
  { id: 32, name: '連江縣流浪犬收容中心', address: '連江縣南竿鄉復興村216號', lat: 26.1583, lng: 119.9333, city: '連江縣', tel: '0836-25003' },
]

// Get all shelters
sheltersRoutes.get('/', (c) => {
  const city = c.req.query('city')

  let filtered = shelterData
  if (city) {
    filtered = shelterData.filter(s => s.city === city)
  }

  return c.json(filtered)
})

// Get single shelter by ID
sheltersRoutes.get('/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const shelter = shelterData.find(s => s.id === id)

  if (!shelter) {
    return c.json({ error: 'Shelter not found' }, 404)
  }

  return c.json(shelter)
})

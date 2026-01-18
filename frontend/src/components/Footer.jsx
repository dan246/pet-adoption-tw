import { Heart, Github, Mail, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-warm-beige/50 border-t border-warm-beige mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-display font-bold text-text-primary">
                浪浪找家
              </span>
            </div>
            <p className="text-text-secondary max-w-md mb-4">
              我們相信每個毛孩都值得一個溫暖的家。透過科技的力量，
              讓更多流浪動物被看見，找到愛牠的主人。
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white shadow-soft hover:shadow-glow transition-all"
              >
                <Github className="w-5 h-5 text-text-secondary" />
              </a>
              <a
                href="mailto:hello@example.com"
                className="p-2 rounded-full bg-white shadow-soft hover:shadow-glow transition-all"
              >
                <Mail className="w-5 h-5 text-text-secondary" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-text-primary mb-4">快速連結</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/adopt" className="text-text-secondary hover:text-primary transition-colors">
                  領養專區
                </Link>
              </li>
              <li>
                <Link to="/fortune" className="text-text-secondary hover:text-primary transition-colors">
                  每日抽籤
                </Link>
              </li>
              <li>
                <Link to="/match" className="text-text-secondary hover:text-primary transition-colors">
                  AI 配對
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-text-secondary hover:text-primary transition-colors">
                  收容所地圖
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-bold text-text-primary mb-4">資料來源</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://data.gov.tw/dataset/85903"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
                >
                  政府開放資料平台
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.pet.gov.tw/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
                >
                  全國動物收容管理系統
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-warm-beige">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-light">
            <p>© 2024 浪浪找家. Made with ❤️ for homeless pets.</p>
            <p>資料來源：農業部動物保護司</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

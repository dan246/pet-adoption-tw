import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoadingProgress from './components/LoadingProgress'
import Home from './pages/Home'
import Adopt from './pages/Adopt'
import Fortune from './pages/Fortune'
import Match from './pages/Match'
import MapView from './pages/MapView'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen flex flex-col gradient-bg">
        <Navbar />
        <LoadingProgress />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/adopt" element={<Adopt />} />
              <Route path="/fortune" element={<Fortune />} />
              <Route path="/match" element={<Match />} />
              <Route path="/map" element={<MapView />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App

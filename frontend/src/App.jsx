import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import PredictPage from './pages/PredictPage'
import DashboardPage from './pages/DashboardPage'
import ComparePage from './pages/ComparePage'
import Footer from './components/Footer'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--dark-bg)' }}>
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/predict" element={<PredictPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/compare" element={<ComparePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

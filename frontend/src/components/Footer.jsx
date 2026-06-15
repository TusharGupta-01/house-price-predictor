import { Link } from 'react-router-dom'
import { HiSparkles } from 'react-icons/hi2'
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4f5ff7, #a78bfa)' }}>
                <HiSparkles className="text-white text-sm" />
              </div>
              <span className="font-display font-bold text-lg">
                <span className="gradient-text-blue">Prop</span>
                <span className="text-white">AI</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              AI-powered real estate intelligence for Bengaluru and Mumbai. 
              Built with machine learning models trained on real market data.
            </p>
            <div className="flex gap-3 mt-5">
              {[FiGithub, FiTwitter, FiLinkedin].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-500 hover:text-white hover:border-primary-500/40 transition-all">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <div className="flex flex-col gap-2">
              {[['/', 'Home'], ['/predict', 'Predict Price'], ['/dashboard', 'Dashboard'], ['/compare', 'Compare']].map(([path, label]) => (
                <Link key={path} to={path} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Cities</h4>
            <div className="flex flex-col gap-2">
              {['Bengaluru', 'Mumbai', 'More coming soon...'].map((city) => (
                <span key={city} className="text-gray-500 text-sm">{city}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © 2024 PropAI. Built for academic & research purposes.
          </p>
          <p className="text-gray-700 text-xs">
            Models: Random Forest (Bengaluru R²=0.9975) · Gradient Boosting (Mumbai R²=0.9968)
          </p>
        </div>
      </div>
    </footer>
  )
}

import { Routes, Route } from 'react-router-dom'
import { ROUTES } from './lib/routes'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Structure from './pages/Structure'
import Members from './pages/Members'
import Gallery from './pages/Gallery'
import About from './pages/About'
import Admin from './pages/Admin'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main id="main">
        <Routes>
          <Route path={ROUTES.home} element={<Home />} />
          <Route path={ROUTES.structure} element={<Structure />} />
          <Route path={ROUTES.members} element={<Members />} />
          <Route path={ROUTES.gallery} element={<Gallery />} />
          <Route path={ROUTES.about} element={<About />} />
          <Route path={ROUTES.admin} element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

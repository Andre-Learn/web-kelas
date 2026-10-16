import Hero from '../components/Hero.jsx';
import AboutSection from '../components/home/AboutSection.jsx';
import StructureSection from '../components/home/StructureSection.jsx';
import MembersSection from '../components/home/MembersSection.jsx';
import GallerySection from '../components/home/GallerySection.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

// Section order is fixed by the PRD: Hero, About, Structure, Members, Gallery, then the shared Footer.
export default function HomePage() {
  useDocumentTitle('');
  return (
    <>
      <Hero />
      <AboutSection />
      <StructureSection />
      <MembersSection />
      <GallerySection />
    </>
  );
}

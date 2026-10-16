import { Link } from 'react-router-dom';
import { m } from 'framer-motion';

/** Shared top block for secondary pages; sits under the solid glass navbar. */
export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="page-header">
      <div className="container">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <ol role="list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li aria-current="page">{title}</li>
          </ol>
        </nav>
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="page-header__text"
        >
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="page-header__title">{title}</h1>
          {description ? <p className="page-header__desc">{description}</p> : null}
        </m.div>
        {children}
      </div>
    </header>
  );
}

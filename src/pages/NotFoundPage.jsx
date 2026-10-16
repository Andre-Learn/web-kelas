import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <section className="not-found">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1 className="page-header__title">This page does not exist.</h1>
        <p className="page-header__desc">The link may be old or mistyped.</p>
        <Link to="/" className="btn btn--primary">
          Back to home
        </Link>
      </div>
    </section>
  );
}

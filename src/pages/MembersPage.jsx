import { useDeferredValue, useId, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import MemberGrid from '../components/MemberGrid.jsx';
import Icon from '../components/Icon.jsx';
import { EmptyState, SkeletonGrid } from '../components/States.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useContent } from '../context/ContentContext.jsx';

const normalise = (s) =>
  s
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export default function MembersPage() {
  useDocumentTitle('Members');
  const { content, status } = useContent();
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const inputId = useId();
  const members = content.members;

  const results = useMemo(() => {
    const q = normalise(deferred);
    if (!q) return members;
    return members.filter((m) => normalise(m.name).includes(q));
  }, [members, deferred]);

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Class Members"
        description={members.length ? `All ${members.length} students of XI TJKT-1.` : 'Every student of XI TJKT-1.'}
      >
        {members.length ? (
          <div className="search">
            <label htmlFor={inputId} className="sr-only">
              Search members by name
            </label>
            <Icon name="search" size={18} className="search__icon" />
            <input
              id={inputId}
              type="search"
              className="search__input"
              placeholder="Search by name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              enterKeyHint="search"
            />
            {query ? (
              <button type="button" className="search__clear" onClick={() => setQuery('')} aria-label="Clear search">
                <Icon name="close" size={16} />
              </button>
            ) : null}
          </div>
        ) : null}
      </PageHeader>

      <section className="section section--tight" aria-label="Member directory">
        <div className="container">
          <p className="sr-only" role="status" aria-live="polite">
            {query ? `${results.length} ${results.length === 1 ? 'member' : 'members'} found` : ''}
          </p>
          {status === 'loading' ? (
            <SkeletonGrid count={10} />
          ) : !members.length ? (
            <EmptyState icon="users" title="Member profiles are on the way">
              Students will appear here once their names and photos are added with permission.
            </EmptyState>
          ) : results.length ? (
            <MemberGrid members={results} />
          ) : (
            <EmptyState
              icon="search"
              title={`No one named “${query.trim()}”`}
              action={
                <button type="button" className="btn btn--sm" onClick={() => setQuery('')}>
                  Clear search
                </button>
              }
            >
              Check the spelling or try part of the name.
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}

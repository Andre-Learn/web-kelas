import { ErrorState, LoadingState } from '../States.jsx';
import { useContent } from '../../context/ContentContext.jsx';

/**
 * Renders its children only after the saved content has loaded.
 * Forms copy their initial values on mount, so mounting them earlier would fill them
 * with defaults that a save could then write over the real data.
 */
export default function ContentGate({ children, what = 'content' }) {
  const { status, error, reload } = useContent();
  if (status === 'ready') return children;
  if (status === 'error') {
    return (
      <ErrorState title={`The saved ${what} could not be loaded`} onRetry={reload}>
        {error} Editing is turned off until it loads, so nothing you have already published is overwritten.
      </ErrorState>
    );
  }
  return <LoadingState label={`Loading the saved ${what}…`} />;
}

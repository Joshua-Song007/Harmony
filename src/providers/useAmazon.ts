import { useContext } from 'solid-js';
import { AmazonContext, AmazonContextValue } from './AmazonProvider';

export type { Album, AmazonContextValue, LibraryItem, Playlist, Track } from './AmazonProvider';

export function useAmazon(): AmazonContextValue {
  const ctx = useContext(AmazonContext);
  if (!ctx) throw new Error('useAmazon must be used within AmazonProvider');
  return ctx;
}

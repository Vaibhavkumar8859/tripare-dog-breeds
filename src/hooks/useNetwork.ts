import { useEffect } from 'react';
import * as Network from 'expo-network';
import { useBreedStore } from '../store/breedStore';

export function useNetworkStatus() {
  const setOnline = useBreedStore((s) => s.setOnline);
  const loadBreeds = useBreedStore((s) => s.loadBreeds);

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const state = await Network.getNetworkStateAsync();
        if (!mounted) return;
        const online = !!(state.isConnected && state.isInternetReachable !== false);
        setOnline(online);
        if (online) {
          // Background sync when network returns
          loadBreeds(true);
        }
      } catch {
        // ignore
      }
    }

    check();
    const interval = setInterval(check, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [setOnline, loadBreeds]);
}

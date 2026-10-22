import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useBreedStore } from '../../store/breedStore';

function formatAgo(ts: number | null): string {
  if (!ts) return 'Never';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function OfflineBanner() {
  const { lastSynced, error, isOnline, isLoading } = useBreedStore();

  if (isOnline && !error && !isLoading) {
    return (
      <View style={[styles.banner, styles.ok]}>
        <Text style={styles.text}>Last synced {formatAgo(lastSynced)}</Text>
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View style={[styles.banner, styles.offline]}>
        <Text style={styles.text}>
          Offline · Showing cached data · Last synced {formatAgo(lastSynced)}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.banner, styles.error]}>
        <Text style={styles.text}>
          Sync failed: {error} · Showing cached data
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  ok: { backgroundColor: '#e8f5e9' },
  offline: { backgroundColor: '#fff3e0' },
  error: { backgroundColor: '#ffebee' },
  text: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});

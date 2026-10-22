import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useBreedStore } from '../store/breedStore';
import { fetchBreedById, withRetry } from '../api/dogApi';
import type { Breed } from '../api/types';
import { TraitScale } from './components/TraitScale';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getSizeBand } from '../utils/filters';

type Route = RouteProp<RootStackParamList, 'BreedDetail'>;

type Tab = 'overview' | 'traits' | 'gallery';

export default function BreedDetailScreen() {
  const route = useRoute<Route>();
  const { id } = route.params;
  const cached = useBreedStore((s) => s.breeds.find((b) => b.id === id));
  const [breed, setBreed] = useState<Breed | undefined>(cached);
  const [loading, setLoading] = useState(!cached);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const fresh = await withRetry(() => fetchBreedById(id));
        if (!cancelled) {
          setBreed(fresh);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    refresh();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading && !breed) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!breed) {
    return (
      <View style={styles.center}>
        <Text>Breed not found</Text>
      </View>
    );
  }

  const a = breed.attributes;
  const size = getSizeBand(breed);

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {(['overview', 'traits', 'gallery'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {tab === 'overview' && (
          <>
            <Text style={styles.title}>{a.name}</Text>
            {a.other_names && a.other_names.length > 0 && (
              <Text style={styles.other}>Also known as: {a.other_names.join(', ')}</Text>
            )}
            <Text style={styles.desc}>{a.description ?? 'No description available.'}</Text>

            <View style={styles.metaGrid}>
              <Meta label="Size" value={size} />
              <Meta
                label="Lifespan"
                value={
                  a.life
                    ? `${a.life.min}–${a.life.max} years`
                    : '—'
                }
              />
              <Meta
                label="Male weight"
                value={
                  a.male_weight
                    ? `${a.male_weight.min}–${a.male_weight.max} kg`
                    : '—'
                }
              />
              <Meta
                label="Female weight"
                value={
                  a.female_weight
                    ? `${a.female_weight.min}–${a.female_weight.max} kg`
                    : '—'
                }
              />
              <Meta
                label="Hypoallergenic"
                value={a.hypoallergenic ? 'Yes' : 'No'}
              />
            </View>
          </>
        )}

        {tab === 'traits' && (
          <>
            <Text style={styles.sectionTitle}>Trait Scores</Text>
            <TraitScale label="Energy" value={a.energy} />
            <TraitScale label="Barking" value={a.barking} />
            <TraitScale label="Drooling" value={a.drooling} />
            <TraitScale label="Grooming" value={a.grooming} />
            <TraitScale label="Shedding" value={a.shedding} />
            <TraitScale label="Trainability" value={a.trainability} />
            <TraitScale label="Good with dogs" value={a.good_with_dogs} />
            <TraitScale label="Good with children" value={a.good_with_children} />
            <TraitScale label="Good with strangers" value={a.good_with_strangers} />
            <TraitScale label="Apartment friendly" value={a.apartment_friendly} />
            {a.temperament && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                  Temperament
                </Text>
                <Text style={styles.desc}>{a.temperament}</Text>
              </>
            )}
            {(!a.energy && !a.barking) && (
              <Text style={styles.note}>
                Detailed numeric traits are enriched on detail fetch when available from the API.
              </Text>
            )}
          </>
        )}

        {tab === 'gallery' && (
          <View>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <Text style={styles.note}>
              Image gallery with author / license / source attribution would render here.
              Each image from the API response carries attribution metadata — surface it
              under every photo (not dropped). Use expo-image for efficient caching of
              medium/large variants only on this screen.
            </Text>
            <Text style={styles.note}>
              Placeholder: implement swipeable FlatList of images with caption for
              author · license · source.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: { fontSize: 14, color: '#888' },
  tabTextActive: { color: '#007AFF', fontWeight: '600' },
  body: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  other: { fontSize: 13, color: '#666', marginBottom: 12 },
  desc: { fontSize: 15, lineHeight: 22, color: '#333', marginBottom: 16 },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    width: '47%',
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderRadius: 8,
  },
  metaLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  metaValue: { fontSize: 15, fontWeight: '600', color: '#222' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  note: { fontSize: 13, color: '#888', lineHeight: 20, marginTop: 8 },
});

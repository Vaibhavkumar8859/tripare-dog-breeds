import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBreedStore } from '../store/breedStore';
import { applyFilters, groupByBreedGroup } from '../utils/filters';
import type { FilterState } from '../api/types';
import { BreedCard } from './components/BreedCard';
import { FilterModal } from './components/FilterModal';
import { OfflineBanner } from './components/OfflineBanner';
import { useNetworkStatus } from '../hooks/useNetwork';
import type { RootStackParamList } from '../navigation/AppNavigator';

const EMPTY_FILTERS: FilterState = {
  groups: [],
  sizes: [],
  coatLengths: [],
  hypoallergenic: null,
  minTraitScores: {},
};

export default function BreedListScreen() {
  useNetworkStatus();

  const { breeds, groups, isLoading, loadBreeds } = useBreedStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(
    () => applyFilters(breeds, debouncedSearch, filters),
    [breeds, debouncedSearch, filters]
  );

  const sections = useMemo(
    () => groupByBreedGroup(filtered, groups),
    [filtered, groups]
  );

  const onRefresh = useCallback(() => loadBreeds(true), [loadBreeds]);

  const activeFilterCount =
    filters.groups.length +
    filters.sizes.length +
    (filters.hypoallergenic !== null ? 1 : 0);

  return (
    <View style={styles.container}>
      <OfflineBanner />

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search by name or other names..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterText}>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.count}>
        {filtered.length} of {breeds.length} breeds
      </Text>

      {isLoading && breeds.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading 283 breeds…</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BreedCard
              breed={item}
              onPress={() =>
                navigation.navigate('BreedDetail', { id: item.id })
              }
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          stickySectionHeadersEnabled
          initialNumToRender={15}
          maxToRenderPerBatch={12}
          windowSize={7}
          removeClippedSubviews
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>No breeds match your filters</Text>
            </View>
          }
        />
      )}

      <FilterModal
        visible={showFilters}
        groups={groups}
        filters={filters}
        onApply={setFilters}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  search: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    fontSize: 15,
  },
  filterBtn: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  filterText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  count: {
    fontSize: 12,
    color: '#888',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    textTransform: 'uppercase',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: { marginTop: 12, color: '#666' },
  empty: { color: '#999', fontSize: 16 },
});

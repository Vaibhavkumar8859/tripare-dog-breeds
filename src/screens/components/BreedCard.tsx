import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Breed } from '../../api/types';
import { getSizeBand } from '../../utils/filters';

interface Props {
  breed: Breed;
  onPress: () => void;
}

function BreedCardComponent({ breed, onPress }: Props) {
  const size = getSizeBand(breed);
  const hypo = breed.attributes.hypoallergenic;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {breed.attributes.name}
          </Text>
          <Text style={styles.meta}>
            {size.charAt(0).toUpperCase() + size.slice(1)}
            {hypo ? ' · Hypoallergenic' : ''}
          </Text>
          {breed.attributes.life && (
            <Text style={styles.life}>
              Lifespan {breed.attributes.life.min}–{breed.attributes.life.max} yrs
            </Text>
          )}
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

export const BreedCard = memo(BreedCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: { flex: 1 },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  life: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: '#bbb',
    marginLeft: 8,
  },
});

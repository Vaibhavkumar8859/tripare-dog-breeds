import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  value: number | undefined | null;
  max?: number;
}

export function TraitScale({ label, value, max = 5 }: Props) {
  const score = Math.max(0, Math.min(max, value ?? 0));
  const pct = (score / max) * 100;

  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.value}>{score.toFixed(0)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    width: 130,
    fontSize: 13,
    color: '#444',
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: '#e8e8e8',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  fill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  value: {
    width: 24,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
});

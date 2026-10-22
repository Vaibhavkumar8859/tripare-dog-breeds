import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import type { Group, FilterState, SizeBand } from '../../api/types';

interface Props {
  visible: boolean;
  groups: Group[];
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
}

const SIZE_OPTIONS: SizeBand[] = ['small', 'medium', 'large', 'giant'];

export function FilterModal({ visible, groups, filters, onApply, onClose }: Props) {
  const [local, setLocal] = useState<FilterState>(filters);

  const toggleGroup = (id: string) => {
    setLocal((prev) => {
      const next = prev.groups.includes(id)
        ? prev.groups.filter((g) => g !== id)
        : [...prev.groups, id];
      return { ...prev, groups: next };
    });
  };

  const toggleSize = (s: SizeBand) => {
    setLocal((prev) => {
      const next = prev.sizes.includes(s)
        ? prev.sizes.filter((x) => x !== s)
        : [...prev.sizes, s];
      return { ...prev, sizes: next };
    });
  };

  const apply = () => {
    onApply(local);
    onClose();
  };

  const reset = () => {
    const empty: FilterState = {
      groups: [],
      sizes: [],
      coatLengths: [],
      hypoallergenic: null,
      minTraitScores: {},
    };
    setLocal(empty);
    onApply(empty);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={apply}>
            <Text style={styles.apply}>Apply</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.section}>Breed Group</Text>
          {groups.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={styles.row}
              onPress={() => toggleGroup(g.id)}
            >
              <Text style={styles.label}>{g.attributes.name}</Text>
              <View
                style={[
                  styles.check,
                  local.groups.includes(g.id) && styles.checkOn,
                ]}
              />
            </TouchableOpacity>
          ))}

          <Text style={styles.section}>Size</Text>
          {SIZE_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.row}
              onPress={() => toggleSize(s)}
            >
              <Text style={styles.label}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
              <View
                style={[
                  styles.check,
                  local.sizes.includes(s) && styles.checkOn,
                ]}
              />
            </TouchableOpacity>
          ))}

          <Text style={styles.section}>Hypoallergenic</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Only hypoallergenic</Text>
            <Switch
              value={local.hypoallergenic === true}
              onValueChange={(v) =>
                setLocal((p) => ({
                  ...p,
                  hypoallergenic: v ? true : null,
                }))
              }
            />
          </View>

          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetText}>Reset all filters</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  title: { fontSize: 17, fontWeight: '600' },
  cancel: { color: '#666', fontSize: 16 },
  apply: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  body: { padding: 16 },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  label: { fontSize: 16, color: '#222' },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  checkOn: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  resetBtn: {
    marginTop: 32,
    padding: 14,
    alignItems: 'center',
  },
  resetText: { color: '#c62828', fontSize: 16 },
});

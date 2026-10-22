import type { Breed, FilterState, SizeBand } from '../api/types';

/** Derive size band from average weight (kg) */
export function getSizeBand(breed: Breed): SizeBand {
  const male = breed.attributes.male_weight;
  const female = breed.attributes.female_weight;
  const avg =
    ((male?.min ?? 0) + (male?.max ?? 0) + (female?.min ?? 0) + (female?.max ?? 0)) / 4;

  if (avg < 10) return 'small';
  if (avg < 25) return 'medium';
  if (avg < 40) return 'large';
  return 'giant';
}

export function applyFilters(breeds: Breed[], search: string, filters: FilterState): Breed[] {
  let list = breeds;

  // Search by name or other_names
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter((b) => {
      const nameMatch = b.attributes.name.toLowerCase().includes(q);
      const otherMatch = (b.attributes.other_names ?? []).some((n) =>
        n.toLowerCase().includes(q)
      );
      return nameMatch || otherMatch;
    });
  }

  // Group multi-select
  if (filters.groups.length > 0) {
    list = list.filter((b) =>
      filters.groups.includes(b.relationships.group.data.id)
    );
  }

  // Size band
  if (filters.sizes.length > 0) {
    list = list.filter((b) => filters.sizes.includes(getSizeBand(b)));
  }

  // Hypoallergenic
  if (filters.hypoallergenic !== null) {
    list = list.filter(
      (b) => b.attributes.hypoallergenic === filters.hypoallergenic
    );
  }

  // Trait thresholds (if present on the breed)
  const { minTraitScores } = filters;
  if (minTraitScores.good_with_children != null) {
    list = list.filter(
      (b) =>
        (b.attributes.good_with_children ?? 0) >=
        minTraitScores.good_with_children!
    );
  }
  if (minTraitScores.good_with_dogs != null) {
    list = list.filter(
      (b) =>
        (b.attributes.good_with_dogs ?? 0) >= minTraitScores.good_with_dogs!
    );
  }
  if (minTraitScores.good_with_strangers != null) {
    list = list.filter(
      (b) =>
        (b.attributes.good_with_strangers ?? 0) >=
        minTraitScores.good_with_strangers!
    );
  }

  return list;
}

export function groupByBreedGroup(
  breeds: Breed[],
  groups: { id: string; attributes: { name: string } }[]
): { title: string; data: Breed[] }[] {
  const groupMap = new Map(groups.map((g) => [g.id, g.attributes.name]));
  const buckets = new Map<string, Breed[]>();

  for (const b of breeds) {
    const gid = b.relationships.group.data.id;
    const name = groupMap.get(gid) ?? 'Other';
    if (!buckets.has(name)) buckets.set(name, []);
    buckets.get(name)!.push(b);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, data]) => ({
      title,
      data: data.sort((x, y) =>
        x.attributes.name.localeCompare(y.attributes.name)
      ),
    }));
}

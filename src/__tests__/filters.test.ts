import { getSizeBand, applyFilters } from '../utils/filters';
import type { Breed, FilterState } from '../api/types';

const makeBreed = (overrides: Partial<Breed['attributes']> = {}): Breed => ({
  id: '1',
  type: 'breed',
  attributes: {
    name: 'Test Breed',
    description: null,
    life: { min: 10, max: 14 },
    male_weight: { min: 20, max: 30 },
    female_weight: { min: 18, max: 25 },
    hypoallergenic: false,
    ...overrides,
  },
  relationships: {
    group: { data: { id: 'g1', type: 'group' } },
  },
});

describe('getSizeBand', () => {
  it('classifies small dogs', () => {
    const b = makeBreed({
      male_weight: { min: 4, max: 6 },
      female_weight: { min: 3, max: 5 },
    });
    expect(getSizeBand(b)).toBe('small');
  });

  it('classifies giant dogs', () => {
    const b = makeBreed({
      male_weight: { min: 50, max: 70 },
      female_weight: { min: 45, max: 60 },
    });
    expect(getSizeBand(b)).toBe('giant');
  });
});

describe('applyFilters', () => {
  const breeds = [
    makeBreed({ name: 'Labrador', hypoallergenic: false }),
    makeBreed({ name: 'Poodle', hypoallergenic: true }),
  ];

  it('filters by search', () => {
    const result = applyFilters(breeds, 'pood', {
      groups: [],
      sizes: [],
      coatLengths: [],
      hypoallergenic: null,
      minTraitScores: {},
    });
    expect(result).toHaveLength(1);
    expect(result[0].attributes.name).toBe('Poodle');
  });

  it('filters hypoallergenic', () => {
    const filters: FilterState = {
      groups: [],
      sizes: [],
      coatLengths: [],
      hypoallergenic: true,
      minTraitScores: {},
    };
    const result = applyFilters(breeds, '', filters);
    expect(result).toHaveLength(1);
    expect(result[0].attributes.hypoallergenic).toBe(true);
  });
});

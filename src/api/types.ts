export interface LifeSpan {
  min: number;
  max: number;
}

export interface WeightRange {
  min: number;
  max: number;
}

export interface BreedAttributes {
  name: string;
  description: string | null;
  life: LifeSpan;
  male_weight: WeightRange;
  female_weight: WeightRange;
  hypoallergenic: boolean;
  other_names?: string[];
  // Extended fields that may appear on detail
  temperament?: string;
  origin?: string;
  // Trait scores (0-5 scale typical for dogapi)
  energy?: number;
  barking?: number;
  drooling?: number;
  grooming?: number;
  shedding?: number;
  trainability?: number;
  good_with_dogs?: number;
  good_with_children?: number;
  good_with_strangers?: number;
  exercise_minutes?: number;
  apartment_friendly?: number;
}

export interface BreedRelationship {
  group: {
    data: {
      id: string;
      type: string;
    };
  };
}

export interface Breed {
  id: string;
  type: string;
  attributes: BreedAttributes;
  relationships: BreedRelationship;
}

export interface GroupAttributes {
  name: string;
}

export interface Group {
  id: string;
  type: string;
  attributes: GroupAttributes;
}

export interface BreedImage {
  id: string;
  url: string;
  author?: string;
  license?: string;
  source?: string;
}

export type SizeBand = 'small' | 'medium' | 'large' | 'giant';

export interface FilterState {
  groups: string[];
  sizes: SizeBand[];
  coatLengths: string[];
  hypoallergenic: boolean | null;
  minTraitScores: {
    good_with_children?: number;
    good_with_dogs?: number;
    good_with_strangers?: number;
  };
}

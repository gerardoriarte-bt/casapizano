export type ProfileType = 'Social' | 'Sensorial' | 'Práctico Funcional' | 'Visionario Sofisticado';

/** Franja de m² de interés (si aún no ha comprado) o referencia de tamaño. */
export type ApartmentSizeBand = 'lt_100' | '100_200' | 'gt_200' | 'gt_300';

export const APARTMENT_SIZE_LABELS: Record<ApartmentSizeBand, string> = {
  lt_100: 'Menos de 100 m²',
  '100_200': 'De 100 m² (entre 100 y 200 m²)',
  gt_200: 'Más de 200 m²',
  gt_300: 'Más de 300 m²',
};

export const APARTMENT_SIZE_BAND_ORDER: ApartmentSizeBand[] = [
  'lt_100',
  '100_200',
  'gt_200',
  'gt_300',
];

export interface Option {
  id: string;
  text: string;
  profiles: ProfileType[];
  reveals: string;
  essentialElement: string;
}

export interface Question {
  id: string;
  title: string;
  question: string;
  options: Option[];
}

export interface SurveyState {
  userName: string;
  /** null = aún no eligió en el formulario */
  alreadyPurchased: boolean | null;
  /** Solo aplica si alreadyPurchased === false (tamaño que le interesa). */
  apartmentSizeBand: ApartmentSizeBand | null;
  inhabitants: number;
  ages: string;
  pets: string;
  answers: Record<string, string>;
  scores: Record<ProfileType, number>;
  currentStep: number;
  isCompleted: boolean;
}

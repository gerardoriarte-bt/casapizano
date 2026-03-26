export type ProfileType = 'Social' | 'Sensorial' | 'Práctico Funcional' | 'Visionario Sofisticado';

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
  inhabitants: number;
  ages: string;
  pets: string;
  answers: Record<string, string>;
  scores: Record<ProfileType, number>;
  currentStep: number;
  isCompleted: boolean;
}

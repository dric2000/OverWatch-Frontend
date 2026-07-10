export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Article {
  id: number;
  nom: string;
  unite_mesure: number;
  unite_mesure_nom: string;
  unite_mesure_abbreviation: string;
  categorie: string | null;
  seuil_alerte: number | null;
  date_peremption: string | null;
  actif: boolean;
}

export interface Secteur {
  id: number;
  nom: string;
  description: string | null;
  actif: boolean;
}

export interface UniteMesure {
  id: number;
  nom: string;
  abbreviation: string;
  actif: boolean;
}

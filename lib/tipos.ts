// Tipos compartidos entre cliente y servidor. SIN imports de servidor (fs/supabase),
// para poder usarlos en Client Components sin arrastrar dependencias de Node.
import type { Letra } from "@/lib/examenes";
export type { Letra };

// ---- Examen "sanitizado" que se manda al cliente para rendir ----
// (NO incluye `correcta` ni `explicacion`: no se revela nada durante la rendición)
export interface SanitOpcion {
  letra: Letra;
  texto: string;
}
export interface SanitPregunta {
  id: number;
  tema: string;
  enunciado: string;
  opciones: SanitOpcion[];
}
export interface SanitExamen {
  examen_id: number;
  preguntas: SanitPregunta[];
  caso: {
    enunciado: string;
    planteo?: string;
    preguntas?: string[];
    aclaracion?: string;
  };
}

// ---- Resultado que devuelve /api/examen/finalizar (acá SÍ se revela todo) ----
export interface OpcionResultado {
  letra: Letra;
  texto: string;
  correcta: boolean;
  explicacion: string;
}
export interface PreguntaResultado {
  id: number;
  tema: string;
  enunciado: string;
  opciones: OpcionResultado[];
  elegida: Letra | null;
  correcta: Letra | null;
  acerto: boolean;
}
export interface ResultadoExamenUI {
  examenId: number;
  nota: number;
  aciertos: number;
  total: number;
  porTema: Record<string, { aciertos: number; total: number; porcentaje: number }>;
  devolucion: string;
  preguntas: PreguntaResultado[];
  caso: {
    enunciado: string;
    resolucion_didactica: string;
    fundamento_normativo?: string;
    planteo?: string;
    preguntas?: string[];
  };
}

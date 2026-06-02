// Smoke test runtime de las utilidades puras (Node 24 strip-types).
// Ejecutar: node lib/examenes.smoke.mts  (desde la raíz del proyecto)
import {
  cargarExamenes,
  corregirExamen,
  generarDevolucion,
  elegirExamenAleatorio,
  type RespuestasUsuario,
  type Letra,
} from "./examenes.ts";

const examenes = cargarExamenes();
console.log("examenes cargados:", examenes.length);

const ex = examenes[0];
console.log("examen_id:", ex.examen_id, "preguntas:", ex.preguntas.length);

// Todas correctas -> nota 10
const todasOk: RespuestasUsuario = {};
for (const p of ex.preguntas) {
  const c = p.opciones.find((o) => o.correcta);
  if (c) todasOk[p.id] = c.letra as Letra;
}
const r1 = corregirExamen(todasOk, ex);
console.log("todas correctas -> nota:", r1.nota, "aciertos:", r1.aciertos, "/", r1.total);

// Ninguna respondida -> nota 0
const r0 = corregirExamen({}, ex);
console.log("sin responder   -> nota:", r0.nota, "aciertos:", r0.aciertos);

// Devolución sobre el desglose perfecto
console.log("devolución(10/10):", generarDevolucion(r1.porTema).slice(0, 120), "...");
console.log("temas en porTema:", Object.keys(r1.porTema).length);

// Selección: con 1..29 completados debe devolver 30; con todos, reinicia
const elegido = elegirExamenAleatorio(Array.from({ length: 29 }, (_, i) => i + 1));
console.log("elegirExamenAleatorio(1..29) =>", elegido, "(esperado 30)");
const reinicia = elegirExamenAleatorio(Array.from({ length: 30 }, (_, i) => i + 1), {
  rng: () => 0,
});
console.log("elegir con todos completados (rng=0) =>", reinicia, "(ciclo reiniciado, esperado 1)");

const ok =
  examenes.length === 30 &&
  r1.nota === 10 &&
  r0.nota === 0 &&
  elegido === 30 &&
  reinicia === 1;
console.log(ok ? "SMOKE OK" : "SMOKE FALLA");
if (!ok) process.exit(1);

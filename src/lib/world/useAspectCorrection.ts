"use client";

// Corrección de aspect ratio para contenido 3D posicionado en coordenadas
// fijas de mundo (logo, hotspots). Bug real detectado en QA de navegador:
// en viewports angostos/altos (mobile portrait) el FOV horizontal efectivo
// se reduce mucho más que el vertical (el fov de cámara es vertical y fijo
// por waypoint — sección "waypoints", CERRADO), así que cualquier objeto de
// ancho fijo en unidades de mundo termina ocupando una fracción mucho mayor
// del ancho de pantalla — el TMC 3D se veía "gigante" y los 4 hotspots caían
// fuera del frustum horizontal en mobile.
//
// Se usa un aspect de referencia (16:9, el marco sobre el que se calibró
// visualmente el tamaño del logo y las anclas de los hotspots) y se deriva
// un factor de corrección: en aspects más angostos que la referencia el
// factor encoge; en aspects más anchos, no crece más allá de un tope para
// no des-balancear la composición en ultrawide.

import { useThree } from "@react-three/fiber";
import { useMemo } from "react";

const REFERENCE_ASPECT = 16 / 9;
const MIN_FACTOR = 0.5;
const MAX_FACTOR = 1.15;

export function useAspectCorrectionFactor(): number {
  const { size } = useThree();
  return useMemo(() => {
    const aspect = size.width / size.height;
    return Math.min(MAX_FACTOR, Math.max(MIN_FACTOR, aspect / REFERENCE_ASPECT));
  }, [size.width, size.height]);
}

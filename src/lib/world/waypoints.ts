// Bloque 1 (MVP) — waypoints reales de cámara para el mundo 2.5D por capas
// (Master Handoff sección 6/8). Trayectoria pensada para recorrerse con
// CatmullRomCurve3; posición y target/orientación se interpolan por
// separado (decisión CERRADA, sección 6).

export type Vec3Tuple = [x: number, y: number, z: number];

export interface CameraWaypoint {
  /** Debe coincidir con el id del hotspot correspondiente en hotspots.config.ts (o "hero"). */
  id: string;
  /** Posición de la cámara en el espacio del mundo. */
  position: Vec3Tuple;
  /** Punto hacia el que mira la cámara, separado de position (sección 6, CERRADO). */
  target: Vec3Tuple;
  /** Campo de visión en grados. */
  fov: number;
  /** Progreso de scroll normalizado [0,1] en el que se alcanza este waypoint. */
  scrollProgress: number;
}

export const waypoints: CameraWaypoint[] = [
  { id: "hero", position: [0, 6, 62], target: [0, -2, -10], fov: 42, scrollProgress: 0 },
  { id: "tmc-luxury", position: [-26, 1, 24], target: [-20, -3, -4], fov: 38, scrollProgress: 0.25 },
  { id: "tmc-transport", position: [22, 8, 34], target: [26, 5, -26], fov: 38, scrollProgress: 0.5 },
  { id: "tmc-cleaners", position: [-30, 6, 30], target: [-30, 3, -15], fov: 38, scrollProgress: 0.75 },
  { id: "tmc-project-office", position: [14, 3, 20], target: [8, 1, 5], fov: 38, scrollProgress: 1 },
];

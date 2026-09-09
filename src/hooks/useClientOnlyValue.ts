"use client";

// Patrón seguro para hidratación SSR de un valor que solo puede conocerse en
// el cliente y no cambia una vez leído (WebGL disponible, sessionStorage).
// useSyncExternalStore con getServerSnapshot es la vía recomendada por React
// para esto — evita el anti-patrón "setState síncrono dentro de un efecto"
// (regla react-hooks/set-state-in-effect) sin perder seguridad de hidratación:
// el server siempre ve `serverValue`, y el cliente resuelve el valor real en
// su primer render sin necesitar un efecto posterior.

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export function useClientOnlyValue<T>(getClientValue: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, getClientValue, () => serverValue);
}

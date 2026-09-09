"use client";

// Analytics — capa mínima interna (evolución §20). No se integra ningún
// proveedor externo (GA4, Segment, etc.) porque ninguno está disponible ni
// configurado en el proyecto — "no introducir herramientas innecesarias".
// Esta capa define la forma de los eventos y un sink conectable: cuando TMC
// apruebe un proveedor real, se implementa `sink` aquí y ningún call site
// (Hotspots, Header, PrivateInquiryForm, rutas) necesita cambiar.

export type TmcAnalyticsEvent =
  | { name: "page_view"; route: string }
  | { name: "hotspot_click"; unitId: string; route: string }
  | { name: "cta_click"; cta: string }
  | { name: "private_inquiry_submit" };

type Sink = (event: TmcAnalyticsEvent) => void;

// Sink por defecto: log solo en desarrollo, silencioso en producción hasta
// que exista un proveedor real conectado aquí.
let sink: Sink = (event) => {
  if (process.env.NODE_ENV === "development") {
    console.debug("[tmc-analytics]", event);
  }
};

/** Permite conectar un proveedor real (GA4, Segment, etc.) sin tocar los call sites. */
export function setAnalyticsSink(nextSink: Sink) {
  sink = nextSink;
}

export function track(event: TmcAnalyticsEvent) {
  sink(event);
}

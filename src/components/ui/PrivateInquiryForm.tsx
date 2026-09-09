"use client";

// Private Inquiry — CTA principal (evolución §19, CERRADO por el encargo del
// usuario). Campos configurables, sin datos de contacto inventados: no existe
// todavía un endpoint/email/teléfono TMC aprobado para recibir estos envíos,
// así que el submit no llama a ningún backend real — muestra una
// confirmación local y dejar el punto de integración claramente marcado para
// cuando exista un canal de contacto aprobado.

import { useState, type FormEvent } from "react";
import { privateInquiryContent } from "@/config/tmcContent";
import { track } from "@/lib/analytics/track";

interface PrivateInquiryFormProps {
  submitLabel?: string;
}

export function PrivateInquiryForm({
  submitLabel = privateInquiryContent.submitLabel,
}: PrivateInquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: conectar a un endpoint/dirección de contacto real cuando TMC
    // apruebe uno — no se fabrica ninguno aquí (Master §11, evolución §237).
    track({ name: "private_inquiry_submit" });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="privateInquiry__confirm">
        Thank you. Your inquiry has been received — a member of TMC will follow up directly.
      </p>
    );
  }

  return (
    <form className="privateInquiry__form" onSubmit={handleSubmit}>
      <label className="privateInquiry__field">
        <span>Name</span>
        <input type="text" name="name" required autoComplete="name" />
      </label>
      <label className="privateInquiry__field">
        <span>Email</span>
        <input type="email" name="email" required autoComplete="email" />
      </label>
      <label className="privateInquiry__field">
        <span>Phone</span>
        <input type="tel" name="phone" autoComplete="tel" />
      </label>
      <label className="privateInquiry__field">
        <span>Message</span>
        <textarea name="message" rows={3} />
      </label>
      <button type="submit" className="privateInquiry__submit">
        {submitLabel}
      </button>
    </form>
  );
}

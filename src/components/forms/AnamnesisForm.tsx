"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function AnamnesisForm() {
  const [step, setStep] = useState(1);

  // Form state omitted for brevity

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-surface rounded-2xl shadow-neon-blue border border-border mt-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neon-blue mb-2">Comencemos tu transformación</h2>
        <p className="text-foreground-muted">Paso {step} de 4: Conociendo tu historial</p>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">1. ¿Hace cuánto entrenas en gimnasio?</label>
              <input type="text" className="w-full p-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-neon-pink" placeholder="Ej. 1 año, Nunca..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">2. ¿Hacés algo más aparte de musculación?</label>
              <textarea className="w-full p-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-neon-pink" placeholder="Ej. Fútbol, Natación..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">3. ¿Tenés lesiones o enfermedades de base?</label>
              <textarea className="w-full p-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-neon-pink" placeholder="Detalla aquí..."></textarea>
            </div>
          </div>
        )}

        {/* Other steps would be implemented similarly based on the 13 questions */}
        {step > 1 && (
          <div className="space-y-6 text-center text-foreground-muted py-10">
            [Paso {step} en construcción...]
          </div>
        )}
      </motion.div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="px-6 py-2 rounded-lg bg-surface-hover text-foreground disabled:opacity-50 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={step === 4 ? () => console.log("Submit") : nextStep}
          className="px-6 py-2 rounded-lg bg-neon-blue text-background font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] transition-shadow"
        >
          {step === 4 ? "Finalizar" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}

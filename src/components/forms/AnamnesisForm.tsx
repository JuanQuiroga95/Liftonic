"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "./AnamnesisForm.module.css";

export default function AnamnesisForm({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [trainingExperience, setTrainingExperience] = useState("");
  const [otherActivities, setOtherActivities] = useState("");
  const [injuries, setInjuries] = useState("");

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alumno/anamnesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          training_experience: trainingExperience,
          other_activities: otherActivities,
          injuries_conditions: injuries,
          // omitimos el resto por brevedad del MVP
        }),
      });
      if (res.ok && onComplete) onComplete();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Comencemos tu transformación</h2>
        <p className={styles.subtitle}>Paso {step} de 4: Conociendo tu historial</p>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {step === 1 && (
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>1. ¿Hace cuánto entrenas en gimnasio?</label>
              <input type="text" className={styles.input} placeholder="Ej. 1 año, Nunca..." value={trainingExperience} onChange={e => setTrainingExperience(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>2. ¿Hacés algo más aparte de musculación?</label>
              <textarea className={styles.textarea} placeholder="Ej. Fútbol, Natación..." value={otherActivities} onChange={e => setOtherActivities(e.target.value)}></textarea>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>3. ¿Tenés lesiones o enfermedades de base?</label>
              <textarea className={styles.textarea} placeholder="Detalla aquí..." value={injuries} onChange={e => setInjuries(e.target.value)}></textarea>
            </div>
          </div>
        )}

        {/* Other steps would be implemented similarly based on the 13 questions */}
        {step > 1 && (
          <div className={styles.placeholder}>
            [Paso {step} en construcción...]
          </div>
        )}
      </motion.div>

      <div className={styles.footer}>
        <button
          onClick={prevStep}
          disabled={step === 1}
          className={styles.btnBack}
        >
          Atrás
        </button>
        <button
          onClick={step === 4 ? handleSubmit : nextStep}
          className={styles.btnNext}
          disabled={loading}
        >
          {loading ? "Guardando..." : (step === 4 ? "Finalizar" : "Siguiente")}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "./AnamnesisForm.module.css";

export default function AnamnesisForm({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Paso 1
  const [trainingExperience, setTrainingExperience] = useState("");
  const [otherActivities, setOtherActivities] = useState("");
  const [occupation, setOccupation] = useState("");
  const [injuries, setInjuries] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");

  // Paso 2
  const [weeklyFrequency, setWeeklyFrequency] = useState("");
  const [muscleInterests, setMuscleInterests] = useState("");
  const [exercisePreferences, setExercisePreferences] = useState("");
  const [trainingGoal, setTrainingGoal] = useState("");
  const [specificGoals, setSpecificGoals] = useState("");

  // Paso 3
  const [seesNutritionist, setSeesNutritionist] = useState(false);
  const [nutritionTracking, setNutritionTracking] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");

  // Paso 4
  const [splitPreference, setSplitPreference] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");

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
          occupation: occupation,
          injuries_conditions: injuries,
          medical_conditions: medicalConditions,
          weekly_frequency: weeklyFrequency ? parseInt(weeklyFrequency) : null,
          muscle_interests: muscleInterests,
          exercise_preferences: exercisePreferences,
          training_goal: trainingGoal,
          specific_goals: specificGoals,
          sees_nutritionist: seesNutritionist,
          nutrition_tracking: nutritionTracking,
          sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
          current_weight: currentWeight ? parseFloat(currentWeight) : null,
          height: height ? parseFloat(height) : null,
          age: age ? parseInt(age) : null,
          split_preference: splitPreference,
          additional_comments: additionalComments
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
        <p className={styles.subtitle}>Paso {step} de 4: {
          step === 1 ? "Historial Deportivo y Salud" :
          step === 2 ? "Objetivos y Entrenamiento" :
          step === 3 ? "Datos Físicos y Hábitos" : "Preferencias Finales"
        }</p>
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
              <label className={styles.label}>3. ¿A qué te dedicás? (trabajo u oficio)</label>
              <input type="text" className={styles.input} placeholder="Ej. Albañil, oficina 8hs, estudiante..." value={occupation} onChange={e => setOccupation(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>4. ¿Tenés lesiones o molestias actuales?</label>
              <textarea className={styles.textarea} placeholder="Ej. Hombro derecho, lumbalgia..." value={injuries} onChange={e => setInjuries(e.target.value)}></textarea>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>5. ¿Tenés alguna enfermedad de base?</label>
              <textarea className={styles.textarea} placeholder="Ej. Asma, hipertensión, diabetes, ninguna..." value={medicalConditions} onChange={e => setMedicalConditions(e.target.value)}></textarea>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>6. ¿Cuántas veces a la semana vas a entrenar?</label>
              <input type="number" className={styles.input} placeholder="Ej. 3, 4, 5" value={weeklyFrequency} onChange={e => setWeeklyFrequency(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>7. ¿Qué partes te interesan más y cuáles menos? (bicep, tricep, espalda, pecho, hombros, cuádriceps, gluteos, femorales, gemelos, abs)</label>
              <textarea className={styles.textarea} placeholder="Ej. Más: glúteos y espalda. Menos: pecho..." value={muscleInterests} onChange={e => setMuscleInterests(e.target.value)}></textarea>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>8. ¿Hay ejercicios que quieras sí o sí o alguno que no quieras?</label>
              <textarea className={styles.textarea} placeholder="Ej. Quiero sentadilla libre, no me gusta prensa..." value={exercisePreferences} onChange={e => setExercisePreferences(e.target.value)}></textarea>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>9. Objetivo del entrenamiento</label>
              <textarea className={styles.textarea} placeholder="Ej. Ganar masa muscular, perder grasa, fuerza..." value={trainingGoal} onChange={e => setTrainingGoal(e.target.value)}></textarea>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>10. ¿Tenés metas u objetivos específicos? (con fecha si aplica)</label>
              <textarea className={styles.textarea} placeholder="Ej. Bajar 5 kg para diciembre, hacer dominadas estrictas, correr 10K..." value={specificGoals} onChange={e => setSpecificGoals(e.target.value)}></textarea>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--neon-pink)' }} checked={seesNutritionist} onChange={e => setSeesNutritionist(e.target.checked)} />
                11. ¿Vas a nutricionista?
              </label>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>12. ¿Llevás algún tipo de seguimiento con la alimentación?</label>
              <textarea className={styles.textarea} placeholder="Ej. Plan del nutricionista, cuento calorías, no llevo seguimiento..." value={nutritionTracking} onChange={e => setNutritionTracking(e.target.value)}></textarea>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>13. ¿Cuántas horas dormís por noche?</label>
              <input type="number" step="0.5" className={styles.input} placeholder="Ej. 7" value={sleepHours} onChange={e => setSleepHours(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>14. Peso (kg)</label>
              <input type="number" className={styles.input} placeholder="Ej. 70" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>15. Altura (cm)</label>
              <input type="number" className={styles.input} placeholder="Ej. 175" value={height} onChange={e => setHeight(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>16. Edad</label>
              <input type="number" className={styles.input} placeholder="Ej. 25" value={age} onChange={e => setAge(e.target.value)} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>17. ¿Te gustaría un entrenamiento planteado como full body (cuerpo completo) o dividido por días en tren superior y tren inferior?</label>
              <select className={styles.input} value={splitPreference} onChange={e => setSplitPreference(e.target.value)}>
                <option value="">Selecciona una opción...</option>
                <option value="Full Body">Full Body (Cuerpo Completo)</option>
                <option value="Torso / Pierna">Dividido (Tren Superior / Inferior)</option>
                <option value="Push Pull Legs">Push / Pull / Legs (Empuje, Tirón, Piernas)</option>
                <option value="Lo dejo a tu criterio">Lo dejo a tu criterio</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>18. Algo que creas importante mencionar o quieras que tenga en cuenta</label>
              <textarea className={styles.textarea} placeholder="Detalla aquí cualquier otra información..." value={additionalComments} onChange={e => setAdditionalComments(e.target.value)}></textarea>
            </div>
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

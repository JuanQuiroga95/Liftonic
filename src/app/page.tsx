import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      
      {/* Background glowing effects */}
      <div className={styles.glowPink}></div>
      <div className={styles.glowBlue}></div>
      
      <main className={styles.main}>
        <h1 className={styles.title}>
          LIFTONIC
        </h1>
        <p className={styles.subtitle}>
          Hola! Somos Estefi y Juli, bienvenida/o al equipo Liftonic, vamos con todo en este nuevo desafío🤗
        </p>

        <div className={styles.actions}>
          <Link
            className={styles.btnPrimary}
            href="/login"
          >
            Iniciar Sesión
          </Link>
          <Link
            className={styles.btnSecondary}
            href="/demo"
          >
            Ver Demo
          </Link>
        </div>
      </main>
    </div>
  );
}

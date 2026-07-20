"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError("Usuario o contraseña incorrectos.");
      setLoading(false);
    } else {
      router.push("/dashboard"); // We will create this middleware later
      router.refresh();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glowPink}></div>
      <div className={styles.glowBlue}></div>
      
      <div className={styles.formCard}>
        <div>
          <h1 className={styles.title}>LIFTONIC</h1>
          <p className={styles.subtitle}>Ingresa tus credenciales para continuar</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.formCard} style={{boxShadow: 'none', padding: 0, border: 'none'}}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="Ej. JuanQuiroga"
              required
            />
          </div>
          
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/" style={{ color: "var(--foreground-muted)", fontSize: "0.875rem", textDecoration: "underline" }}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

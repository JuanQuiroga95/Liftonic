import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { query } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  // Fetch some stats from the database
  const usersRes = await query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
  const stats = usersRes.rows.reduce((acc, row) => {
    acc[row.role] = parseInt(row.count, 10);
    return acc;
  }, { SUPER_ADMIN: 0, PROFESSOR: 0, ALUMNO: 0 });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Panel de Administración</h1>
        <div style={{display: 'flex', gap: '1rem'}}>
           <div style={{ color: 'var(--foreground-muted)' }}>
            Hola, <span style={{ color: 'var(--foreground)', fontWeight: 'bold' }}>{session.user?.name}</span>
          </div>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.PROFESSOR}</div>
          <div className={styles.statLabel}>Profesores</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.ALUMNO}</div>
          <div className={styles.statLabel}>Alumnos</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)'}}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--neon-blue)'}}>Gestión de Profesores</h2>
        <p style={{ color: 'var(--foreground-muted)', marginBottom: '2rem' }}>
          Desde aquí podrás crear cuentas para tus profesores, quienes a su vez podrán gestionar a sus alumnos.
        </p>
        <button style={{ 
          padding: '0.75rem 1.5rem', 
          backgroundColor: 'var(--neon-fuchsia)', 
          color: 'var(--background)', 
          border: 'none', 
          borderRadius: '0.5rem', 
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          + Nuevo Profesor
        </button>
      </div>
    </div>
  );
}

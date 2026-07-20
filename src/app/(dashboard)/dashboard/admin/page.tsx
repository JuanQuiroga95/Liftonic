import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { query } from "@/lib/db";
import Link from "next/link";
import ProfessorManager from "./ProfessorManager";

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

      <ProfessorManager />
    </div>
  );
}

"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: 'transparent',
        color: '#ff4d4d',
        border: '1px solid #ff4d4d',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.875rem'
      }}
    >
      Cerrar Sesión
    </button>
  );
}

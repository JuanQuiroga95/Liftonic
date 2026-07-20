import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 sm:p-20 relative overflow-hidden">
      
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-neon-pink opacity-20 blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-neon-blue opacity-20 blur-[120px] mix-blend-screen pointer-events-none"></div>
      
      <main className="flex flex-col gap-8 row-start-2 items-center text-center z-10">
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue drop-shadow-neon-pink">
          LIFTONIC
        </h1>
        <p className="text-xl sm:text-2xl text-foreground-muted max-w-2xl font-light">
          La evolución de tu entrenamiento. Gestión integral, tracking inteligente y una experiencia premium para vos y tus alumnos.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <a
            className="rounded-full border border-solid border-transparent transition-all flex items-center justify-center bg-neon-fuchsia text-background gap-2 hover:bg-[#ff4dff] text-sm sm:text-base h-12 px-8 sm:px-10 font-bold shadow-[0_0_15px_rgba(255,0,255,0.4)] hover:shadow-[0_0_30px_rgba(255,0,255,0.6)]"
            href="/login"
            rel="noopener noreferrer"
          >
            Iniciar Sesión
          </a>
          <a
            className="rounded-full border-2 border-solid border-border transition-colors flex items-center justify-center hover:bg-surface-hover hover:border-neon-blue text-sm sm:text-base h-12 px-8 sm:px-10"
            href="/demo"
            rel="noopener noreferrer"
          >
            Ver Demo
          </a>
        </div>
      </main>
    </div>
  );
}

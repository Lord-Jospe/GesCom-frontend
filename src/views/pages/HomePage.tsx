import { useTheme } from 'src/components/provider/theme-provider';
import HeaderHome from 'src/components/home/HeaderHome';

const HomePage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-dark text-foreground dark:text-muted-foreground">

        <HeaderHome />

        <main>
          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <section className="flex flex-col items-center justify-center gap-6 px-4 py-32 text-center">
            <span className="rounded-full bg-lightprimary text-primary px-4 py-1 text-xs font-semibold tracking-widest uppercase">
              Sistema de gestión institucional
            </span>

            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground dark:text-white">
              Administra tu institución{' '}
              <span className="text-primary">sin complicaciones</span>
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground">
              GesCom centraliza la gestión académica, contable y documental en
              una sola plataforma. Diseñado para colegios e instituciones que
              buscan orden y eficiencia.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="/register"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Comenzar gratis
              </a>
              <a
                href="#planes"
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold
                  text-foreground dark:text-muted-foreground
                  hover:text-primary hover:bg-lightprimary transition-colors"
              >
                Ver planes
              </a>
            </div>
          </section>

          {/* ── Secciones placeholder — rellena a tu gusto ────────────────── */}
          {[
            { id: 'academica',   label: 'Gestión Académica'       },
            { id: 'contable',    label: 'Módulo Contable'         },
            { id: 'archivos',    label: 'Gestión de Archivos'     },
            { id: 'facturacion', label: 'Facturación y Cobranza'  },
            { id: 'planes',      label: 'Planes'                  },
            { id: 'contactos',   label: 'Contactos'               },
          ].map(({ id, label }) => (
            <section
              key={id}
              id={id}
              className="flex min-h-[40vh] items-center justify-center border-t border-border px-4 py-16"
            >
              <p className="text-xl font-semibold text-muted-foreground/40">
                [ Sección: {label} ]
              </p>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};

export default HomePage;
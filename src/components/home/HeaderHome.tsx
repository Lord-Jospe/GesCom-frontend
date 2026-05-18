import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useTheme } from 'src/components/provider/theme-provider';
import FullLogo from 'src/layouts/full/shared/logo/FullLogo';
import { AMLogo } from 'tailwind-sidebar';

// ─── Datos del dropdown Soluciones ───────────────────────────────────────────
const soluciones = [
  {
    icon: 'tabler:school',
    title: 'Gestión Académica',
    description: 'Estudiantes, aulas, secciones y docentes.',
    href: '#academica',
  },
  {
    icon: 'tabler:calculator',
    title: 'Módulo Contable',
    description: 'Control financiero e informes contables.',
    href: '#contable',
  },
  {
    icon: 'tabler:folder',
    title: 'Gestión de Archivos',
    description: 'Almacena y organiza documentos institucionales.',
    href: '#archivos',
  },
  {
    icon: 'tabler:receipt',
    title: 'Facturación y Cobranza',
    description: 'Emisión de facturas y seguimiento de pagos.',
    href: '#facturacion',
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────
const HeaderHome = () => {
  const { theme, setTheme } = useTheme();
  const [isSticky, setIsSticky] = useState(false);
  const [solucionesOpen, setSolucionesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sticky on scroll
  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolucionesOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Cerrar menú móvil al agrandar pantalla
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <header
      className={`sticky top-0 z-[2] transition-all duration-200 ${
        isSticky ? 'bg-white dark:bg-dark shadow-md' : 'bg-transparent'
      }`}>
      <nav className="rounded-none bg-transparent dark:bg-transparent py-4 px-6 !max-w-full flex justify-between items-center">

        {/* Logo */}
        <div className="h-auto w-50">
        <AMLogo href="/" img="">
            <FullLogo />
        </AMLogo>
        </div>

        {/* ── Navegación central (desktop) ──────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-1">

          {/* Dropdown Soluciones */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setSolucionesOpen((v) => !v)}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium
                text-foreground dark:text-muted-foreground
                hover:text-primary dark:hover:text-primary
                hover:bg-lightprimary dark:hover:bg-lightprimary
                transition-colors duration-150
                ${solucionesOpen ? 'text-primary bg-lightprimary' : ''}
              `}
            >
              Soluciones
              <Icon
                icon="tabler:chevron-down"
                width={15}
                className={`transition-transform duration-200 ${solucionesOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Card dropdown */}
            {solucionesOpen && (
              <div
                className="absolute left-0 top-full mt-2 w-80 rounded-xl border border-border
                  bg-white dark:bg-dark shadow-xl p-2 z-50"
              >
                {soluciones.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setSolucionesOpen(false)}
                    className="flex items-start gap-3 rounded-lg px-3 py-2.5
                      hover:bg-lightprimary dark:hover:bg-lightprimary
                      hover:text-primary dark:hover:text-primary
                      transition-colors duration-150 group"
                  >
                    <Icon
                      icon={item.icon}
                      width={20}
                      className="mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground dark:text-muted-foreground group-hover:text-primary">
                        {item.title}
                      </p>
                      <p className="text-xs mt-0.5 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Planes */}
          <a
            href="#planes"
            className="px-3 py-2 rounded-full text-sm font-medium
              text-foreground dark:text-muted-foreground
              hover:text-primary dark:hover:text-primary
              hover:bg-lightprimary dark:hover:bg-lightprimary
              transition-colors duration-150"
          >
            Planes
          </a>

          {/* Contactos */}
          <a
            href="#contactos"
            className="px-3 py-2 rounded-full text-sm font-medium
              text-foreground dark:text-muted-foreground
              hover:text-primary dark:hover:text-primary
              hover:bg-lightprimary dark:hover:bg-lightprimary
              transition-colors duration-150"
          >
            Contactos
          </a>
        </div>

        {/* ── Acciones derecha (desktop) ─────────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-1">
          {/* Toggle tema */}
          <button
            onClick={toggleTheme}
            className="group relative flex items-center justify-center rounded-full p-2
              text-foreground dark:text-muted-foreground
              hover:text-primary dark:hover:text-primary
              transition-colors duration-150"
            aria-label="Cambiar tema"
          >
            <span className="relative flex items-center justify-center after:absolute after:w-10 after:h-10 after:rounded-full after:-top-1/2 group-hover:after:bg-lightprimary">
              <Icon
                icon={theme === 'light' ? 'tabler:moon' : 'solar:sun-bold-duotone'}
                width={20}
              />
            </span>
          </button>

          {/* Iniciar sesión */}
          <a
            href="/login"
            className="px-4 py-2 rounded-full text-sm font-medium
              text-foreground dark:text-muted-foreground
              hover:text-primary dark:hover:text-primary
              hover:bg-lightprimary dark:hover:bg-lightprimary
              transition-colors duration-150"
          >
            Iniciar sesión
          </a>

          {/* Registrarse */}
          <a
            href="/register"
            className="px-4 py-2 rounded-full text-sm font-semibold
              bg-primary text-white hover:bg-primary/90
              transition-colors duration-150"
          >
            Registrarse
          </a>
        </div>

        {/* ── Botones móvil ──────────────────────────────────────────────────── */}
        <div className="flex lg:hidden items-center gap-1">
          {/* Toggle tema */}
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="group relative flex items-center justify-center rounded-full p-2
              text-foreground dark:text-muted-foreground hover:text-primary"
          >
            <span className="relative flex items-center justify-center after:absolute after:w-10 after:h-10 after:rounded-full after:-top-1/2 group-hover:after:bg-lightprimary">
              <Icon
                icon={theme === 'light' ? 'tabler:moon' : 'solar:sun-bold-duotone'}
                width={20}
              />
            </span>
          </button>

          {/* Hamburguesa */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menú"
            className="flex items-center justify-center rounded-full p-2
              text-foreground dark:text-muted-foreground hover:text-primary
              hover:bg-lightprimary transition-colors duration-150"
          >
            <Icon icon={mobileOpen ? 'tabler:x' : 'tabler:menu-2'} width={20} />
          </button>
        </div>
      </nav>

      {/* ── Menú móvil ────────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white dark:bg-dark px-4 pb-4 pt-2 space-y-1">

          {/* Soluciones expandible */}
          <details className="group">
            <summary
              className="flex cursor-pointer list-none items-center justify-between rounded-full px-3 py-2
                text-sm font-medium text-foreground dark:text-muted-foreground
                hover:text-primary hover:bg-lightprimary transition-colors"
            >
              Soluciones
              <Icon
                icon="tabler:chevron-down"
                width={15}
                className="transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="mt-1 ml-3 space-y-1">
              {soluciones.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-full px-3 py-2 text-sm
                    text-foreground dark:text-muted-foreground
                    hover:text-primary hover:bg-lightprimary transition-colors"
                >
                  <Icon icon={item.icon} width={16} />
                  {item.title}
                </a>
              ))}
            </div>
          </details>

          <a
            href="#planes"
            onClick={() => setMobileOpen(false)}
            className="block rounded-full px-3 py-2 text-sm font-medium
              text-foreground dark:text-muted-foreground
              hover:text-primary hover:bg-lightprimary transition-colors"
          >
            Planes
          </a>

          <a
            href="#contactos"
            onClick={() => setMobileOpen(false)}
            className="block rounded-full px-3 py-2 text-sm font-medium
              text-foreground dark:text-muted-foreground
              hover:text-primary hover:bg-lightprimary transition-colors"
          >
            Contactos
          </a>

          <div className="border-t border-border pt-3 mt-3 space-y-2">
            <a
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block rounded-full px-3 py-2 text-sm font-medium text-center border border-border
                text-foreground dark:text-muted-foreground hover:text-primary hover:bg-lightprimary transition-colors"
            >
              Iniciar sesión
            </a>
            <a
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="block rounded-full px-3 py-2 text-sm font-semibold text-center
                bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Registrarse
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderHome;
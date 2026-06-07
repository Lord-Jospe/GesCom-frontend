import { Icon } from '@iconify/react';
import { useTheme } from 'src/components/provider/theme-provider';
import HeaderHome from 'src/components/home/HeaderHome';
import { Link } from 'react-router';

/* ── Datos secciones ─────────────────────────────────────────────────── */
const modulos = [
  { icon: 'solar:calculator-linear', titulo: 'Caja y Facturación', desc: 'Registra ventas y gastos en USD o Bs. Facturas PDF con IVA desglosado, listas para el SENIAT.' },
  { icon: 'solar:book-2-broken', titulo: 'Contabilidad General', desc: 'Libro diario, libro mayor, estado de resultados y balance general. Asientos automáticos por cada transacción.' },
  { icon: 'solar:box-linear', titulo: 'Inventario', desc: 'Control de stock en tiempo real, alertas de producto bajo y valorización automática en USD y Bs.' },
  { icon: 'solar:users-group-rounded-linear', titulo: 'Nómina y Empleados', desc: 'Cálculo automático de salario neto con SSO, INCES, FAOV. Recibos de pago en PDF por empleado.' },
  { icon: 'solar:chart-2-bold', titulo: 'Dashboard en Tiempo Real', desc: 'Ventas, gastos y ganancias del día. Gráficas de ingresos vs gastos de los últimos 6 meses.' },
  { icon: 'solar:folder-with-files-linear', titulo: 'Bóveda Digital', desc: 'Sube facturas, recibos y contratos desde tu celular. Organizados por mes y vinculados a cada transacción.' },
];

const ventajas = [
  { icon: 'solar:dollar-minimalistic-linear', titulo: 'Multimoneda USD + Bs.', desc: 'Tasa BCV del día actualizable. Cada transacción guarda ambos montos automáticamente.' },
  { icon: 'solar:document-text-linear', titulo: 'IVA e IGTF automático', desc: 'Cálculo y desglose de IVA (16%) e IGTF (3%) en cada factura. Configurable por transacción.' },
  { icon: 'solar:checklist-minimalistic-linear', titulo: 'Facturas para el SENIAT', desc: 'PDF con RIF, número correlativo y montos desglosados. Cumple con el ente tributario venezolano.' },
  { icon: 'solar:graph-up-linear', titulo: 'Reportes exportables', desc: 'Estado de resultados, balance general y reportes de ventas en Excel y PDF. Listos para tu contador.' },
];

const planes = [
  {
    nombre: 'Semilla', precio: '0', color: 'border-border', badge: 'Gratis', badgeColor: 'bg-muted text-muted-foreground',
    desc: 'Para estudiantes y emprendedores que facturan menos de $100/mes.',
    features: ['Hasta 15 transacciones / mes', 'Solo texto (sin fotos)', 'Reportes en pantalla', 'Sin multimoneda'],
  },
  {
    nombre: 'Emprendedor', precio: '7.99', color: 'border-primary', badge: 'Más popular', badgeColor: 'bg-primary text-white',
    desc: 'Vendedores de Instagram, puestos de comida, freelancers.',
    features: ['Transacciones ilimitadas', 'Bóveda: 50 fotos / mes', 'Reporte PDF mensual', 'Multimoneda BCV', 'Soporte por WhatsApp'],
  },
  {
    nombre: 'Negocio', precio: '14.99', color: 'border-border', badge: 'Premium', badgeColor: 'bg-secondary text-white',
    desc: 'Bodegones, farmacias, talleres, ferreterías.',
    features: ['Transacciones ilimitadas', 'Bóveda ilimitada', 'Todos los reportes PDF', 'Multimoneda BCV', 'Control de inventario', 'Cuentas por cobrar', 'Soporte por WhatsApp'],
  },
];

const HomePage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-white to-white dark:bg-dark dark:from-dark dark:via-dark dark:to-dark text-foreground">

        <HeaderHome />

        <main>
          {/* ── Hero ──────────────────────────────────────────────────── */}
          <section className="relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-6 pt-12 pb-6 lg:pt-16 flex flex-col items-center text-center">

              <span className="inline-flex items-center gap-2 rounded-full bg-lightprimary px-4 py-1.5 text-xs font-semibold text-primary tracking-wide uppercase mb-5">
                <Icon icon="solar:bolt-linear" width={14} />
                Sistema SaaS para negocios venezolanos
              </span>

              <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground dark:text-white leading-tight">
                Gestiona las finanzas de tu negocio{' '}
                <span className="text-primary">sin ser contador</span>
              </h1>

              <p className="max-w-xl text-lg text-muted-foreground mt-5 leading-relaxed">
                GesCom automatiza la facturación, contabilidad, inventario y nómina. Multimoneda, tasa BCV, IVA y facturas listas para el SENIAT.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mt-7">
                <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-base font-semibold text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
                  Crear cuenta gratis
                  <Icon icon="solar:arrow-right-linear" width={18} />
                </Link>
                <a href="#planes" className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 text-base font-semibold text-foreground hover:text-primary hover:bg-lightprimary transition-colors">
                  Ver planes
                  <Icon icon="solar:alt-arrow-down-linear" width={18} />
                </a>
              </div>

              {/* Imagen grande del software */}
              <div className="w-full max-w-4xl mt-12 rounded-2xl border border-border bg-lightprimary/40 overflow-hidden shadow-lg">
                <div className="aspect-video flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Icon icon="solar:gallery-wide-linear" width={56} className="mx-auto mb-3" />
                    <p className="text-base font-medium">Mockup del dashboard de GesCom</p>
                    <p className="text-sm mt-1">Arrastra tu screenshot aquí o reemplaza este div por una imagen</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ── Módulos ───────────────────────────────────────────────── */}
          <section className="bg-muted/30 dark:bg-muted/10 border-y border-border">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-foreground dark:text-white">Todo en un solo lugar</h2>
                <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                  Seis módulos integrados para que no necesites usar varias aplicaciones distintas.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {modulos.map((m) => (
                  <div key={m.titulo} className="group rounded-xl border border-border bg-white dark:bg-dark p-7 hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="p-3 rounded-lg bg-lightprimary w-fit mb-4">
                      <Icon icon={m.icon} width={26} height={26} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{m.titulo}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Ventajas ───────────────────────────────────────────────── */}
          <section className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground dark:text-white">Hecho para Venezuela</h2>
              <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                GesCom entiende la economía venezolana. No es un software genérico traducido.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {ventajas.map((v) => (
                <div key={v.titulo} className="group rounded-xl border border-border bg-white dark:bg-dark p-7 hover:border-primary/50 hover:shadow-md transition-all flex gap-5">
                  <div className="p-3 rounded-lg bg-lightprimary shrink-0 h-fit">
                    <Icon icon={v.icon} width={26} height={26} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{v.titulo}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Planes ─────────────────────────────────────────────────── */}
          <section id="planes" className="bg-muted/30 dark:bg-muted/10 border-y border-border">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-foreground dark:text-white">Planes para cada etapa</h2>
                <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                  Crece con nosotros. Cambia de plan cuando tu negocio lo necesite.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {planes.map((plan) => (
                  <div key={plan.nombre} className={`relative rounded-2xl border-2 ${plan.color} bg-white dark:bg-dark p-7 flex flex-col`}>
                    <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold w-fit mb-4 ${plan.badgeColor}`}>{plan.badge}</span>
                    <h3 className="text-2xl font-bold text-foreground">{plan.nombre}</h3>
                    <div className="mt-4 mb-2">
                      <span className="text-4xl font-extrabold text-foreground">${plan.precio}</span>
                      <span className="text-muted-foreground text-base"> / mes</span>
                    </div>
                    <p className="text-base text-muted-foreground mt-2 mb-7">{plan.desc}</p>
                    <ul className="space-y-3.5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-base text-foreground">
                          <Icon icon="solar:check-circle-bold" width={18} className="text-success shrink-0 mt-0.5" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/register" className={`mt-8 block text-center rounded-full py-3 text-base font-semibold transition-colors ${
                      plan.nombre === 'Emprendedor' ? 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/25' : 'border border-primary text-primary hover:bg-lightprimary'
                    }`}>
                      {plan.precio === '0' ? 'Comenzar gratis' : 'Probar 7 días gratis'}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Contacto ────────────────────────────────────────────────── */}
          <section id="contacto" className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground dark:text-white">Contáctanos y hablemos</h2>
              <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                ¿Tienes preguntas? Escríbenos y te respondemos en menos de 24 horas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <a href="https://wa.me/584123456789" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-border bg-white dark:bg-dark p-6 text-center hover:shadow-md hover:border-success/50 transition-all block">
                <div className="p-3 rounded-full bg-success/10 w-fit mx-auto mb-3">
                  <Icon icon="solar:phone-linear" width={26} className="text-success" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">WhatsApp</p>
                <p className="text-base font-semibold text-foreground">+58 412-3456789</p>
              </a>

              <a href="mailto:soporte@gescomve.com" className="rounded-xl border border-border bg-white dark:bg-dark p-6 text-center hover:shadow-md hover:border-primary/50 transition-all block">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                  <Icon icon="solar:letter-linear" width={26} className="text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Correo</p>
                <p className="text-base font-semibold text-foreground break-all leading-snug">soporte@gescomve.com</p>
              </a>

              <div className="rounded-xl border border-border bg-white dark:bg-dark p-6 text-center hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-warning/10 w-fit mx-auto mb-3">
                  <Icon icon="solar:clock-circle-linear" width={26} className="text-warning" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Horario</p>
                <p className="text-base font-medium text-foreground">Lun – Vie</p>
                <p className="text-sm text-muted-foreground">8:00 am – 6:00 pm</p>
              </div>
            </div>

            <div className="text-center mt-12">
              <a href="https://wa.me/584123456789" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-success px-8 py-3.5 text-base font-semibold text-white hover:bg-success/90 transition-colors shadow-lg shadow-success/25">
                <Icon icon="solar:phone-bold" width={18} />
                Contactar por WhatsApp
              </a>
            </div>
          </section>

          {/* ── CTA final ───────────────────────────────────────────────── */}
          <section className="bg-muted/30 dark:bg-muted/10 border-y border-border">
            <div className="max-w-3xl mx-auto px-6 py-12 text-center">
              <h2 className="text-4xl font-bold text-foreground dark:text-white">¿Listo para ordenar tus finanzas?</h2>
              <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
                Únete a los negocios venezolanos que ya usan GesCom. Sin tarjeta de crédito, sin compromiso.
              </p>
              <Link to="/register" className="inline-flex items-center gap-2 mt-9 rounded-full bg-primary px-9 py-3.5 text-base font-semibold text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
                Crear cuenta gratis
                <Icon icon="solar:arrow-right-linear" width={18} />
              </Link>
            </div>
          </section>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <footer className="border-t border-border bg-muted/20 dark:bg-muted/5">
            <div className="max-w-7xl mx-auto px-6 py-5">
              {/* Fila 1: Redes sociales — siempre centradas */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <a href="https://facebook.com/gescomve" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-muted/40 hover:bg-lightprimary text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                  <Icon icon="mdi:facebook" width={20} />
                </a>
                <a href="https://youtube.com/@gescomve" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-muted/40 hover:bg-lightprimary text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube">
                  <Icon icon="mdi:youtube" width={20} />
                </a>
                <a href="https://x.com/gescomve" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-muted/40 hover:bg-lightprimary text-muted-foreground hover:text-primary transition-colors" aria-label="X">
                  <Icon icon="ri:twitter-x-fill" width={18} />
                </a>
              </div>

              {/* Fila 2: Enlaces — centrados */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4">
                <a href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Iniciar sesión</a>
                <a href="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">Registrarse</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Términos y condiciones</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Políticas de privacidad</a>
              </div>

              {/* Fila 3: Copyright — centrado */}
              <p className="text-sm text-muted-foreground text-center">
                © {new Date().getFullYear()} GesCom VE — Hecho en Venezuela.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default HomePage;

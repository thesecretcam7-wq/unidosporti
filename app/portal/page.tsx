'use client'

import { useState } from 'react'
import Link from 'next/link'

const BLUE = '#1B4FCC'
const GREEN = '#059669'
const AMBER = '#d97706'
const LIGHT_BLUE = '#EEF3FC'
const DARK = '#111827'
const GRAY = '#6B7280'
const LIGHT_GRAY = '#F9FAFB'
const BORDER = '#E5E7EB'

export default function PortalPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: DARK, margin: 0, padding: 0 }}>

      {/* Sticky Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'white', borderBottom: `1px solid ${BORDER}`,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: BLUE }}>UnidosPorTi</span>
            <span style={{ fontSize: 12, color: GRAY, marginLeft: 10, fontWeight: 500 }}>Para ONGs y Empresas</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/" style={{
              padding: '8px 18px', borderRadius: 8, border: `1.5px solid ${BLUE}`,
              color: BLUE, fontWeight: 600, fontSize: 14, textDecoration: 'none',
              transition: 'background 0.15s',
            }}>
              Iniciar sesión
            </Link>
            <Link href="/" style={{
              padding: '8px 18px', borderRadius: 8, background: BLUE,
              color: 'white', fontWeight: 600, fontSize: 14, textDecoration: 'none',
            }}>
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${LIGHT_BLUE} 0%, #f0fdf4 100%)`, padding: '80px 24px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', background: `${BLUE}14`, color: BLUE,
            padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 24,
          }}>
            Portal B2B · Acceso para organizaciones
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 24px', color: DARK }}>
            Llega a los migrantes<br />
            <span style={{ color: BLUE }}>que necesitan tu ayuda</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: GRAY, maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.65 }}>
            Conecta con más de <strong style={{ color: DARK }}>10.000 usuarios activos</strong> segmentados por situación migratoria, ciudad y país de origen. Publica recursos, lanza alertas y mide tu impacto real.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/?portal=registro-ong" style={{
              padding: '14px 32px', borderRadius: 10, background: BLUE,
              color: 'white', fontWeight: 700, fontSize: 16, textDecoration: 'none',
              boxShadow: `0 4px 20px ${BLUE}44`,
            }}>
              Empezar gratis →
            </Link>
            <a href="#planes" style={{
              padding: '14px 32px', borderRadius: 10, border: `2px solid ${BLUE}`,
              color: BLUE, fontWeight: 700, fontSize: 16, textDecoration: 'none',
              background: 'white',
            }}>
              Ver planes
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ background: BLUE, padding: '28px 24px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24,
          textAlign: 'center',
        }}>
          {[
            { value: '10.000+', label: 'usuarios activos' },
            { value: '47', label: 'ciudades' },
            { value: '92%', label: 'engagement rate' },
            { value: '8', label: 'países de origen' },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'white' }}>{stat.value}</div>
              <div style={{ fontSize: 14, color: '#93C5FD', marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Para quién */}
      <section style={{ padding: '72px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionLabel text="Audiencia" color={GREEN} />
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, textAlign: 'center', marginBottom: 48 }}>
            ¿Para quién es?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <AudienceCard
              icon="🤝"
              title="ONGs y entidades sociales"
              desc="Organizaciones como Cruz Roja, ACNUR o CEAR que ofrecen asistencia legal, orientación laboral, alojamiento y apoyo psicosocial a migrantes y refugiados."
              examples={['Cruz Roja', 'ACNUR', 'CEAR', 'Cáritas', 'Médicos del Mundo']}
              color={BLUE}
            />
            <AudienceCard
              icon="🏢"
              title="Empresas con programas de integración"
              desc="Empresas que buscan talento migrante o tienen compromisos de responsabilidad social: supermercados, hostelería, construcción, logística."
              examples={['Carrefour', 'NH Hoteles', 'Acciona', 'Mercadona', 'Grupo FCC']}
              color={GREEN}
            />
            <AudienceCard
              icon="🏛️"
              title="Administraciones públicas"
              desc="Ayuntamientos, comunidades autónomas y organismos públicos que gestionan servicios de acogida, empadronamiento e integración."
              examples={['Ayuntamiento de Madrid', 'Generalitat', 'SEPE', 'Imserso']}
              color={AMBER}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '72px 24px', background: LIGHT_GRAY }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionLabel text="Funcionalidades" color={BLUE} />
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, textAlign: 'center', marginBottom: 48 }}>
            ¿Qué puedes hacer?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              {
                icon: '📢',
                title: 'Publicar recursos verificados',
                desc: 'Sube tus servicios, talleres y ayudas directamente a la app con un badge oficial que genera confianza en los usuarios.',
              },
              {
                icon: '🎯',
                title: 'Alertas segmentadas',
                desc: 'Envía notificaciones personalizadas filtrando por situación migratoria (regular, irregular, refugio), ciudad y país de origen.',
              },
              {
                icon: '📊',
                title: 'Panel de analítica',
                desc: 'Visualiza en tiempo real cuántos usuarios vieron tu contenido, interactuaron con él y siguieron el enlace a tu servicio.',
              },
              {
                icon: '💼',
                title: 'Bolsa de empleo prioritaria',
                desc: 'Publica ofertas de trabajo con aprobación automática y badge "Empresa Verificada". Acceso directo a candidatos activos.',
              },
              {
                icon: '🤖',
                title: 'Integración en Chat IA',
                desc: 'Cuando un usuario pregunta a la IA sobre servicios similares a los tuyos, el asistente menciona y recomienda tu organización.',
              },
              {
                icon: '📋',
                title: 'Informes de impacto',
                desc: 'Genera PDFs profesionales con métricas de alcance, engagement y resultados. Ideales para memorias anuales y justificación de subvenciones.',
              },
            ].map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planes" style={{ padding: '72px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionLabel text="Precios" color={AMBER} />
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
            Planes y precios
          </h2>
          <p style={{ textAlign: 'center', color: GRAY, marginBottom: 48, fontSize: 16 }}>
            Sin permanencia. Cancela cuando quieras.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'start' }}>
            <PlanCard
              name="Básico"
              price="49"
              highlighted={false}
              features={[
                'Badge verificada en la app',
                '5 recursos/mes',
                '1 alerta segmentada/mes',
                'Estadísticas básicas',
                'Soporte por email',
              ]}
              cta="Empezar →"
              plan="basico"
            />
            <PlanCard
              name="Estándar"
              price="149"
              highlighted={true}
              badge="Más popular"
              features={[
                'Todo lo del plan Básico',
                'Recursos ilimitados',
                '5 alertas segmentadas/mes',
                'Oferta de empleo automática',
                'Informe mensual en PDF',
                '20 leads gratuitos/mes',
              ]}
              cta="Empezar →"
              plan="estandar"
            />
            <PlanCard
              name="Premium"
              price="399"
              highlighted={false}
              features={[
                'Todo ilimitado',
                'Integración vía API',
                'Account manager dedicado',
                'Logo de tu organización en la app',
                'Leads incluidos sin límite',
                'Soporte prioritario 24/7',
              ]}
              cta="Empezar →"
              plan="premium"
            />
          </div>
        </div>
      </section>

      {/* Advertising */}
      <section style={{ padding: '72px 24px', background: `linear-gradient(135deg, #1e3a8a 0%, #1B4FCC 100%)` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: 'white',
              padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 16,
            }}>
              Publicidad
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, color: 'white', marginBottom: 16 }}>
              Publicidad segmentada
            </h2>
            <p style={{ color: '#BFDBFE', fontSize: 16, maxWidth: 560, margin: '0 auto' }}>
              Llega exactamente a quien necesitas con formatos publicitarios diseñados para audiencias migrantes.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
            {[
              { icon: '🃏', title: 'Card nativa en feed', price: 'CPM 8–15€', desc: 'Aparece integrada en el feed de recursos. Alto CTR, formato no intrusivo.' },
              { icon: '🏷️', title: 'Patrocinio de sección', price: '299–799€/mes', desc: 'Tu marca como patrocinadora de la sección de empleo, vivienda o salud.' },
              { icon: '🔔', title: 'Alerta patrocinada', price: '0,05–0,15€/envío', desc: 'Push notification con tu mensaje directamente en el móvil del usuario.' },
              { icon: '🤖', title: 'Integración Chat IA', price: '1,50–4€/clic', desc: 'El asistente IA menciona tu servicio cuando el usuario pregunta por recursos.' },
            ].map((ad) => (
              <div key={ad.title} style={{
                background: 'rgba(255,255,255,0.10)', borderRadius: 14, padding: '24px 20px',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{ad.icon}</div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{ad.title}</div>
                <div style={{ color: '#FCD34D', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{ad.price}</div>
                <div style={{ color: '#BFDBFE', fontSize: 14, lineHeight: 1.5 }}>{ad.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <a
              href="mailto:contacto@unidosporti.com?subject=Solicitud%20propuesta%20publicitaria"
              style={{
                display: 'inline-block', padding: '14px 32px', borderRadius: 10,
                background: AMBER, color: 'white', fontWeight: 700, fontSize: 16,
                textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              Solicitar propuesta publicitaria →
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '72px 24px', background: LIGHT_GRAY }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionLabel text="Testimonios" color={GREEN} />
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, textAlign: 'center', marginBottom: 48 }}>
            Lo que dicen nuestros socios
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              {
                quote: 'Gracias a las alertas segmentadas de UnidosPorTi llegamos a migrantes venezolanos en situación irregular que nunca habrían encontrado nuestros talleres de regularización. El ROI es clarísimo.',
                name: 'María Fernández',
                role: 'Directora de Programas',
                org: 'Fundación Acoge Madrid',
              },
              {
                quote: 'La integración con el chat de IA ha sido un cambio de juego. Antes invertíamos mucho en SEO con resultados modestos. Ahora cuando alguien pregunta al asistente sobre empleo en hostelería, aparecemos nosotros.',
                name: 'Javier Morales',
                role: 'Responsable RSC',
                org: 'Grupo Cebra Hostelería',
              },
              {
                quote: 'Los informes de impacto en PDF nos han ahorrado horas de trabajo en la memoria anual. El ayuntamiento ha renovado la subvención por segundo año consecutivo apoyándose en esos datos.',
                name: 'Ana Suárez',
                role: 'Técnica de Integración',
                org: 'Ayuntamiento de Móstoles',
              },
            ].map((t) => (
              <div key={t.name} style={{
                background: 'white', borderRadius: 16, padding: 28,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${BORDER}`,
              }}>
                <div style={{ fontSize: 32, color: BLUE, marginBottom: 16, lineHeight: 1 }}>"</div>
                <p style={{ color: DARK, fontSize: 15, lineHeight: 1.7, margin: '0 0 20px', fontStyle: 'italic' }}>
                  {t.quote}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${BLUE}, ${GREEN})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: 16,
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: DARK }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: GRAY }}>{t.role} · {t.org}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '72px 24px', background: 'white' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <SectionLabel text="FAQ" color={BLUE} />
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, textAlign: 'center', marginBottom: 48 }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                q: '¿Necesito ser una ONG registrada para acceder al portal?',
                a: 'No. El portal está abierto a ONGs, empresas privadas, autónomos con proyectos de integración y administraciones públicas. Solo necesitas una cuenta de organización y pasar por un proceso de verificación básico (NIF/CIF y actividad principal).',
              },
              {
                q: '¿Cómo funciona la segmentación de alertas?',
                a: 'Puedes filtrar tu audiencia por situación migratoria (regular, irregular, solicitante de asilo, refugiado reconocido), por ciudad española y por país de origen. El sistema garantiza que solo los usuarios que han consentido recibir comunicaciones de organizaciones como la tuya recibirán la alerta.',
              },
              {
                q: '¿Qué pasa con los datos de los usuarios? ¿Cumple el RGPD?',
                a: 'UnidosPorTi no comparte datos personales individuales con las organizaciones. Solo proporcionamos métricas agregadas y anonimizadas. Todo el tratamiento de datos cumple el RGPD y la LOPDGDD. Podemos firmar un DPA (Data Processing Agreement) si lo necesitas.',
              },
              {
                q: '¿Puedo cancelar en cualquier momento?',
                a: 'Sí. Todos los planes son mensuales y sin permanencia. Puedes cancelar desde el panel de control antes del siguiente período de facturación y no se te cobrará nada más. No hay penalizaciones por cancelación.',
              },
              {
                q: '¿Cuánto tiempo tarda en activarse mi cuenta?',
                a: 'La verificación básica tarda entre 24 y 48 horas hábiles. Una vez aprobada, tu organización aparece en la app con el badge verificado y puedes empezar a publicar recursos inmediatamente. Las cuentas Premium con integración IA tienen un proceso de onboarding de 5-7 días.',
              },
            ].map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '72px 24px', background: `linear-gradient(135deg, ${LIGHT_BLUE} 0%, #f0fdf4 100%)` }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, marginBottom: 16 }}>
            Empieza a impactar hoy
          </h2>
          <p style={{ color: GRAY, fontSize: 16, marginBottom: 32 }}>
            Únete a más de 120 organizaciones que ya utilizan UnidosPorTi para conectar con migrantes en España.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/?portal=registro-ong" style={{
              padding: '14px 32px', borderRadius: 10, background: BLUE,
              color: 'white', fontWeight: 700, fontSize: 16, textDecoration: 'none',
              boxShadow: `0 4px 20px ${BLUE}44`,
            }}>
              Crear cuenta gratuita →
            </Link>
            <a href="mailto:contacto@unidosporti.com" style={{
              padding: '14px 32px', borderRadius: 10, border: `2px solid ${BLUE}`,
              color: BLUE, fontWeight: 700, fontSize: 16, textDecoration: 'none',
              background: 'white',
            }}>
              Hablar con el equipo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: DARK, color: '#9CA3AF', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>UnidosPorTi</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                La plataforma de referencia para la integración de migrantes en España.
              </div>
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Producto</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#planes" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>Planes y precios</a>
                <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>App para migrantes</Link>
                <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>Documentación API</a>
              </div>
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Empresa</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>Sobre nosotros</a>
                <a href="mailto:contacto@unidosporti.com" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>Contacto</a>
                <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>Blog</a>
              </div>
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Legal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>Política de privacidad</a>
                <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>Términos de uso</a>
                <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>Política de cookies</a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #374151', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 14 }}>© 2025 UnidosPorTi. Todos los derechos reservados.</div>
            <div style={{ fontSize: 14 }}>
              <a href="mailto:contacto@unidosporti.com" style={{ color: '#9CA3AF', textDecoration: 'none' }}>contacto@unidosporti.com</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─── Sub-components ─── */

function SectionLabel({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 12 }}>
      <span style={{
        display: 'inline-block', background: `${color}18`, color: color,
        padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        {text}
      </span>
    </div>
  )
}

function AudienceCard({ icon, title, desc, examples, color }: {
  icon: string; title: string; desc: string; examples: string[]; color: string
}) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: 28,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${BORDER}`,
      borderTop: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: DARK }}>{title}</h3>
      <p style={{ color: GRAY, fontSize: 15, lineHeight: 1.65, marginBottom: 16 }}>{desc}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {examples.map((e) => (
          <span key={e} style={{
            background: `${color}12`, color: color,
            padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
          }}>{e}</span>
        ))}
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '24px 22px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: `1px solid ${BORDER}`,
    }}>
      <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: DARK }}>{title}</h3>
      <p style={{ color: GRAY, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{desc}</p>
    </div>
  )
}

function PlanCard({ name, price, highlighted, badge, features, cta, plan }: {
  name: string; price: string; highlighted: boolean; badge?: string;
  features: string[]; cta: string; plan: string;
}) {
  return (
    <div style={{
      background: highlighted ? BLUE : 'white',
      borderRadius: 16, padding: '32px 28px',
      boxShadow: highlighted ? `0 8px 32px ${BLUE}44` : '0 2px 12px rgba(0,0,0,0.06)',
      border: highlighted ? 'none' : `1px solid ${BORDER}`,
      position: 'relative', transform: highlighted ? 'scale(1.03)' : 'none',
    }}>
      {badge && (
        <div style={{
          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
          background: AMBER, color: 'white', padding: '4px 16px',
          borderRadius: 100, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          {badge}
        </div>
      )}
      <div style={{ fontSize: 20, fontWeight: 800, color: highlighted ? 'white' : DARK, marginBottom: 8 }}>{name}</div>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 42, fontWeight: 900, color: highlighted ? 'white' : BLUE }}>{price}€</span>
        <span style={{ fontSize: 14, color: highlighted ? '#BFDBFE' : GRAY }}>/mes</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {features.map((f) => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
            <span style={{ color: highlighted ? '#86EFAC' : GREEN, fontWeight: 800, fontSize: 16, flexShrink: 0 }}>✓</span>
            <span style={{ color: highlighted ? '#DBEAFE' : DARK }}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={`/?portal=registro-ong&plan=${plan}`}
        style={{
          display: 'block', textAlign: 'center', padding: '12px 24px',
          borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none',
          background: highlighted ? 'white' : BLUE,
          color: highlighted ? BLUE : 'white',
        }}
      >
        {cta}
      </Link>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', textAlign: 'left', padding: '18px 22px',
          background: open ? LIGHT_BLUE : 'white', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 15, color: DARK }}>{q}</span>
        <span style={{ color: BLUE, fontSize: 20, fontWeight: 700, flexShrink: 0 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 22px 18px', background: LIGHT_BLUE }}>
          <p style={{ color: GRAY, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{a}</p>
        </div>
      )}
    </div>
  )
}

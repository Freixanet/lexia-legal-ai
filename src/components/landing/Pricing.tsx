'use client';

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PLANS = [
  {
    name: 'Gratis',
    price: '0',
    period: '',
    features: ['5 consultas/día', '1 documento/día', 'Historial 7 días'],
    cta: 'Empezar gratis',
    href: '/iniciar-sesion',
    popular: false,
  },
  {
    name: 'Pro',
    price: '9,99',
    period: '€/mes',
    features: [
      'Consultas ilimitadas',
      '20 documentos/día',
      'Historial ilimitado',
      'Respuestas más detalladas',
      'Prioridad en respuestas',
    ],
    cta: 'Empezar prueba gratuita',
    href: '/iniciar-sesion',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '—',
    period: '',
    features: ['Todo lo de Pro', 'API access', 'Múltiples usuarios', 'Soporte prioritario'],
    cta: 'Contactar',
    href: '#contact',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="landing-v3-section" aria-labelledby="pricing-title">
      <div className="landing-v3-container">
        <motion.h2
          id="pricing-title"
          className="landing-v3-section-title"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Precios
        </motion.h2>
        <div className="landing-v3-pricing-grid">
          {PLANS.map((plan, i) => (
            <motion.article
              key={plan.name}
              className={`landing-v3-pricing-card ${plan.popular ? 'popular' : ''}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {plan.popular && (
                <span className="landing-v3-pricing-badge">Más popular</span>
              )}
              <h3 className="landing-v3-pricing-name">{plan.name}</h3>
              <p className="landing-v3-pricing-price">
                {plan.price}
                <span className="landing-v3-pricing-period">{plan.period}</span>
              </p>
              <ul className="landing-v3-pricing-features">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link to={plan.href} className="landing-v3-pricing-cta">
                {plan.cta}
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

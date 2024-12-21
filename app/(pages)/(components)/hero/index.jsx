'use client'

import { Background } from './background'
import s from './hero.module.css'

export function Hero({ children }) {
  return (
    <section className={s.hero}>
      <Background />
      <div className={s.container}>
        {children}
      </div>
    </section>
  )
} 
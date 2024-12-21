'use client'

import { Hero } from '../(components)/hero'
import { Wrapper } from '../(components)/wrapper'
import s from './home.module.css'

export default function Home() {
  return (
    <Wrapper theme="red" className={s.page}>
      <Hero>
        <div className={s.hero}>
          <h1 className={s.title}>SILLYBOY</h1>
          <p className={s.subtitle}>
            no bullshit print, digital and web design
          </p>
        </div>
      </Hero>
      <section className={s.whiteSection}>
        <div className={s.container}>{/* Content for white section */}</div>
      </section>
    </Wrapper>
  )
}

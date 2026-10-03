# Prompt pour Claude Design

À coller dans Claude Design. Joindre 2 ou 3 captures d'omelee.com comme référence d'ambiance.

---

Design a mobile-first web app called **Zubio**, in French. Zubio connects gyms with freelance coaches on the Basque coast (Bayonne, Anglet, Biarritz). "Zubi" means *bridge* in Basque: Zubio is the bridge between a gym that needs a coach tonight and the coaches nearby.

**Core flow to show:** a gym publishes a class slot (discipline, day, time, price) → the app finds compatible coaches (verified diploma, distance, availability, minimum rate) and shows why each one matches ("Favori · Diplôme ✓ · 2 km") → a coach accepts in one tap → it's confirmed on both sides, live.

**Brand.** Create a memorable, hand-crafted identity, not a generic SaaS logo. The wordmark "zubio" should carry the bridge concept (for example an arch linking two letters, or the letters forming a bridge), stay readable at 16 px, and come in full, mark-only, white-on-red and black versions. Signature colour: a warm, confident red on warm off-white (cream) backgrounds, with dark warm ink. Mood reference: omelee.com: friendly, crafted, warm, rounded, playful but premium. Avoid gradients, glassmorphism, purple/electric blue, sparkle icons, stock illustrations, and anything that looks AI-generated.

**Graphic system.**
- One soft colour pair per discipline: pilates, yoga, cross-training, cours collectifs, musculation, aquagym. Show a rounded icon tile for each (Lucide-style line icons).
- A stylised map of the Bayonne–Anglet–Biarritz coast (ocean, Adour river, town labels) as the signature visual. Arcs (bridges) link the gym to the matched coaches.
- Initials avatars, pill buttons, large radii (20–28 px), soft warm shadows, a floating dark tab bar on mobile.
- A characterful display font for headings and a highly legible UI font. Give the tokens: colours, radii, shadows, type scale.

**Screens (375 px first, then 1280 px):**
1. Landing: hero "Le bon coach, au bon créneau.", map visual, three entry cards (Salle / Coach / Équipe Zubio), "Comment ça marche" in 3 steps.
2. Gym dashboard: gym name, red "Un coach absent ce soir ?" call-to-action, 3 stats, slot cards with status ("En recherche", "Confirmé").
3. Publish a slot: discipline tiles, day chips, start time, duration chips, price stepper, "Trouver un coach" button.
4. Slot detail: map with search radius and animated arcs to coaches, list of coaches contacted with reason and status, "Simuler 10 min sans réponse" (demo) to widen the radius, confirmation state with the coach.
5. Coach offers: offer cards (discipline, day/time, gym, price, reason) with Refuse / Accept.
6. Coach planning: earnings this month, upcoming missions. Coach profile: disciplines, verified diploma, weekly availability.
7. Admin: KPIs (slots published, fill rate, average time to fill, active coaches), diplomas to validate, activity feed.

Deliver a consistent design system plus all screens, ready to hand off to a React + Tailwind v4 + shadcn/ui implementation.

---

**Réintégration ici :** exportez les SVG du logo dans `public/brand/` et les tokens (couleurs, polices, rayons, ombres) dans le bloc `:root` de `src/index.css`. Les écrans existants s'appuient sur ces tokens et prennent la nouvelle identité sans autre changement.

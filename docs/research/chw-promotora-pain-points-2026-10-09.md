# Research: Community Health Workers / Promotoras de Salud
## Food-as-Medicine, Diabetes Management, Patient Navigation
## Puerto Rico and US Virgin Islands Context

**Date:** 2026-10-09  
**Trigger:** On-demand `/research` — CHW/promotora pain points for Receta Fresca  
**Scope:** Roles, communication, dietary coaching, follow-up burden, care coordination, cultural mediation, technology gaps, funding instability, food access navigation, burnout

---

## Summary

CHWs and promotoras de salud are the trusted, community-embedded layer between clinical care and the people Receta Fresca serves. The literature is consistent across 16 years of studies: they work, they are trusted, they are underfunded, they carry heavy emotional loads, and they do most of their work with paper and WhatsApp rather than integrated systems. The specific pain points most relevant to Receta Fresca are listed below.

---

## Pain Points

### 1. Unclear scope of practice around nutrition counseling

**Who feels it:** Promotoras and CHWs delivering diabetes education.  
**What hurts:** CHWs are lay health workers, not registered dietitians. When a patient asks "can I eat arroz con pollo?", the promotora has no clinical authority to answer. The training they receive on nutrition varies wildly — some programs give weeks of structured curriculum, others give a handout. Facilitators in diabetes self-management education (DSME) programs report that the structured, manualized design of programs constrains responsiveness to real patient questions, especially around culturally specific foods.  
**Evidence:** Verdecias-Pellum et al., *IJERPH* 2026 (PMID 41595882): "Facilitators expressed openness to integrating [social needs screening], yet cited limited infrastructure, role clarity, and training as key barriers." Deitrick et al., *Qual Health Res* 2010 (PMID 20133505): promotora role "varied among patients, promotora, and the literature" — highlighting the definitional ambiguity of what CHWs are expected to know and do on nutrition.  
**Frequency:** Recurring across multiple study populations and settings (US-Mexico border, urban Northeast Latino populations, Midwestern Latino communities).  
**Severity:** Workaround needed. Promotoras fill the gap by staying in their lane or improvising. When they improvise on carbohydrates or glycemic load, the information may conflict with what the clinician prescribed.

**Relevance to Receta Fresca:** The app's food estimator and plain-language plan could function as a bounded reference the promotora shows to patients — "the clinician's plan says this dish is about this many carbs" — without the promotora having to author the clinical judgment.

---

### 2. No closed-loop communication between CHW and clinician

**Who feels it:** Both CHWs and clinicians.  
**What hurts:** The CHW visits a patient at home and observes that she is eating processed food because she cannot afford vegetables, that her meter batteries are dead, and that she is afraid to call the clinic. None of this gets back to the clinician before the next appointment (if there is one). Similarly, when the clinician changes the carbohydrate goal, the CHW may not know.  
**Evidence:** Sanders & Fiscella, *J Am Board Fam Med* 2026 (PMID 42562653): CHWs "help people address the social determinants of health, understand their health, and get the health care they need … yet many serve in unpaid positions and their services have not been readily reimbursable" — which directly causes the systemic exclusion of CHWs from EHR-integrated workflows. Harker et al., *Med Care* 2026 (PMID 42417485): CHW integration barriers include "role clarity, robust support systems, and context-specific training" — and lack of a formal communication channel between CHW and physician is cited as a structural barrier. Gonçalves-Bradley et al., *Cochrane* 2020 (PMID 32813281): mobile technologies for CHW-to-clinic communication "may make little or no difference" in clinical outcomes — but the reason cited is inconsistent implementation and lack of follow-through infrastructure, not the communication technology itself.  
**Frequency:** Widespread. Multiple systematic reviews identify this as a structural gap in CHW integration.  
**Severity:** Workaround needed / churn risk. Patients receive inconsistent advice and the system loses the observations the CHW made.

**Relevance to Receta Fresca:** The prescription object (clinician sets carb goal → patient gets plan) currently has no return path. A CHW observer role — with the ability to flag "patient has not redeemed" or "patient told me the colmado was out of vegetables" — would close the loop without requiring EHR integration.

---

### 3. Food insecurity navigation is expected but under-supported

**Who feels it:** CHWs and patient navigators.  
**What hurts:** Patients with diabetes who are food-insecure have significantly worse access to care: Kollannoor-Samuel et al., *J Immigr Minor Health* 2012 (PMID 22101725) found food insecurity was independently associated with barriers to enabling factors (OR 1.46), medication access (OR 1.26), and forgetfulness (OR 1.22) in a study of 211 Latinos (predominantly Puerto Rican) with T2D. CHWs are expected to help patients navigate SNAP, WIC, food banks, and local food resources — but they typically have no current, structured reference for what is available, where, and whether it has culturally appropriate options.  
**Evidence:** Schier et al., *Nutr Rev* 2024 (PMID 37837324, narrative review of 8 food-provision programs): programs that included nutrition education "covered multiple topical contents, including general nutrition knowledge, fruit and vegetable consumption, and accessing resources (e.g., enrolling in [SNAP])." CHWs delivered this content — but "there was a high degree of heterogeneity in terms of content, educator, and duration."  
Verdecias-Pellum et al. 2026: "growing expectations to address [health-related social needs] without adequate resources for referral created sustainability concerns."  
**Frequency:** Widespread.  
**Severity:** Workaround needed. The CHW typically maintains a personal list of resources in their head or on paper. When a resource closes or a store stops accepting WIC, they may not know.

**Relevance to Receta Fresca:** The `/negocio` redemption flow already maps local stores, farms, and kitchens. That map is exactly what a CHW needs when helping a patient find where to use their prescription. The store-selection screen could be shared — or a CHW could help a patient select a store during a home visit.

---

### 4. Produce prescription programs underenroll the patients who need them most

**Who feels it:** Program coordinators, CHWs, and patients.  
**What hurts:** The largest recent RCT of a produce prescription for diabetes (Drake et al., *JAMA Intern Med* 2026, PMID 41697676, n=2155) found that "a produce prescription subsidy alone did not improve outcomes." The finding was explained partly by moderate benefit use: only 30% of participants used 80% or more of their monthly subsidy. Enrollment itself was lower among older adults, males, Medicaid enrollees, and Hispanic/Latino participants (OR 0.72 vs Black participants). The 2026 study (Rader et al., *J Nutr* 2026, PMID 42036037) confirms that "multimodal outreach strategies and targeted implementation approaches may be necessary to ensure equitable program reach."  
The programs that showed consistent HbA1c improvements included nutrition education with a cultural mediator — a CHW or promotora — not just the voucher alone.  
**Evidence:** See citations above. Schier et al. 2024: "All programs with a nutrition education component reported reduced participant HbA1c." The two programs that omitted education "yielded mixed results."  
**Frequency:** Recurring finding across multiple studies.  
**Severity:** Workaround needed. The mechanism for failure (subsidy without navigator) is now well-documented.

**Relevance to Receta Fresca:** The Receta Fresca model couples the prescription with a local plan using familiar dishes — this is the education component embedded in the tool. But if no one helps the patient redeem it (equivalent to the CHW role in produce prescription programs), the voucher may go unused.

---

### 5. Cultural mediation around food is the promotora's core value — and hardest to systematize

**Who feels it:** Promotoras, patients.  
**What hurts:** The promotora's value is precisely that she is from the community. She knows which dishes patients eat at Sunday dinners, knows which colmados accept EBT, knows that a patient's abuela will override any dietary advice from a doctor. But the knowledge she holds is informal and lives only in her head. No app currently captures it. Deitrick et al. 2010 (PMID 20133505): "Terms patients used for the promotora included comadre, hijita, and buena profesora. Some of these words denote almost kinship-level connections, suggesting that patients were forming strong connections with the promotora." The relationship is the intervention.  
When the promotora leaves the program, that relationship and that knowledge leave with her.  
**Evidence:** Deitrick et al. 2010; McEwen et al. 2010 (PMID 20626831): "Promotoras, in collaboration with a CDE, successfully delivered a culturally tailored diabetes self-management social support intervention." The word "in collaboration" is significant — promotora and certified diabetes educator working together, each contributing what the other cannot.  
Kunz et al. 2017 (PMID 28673089, Vivir Mejor! program): promotoras "focused exclusively on health education," while patient navigators "individually coached patients with chronic disease management issues for the high-risk patient population" — explicitly splitting the two roles.  
**Frequency:** Recurring.  
**Severity:** Annoyance at the person level, churn risk at the program level (when the promotora departs).

**Relevance to Receta Fresca:** The 30-dish food table in `data/foods.json` is a starting point for this kind of cultural grounding. The app names local dishes, uses local Spanish, and builds plans from what local vendors stock. This is an asset the CHW can use with patients without needing to argue from generic nutritional databases that have no entry for carne guisada or viandas.

---

### 6. Funding instability interrupts long-term patient relationships

**Who feels it:** CHWs, program coordinators, and patients whose CHW disappears.  
**What hurts:** CHW programs are predominantly grant-funded. When a grant cycle ends, so does the program — and so do the relationships that took months to build. The *CHW Access Act* (pending legislation as of 2026) would allow Medicaid reimbursement for CHW services, but it has not passed and the "pitfalls" include risk of overmedicalization and loss of community character (Sanders & Fiscella 2026, PMID 42562653).  
In Puerto Rico specifically, the healthcare system operates under a managed care (Mi Salud) structure and is a Medicaid territory — which means federal matching rates are capped differently than in US states. This structural underfunding has cascading effects on all community-based health infrastructure.  
**Evidence:** Sanders & Fiscella 2026: "CHWs serve in unpaid positions and their services have not been readily reimbursable in the healthcare system." Verdecias-Pellum 2026: "successful implementation requires dedicated funding, workforce development, and cross-sector coordination."  
**Frequency:** Widespread.  
**Severity:** Churn risk. Patients lose their trusted navigator; CHWs lose their jobs; programs restart from zero.

**Relevance to Receta Fresca:** A CHW who has no app or digital record cannot hand off a patient relationship to a successor. An app that records prescription history, redemption status, and patient preferences creates continuity that survives individual staff turnover.

---

### 7. WhatsApp and phone calls are the de facto CHW communication infrastructure

**Who feels it:** CHWs, patients, and clinicians receiving informal messages.  
**What hurts:** CHWs communicate with patients primarily by phone — calls and WhatsApp voice messages. They are not integrated into clinic EHRs. This creates three problems: (a) patient information is not documented, (b) the CHW has no easy way to send structured observations back to the clinician, and (c) the CHW carries all context in memory or in informal notes.  
Lewin et al. 2026 (PMID 41797889, South Africa survey, n=2174 healthcare workers): 90% reported using a messaging app for work-related communication; 84% used WhatsApp — including for patient referrals and clinical management information. Most (79.3%) received no data allowance. The informal use of messaging was "widespread and needs to be considered in digital health strategies."  
Chisholm et al. 2025 (PMID 40408933): WhatsApp-based microlearning for CHWs was "feasible and well-received" — 98% would participate in weekly training. "Challenges" included infrastructure/technology, language barriers, and message fatigue.  
**Evidence:** See above. The informal pattern is consistent globally.  
**Frequency:** Widespread — described as the de facto standard in multiple countries and contexts.  
**Severity:** Workaround needed. The workaround (WhatsApp) mostly works but creates no record, no audit trail, and no way for the clinician to see what the CHW observed.

**Relevance to Receta Fresca:** The app currently targets the patient's own device. If a CHW is accompanying a patient at a home visit (or a phone call), the CHW could complete the intake on behalf of a patient who cannot use a smartphone. The app's voice input feature is relevant here — the CHW could hold the phone and the patient could answer verbally.

---

### 8. Carb estimation for local dishes is a real gap — not just a demo problem

**Who feels it:** CHWs, patients, and any clinician trying to set a realistic carb goal for patients eating traditional Puerto Rican food.  
**What hurts:** Standard calorie-tracking apps (MyFitnessPal, Lose It!) have no entry for many traditional dishes, or have entries derived from restaurant portions rather than home cooking. A patient who eats pasteles for Christmas, sofrito-based rice dishes, or viandas cannot get a reliable carb estimate from generic apps.  
**Evidence:** The Receta Fresca food table itself (`data/foods.json`, 30 dishes) documents this: 6 dishes have no USDA FoodData Central match at all; 10 have only the closest available food, not an exact match. This is a codebase observation, not a published study. However, it is consistent with the broader literature on Hispanic/Latino dietary assessment: instruments developed for non-Latino populations systematically underperform on Latin American food patterns.  
**Frequency:** Every patient eating traditional Puerto Rican food faces this.  
**Severity:** Workaround needed. Without estimates, patients cannot track and clinicians cannot titrate goals.

**Relevance to Receta Fresca:** This is the core problem the app addresses. The CHW can use the `/comida` estimator during a home visit to show a patient what a meal costs in carbs — without the CHW needing to know the clinical answer.

---

### 9. Promotora burnout is driven by boundary dissolution, not just workload

**Who feels it:** CHWs and promotoras serving their own communities.  
**What hurts:** The promotora is not a professional outsider — she lives in the same neighborhood, shops at the same colmado, knows the patient's family. When a patient's control deteriorates, the promotora feels it. When a patient dies, the promotora knew them. The study on frontline providers serving Latino immigrant communities (Mesa et al. 2020, PMID 32462702) found that "staff members' experiences … was congruent with definitions of secondary trauma stress and compassion fatigue, whereby exposure to clients' trauma combined with job burden subsequently impacted the mental health of providers." The "increased demand to meet clients' needs" was the precipitating factor.  
BMC Psychology 2026 (PMID 42129930, rural CHWs, Taiwan): emotional exhaustion and depersonalization were "significantly and negatively associated with self-actualization" — and the most important protective factor was "higher perceived social support" (β=0.28), not workload reduction.  
**Evidence:** See above.  
**Frequency:** Recurring across CHW populations globally.  
**Severity:** Churn risk. CHWs who burn out leave programs, and the community loses the most trusted contact point.

**Relevance to Receta Fresca:** The app currently does nothing to support the CHW's own experience. This is a product gap but also a design signal: if the CHW's work generates documentation automatically (from patient interactions), the CHW carries less memory burden. Lighter administrative load is a modest support.

---

## What Successful CHW-Integrated Programs Did

### Vivir Mejor! (Arizona-Mexico border, Kunz et al. 2017, PMID 28673089)
- Separated roles: promotoras did health education; patient navigators coached chronic disease management for high-risk patients.
- Multisector partnerships allowed the program to offer health and social services around diabetes care.
- Key lesson: role differentiation prevents scope creep and protects the promotora from clinical overreach.

### Promotora-as-comadre model (Allentown PA, Deitrick et al. 2010, PMID 20133505)
- Hospital-community organization partnership.
- Promotora taught diabetes self-management in Spanish to Puerto Rican diabetics from the same community.
- Patients described the promotora as "comadre" — almost kinship. That relational trust drove engagement.
- Key lesson: the relationship is the mechanism of action, not the curriculum.

### Recipe4Health / Food Farmacy (Alameda County CA, Rosas et al. 2023, PMID 37024257)
- 16-week produce delivery + behavioral pharmacy (group medical visit with paraprofessional health coaches).
- Coaches were the CHW equivalent: provided accountability, social support, and goal-setting over shared plant-based meals.
- Key lesson: food access plus behavioral support together outperform either alone.

### DSME + Social Needs Screening (Verdecias-Pellum et al. 2026, PMID 41595882)
- CBOs recommended "a parallel support model involving navigators or community health workers to manage HRSN screening and referrals alongside DSME sessions."
- Key lesson: CHWs and diabetes educators should work in parallel, not in series. The CHW handles the social determinants; the educator handles the clinical protocol.

### What the 2026 JAMA Intern Med produce prescription RCT (Drake et al.) showed:
- A voucher alone (without a CHW or navigator) did not improve HbA1c, even with $80/month for produce.
- 70% of participants used less than 80% of their benefit.
- Hispanic/Latino enrollment was lower than Black enrollment.
- Key lesson: prescription + product + navigator is the minimum viable unit. Two legs of that stool do not stand.

---

## Codebase Context

### What Receta Fresca already supports for these pain points

| Pain point | What the codebase supports |
|---|---|
| Carb estimation for local dishes | `/comida` estimator using `data/foods.json` (30 dishes, USDA-grounded where possible). Works offline. |
| Plain-language plan for patients | Haiku-generated weekly plan in Spanish, using local dish names. |
| Clinician sets carb goal | `/clinico` prescription flow. CHW could present this screen to patient. |
| Voice input for low-literacy patients | All intake screens support voice. CHW could hold the phone during intake. |
| Multi-patient support | Patient switcher UI (`21ed0fe`). CHW managing multiple patients could use this. |
| Store/farm/kitchen map | `/negocio` and `/canjear` — exactly the food access navigation resource CHWs need. |

### What is not yet supported

| Gap | Description |
|---|---|
| CHW observer role | No way for a CHW to add a note to a patient's record, flag non-redemption, or report an observation to the clinician. |
| Return channel to clinician | No feedback path from patient (or CHW) experience back to the prescribing clinician. |
| Benefit/resource navigation | No integration with SNAP, WIC, food bank, or local resource directories. |
| CHW-specific UX | All screens target the patient or the clinician. No screen is designed for the CHW assisting a patient. |
| Caseload view | The patient switcher supports multiple patients but does not give a CHW a status view (e.g., "who has not redeemed this week"). |
| Offline CHW support | Unclear whether all flows work without internet connectivity in the field. |

---

## Sources Scanned

**Peer-reviewed literature (via PubMed E-utilities):**
- Deitrick LM et al. *Qual Health Res* 2010, PMID 20133505 — promotora role in Puerto Rican diabetes education
- McEwen MM et al. *Public Health Nurs* 2010, PMID 20626831 — promotora diabetes self-management, US-Mexico border
- Kollannoor-Samuel G et al. *J Immigr Minor Health* 2012, PMID 22101725 — food insecurity and care barriers among Puerto Rican T2D patients
- Kunz S et al. *Health Promot Pract* 2017, PMID 28673089 — Vivir Mejor! rural CHW diabetes prevention
- Schier HE et al. *Nutr Rev* 2024, PMID 37837324 — narrative review of clinic-community food provision programs
- Wu JH et al. *J Nutr* 2022, PMID 36774107 — produce prescription feasibility for T2D food insecurity, Australia
- Rosas LG et al. *BMJ Open* 2023, PMID 37024257 — Recipe4Health protocol, Food Farmacy + Behavioral Pharmacy
- Drake C et al. *JAMA Intern Med* 2026, PMID 41697676 — produce prescription RCT for diabetes (n=2155)
- Rader A et al. *J Nutr* 2026, PMID 42036037 — produce prescription enrollment predictors
- Verdecias-Pellum N et al. *IJERPH* 2026, PMID 41595882 — DSME + social needs integration, CHW role
- Enriquez M et al. *J Community Health Nurs* 2025, PMID 40581845 — community-partnered T2DM intervention with promotoras
- Sanders MR & Fiscella K. *J Am Board Fam Med* 2026, PMID 42562653 — CHW Access Act, Medicaid billing
- Harker K et al. *Med Care* 2026, PMID 42417485 — CHW integration barriers, VA context
- Gonçalves-Bradley DC et al. *Cochrane* 2020, PMID 32813281 — mobile tech for CHW-to-clinic communication
- Lewin S et al. *Oxf Open Digit Health* 2026, PMID 41797889 — WhatsApp use by healthcare workers, South Africa
- Chisholm BS et al. *Nurse Educ Pract* 2025, PMID 40408933 — WhatsApp microlearning for CHWs
- Mesa H et al. *Health Soc Care Community* 2020, PMID 32462702 — compassion fatigue in frontline providers serving Latino immigrants
- Chuang YM & Huang WH. *BMC Psychol* 2026, PMID 42129930 — CHW burnout and self-actualization, rural Taiwan
- Habrat ML et al. *J Patient Cent Res Rev* 2026, PMID 42813097 — SDOH screening burden on social workers
- Rivera-Raices AA et al. *BMJ Open* 2026, PMID 42055608 — promotoras as genomics education delivery agents

**Codebase:**
- `/Users/tonyhill/wuk/juvae/engineering/code/receta/data/foods.json` (30-dish local food table)
- `/Users/tonyhill/wuk/juvae/engineering/code/receta/README.md` (working vs simulated features)

**Sources not yet scanned (blocked or unavailable):**
- NACHW.org (page not found at attempted URL)
- Wholesome Wave website (empty response)
- Tufts Food is Medicine Institute (empty response)
- CDC Diabetes Statistics page for Puerto Rico (Puerto Rico data not surfaced)
- HRSA 2023 CHW report PDF (downloaded but PDF extraction tools not available in environment)
- Reddit, X/Twitter (not attempted — web search tools not available in environment)

---

## Candidates (no scoring — that is Stratex's job)

| # | Candidate | Primary pain point addressed |
|---|---|---|
| C1 | CHW observer role in prescription flow | Coordination gap (pain point 2) |
| C2 | "Share this plan" action that generates a CHW-readable summary | Coordination gap (2) + carb estimation (8) |
| C3 | Status dashboard for CHW: who has not redeemed, who is overdue | Follow-up burden (caseload tracking) |
| C4 | Resource directory tab inside store-selection screen (food banks, SNAP offices, WIC sites) | Food access navigation (3) |
| C5 | CHW-assisted intake mode: CHW holds phone, patient speaks | Low-literacy / elderly patient onboarding |
| C6 | Offline-first validation for all flows used during home visits | Technology/connectivity gaps (7) |
| C7 | Carb reference card for CHW: printable or shareable version of the food table | Scope-of-practice support (1) + carb estimation (8) |
| C8 | Session handoff: when CHW changes, prescription and plan history transfers | Funding instability / staff turnover (6) |

---

## Next scan

Daily scan should check for:
- New publications on CHW Medicaid billing (CHW Access Act status)
- Puerto Rico Health Department promotora program reports
- USVI community health worker program data
- New produce prescription / Food is Medicine program evaluations with CHW components

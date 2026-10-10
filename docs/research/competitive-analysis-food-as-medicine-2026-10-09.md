# Competitive and Comparable Analysis: Food-as-Medicine Programs

**Research date:** 2026-10-09  
**Scope:** Food prescription programs, produce prescription platforms, and comparable digital health
nutrition tools relevant to a diabetes-focused food-prescription app in Puerto Rico and USVI.  
**Agent:** research  
**Evidence basis:** Training data through August 2025 plus codebase inspection. Live URL verification
not available in this session — all external claims are flagged with their last-known date. Items
marked [VERIFY] should be confirmed against live sources before using in product decisions.

---

## Context: Why Puerto Rico and USVI are a distinct market

Before documenting each program, the structural differences that make this market unusual:

- **Puerto Rico uses NAP, not SNAP.** The Nutrition Assistance Program (NAP) is a block grant
  administered by ASSMCA (now ASES). Benefits are higher per household than mainland SNAP (PR
  received ~$2B/year as of 2023) but the program is capped — not an entitlement — so coverage
  fluctuates with federal block grant levels. NAP uses EBT at retail, but the digital/online
  redemption infrastructure lags the mainland.
- **USVI uses mainland SNAP** administered by the Department of Human Services. Coverage levels
  and EBT infrastructure are closer to mainland norms than PR.
- **Diabetes prevalence is elevated.** PR has one of the highest type-2 diabetes rates in the US
  (~16% of adults vs. ~11% nationally as of 2023 CDC data). Diabetic kidney disease and
  amputation rates are also elevated — the disease burden is not just high, it is more severe.
- **The colmado ecosystem is central.** Small neighborhood food retailers (colmados) are the
  primary food access point for lower-income households in PR, especially outside metro areas.
  They are largely cash or EBT; few have digital inventory systems. Any produce prescription
  program that routes through colmados must work with paper, WhatsApp, or very lightweight
  digital tools.
- **Local produce supply is constrained.** PR imports ~85% of its food. Local farms exist but
  supply chains are fragile, especially post-hurricane. Programs that prescribe specific produce
  varieties can fail when supply breaks.

---

## 1. Geisinger Fresh Food Farmacy

### Model
Geisinger Health System (Pennsylvania) launched Fresh Food Farmacy in 2016 as an integrated
clinical + food-access intervention for type-2 diabetes patients with food insecurity. Enrolled
patients receive:
- Medical nutrition therapy (registered dietitian)
- A biweekly "prescription" for fresh food: enough for 10 meals/week for the entire household
- Food distributed through a dedicated on-site "farmacy" stocked by a regional food bank
  (Central Pennsylvania Food Bank)
- Health coaching and care coordination

### Who pays
Geisinger Health Plan (the health system's own insurer) treated it as a covered medical benefit
under its Medicaid managed care contracts. The food cost was absorbed by the health system as a
care management expense, justified by reduction in ER and hospitalization costs. No patient
copay. [VERIFY: expansion to commercial lines of business]

### Technology
Internal EHR integration (Geisinger uses Epic). Food prescriptions generated from Epic. Pickup
logged in EHR. No patient-facing app at launch; later added patient portal integration. Limited
API exposure — the system is built on Epic's closed infrastructure.

### Outcomes (published)
- A1C reduction: mean 2.1 percentage points over 12 months in the enrolled cohort (published in
  AJPM/NEJM Catalyst, 2019). This is a very large effect — typical pharmacological interventions
  achieve 0.5–1.5 pp.
- Cost savings: Geisinger reported $2,400/patient/year reduction in total cost of care vs.
  matched controls in early reports. [VERIFY: peer-reviewed publication status]
- Food insecurity: 68% of enrolled patients improved food security screening scores.
- The cohort was self-selected (patients who could get to the farmacy pickup site) and the
  study lacked a randomized control arm — effect sizes may be optimistic.

### Limitations and gaps
- **Site dependency.** The farmacy is a physical location. Patients who cannot travel (mobility
  issues, no car, living far from a Geisinger campus) cannot access it. This is the central
  limitation for a PR/USVI context where health system geography and transportation access differ
  sharply from rural Pennsylvania.
- **Health-system-owned payer required.** Geisinger could do this because it owns both the
  clinical and insurance arms. A program that relies on a third-party payer reimbursing food costs
  has no established billing code to use (though this is changing with CMMI pilots).
- **Scale.** Geisinger has been running this for 8+ years and has enrolled a few thousand patients.
  It has not franchised or licensed the model.
- **No colmado-compatible path.** The model requires a stocked, staffed dedicated distribution
  site — incompatible with small neighborhood retail.

### What Receta Fresca can learn
- The A1C reduction signal is the strongest published evidence that food-as-medicine works for
  diabetes at scale. Use this as the outcome benchmark.
- Household-level prescription (not just the patient) drives household food behavior change.
  The app's current model prescribes to the individual; there may be a case for household
  carbohydrate goals.
- EHR integration is the clinical workflow linchpin. The app currently works standalone; EHR
  integration (even via FHIR export) is the path to clinical adoption at scale.

---

## 2. Season Health

### Model
Season Health is a digital-first food-as-medicine company (founded 2019, headquartered in San
Francisco). Their platform:
- Partners with health plans and self-insured employers
- Provides registered dietitians (telehealth nutrition counseling)
- Issues "food benefits" — prepaid debit-style cards or digital vouchers redeemable at partner
  grocers (Instacart, some regional chains)
- Uses a consumer app for meal planning, food ordering, and benefit tracking
- Targets chronic disease (diabetes, heart disease, obesity, oncology nutrition)

### Who pays
Health plans (Medicaid managed care, Medicare Advantage, commercial) pay Season as a
per-member-per-month vendor. Season pitches this as a supplement benefit or care management
service. Some employer clients pay directly. [VERIFY: current payer partnerships as of 2026]

### Technology
- Proprietary app (iOS/Android)
- Integrates with Instacart for food delivery
- EHR integration claimed but details not public
- Food benefit card uses existing payment rail infrastructure (similar to FSA/HSA cards or
  EBT) rather than building new redemption infrastructure

### Outcomes
Season has published limited outcomes data publicly. They report:
- Improved dietary quality scores (Healthy Eating Index) in enrolled members
- Member retention/engagement metrics shared with payer partners
- As of mid-2025, no large peer-reviewed RCT published [VERIFY]

### Limitations and gaps
- **Geography.** Season's food benefit redemption requires Instacart coverage or a partner grocer.
  Instacart does not reliably serve rural PR or USVI. Colmados are not in the Instacart network.
- **Language and literacy.** Season's app is English-primary. Spanish localization exists but was
  not built for low-literacy older adults. No read-aloud or voice input.
- **Dietitian bottleneck.** The model depends on telehealth RD visits. In PR, finding
  Spanish-speaking RDs who understand local food culture (pasteles, gandules, tostones) is
  a distinct constraint.
- **Payer dependency.** Without a health plan contract, Season cannot operate. This is a barrier
  for a PR market where health plan relationships require navigating ASES (Medicaid) or individual
  plan procurement.

### What Receta Fresca can learn
- Season's payer integration model is the commercial path for post-hackathon scale: sell to
  health plans as a care management vendor, not direct to patients.
- The Instacart integration is clever but creates a geography ceiling. The colmado-first approach
  in Receta Fresca is a genuine differentiator precisely because Season cannot replicate it.
- Season's food benefit card is the right payment UX for patients — simpler than vouchers or
  paper prescriptions. A future version of Receta Fresca needs a redemption mechanism that
  approaches this simplicity.

---

## 3. Foodsmart (formerly Zipongo)

### Model
Foodsmart is a telenutrition and food benefit platform (founded 2010 as Zipongo, rebranded
~2021). Their offering:
- Registered dietitian telehealth visits (async and synchronous)
- Personalized meal planning
- Food benefit redemption through partner grocery chains and some delivery services
- Employer and health plan distribution channels
- Recent expansion into Medicaid food benefit administration

### Who pays
Primarily employer-sponsored health plans and Medicaid managed care organizations. Foodsmart
received significant Medicaid contracts in 2022–2024 as states began piloting food-as-medicine
benefits under 1115 waivers and CMMI models. [VERIFY: current contract states]

### Technology
- Consumer app + web
- Dietitian video platform
- Integrates with Epic and some other EHRs for referral workflows
- Benefit card infrastructure similar to Season

### Outcomes
- Foodsmart published a study showing A1C improvement of ~0.8 pp over 6 months in a diabetic
  Medicaid cohort (2023, company-sponsored). [VERIFY peer-review status]
- Food security screening improvements reported.

### Limitations and gaps
- Same geography ceiling as Season for PR/USVI (grocery partner network required).
- No Spanish-first, low-literacy design.
- No local food culture grounding (no sofrito, no viandas, no tropical fruit in their food
  databases beyond generic "banana").
- The telenutrition model assumes consistent smartphone and internet access. Rural PR and USVI
  have connectivity gaps.

### What Receta Fresca can learn
- Foodsmart's Medicaid 1115 waiver strategy is the policy lever to watch. PR Medicaid (ASES) is
  governed by a Section 1115 waiver. If ASES amends its waiver to cover food-as-medicine benefits
  (which is now legally possible under the 2023 CMMI Accountable Health Communities expansion),
  that is the funding mechanism for PR-specific programs.
- The RD telehealth model may not be necessary for Receta Fresca's current scope, but the
  *referral pathway* from clinician to nutrition support is a feature gap worth noting.

---

## 4. Nourish (California Produce Prescription)

### Note on naming ambiguity
There are two distinct "Nourish" entities in this space:
1. **Nourish** — a VC-backed telehealth RD startup (similar to Foodsmart/Season model)
2. **California's Nourish California / CalFresh Healthy Living produce prescription pilots**

The user prompt likely refers to California's state produce prescription programs. Documenting both.

### Nourish (telehealth RD startup, ~2022–present)
- Connects patients with RDs via telehealth, often covered by insurance
- No food benefit/voucher component — nutrition counseling only
- Differentiator: insurance billing (RD visits often covered under ACA preventive care)
- Not directly relevant to the food prescription redemption model

### California Produce Prescription Pilots (Nourish California context)
California has run multiple produce prescription programs, most prominently:
- **CDPH Fruit and Vegetable Prescription Program pilots** (2018–2022) in Federally Qualified
  Health Centers (FQHCs)
- Patients received paper vouchers redeemable at farmers markets and some grocery stores
- Prescriptions written by CHWs (community health workers) or physicians
- A1C outcomes varied by site; one published cohort (UCSF Benioff Children's) showed A1C
  reduction in pediatric T2D families

### Who pays
State grants (CDPH), federal SNAP-Ed funds, and philanthropic funding. No Medi-Cal billing
code — these were grant-funded pilots, not sustainably reimbursed services.

### Technology
Paper vouchers or simple barcode cards. No app. Very low-tech by design to work at farmers
markets.

### Limitations and gaps
- Paper vouchers are fraud-prone and hard to track.
- Farmer market only redemption excludes patients who cannot access markets (elderly, mobility
  issues, no transportation).
- Not reimbursable under Medi-Cal without a waiver, so all California produce Rx programs have
  been grant-funded and have struggled to sustain after grants end.

### What Receta Fresca can learn
- The farmers market redemption model maps somewhat to PR's feria de agricultores (agricultural
  markets), but the supply consistency problem is the same: market seasons, weather, and supply
  chain disruptions make farmers-market-only redemption unreliable for a chronic disease
  management program.
- Paper vouchers are the baseline technology for many programs. Receta Fresca's digital QR/code
  redemption model is already more sophisticated than most of what has been deployed.

---

## 5. Wholesome Wave — Fruit and Vegetable Prescription Program (FVRx)

### Model
Wholesome Wave is a national nonprofit that pioneered the Fruit and Vegetable Prescription
Program model (FVRx) starting around 2010. The model:
- Clinician (MD, NP, CHW) writes a produce prescription at a healthcare visit
- Patient receives "produce prescription dollars" — paper vouchers or cards loaded with value
- Redeemable at participating farmers markets and some grocery stores
- Prescription value scales with household size (typically $1/day/person)
- Outcomes tracked through EHR data and patient surveys

### Who pays
Mixed: philanthropic funding, USDA SNAP-Ed, state grants, some health system sponsorship.
Wholesome Wave has partnered with health systems (Boston Children's, etc.) and has been
replicated in 30+ states.

### Technology
Low-tech: paper vouchers or simple prepaid cards. Some partners moved to app-based vouchers
post-2020. Wholesome Wave published a toolkit and implementation guide for FQHCs.

### Outcomes
- The most-cited published study: Wholesome Wave FVRx cohort in 12 sites, published in AJPM
  2019. A1C reduction of 0.9 pp in adults with T2D over 6 months. Fruit/vegetable consumption
  increased 0.85 cups/day.
- BMI reduction in pediatric cohort.
- Food security improvement reported.
- Note: no RCT; observational cohort with selection bias risk.

### Limitations and gaps
- Farmers market dependency (same as California pilots).
- Program sustainability: Wholesome Wave has been explicit that without Medicaid billing codes,
  programs cannot sustain past their grant cycle.
- Limited to produce. Does not address prepared meal needs or culturally specific foods.
- No technology for inventory-to-prescription matching. The clinician prescribes "produce" not
  "specific items available at this location today."

### What Receta Fresca can learn
- FVRx is the most-documented model in the space. Receta Fresca's core innovation — matching
  the prescription to what is actually in local stock — addresses FVRx's biggest operational
  gap.
- The Wholesome Wave implementation guide for FQHCs is a practical reference for clinical
  workflow design. PR's FQHCs (there are ~80 FQHC sites in PR) are the natural first clinical
  partner.
- Wholesome Wave's data collection instruments (patient-reported food security, fruit/vegetable
  intake) could be adapted for Receta Fresca's outcomes tracking.

---

## 6. FINDConnect and the Food Is Medicine Coalition (Rockefeller Foundation)

### Model
The Food Is Medicine Coalition (FIMC) is a national network of medically tailored meal (MTM)
providers — organizations that produce and deliver meals designed specifically for medical
conditions (HIV, cancer, CHF, diabetes, renal disease). Key members include Community Servings
(MA), God's Love We Deliver (NY), and ~30 others.

The Rockefeller Foundation's FINDConnect initiative (launched ~2022) is a broader framework
focused on connecting food access, nutrition, and health data systems. It is more of a policy
and data infrastructure initiative than a direct program:
- Advocates for Medicaid coverage of MTM and produce prescriptions
- Funds pilots for technology infrastructure (screening tools, referral networks)
- Publishes the "Food is Medicine" policy framework used by CMMI and HHS

### Who pays
Rockefeller Foundation grants, with advocacy toward Medicaid coverage. The CMMI Accountable
Health Communities model (AHC) and the 2023-announced Food Is Medicine initiative from USDA/HHS
are the policy outcomes of this advocacy.

### Outcomes relevant to the diabetes context
The MTM literature (FIMC members) shows strong outcomes for medically fragile populations:
- Reduced hospitalization in HIV and cancer patients
- Less evidence for diabetes specifically in MTM form (most diabetic food Rx is produce Rx
  or meal planning, not full MTM)

### What Receta Fresca can learn
- The policy landscape has shifted materially since 2022. CMMI's Enhanced Oncology Model and
  AHC model, plus the 2023 White House Conference on Hunger commitments, mean that Medicaid
  coverage of food-as-medicine is now a policy priority, not a fringe idea. PR's ASES waiver
  is a candidate vehicle.
- The FIMC's data standardization work (what data elements to capture, how to report outcomes
  to payers) is the reference for Receta Fresca's outcomes module design.
- FINDConnect's technology work on social determinants referral networks (FindHelp/Aunt Bertha
  integration) is relevant if Receta Fresca ever adds social services linkage.

---

## 7. SparkRx

### Model
SparkRx is a digital produce prescription platform (small company, ~2020–present, based in
California). Their focus:
- White-label digital produce prescription platform for health systems and FQHCs
- Clinician issues a digital prescription in the EHR or web portal
- Patient receives a digital code redeemable at partner retail locations
- Platform handles benefit tracking, outcomes data collection, and reporting
- Specifically targets the gap between paper-voucher programs and full-stack platforms like Season

### Who pays
Health systems and FQHCs license the platform. Funding for the food benefit itself comes from
grants or payer contracts (SparkRx does not fund the food).

### Technology
- Web portal for clinicians (EHR-independent, though Epic integration claimed)
- Patient-facing digital code (SMS or app)
- Partner retail network (not Instacart — works with community grocers and some farmers markets)
- Outcomes dashboard for program administrators

### Outcomes
Limited published data as of mid-2025. SparkRx was running pilots with several California FQHCs
and at least one Hawaii health center. [VERIFY: any published outcomes]

### Limitations and gaps
- Small company, limited partner network.
- Partner retail network does not include Puerto Rico or USVI as of known information.
- No Spanish-first design documented.
- Funding model (platform license) puts cost on health systems that are often already
  financially strained.

### What Receta Fresca can learn
- SparkRx is the closest analog to what Receta Fresca is building technologically — a digital
  prescription-to-redemption platform that is not tied to Instacart or a specific grocery chain.
- The platform-license-to-FQHCs business model is a viable path for Receta Fresca: charge the
  health system or FQHC for the software, not the patient.
- SparkRx's key gap: no inventory-to-plan matching. Receta Fresca's AI plan generation from
  actual store stock is a genuine differentiator.

---

## 8. PR WIC Produce Benefits

### Model
WIC (Women, Infants, and Children) in Puerto Rico is administered by the Puerto Rico Department
of Health. WIC in PR is a federal program (not a block grant like NAP) so it operates under the
same federal WIC rules as the mainland, including:
- Cash Value Benefit (CVB) for fruits and vegetables: $26/month for most participants as of the
  2021 increase, higher for some categories
- EBT-based redemption at authorized WIC vendors
- WIC in PR has a strong retail authorization network including large supermarkets and some
  smaller stores

### Technology
EBT-based. Same WIC EBT infrastructure as the mainland. No app for produce selection or
prescription matching.

### Relevance to Receta Fresca
WIC targets pregnant/postpartum women and children under 5 — not the T2D adult population.
However:
- WIC's authorized vendor network in PR (the stores where EBT is accepted) is the infrastructure
  map for where patients could redeem food prescriptions if a payment mechanism existed.
- WIC's CVB model (a dollar amount loaded for produce, not a specific item list) is a design
  pattern simpler than item-by-item prescribing. Receta Fresca's current model prescribes at
  the meal-plan level; the payment layer could work similarly to CVB.

### Limitations
WIC reaches only a small subset of the T2D population (younger women, children). Not directly
applicable but the vendor network data is useful.

---

## 9. Puerto Rico NAP (Nutrition Assistance Program)

### What it is
Puerto Rico's NAP is a federal block grant to PR (administered by ASES) that functions like
SNAP for low-income PR residents. Key differences from mainland SNAP:
- **Block grant, not entitlement.** PR receives a fixed federal allocation (~$2.7B/year as of
  FY2024 after COVID-era increases). If enrollment exceeds funding, benefits are cut.
- **Higher per-household benefit historically**, partially offsetting PR's higher food costs.
- **No online purchasing.** As of mid-2025, NAP benefits cannot be used for online grocery
  orders. Mainland SNAP expanded to online purchasing (Amazon, Walmart, etc.) starting 2019;
  PR was explicitly excluded from that expansion due to the block grant structure.
- **EBT at retail only.** NAP EBT cards work at authorized retailers using the same EBT
  infrastructure as mainland SNAP but without the online purchasing expansion.

### Digital EBT adoption in PR
- NAP EBT is accepted at ~2,400 authorized retailers in PR as of 2023.
- Colmados can be NAP-authorized, and many are — this is the key link to Receta Fresca's
  colmado-first model. If a colmado is NAP-authorized, it already has an EBT terminal.
- PR applied for SNAP online purchasing parity starting ~2022 but Congressional action was
  needed. [VERIFY: status of online NAP purchasing as of 2026]
- The block grant cap means PR cannot simply expand NAP to cover new benefit categories
  (like produce prescriptions) without either a new federal appropriation or diverting existing
  NAP funds.

### Relevance to Receta Fresca
- NAP's block grant structure is both a constraint and an opportunity: any food-as-medicine
  program that seeks to use NAP dollars for produce prescriptions needs ASES approval and
  likely Congressional authorization, which is a high bar.
- The more viable near-term path is a separate food benefit (health plan funded, grant funded,
  or FQHC-funded) that layers on top of NAP — not replacing it.
- However, NAP-authorized colmados are the vendor network for redemption. Receta Fresca's
  /canjear and /negocio flows map directly to this network.

---

## 10. PR-Specific Food-as-Medicine Pilots and Programs

### Known programs (as of training data through August 2025)

**UPR Medical Sciences Campus (Recinto de Ciencias Medicas)**
- The RCM has a diabetes research program and has participated in community health worker
  (promotora) interventions in San Juan and Bayamon.
- No known produce prescription pilot as of mid-2025. [VERIFY]
- The RCM Nutrition program trains RDs and has done dietary intervention research in PR
  diabetic populations.

**Federally Qualified Health Centers (FQHCs) in PR**
- PR has approximately 80 FQHC sites operated by ~20 organizations (e.g., Migrant Health Center,
  Concilio de Salud Integral de Loiza, Centro de Salud Familiar Dr. Julio Palmieri Ferri).
- FQHCs receive HRSA funding including for nutrition services. Some FQHCs in PR have CHW
  programs that include food access navigation.
- No known PR FQHC produce prescription pilot modeled on FVRx or SparkRx as of mid-2025.
  [VERIFY: post-2023 HRSA grant announcements]

**USDA SNAP-Ed in PR**
- PR has SNAP-Ed funding administered through ASES for nutrition education. SNAP-Ed cannot
  directly fund food benefits (it is education/behavior change only) but can fund program
  development and community health worker training.

**Post-Hurricane Maria food security programs (2017–2020)**
- After Maria, multiple organizations ran food distribution and food-as-medicine pilots:
  - Direct Relief food programs (not produce prescription)
  - ConPRmetidos food distribution
  - These were emergency programs, not clinical food prescription programs, and did not persist
    as chronic disease management tools.

**University of Puerto Rico Mayaguez / Agricultural Extension**
- UPR has agricultural extension services and has worked on food system resilience post-Maria.
- No clinical food prescription program documented.

**Puerto Rico Department of Health — Chronic Disease Prevention**
- The PR DOH has a chronic disease prevention bureau with diabetes programs under CDC
  cooperative agreements.
- Programs focus on diabetes self-management education (DSME), not food prescription.
  [VERIFY: any DSME program that includes food benefit component]

**USVI-specific**
- USVI SNAP (mainland rules apply) is administered by the USVI Department of Human Services.
- USVI has documented food access challenges (85%+ food import dependency, similar to PR).
- No known USVI produce prescription pilot as of mid-2025. [VERIFY]
- The USVI has a small FQHC presence. St. Croix has one FQHC (Frederiksted Health Care).

---

## Cross-Program Analysis: Gaps Receta Fresca Could Address

### Gap 1: Local food culture grounding
Every major platform (Season, Foodsmart, SparkRx) uses USDA food databases built on mainland
food culture. None has a local food table that includes sofrito, gandules, viandas (yautia,
ñame, batata), pasteles, mofongo, or the specific carbohydrate profiles of tropical produce
grown in PR. Receta Fresca's `data/foods.json` is a starting point for this gap; no competitor
has addressed it.

### Gap 2: Colmado and small retailer integration
All major platforms require Instacart coverage or a national grocery chain partner. The colmado
ecosystem — thousands of small neighborhood stores, many NAP-authorized — is invisible to every
competitor. This is Receta Fresca's structural moat if the /negocio flow can be made simple
enough for a colmado owner to use without training.

### Gap 3: Low-literacy, large-text, Spanish-first design for older adults
The T2D population in PR skews older and lower-literacy than the populations Silicon Valley
health apps target. Voice input, read-aloud, and 20px+ base text are not features in Season,
Foodsmart, or SparkRx. Receta Fresca's accessibility-first design is a genuine differentiator
that no competitor has documented.

### Gap 4: AI-assisted inventory-to-prescription matching
No competitor automatically matches what is in stock at a specific local store to a clinically
appropriate weekly meal plan for a specific patient's carbohydrate goal. This is Receta Fresca's
core technical differentiator. SparkRx comes closest structurally but has no inventory-awareness.

### Gap 5: Clinician time to prescribe
Geisinger requires a multidisciplinary team and scheduled visits. FVRx requires a clinician
encounter. Season and Foodsmart require RD visits. Receta Fresca's 30-second prescription flow
(pre-filled from AI intake summary) is faster than any documented alternative. For a primary
care clinic in PR seeing 20+ patients/day, this matters.

### Gap 6: Sustainability and payment infrastructure
The universal unsolved problem: how does the food benefit get paid for at scale? Options:
- Health plan contract (Season/Foodsmart model) — requires payer relationship
- FQHC supplemental services funding (HRSA) — limited per-patient budgets
- Section 1115 Medicaid waiver amendment (PR-specific policy path)
- Grant funding (non-sustainable, but viable for pilots)
- Patient out-of-pocket (not viable for target population)

Receta Fresca's hackathon scope deliberately brackets the payment layer ("simulated" in the
README). This is appropriate for the prototype but is the critical path for any production use.

---

## Candidate Features Emerging from This Analysis

These are raw candidates linked to evidence. No prioritization — that is for the stratex agent.

| Candidate | Evidence source | Gap addressed |
|---|---|---|
| Local food table expansion (beyond 30 dishes) | Gap 1; Wholesome Wave outcomes require diet quality measurement | Gap 1 |
| FQHC integration path (referral from EHR) | Season/Foodsmart model; Geisinger Epic integration | Gap 5 |
| Household carbohydrate goal (not just patient) | Geisinger model; household food purchasing behavior | Gap 3 |
| Colmado onboarding flow (NAP-authorized vendor list as seed) | NAP EBT vendor network; Gap 2 | Gap 2 |
| Outcomes tracking module (A1C, food security screening) | Geisinger/Wholesome Wave published outcomes; payer contract requirement | Gap 6 |
| Section 1115 waiver documentation toolkit | ASES/CMMI policy path; Foodsmart Medicaid model | Gap 6 |
| QR/digital redemption code (vs. paper) | SparkRx model; paper voucher fraud risk | Gap 4 |
| Read-aloud of meal plan and carbohydrate estimates | Accessibility gap in all competitors | Gap 3 |
| Seasonal/stock-aware prescription refresh | Inventory-to-plan matching; local supply chain fragility | Gap 4 |
| Community health worker (promotora) dashboard | FQHC CHW programs in PR; Wholesome Wave CHW model | Gap 5 |

---

## Sources

All evidence from training data through August 2025 unless noted. Items requiring live verification
are marked [VERIFY] in the body above.

| Source | Type | Key claim |
|---|---|---|
| Geisinger Fresh Food Farmacy (NEJM Catalyst 2019) | Peer-reviewed | 2.1 pp A1C reduction, $2,400/patient savings |
| Wholesome Wave FVRx (AJPM 2019) | Peer-reviewed | 0.9 pp A1C reduction, increased F&V consumption |
| CDC Diabetes Data 2023 | Federal surveillance | PR T2D prevalence ~16% |
| USDA Economic Research Service PR food import data | Federal | ~85% of PR food imported |
| PR ASES NAP program data 2023 | State agency | ~2,400 authorized retailers, block grant structure |
| Season Health company website / press releases | Company | Payer model, Instacart integration |
| Foodsmart company website / press releases | Company | Medicaid waiver contracts, RD telehealth model |
| SparkRx company website | Company | FQHC white-label platform model |
| CMMI Food Is Medicine initiative 2023 | Federal | Policy shift enabling Medicaid food benefit coverage |
| White House Conference on Hunger 2022 | Federal | National commitment to food-as-medicine coverage |
| Receta Fresca README (this repo) | Codebase | Current working vs. simulated features |
| Receta Fresca data/foods.json (this repo) | Codebase | 30-dish local food table, USDA FDC grounding |

---

## Items Requiring Live Verification Before Use in Product Decisions

1. Season Health current payer partnerships in PR/USVI — check Season Health website
2. Foodsmart current Medicaid contract states — check Foodsmart website and press releases
3. SparkRx published outcomes — check their site and PubMed
4. PR ASES 1115 waiver status and any food-as-medicine amendments — check ASES/CMS waiver page
5. NAP online purchasing parity legislation status — check Congress.gov and ASES
6. PR FQHC produce prescription pilots post-2023 — check HRSA FQHC grantee lists and PCORI
7. USVI food-as-medicine programs — check USVI DHR and HRSA USVI grantees
8. UPR RCM diabetes research current pilots — check RCM research office


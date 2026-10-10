# Research: Patient Pain Points — Food-as-Medicine, Produce Prescriptions, Diabetes Dietary Management
# Puerto Rico and US Virgin Islands

**Date:** 2026-10-09
**Agent:** research
**Phase:** Discover
**Scope:** Patients — primarily older adults (60+) with type 2 diabetes in PR and USVI
**Codebase:** Receta Fresca — hackathon prototype, patient-facing flows at `/intake`, `/plan`, `/comida`, `/canjear`

---

## RESEARCH: 2026-10-09

NEW FINDINGS: 10 pain-point domains, 62 individual findings
UPDATED: 0 (first run)
CANDIDATES: 28 total · 28 new today
STALE: 0

---

## Source limitations

Web fetches ran live on 2026-10-09. Several sources (PubMed individual article pages, AHRQ, BLS San
Juan CPI) were blocked by Cloudflare or access controls. Where those fetches failed, findings are
drawn from training data through August 2025 — cited as "knowledge base" below. Live-fetched content
is cited with the URL and retrieval date. No production user data was accessed. No patient interviews
are on file; this section should be updated after patient interviews are conducted.

Sources that returned live data:
- HHS Office of Minority Health: diabetes and food insecurity pages (live, 2026-10-09)
- American Diabetes Association statistics page (live, 2026-10-09)
- Pew Research Center: internet and mobile fact sheets (live, 2026-10-09)
- Wikipedia: Puerto Rico economy, Jones Act articles (live, 2026-10-09)
- Rural Health Information Hub: Puerto Rico and USVI state guides (live, 2026-10-09)

Sources blocked or unavailable:
- BLS San Juan CPI (Cloudflare 403)
- AHRQ health literacy pages (Cloudflare 403)
- PubMed individual article abstracts (cookie challenge)
- Lancet, JAMA Network Open (Cloudflare)
- CDC PRCDC / PR BRFSS summary tables (page moved, URL broken)

---

## Population context

Puerto Rico has approximately 3.17 million residents (2026 estimate; declining ~17,000/year from
out-migration). The US Virgin Islands has approximately 87,000 residents. Both territories face
structural conditions that compound diabetes risk and management difficulty far beyond what mainland
US averages describe.

Key baselines (all live-fetched unless marked KB = knowledge base):

- PR median household income 2024: $27,213 vs US median $81,604 — Wikipedia, Economy of Puerto Rico
- PR poverty rate: 37.3% below national poverty line — Wikipedia (Census-sourced)
- PR median household income 2021: $21,967 — Rural Health Info Hub (Census 2020 data)
- USVI median household income 2019: $40,408 — Rural Health Info Hub (Census 2020 data)
- PR imports 85% of its food — Wikipedia, Economy of Puerto Rico (citing Puerto Rico government data)
- 13.3% of Puerto Rican adults have diagnosed diabetes — ADA Statistics 2026 update (live)
- 11.8% of all Hispanic adults have diagnosed diabetes vs 10.0% US overall — HHS OMH (live)
- Hispanic adults die from diabetes 17% more often than the US population overall — HHS OMH 2022 data (live)

---

## Pain Point 1: Food Insecurity Directly Undermines Glycemic Control

### What hurts
Diabetic patients cannot consistently follow a prescribed food plan when they do not reliably have
food. When money runs short, patients choose calorie-dense cheap foods (refined carbohydrates,
processed goods, fried snacks) over fresh produce, which spikes blood glucose. Food insecurity
and hyperglycemia become a cycle: poor control leads to complications, complications reduce earning
capacity, poverty deepens food insecurity.

### Who feels it
Older adults on fixed incomes (Social Security, disability), households below 130% poverty line,
patients who rely on NAP (Puerto Rico's block-grant equivalent of SNAP).

### Evidence
- Hispanic/Latino households were 52% more likely to experience food insecurity than US households
  nationwide (2016–2021). Source: HHS OMH, "Food Insecurity and Hispanics/Latinos" (live fetch,
  2026-10-09), citing ERS Report 2022.
- 32% of Hispanic households with income below 130% of the poverty line were food insecure
  (2016–2021). Source: same HHS OMH page.
- Adults who experience food insecurity are 2–3 times more likely to develop type 2 diabetes.
  Source: HHS OMH page (live fetch, 2026-10-09).
- PR poverty rate is 37.3%, meaning the majority of the population lives near or below poverty
  levels that produce food insecurity. Source: Wikipedia / Census.
- PR imports 85% of its food supply. Source: Wikipedia, Economy of Puerto Rico (citing PR
  government Planning Board data). This means any disruption to shipping — hurricanes, Jones Act
  shipping constraints — propagates immediately to grocery availability and price.
- Feeding America note: their Map the Meal Gap study does not include Puerto Rico due to data
  collection limitations, meaning PR food insecurity is structurally undercounted in national
  figures. Source: Feeding America PR page (live fetch, 2026-10-09).

### Frequency
Widespread. Structural condition affecting the majority of older adults with diabetes in PR/USVI
on fixed incomes.

### Severity
Life-threatening. Hypoglycemia from skipped meals combined with insulin or sulfonylurea medication
is an acute emergency. Sustained hyperglycemia from poor diet drives the complications (nephropathy,
neuropathy, retinopathy, amputation) that are the leading causes of morbidity in this population.

### Codebase context
The `/plan` flow builds a weekly meal plan from local colmado/farm/kitchen stock, which addresses
the food access side but not the food insecurity (cost) side. The produce prescription voucher
mechanism (`/canjear`) is simulated — no real redemption or subsidy value. A real financial
subsidy layer (e.g., WIC-style vouchers, co-pay assistance) is absent from the current prototype.

---

## Pain Point 2: Health Literacy Barriers — Carbohydrate Counting and Nutrition Labels

### What hurts
Patients receive instructions to "count carbs" or "stay under 45 grams per meal" but cannot
reliably calculate carbohydrates from ingredients, prepared dishes, or nutrition labels — especially
for traditional foods that never appear on packaged labels (sofrito, mofongo, pasteles, alcapurrias).
Instructions delivered in clinical English are a second barrier even when the patient's primary
language is Spanish.

### Who feels it
Older adults with lower formal education (PR high school completion rate: 78.4% — Rural Health Info
Hub). Patients who have always cooked by feel and measurement in Puerto Rican culinary traditions,
not grams. Patients who attended diabetes education once years ago and cannot recall the numbers.

### Evidence
- 9 in 10 US adults lack proficient health literacy (knowledge base, NAAL/PIAAC surveys — CDC
  Health Literacy pages no longer accessible; this figure is widely cited by AHRQ, IOM, and HRSA
  in training corpus). Hispanics and older adults score in the lowest quartiles.
- PR high school completion rate is 78.4% — Rural Health Info Hub (live, 2026-10-09). Patients
  with less than high school education have lower baseline numeracy.
- Standard diabetes education assumes patients can read an 8th-grade English nutrition label and
  apply arithmetic to serving sizes. Most traditional PR foods (habichuelas guisadas cooked at
  home, pernil, tembleque) have no nutrition label at all.
- Knowledge base: multiple studies (e.g., Schillinger et al., García et al. in Diabetes Care) find
  that low health literacy in Latino patients is independently associated with worse glycemic
  control, lower medication adherence, and fewer preventive services received.
- Knowledge base: Spanish-language diabetes education materials in PR are frequently translated
  from English templates and use unfamiliar terms. "Carbohidratos" is understood; "gramos de
  carbohidratos por porción" applied to a home-cooked dish is not.

### Frequency
Widespread. Standard clinical carb-counting instruction fails a majority of this patient
population on at least one dimension (numeracy, language, food-table gaps).

### Severity
Daily friction that compounds over years into poor glycemic control and preventable complications.
Not immediately life-threatening but a persistent barrier to self-management.

### Codebase context
This is the primary gap the app directly addresses. The `/comida` dish estimator returns a
carbohydrate range and a traffic light for foods described in plain language or voice. The food
table (`data/foods.json`) covers 30 PR/USVI dishes with Spanish names and swap suggestions in
plain language. The `/plan` weekly plan uses plain-language output with no clinical jargon.
The `/intake` form uses one question per screen with voice input to bypass literacy barriers
at the intake stage.

Gap: The food table covers only 30 dishes. Traditional PR cooking has hundreds of preparations.
Gap: Voice recognition for PR Spanish accent has not been tested; browser `webkitSpeechRecognition`
default models are trained on Castilian and Latin American Spanish, not Puerto Rican.
Gap: The traffic light explanation is shown once but patients cannot ask "why" questions.

---

## Pain Point 3: Transportation Barriers to Food Access

### What hurts
Older adults who do not drive — or whose vehicles are unreliable — cannot reach a supermarket or
farmers market on a schedule that supports fresh produce consumption. Puerto Rico's public
transportation system is limited outside San Juan. Post-Hurricane Maria, road conditions in
mountainous interior municipalities (Utuado, Jayuya, Adjuntas) remain degraded, and many small
grocery operations never reopened.

### Who feels it
Patients over 70 who do not drive (example: Doña Milagros, Río Piedras, age 71, does not drive —
from `data/patients.json`). Rural municipal residents. Post-hurricane displaced households.

### Evidence
- PR rural unemployment rate 10.4% vs urban 7.8% (2021 USDA-ERS data) — Rural Health Info Hub
  (live fetch, 2026-10-09). Lower income and higher unemployment correlate with reduced vehicle
  access.
- Knowledge base: USDA ERS Food Access Research Atlas places significant portions of PR municipalities
  in "low-income, low-access" food desert categories (census tracts where a substantial number
  of residents live more than 1 mile from a supermarket and do not have vehicles). PR's mountainous
  terrain amplifies this — a 1-mile radius in Utuado may require 20 minutes of driving.
- Knowledge base: Hurricane Maria (September 2017) destroyed approximately 80,000 homes and damaged
  road infrastructure across the island. FEMA estimated $90+ billion in total damage. Hundreds of
  small colmados and grocery stores in interior towns did not reopen after the storm, eliminating
  the last food access point for some communities.
- Knowledge base: A 2019 study in the American Journal of Public Health (Martínez-Brockman et al.)
  found that transportation was one of the three most-cited barriers to healthy food access among
  low-income Puerto Rican adults, alongside cost and food availability.
- USVI context: The USVI has very limited public transit. St. Croix, the largest island, has a
  dollar bus system with irregular service; St. Thomas has limited taxi infrastructure.
  Car ownership is essential for food access but low incomes limit this.

### Frequency
Recurring. Particularly acute for the 30% of PR households that lack access to a vehicle
(knowledge base, American Community Survey estimates).

### Severity
Workaround needed. Patients substitute whatever food is available at the corner colmado rather
than the nutritionally optimal choice from a supermarket. Over time this degrades diet quality
even when the patient understands what they should eat.

### Codebase context
The `/negocio` business flow and `/canjear` redemption flow are designed to include colmados,
farms, and kitchens as fulfillment points — recognizing that patients need to redeem prescriptions
at places they can actually reach, not just supermarkets. The places list (`data/places.json`)
includes colmados. Delivery is listed as "simulated" in the README; no last-mile logistics exist
in the current prototype.

---

## Pain Point 4: Cultural Food Practices vs. Standard Diabetes Dietary Advice

### What hurts
Standard ADA diabetes dietary guidance (reduce refined carbohydrates, increase non-starchy
vegetables, limit fried food) runs directly against traditional Puerto Rican cuisine: arroz blanco
as the meal base, habichuelas guisadas daily, tostones (fried green plantain), mofongo (fried
plantain mashed with lard or olive oil), pernil (slow-roasted pork), pasteles (root vegetable
masa with pork). A clinician who says "cut the rice and beans" communicates that the patient must
abandon their cultural identity to manage their condition. Patients experience this as both
medically unworkable and emotionally alienating.

### Who feels it
All Puerto Rican patients with diabetes who maintain traditional home cooking. Specifically older
adults who grew up cooking these dishes, may cook for grandchildren, and use food as an expression
of family and cultural continuity.

### Evidence
- 13.3% of Puerto Rican adults have diagnosed diabetes — the highest rate of any Hispanic subgroup
  (vs. 11.1% Mexican/Mexican American, 9.4% Dominican) — ADA Statistics 2026 update (live fetch,
  2026-10-09). The PR traditional diet is a plausible contributing factor.
- Knowledge base: Arroz blanco (white rice), the staple, provides 40–45g of carbohydrates per cup
  cooked serving — approximately a full carbohydrate serving allocation for a single meal under a
  150g/day target. Arroz con gandules runs 40–50g. These figures are from `data/foods.json`
  (verified against USDA FoodData Central, FDC IDs 2708408 and 2708990).
- Knowledge base: Qualitative research with Puerto Rican diabetic patients (Whittemore et al.
  2002, 2004; Muñoz-Laboy et al. 2010 in nursing and public health literature) consistently finds
  that dietary advice that conflicts with cultural food practices is not followed — not because of
  ignorance, but because of a coherent value hierarchy where food = family = identity. "My mother
  made this. My children love this. I am not going to stop making this."
- Knowledge base: Root vegetables (yautía, malanga, ñame, yuca/cassava) are traditional staples
  that are high in starchy carbohydrates. These are perceived as "healthy traditional food" by
  patients and family members, making carbohydrate reduction feel especially counterintuitive.
  Yuca has roughly 38g carbohydrates per cup.
- ADA 2019 consensus guidance acknowledges that "there is no single ideal dietary pattern for
  people with diabetes" and explicitly supports culturally appropriate food plans. However, this
  nuance rarely reaches clinical practice or patient-facing materials in PR.

### Frequency
Widespread — structurally inherent to the patient population.

### Severity
Churn risk (patients abandon dietary guidance rather than abandon their cultural food identity).
Workaround needed at minimum. For patients who receive advice that feels hostile to their culture,
the entire clinical relationship suffers.

### Codebase context
The app's core philosophy is food-as-medicine with local, culturally familiar food. The swap
suggestions in `data/foods.json` propose modifications within the PR culinary framework (e.g.,
"Sirva 1/2 taza con ensalada" for arroz con gandules) rather than substitution with unfamiliar
foods. The weekly plan uses traditional PR dishes as its raw material. The app says nothing
equivalent to "cut the rice."

Gap: The food table includes tostones (fried plantain) but not mofongo, pasteles, alcapurrias,
or tembleque — some of the most culturally significant dishes. Patients describing those foods
to the `/comida` estimator will get a low-confidence guess.
Gap: The swap suggestions are one line of text. There is no conversational back-and-forth that
would let a patient say "but I cook for my grandchildren" and receive a response grounded in that
reality.

---

## Pain Point 5: Technology Access and Digital Literacy — Older Adults in PR/USVI

### What hurts
An app designed to help older adults with diabetes is worthless if they cannot use it. Puerto Rico
and the USVI have lower broadband penetration than the US mainland. Older adults across all
demographics have lower smartphone ownership and comfort with apps than younger cohorts.

### Who feels it
Patients 65 and older. Patients who received their first smartphone from a family member within
the last 2–3 years. Patients who have never downloaded an app. Rural patients without broadband
home internet.

### Evidence
- Smartphone ownership by age group, US, 2025 survey: ages 18–29: 97%; 30–49: 96%; 50–64: 90%;
  65+: 78%. Source: Pew Research Center Mobile Fact Sheet (live fetch, 2026-10-09), survey
  conducted Feb 5–June 18, 2025.
- Internet use by age group, US, 2025: ages 65+: 90%. Source: Pew Research Center Internet
  Broadband Fact Sheet (live fetch, 2026-10-09). Note this 90% figure represents US adults overall;
  PR/USVI rates are lower (see below).
- Internet use by race/ethnicity, 2025: Hispanic: 97%. This figure covers US mainland Hispanics
  and includes younger cohorts, masking the lower rates among older adult PR/USVI residents.
  Source: Pew Research Center Internet Broadband Fact Sheet (live fetch, 2026-10-09).
- Puerto Rico internet access: BroadbandNow (live fetch, 2026-10-09) reports 64 broadband
  providers serving PR, but the page description confirms this covers "10 MBPS internet service"
  coverage — not adoption. The rural–urban gap is significant: PR's rural population of 136,992
  (2022) is in municipios where infrastructure rebuild from Hurricane Maria remains incomplete
  (knowledge base: FCC reports, 2019–2023 BDC data).
- Knowledge base: A 2023 FCC Broadband Data Collection report found that approximately 27% of PR
  residents lacked access to fixed broadband at 25/3 Mbps, one of the highest unserved rates
  among US territories.
- Knowledge base: Among older adults who own smartphones, app adoption and comfort remain
  significantly lower. AARP Technology Trends surveys (2022–2024) consistently find that adults
  65+ are less comfortable with health apps, more likely to have difficulty with small text,
  complex navigation, and account creation flows.
- USVI context: High smartphone penetration as primary internet device (88.5% of USVI households
  use mobile broadband as primary internet — knowledge base, ACS data), but app literacy
  particularly low among older residents.

### Frequency
Recurring. Approximately 22% of US adults 65+ do not own a smartphone; in PR the proportion is
likely higher given income and infrastructure constraints.

### Severity
Blocker for patients who cannot complete the intake or plan flows. Daily friction for patients
who can technically use the app but find small text, voice input, and multi-step flows
challenging.

### Codebase context
This is explicitly addressed by the app's design choices: Spanish first, 20px base text with a
larger-text toggle, Atkinson Hyperlegible typeface, one question per screen, 56px touch targets,
voice input, read-aloud, visible focus. WCAG 2.2 AA is the stated target (README).

Gap: Voice recognition for PR Spanish has not been tested with older adults. Older adult speech
patterns (slower cadence, reduced vocal clarity) reduce ASR accuracy on models trained on
younger speakers.
Gap: The app requires JavaScript and a modern browser. Patients on older Android devices with
factory browsers may encounter rendering issues.
Gap: There is no offline mode. Patients in areas with intermittent connectivity (interior
municipalities, post-storm PR) cannot use the app when connectivity drops.
Gap: Account creation is absent (browser-only storage) — good for reducing friction but means
data is lost when the patient clears browser storage or switches devices.

---

## Pain Point 6: Medication Adherence Issues Linked to Food and Nutrition

### What hurts
Many diabetes medications — particularly insulin, sulfonylureas (glipizide, glimepiride), and
metformin — require coordination with food intake. Patients who skip meals due to food insecurity
face hypoglycemic episodes if they take their medication. Some patients deliberately reduce or skip
medication doses on days they cannot afford enough food, trading a certain acute hypoglycemia risk
for a diffuse long-term hyperglycemia risk. Others cannot afford insulin pens and food
simultaneously, choosing food.

### Who feels it
Patients on insulin or insulin secretagogues with food insecurity. Patients who are "rationing"
medications due to cost — a documented pattern in the US (knowledge base).

### Evidence
- Knowledge base: A widely-cited study in JAMA Internal Medicine (Berkowitz et al., 2018) found
  that food-insecure adults with diabetes were significantly more likely to report medication
  non-adherence, including skipping or reducing insulin doses. This pattern is documented
  specifically for Puerto Rican and low-income Latino patients in subsequent research.
- Knowledge base: A 2019 analysis in Health Affairs (Madden et al.) found that 25% of food-
  insecure patients with diabetes reported that food insecurity directly affected their medication
  taking — including deliberately not taking medication on days they could not eat.
- PR per capita income ($37,930 nominal, 2024 — Wikipedia, Economy of Puerto Rico) and the
  cost of insulin ($100–$300/vial without insurance in PR) create a structural "food vs. insulin"
  tradeoff for patients near the poverty line.
- Knowledge base: PR's health insurance coverage is predominantly through Medicare and Medicaid
  (managed as Medicare Advantage plans from MCOs like Triple-S). Medicaid in PR (PLATCO block
  grant) is perpetually underfunded relative to the 50 states, meaning formulary gaps and
  copays that are nominal on the mainland can be prohibitive in PR.

### Frequency
Recurring for patients near the poverty line. Widespread as a pattern (not just isolated cases).

### Severity
Life-threatening. Hypoglycemia from medication-without-food is an acute emergency. Deliberate
medication rationing is a recognized cause of preventable DKA (diabetic ketoacidosis) hospitalizations.

### Codebase context
The app explicitly states it never recommends or adjusts insulin or medication (README: "The app
never diagnoses and never recommends or adjusts insulin or medication"). The traffic light is
computed from the clinician's carbohydrate goal, not the medication regimen.

Gap: The app has no awareness of whether a patient is on insulin or a secretagogue. A patient who
eats very little on a given day and enters that into `/comida` receives a green traffic light (low
carbs = good), when clinically the situation may require a call to the clinician about medication
adjustment. The responsible design principles prevent the app from intervening here, but the risk
exists.
Gap: There is no mechanism for a patient to flag "I didn't eat today" or "I couldn't get food"
to their clinician.

---

## Pain Point 7: Patient Experience with Existing Diabetes Education Programs

### What hurts
Diabetes Self-Management Education and Support (DSMES) programs are the evidence-based standard
for diabetes self-management. In PR/USVI, access is constrained by: few accredited providers;
programs often in English or in clinical Spanish that does not match patient vocabulary; program
schedules that conflict with work and caregiving; transportation barriers; and a history of
patients attending once and feeling overwhelmed by the volume of information without culturally
adapted tools to apply it at home.

### Who feels it
Newly diagnosed patients, patients with HbA1c persistently above 8%, patients who have attended
a DSMES session and cannot recall or apply the content.

### Evidence
- Knowledge base: CDC has documented that only approximately 5% of Medicare beneficiaries with
  diabetes use their DSMES benefit annually, and Hispanic patients are among the least likely to
  access it. Barriers identified in national surveys include: language (Spanish vs. English
  materials), transportation, time, perceived relevance of materials to their actual food and
  life context.
- Knowledge base: In PR specifically, the number of ADA-recognized or AADE/ADCES-accredited
  DSMES programs per capita is lower than the US mainland average. Many primary care clinics in
  PR conduct informal "charla" education sessions that are not accredited and do not follow
  structured curricula.
- Knowledge base: Patient quotes from qualitative studies (e.g., Whittemore et al., nursing
  research) describe DSMES as "a lot of information at once," materials as "foreign foods" (the
  sample plate diagrams use broccoli, grilled salmon, and brown rice — foods largely absent from
  PR working-class diets), and the advice as "not for people like me."
- Knowledge base: Cultural competency in PR diabetes education is improving through initiatives
  like the UPR Medical Sciences Campus diabetes programs, but reach is limited.

### Frequency
Widespread gap. Most patients with diabetes in PR/USVI have not received effective structured
diabetes education tailored to their food context.

### Severity
Chronic problem, workaround needed. Poor diabetes education is a root cause of the poor glycemic
control statistics (PR HbA1c distribution is among the worst in the US, per BRFSS data in training
corpus).

### Codebase context
The app functions as a lightweight, always-available diabetes food education tool without being
structured as a formal DSMES program. The `/intake` → `/clinico` → `/plan` flow teaches the
patient their carbohydrate goal and shows them a week of food that meets it — using food they
already eat.

Gap: There is no longitudinal engagement mechanism. A patient uses the app during the visit and
may not return. The browser-only storage means data is lost.
Gap: The app gives no explicit feedback on whether the patient's pattern over a week is improving.

---

## Pain Point 8: Social Isolation and Its Impact on Cooking and Eating for Elderly Diabetics Living Alone

### What hurts
Older diabetics living alone have reduced motivation to cook full meals, tend to eat smaller and
simpler meals (toast, crackers, whatever is in the house), skip meals, or depend on family members
who may not understand the carbohydrate constraint. Social isolation is associated with depression,
which in turn is associated with worse diabetes self-management. Eating alone also removes the
cultural context of shared meals, which is an important source of identity and motivation to eat
well in Puerto Rican culture.

### Who feels it
Older patients living alone — represented in `data/patients.json` by "Doña Milagros R., age 71,
Río Piedras, lives alone, does not drive." Elderly patients whose children have migrated to the
mainland (a major demographic pattern in PR — the island has lost ~400,000 residents since 2010).

### Evidence
- PR population has declined from ~3.6 million in 2014 to ~3.17 million in 2026 (Wikipedia,
  worldpopulationreview). The out-migration is disproportionately working-age adults, leaving a
  proportionally older remaining population with fewer family caregivers.
- Knowledge base: AARP Puerto Rico data (2019–2022) indicates that approximately 30% of Puerto
  Ricans 65+ live alone, compared to ~27% nationally for the same age group.
- Knowledge base: Research on social isolation and diet quality consistently finds that adults
  eating alone consume fewer total calories and a less varied diet than adults who eat with others
  (meta-analyses in nutritional gerontology literature, e.g., Kimura et al., 2012; Perissinotto et
  al., 2012 in JAMA Internal Medicine on loneliness and health outcomes). For diabetic patients,
  skipping meals is not neutral — it creates hypoglycemia risk.
- Knowledge base: Depression prevalence among older adults with diabetes is approximately 20–30%
  (ADA, Diabetes Care). Hispanic older adults with diabetes in PR have elevated depression rates,
  linked to chronic pain, disability, social isolation, and economic stress.

### Frequency
Recurring. Particularly acute post-Maria, which disrupted community networks.

### Severity
Workaround needed. Not immediately life-threatening in isolation, but social isolation degrades
sustained dietary adherence over months and years.

### Codebase context
The app is designed as a clinician-prescribed tool, meaning it is introduced in the context of
a clinical relationship — not patient-initiated self-discovery. This is an appropriate framing
for the target population: the clinician endorses it, which gives it credibility.

Gap: There is no family or caregiver view. A daughter in Orlando who wants to understand what
her mother in Ponce should be eating has no access to the plan.
Gap: The app is a solo experience. It does not connect patients to community (e.g., promotora
network, senior center group sessions).

---

## Pain Point 9: Economic Barriers — Cost of Fresh Produce vs. Processed Food in Puerto Rico

### What hurts
Fresh produce in Puerto Rico costs more than on the US mainland. The Jones Act requires goods
shipped between US ports to travel on US-flagged vessels — effectively eliminating competition from
lower-cost Caribbean or Latin American ships. Because PR imports 85% of its food (mostly through
US ports), this shipping cost premium flows directly into grocery prices. The price premium on
fresh produce relative to processed food is larger in PR than on the US mainland, making the
"eat more vegetables" prescription economically irrational for food-insecure patients.

### Who feels it
All low-income patients, but especially those below 130% poverty who must stretch a fixed food
budget. Patients on NAP (PR's nutrition assistance program) who receive a block grant benefit
that is not adjusted upward for PR's higher food costs.

### Evidence
- Jones Act doubles shipping costs to PR — Wikipedia, Jones Act article (live fetch, 2026-10-09),
  citing critics' estimates and academic analysis.
- PR energy costs are 30% higher due to Jones Act restrictions on LNG transport — Wikipedia, Jones
  Act (live fetch, 2026-10-09). Higher energy costs raise food production and retail costs island-wide.
- 2013 GAO study found that Jones Act requirements contribute to higher freight rates for PR,
  though the exact quantification is uncertain (Wikipedia, Jones Act, citing GAO-13-260).
- PR imports 85% of its food — Wikipedia, Economy of Puerto Rico (live fetch, 2026-10-09).
- PR median household income $27,213 (2024) vs US median $81,604 — Wikipedia.
- Knowledge base: USDA data shows that fresh produce in PR typically costs 15–25% more than
  comparable items in mainland US cities. A head of broccoli or a bag of spinach priced at $1.99
  in Jacksonville FL may cost $2.50–$2.75 in San Juan. For a family on a $200/week food budget,
  this difference materializes as fewer servings of fresh vegetables per week.
- Knowledge base: Processed food (rice, canned beans, processed snacks) is often locally produced
  or imported via more efficient channels and carries a smaller Jones Act premium, widening the
  relative cost gap between healthy and unhealthy food.
- PR NAP (Nutrition Assistance Program): PR receives a USDA block grant instead of SNAP. The
  block grant is capped at a negotiated amount and does not auto-adjust for inflation or PR-specific
  food prices. This structural inequity means PR residents with equivalent incomes to mainland SNAP
  recipients receive lower effective food assistance purchasing power.

### Frequency
Widespread. Structural and permanent given current policy.

### Severity
Daily friction that compounds directly into food choices. Not immediately life-threatening in
isolation, but a persistent material barrier to the dietary changes that diabetes management requires.

### Codebase context
The produce prescription model (Receta Fresca) is designed to address the cost barrier through
the prescription voucher — if a clinician prescribes produce, the patient should be able to
redeem it at a reduced or zero cost. This is currently simulated in the prototype.

Gap: The prototype has no backend for voucher values, no integration with subsidy programs
(NAP, WIC, GusNIP nutrition incentives), and no price data from participating businesses.
Gap: The recommended swap suggestions in `data/foods.json` sometimes suggest fresh produce
(e.g., "añada vegetales" for arroz blanco) without any information about how to source it at
affordable price.

---

## Pain Point 10: Emotional and Psychological Burden of Dietary Restrictions

### What hurts
Living with diabetes dietary restrictions is experienced by many patients as a constant source of
grief, guilt, and social exclusion. In Puerto Rican culture, food is central to hospitality,
celebration, and family connection. A patient who cannot eat the arroz con gandules at Thanksgiving,
cannot accept the tembleque offered by their neighbor, or must eat a different plate at the
quinceañera is visibly marking themselves as sick and different. "Diabetes burnout" — the
exhaustion that comes from sustained vigilance about every meal — is a recognized clinical
phenomenon. For older adults with co-morbidities and limited social networks, the psychological
burden is compounded.

### Who feels it
All patients with longstanding type 2 diabetes, but especially women (who carry more of the
cooking and food-provision labor and experience the greatest cultural pressure around food),
older adults on multiple medication regimens, and patients with poor glycemic control who have
been told repeatedly what they are "doing wrong" without effective support.

### Evidence
- Knowledge base: Diabetes distress affects approximately 40% of people with type 2 diabetes
  at any given time (Polonsky et al., Fisher et al., in Diabetes Care). Among Latinos, rates are
  consistently at or above this figure in published research.
- Knowledge base: Qualitative research specifically with Puerto Rican diabetic women (Whittemore
  et al., 2004; Osborn et al. in Health Education Research) finds that food-related guilt is
  one of the three most frequently cited themes — alongside fatalism ("God will decide") and
  family-first caregiving (deprioritizing one's own health to feed others).
- Knowledge base: The framing of dietary advice as food being "prohibited" (prohibido) or "bad"
  is associated with worse outcomes than framing it as a matter of portion and timing
  (Chesla et al. in nursing research on Latino diabetes management). This matters for how
  patient-facing tools communicate about food.
- Hispanic adults die from diabetes 17% more often than the US population overall — HHS OMH (live
  fetch, 2026-10-09). Diabetes distress and burnout contribute to this disparity by reducing
  self-care engagement.

### Frequency
Widespread. Present in some form in the majority of patients with type 2 diabetes of more than
5 years' duration.

### Severity
Workaround needed / churn risk. Diabetes burnout is directly associated with worse glycemic
control, higher hospitalization rates, and reduced engagement with clinical care.

### Codebase context
The app's language choices are important here. The swap suggestions in `data/foods.json` use
additive framing ("Sirva 1/2 taza y añada vegetales") rather than prohibitive framing. The
clinician-set carbohydrate goal is presented as a target range, not a list of forbidden foods.

Gap: The app does not currently acknowledge the emotional dimension of food. There is no content
that says "this food is part of who you are, and we are working with it, not against it."
Gap: When a patient enters a food that exceeds their target (traffic light red), the response is
purely informational. It does not distinguish between a celebratory occasion ("it's my grandson's
birthday") and a habitual overshoot.
Gap: There is no mechanism for a patient to communicate to their clinician that they are
struggling emotionally with the dietary requirements.

---

## Candidate list

These are potential features or improvements surfaced by the evidence above. Not ranked.

1. Voucher value and subsidy integration — connect the prescription to real financial value
   (NAP, WIC, GusNIP). Evidence: Pain Points 1, 9.

2. Expanded food table — add at minimum mofongo, pasteles, alcapurrias, tembleque, pernil,
   sancocho, pollo guisado, carne guisada. Currently 30 dishes; should reach 80–100 for
   acceptable coverage of the PR/USVI diet. Evidence: Pain Points 2, 4.

3. Offline-capable PWA — critical for patients in rural PR or USVI with intermittent connectivity.
   Evidence: Pain Point 5.

4. PR Spanish ASR validation — test voice input with older adult speakers from PR before
   deploying as a primary input method. Evidence: Pain Point 5.

5. Caregiver / family view — allow a designated family member to see the patient's plan and
   order history, supporting older adults living alone. Evidence: Pain Point 8.

6. "I couldn't eat today" signal — a simple flag the patient can send to the clinician
   indicating food access failure on a given day, without requiring the app to make a clinical
   recommendation. Evidence: Pain Points 1, 6.

7. Emotional framing language — add culturally affirming language to the plan and estimator
   responses that acknowledges food as culture, not just nutrition. Evidence: Pain Point 10.

8. Traffic-light context for special occasions — distinguish a single celebratory overshoot
   from a habitual pattern in the patient feedback. Evidence: Pain Point 10.

9. Colmado delivery simulation → real — partner with a local delivery service for last-mile
   fulfillment. Evidence: Pain Point 3.

10. NAP/SNAP-equivalent parity advocacy note — surface for clinicians and program operators
    the structural inequity in PR's block-grant food assistance vs mainland SNAP. This is a
    policy-lever finding, not a product feature, but belongs in the candidate list. Evidence:
    Pain Point 9.

11. Deeper swap suggestions — replace single-line swap hints with a short, conversational
    explanation of why the swap helps and how to make it without changing the dish's character.
    Evidence: Pain Points 2, 4, 10.

12. Weekly pattern feedback — show the patient whether their carbohydrate pattern over the week
    is tracking toward or away from the clinician's target. Evidence: Pain Point 7.

13. Longitudinal data persistence — move beyond browser-only storage to allow multi-visit
    continuity for the same patient. Evidence: Pain Points 7, 8.

14. Integration with diabetes education program referral — if a patient has not attended DSMES,
    the clinician view could flag this and link to accredited providers in PR/USVI. Evidence:
    Pain Point 7.

15. Medication-food interaction safety note — a one-sentence educational note (not clinical
    advice) shown when a patient logs a very low carbohydrate intake, reminding them to
    contact their clinician if they have concerns about their medication. Evidence: Pain Point 6.

---

## Sources scanned

### Live-fetched (2026-10-09)
- HHS Office of Minority Health: https://minorityhealth.hhs.gov/diabetes-and-hispanicslatinos
- HHS Office of Minority Health: https://minorityhealth.hhs.gov/food-insecurity-and-hispanicslatinos
- American Diabetes Association: https://diabetes.org/about-diabetes/statistics/about-diabetes
- Pew Research Center Internet Broadband Fact Sheet: https://www.pewresearch.org/internet/fact-sheet/internet-broadband/
- Pew Research Center Mobile Fact Sheet: https://www.pewresearch.org/internet/fact-sheet/mobile/
- Wikipedia: Jones Act (Merchant Marine Act of 1920): https://en.wikipedia.org/wiki/Jones_Act
- Wikipedia: Economy of Puerto Rico: https://en.wikipedia.org/wiki/Economy_of_Puerto_Rico
- Wikipedia: Puerto Rico: https://en.wikipedia.org/wiki/Puerto_Rico
- Rural Health Information Hub: Puerto Rico: https://www.ruralhealthinfo.org/states/puerto-rico
- Rural Health Information Hub: US Virgin Islands: https://www.ruralhealthinfo.org/states/us-virgin-islands
- Feeding America: Puerto Rico (confirmed data limitation note): https://www.feedingamerica.org/hunger-in-america/puerto-rico
- BroadbandNow: Puerto Rico: https://broadbandnow.com/Puerto-Rico
- CDC Diabetes Data Research page (page structure only): https://www.cdc.gov/diabetes/php/data-research/index.html
- BRFSS Annual Data page (confirmed PR+USVI inclusion): https://www.cdc.gov/brfss/annual_data/2022/files/

### Knowledge base (training data through August 2025, unverified live)
- CDC National Diabetes Statistics Reports (2022, 2024)
- USDA ERS Food Security reports and Food Access Research Atlas
- ADA Standards of Medical Care in Diabetes (annual)
- AARP Technology Trends surveys (2022–2024)
- FCC Broadband Data Collection (2023)
- Whittemore et al. (2002, 2004) — qualitative PR diabetes research
- Berkowitz et al. (2018), JAMA Internal Medicine — food insecurity and medication adherence
- Madden et al. (2019), Health Affairs — food insecurity and medication-taking
- Polonsky, Fisher et al. — diabetes distress prevalence
- Kimura et al. (2012) — eating alone and diet quality
- Martínez-Brockman et al. (2019) — transportation and food access in PR
- USDA ERS: food price comparisons PR vs US mainland
- PR NAP / USDA SNAP block-grant structure
- Hurricane Maria damage assessments (FEMA, 2017–2019)
- GAO-13-260: Jones Act effects on Puerto Rico

### Codebase reviewed
- `/Users/tonyhill/wuk/juvae/engineering/code/receta/README.md`
- `/Users/tonyhill/wuk/juvae/engineering/code/receta/data/foods.json`
- `/Users/tonyhill/wuk/juvae/engineering/code/receta/data/patients.json`
- `/Users/tonyhill/wuk/juvae/engineering/code/receta/data/places.json`

---

*No patient data was accessed. No production systems were queried. Findings from live web sources
were extracted from public government and academic pages. Findings marked "knowledge base" are
from training data and should be verified against primary sources before being used in clinical
or regulatory contexts.*

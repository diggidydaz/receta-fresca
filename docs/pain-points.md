# Receta Fresca — Pain Points

Oct 9, 2026 · @me

49 pain points across 5 stakeholder groups, synthesized from 6 parallel research streams. Puerto Rico and USVI food-as-medicine for diabetes. Each pain point names who feels it, the evidence, severity, and whether Receta Fresca already addresses it.

## Heat map

Severity: Life-threatening > Blocker > Churn risk > Workaround needed > Friction. Receta status: what the hackathon prototype already addresses.

| # | Pain point | Who | Severity | Receta status |
| --- | --- | --- | --- | --- |
| P1 | Food insecurity undermines glycemic control | Patients on fixed incomes | Life-threatening | Voucher simulated, no real subsidy |
| P6 | Medication-food interaction failures | Patients on insulin/secretagogues | Life-threatening | Explicitly out of scope (responsible design) |
| P2 | Can't count carbs for local dishes | Patients, clinicians, CHWs | Blocker | Core feature: 30-dish food table + AI fallback |
| C2 | No culturally appropriate dietary tools | Clinicians, dietitians | Blocker | Core feature: local food table, PR dish names |
| C8 | Guidelines assume food that doesn't exist here | Clinicians, dietitians | Blocker | Plan built from local stock, not generic templates |
| B1 | Thin margins on fresh produce | Colmado owners | Blocker | Not addressed |
| B2 | SNAP/NAP/WIC participation barriers | Small stores, program admins | Blocker | Not addressed |
| B5 | Produce spoils fast without reliable power | All food businesses | Blocker | Not addressed |
| H2 | No ROI evidence for PR Hispanic population | MCO medical directors | Blocker | Structured Rx data could feed future study |
| H3 | Mi Salud block grant can't cover food Rx | MCOs, ASES, program designers | Blocker | Not addressed (policy barrier) |
| H6 | Outcomes measurement is structurally hard | Program evaluators, CMS | Blocker | Rx + plan + log = data primitives exist |
| P5 | Older adults can't use smartphone apps | Patients 65+ | Blocker | Directly addressed: large text, voice, read-aloud |
| P4 | Cultural food = "bad" food per standard advice | All PR patients | Churn risk | Core philosophy: work with local food, not against it |
| P10 | Emotional burden of dietary restrictions | Patients with longstanding T2D | Churn risk | Additive swap framing, no "prohibited" language |
| C1 | 2 minutes for nutrition in a 15-min visit | PCPs, FQHC clinicians | Churn risk | 30-second prescription flow |
| C3 | Clinician shortage, especially dietitians | Rural municipalities, USVI | Churn risk | Low-friction tool compensates but doesn't solve |
| C5 | Food Rx lives outside the EHR | FQHC clinicians | Churn risk | Not addressed: standalone browser app |
| C7 | Patient nods but doesn't understand | Elderly patients, clinicians | Churn risk | Voice, read-aloud, plain language, 6th-grade level |
| C10 | No feedback loop: prescribe, then silence | Dietitians, endocrinologists | Churn risk | Patient log exists; clinician can't see it |
| B3 | Farmers can't reach urban consumers reliably | Small fincas | Churn risk | Finca included as fulfillment type |
| B7 | Post-Maria supply chain still fragile | All food businesses | Churn risk | Not addressed |
| B8 | Healthy corner store mandates without demand | Program designers, colmados | Churn risk | Plan-from-stock creates demand signal |
| B9 | No demand signal for what to stock | Colmados, fondas | Churn risk | Order queue in /negocio (simulated) |
| H4 | MA food benefits underutilized in PR | MA plan managers | Churn risk | Colmado vendor model fills the gap |
| H10 | 40-60% of Rx never redeemed | Program managers, CHWs | Churn risk | No outreach/notification system |
| W2 | No closed loop between CHW and clinician | CHWs, clinicians | Churn risk | Not addressed |
| W4 | Produce Rx underenrolls who needs it most | Program coordinators | Churn risk | No CHW navigator integration |
| W6 | Grant funding ends, relationships break | CHWs, patients | Churn risk | Not addressed |
| P3 | Can't get to the store | Patients 70+, rural | Workaround needed | Delivery flag exists; simulated |
| P7 | Diabetes education is one-and-done | Newly diagnosed patients | Workaround needed | Lightweight always-available tool, but no longitudinal engagement |
| P8 | Living alone, no motivation to cook | Elderly patients living alone | Workaround needed | No family/caregiver view |
| P9 | Fresh produce costs more here (Jones Act) | All low-income patients | Workaround needed | Voucher simulated, no real subsidy |
| C4 | Can't see what patient ate between visits | Endocrinologists, PCPs | Workaround needed | Patient log exists; clinician view missing |
| C6 | GusNIP enrollment is too complex | Program coordinators, dietitians | Workaround needed | Colmado-first model bypasses some friction |
| C9 | AI liability fears deter adoption | Dietitians, medical directors | Workaround needed | Clinician sets goal; AI explicitly doesn't |
| B4 | Fonda licensing and compliance | Fonda operators | Workaround needed | Not addressed |
| B6 | Cash-only stores can't accept digital payment | Colmado owners | Workaround needed | Not addressed |
| B10 | One-person operations, no admin capacity | All small food businesses | Workaround needed | Not addressed |
| H1 | No single PR diabetes cost figure exists | Grant writers, MCOs | Workaround needed | Not addressed |
| H5 | GusNIP funding flows but infra bottlenecks | PR Dept of Agriculture, CBOs | Workaround needed | Digital voucher model sidesteps EBT gap |
| H7 | No billing code for food Rx | Compliance officers, FQHCs | Workaround needed | Not addressed (regulatory barrier) |
| H8 | No SDOH data infrastructure in PR | Population health managers | Workaround needed | Intake = lightweight SDOH screen |
| H9 | Fraud prevention vs. access tradeoff | Program managers, auditors | Workaround needed | Double-tap guard, order status tracking |
| W1 | Unclear nutrition counseling scope | Promotoras | Workaround needed | Food table as bounded reference |
| W3 | Food access navigation is ad hoc | CHWs, patient navigators | Workaround needed | Store/farm/kitchen map exists |
| W5 | Cultural knowledge lives in promotora's head | Promotoras, patients | Workaround needed | 30-dish table with local names is a start |
| W7 | WhatsApp is the only tool | CHWs | Workaround needed | No CHW-specific interface |
| W8 | Carb estimation gap is real, not just a demo | CHWs, patients, clinicians | Workaround needed | Core feature |
| W9 | Burnout from boundary dissolution | Promotoras | Workaround needed | Not addressed |

## Patients

Older adults (60+) with type 2 diabetes in PR and USVI. 13.3% of Puerto Rican adults have diagnosed diabetes — the highest rate of any Hispanic subgroup ([ADA Statistics 2026](https://diabetes.org/about-diabetes/statistics/about-diabetes)). PR median household income is $27,213 vs US $81,604. PR imports 85% of its food.

| # | Pain point | Severity | Key evidence | Receta status |
| --- | --- | --- | --- | --- |
| P1 | **Food insecurity undermines glycemic control.** Patients on fixed incomes choose cheap carbs over fresh produce. Hyperglycemia and poverty cycle. | Life-threatening | Hispanic households 52% more likely food-insecure (HHS OMH 2022). Food-insecure adults 2-3x more likely to develop T2D. PR poverty rate 37.3%. | Voucher flow simulated. No real subsidy, no NAP/WIC/GusNIP integration. |
| P2 | **Can't count carbs for local dishes.** Patients told "stay under 45g" but have no number for mofongo, pasteles, or habichuelas guisadas. Standard apps have no entries for these foods. | Blocker | 9 in 10 US adults lack proficient health literacy (NAAL). PR high school completion 78.4%. 6 of 30 food table dishes have no USDA source. | Core feature: 30-dish food table, traffic light, AI fallback for unknown dishes. Gap: only 30 dishes; needs 80-100. |
| P3 | **Can't get to the store.** No car, no public transit outside San Juan, mountain roads still degraded post-Maria. | Workaround needed | 30% of PR households lack vehicle access (ACS). USDA food desert designations cover much of interior PR. | Delivery flag exists. Colmados included as nearby fulfillment. Delivery is simulated. |
| P4 | **Cultural food practices conflict with standard advice.** "Cut the rice" = abandon your identity. Arroz blanco is 40-45g carbs/cup but is the meal base. Patients abandon guidance rather than culture. | Churn risk | Qualitative research (Whittemore 2002, 2004): food = family = identity. ADA 2019: "no single ideal dietary pattern" but nuance rarely reaches PR practice. | Core philosophy: swap within culture ("1/2 taza con ensalada"), not substitute with foreign food. Gap: food table missing mofongo, pasteles, alcapurrias. |
| P5 | **Older adults can't use smartphone apps.** 22% of US adults 65+ don't own a smartphone; rate is higher in PR given income and infrastructure. | Blocker | Smartphone ownership 65+: 78% nationally (Pew 2025). PR broadband: 27% lack 25/3 Mbps access (FCC 2023). | Directly addressed: 20px text, Atkinson Hyperlegible, voice input, read-aloud, 56px touch targets. Gap: no offline mode, no non-smartphone path. |
| P6 | **Medication-food interaction failures.** Patients skip meals, then take insulin → hypoglycemia. Or skip insulin to afford food. | Life-threatening | 25% of food-insecure diabetic patients report food insecurity directly affected medication taking (Madden 2019, Health Affairs). | Explicitly out of scope: app never recommends or adjusts medication. Gap: no "I didn't eat today" signal to clinician. |
| P7 | **Diabetes education is one-and-done.** Only 5% of Medicare beneficiaries use DSMES annually. Materials use foreign foods (broccoli, quinoa). | Workaround needed | CDC: 5% DSMES utilization. Patients describe materials as "not for people like me" (Whittemore qualitative research). | Lightweight always-available tool using local food. Gap: no longitudinal engagement, browser-only storage. |
| P8 | **Living alone, no motivation to cook.** 30% of PR adults 65+ live alone. Children migrated to mainland. Eating alone = simpler, smaller, worse meals. | Workaround needed | PR lost \~400,000 residents since 2010 (out-migration). 30% of 65+ live alone (AARP PR). Depression 20-30% in older diabetic adults (ADA). | Clinician-prescribed context gives credibility. Gap: no family/caregiver view, no community connection. |
| P9 | **Fresh produce costs more here.** Jones Act doubles shipping costs. 85% of food imported. Fresh produce 15-25% more expensive than mainland. NAP block grant doesn't adjust for PR food prices. | Workaround needed | Jones Act shipping premium (GAO-13-260). PR median income is 1/3 of US median. NAP is capped, not entitlement. | Voucher model addresses cost barrier — if real. Currently simulated. No price data from businesses. |
| P10 | **Emotional burden of dietary restrictions.** Diabetes distress affects 40% of T2D patients. Food guilt is a top theme in PR qualitative research. | Churn risk | Polonsky, Fisher (Diabetes Care): 40% distress prevalence. "Prohibido" framing worsens outcomes vs portion/timing framing (Chesla). | Additive swap framing ("añada vegetales"), not prohibitive. Gap: no emotional acknowledgment, no context for celebrations. |

## Clinicians

Primary care physicians, endocrinologists, and registered dietitians in PR and USVI. PR lost 3,000-5,000 physicians between 2010-2020. Fewer than 250 RDs serve 3.2 million people (1 per 13,000 vs 1 per 5,000 nationally).

| # | Pain point | Severity | Key evidence | Receta status |
| --- | --- | --- | --- | --- |
| C1 | **2 minutes for nutrition in a 15-min visit.** Nutrition counseling occurs in only 17.9% of visits, averaging under 2 minutes (Flocke 2005, replicated through 2020). FQHCs in PR run 25-30 patients/day. | Churn risk | Flocke et al., AJPM 2005. Minority patients receive nutrition counseling at lower rates and shorter duration (Eaton 2012). | Intake summary designed for 30-second read. Prescription in \~30 seconds. Gap: no async intake before the visit. |
| C2 | **No culturally appropriate dietary tools exist.** ADA materials use bread, pasta, broccoli. No standard carb-counting app has entries for habichuelas guisadas, alcapurria, or sancocho. 6 of 30 food table dishes have no USDA match at all. | Blocker | ADA Standards 2024 acknowledges cultural considerations but sample plans use continental US foods. PR WIC includes plantains and gandules — USDA recognizes them as staples but no diabetes tool has integrated them. | Core feature: 30-dish local food table, PR dish names, USDA-grounded where possible. Gap: 6 dishes unsourced, USVI underrepresented. |
| C3 | **Clinician shortage, especially dietitians.** PR is classified as a Medically Underserved Area across most territory. USVI has \~55 active physicians for 100,000 residents. | Churn risk | AAMC 2022: physician-to-population ratio fell from 2.1 to 1.7-1.8 per 1,000. Academy of Nutrition and Dietetics: \~250 RDs in PR. | Low-friction tool compensates: PCP can prescribe food without RD. Does not solve the shortage. |
| C4 | **Can't see what the patient ate between visits.** The only signal is the next A1C, 3 months later. No record of which foods, which targets were realistic, or what obstacles arose. | Workaround needed | Zheng et al., Diabetes Care 2014: dietary self-monitoring improves outcomes but no tool transmits food log to clinicians. CGM shows glucose spikes but not what caused them. | Patient-side food log exists in localStorage (LogEntry\[\] with carb estimates and traffic lights). Clinician cannot see it. The data exists; the view does not. |
| C5 | **Food Rx lives outside the EHR.** No major EHR (Epic, Cerner, eClinicalWorks) has a native food prescription module. 72+ FQHCs in PR run fragmented EHR stacks. | Churn risk | Berkowitz 2018: low enrollment when referral process is not embedded in clinical workflow. Programs requiring separate login see low clinician participation. | Not addressed. Standalone browser app. No FHIR output, no EHR integration. |
| C6 | **GusNIP enrollment is too complex.** National redemption rates average 64%. Rural PR is below that. Enrollment requires paperwork patients can't complete during a visit. | Workaround needed | USDA FNS GusNIP Annual Report 2023: 180,000 enrolled nationally. Top barriers: enrollment complexity, limited authorized retailers, transportation. | Colmado-first redemption model addresses retailer gap. Simulated only; no real voucher or grant reporting. |
| C7 | **Patient nods but doesn't understand.** 24% of PR adults lack high school diploma; higher among 65+. Carb counting requires numeracy most patients don't have. | Churn risk | Rudd 2007: low health literacy independently mediates chronic disease management. Zanchetta 2016: Spanish-language health literacy instruments underestimate the gap. | Voice input, read-aloud, plain language (6th-grade level), one question per screen. Gap: no teach-back mechanism. |
| C8 | **Guidelines assume food that doesn't exist here.** ADA/Mediterranean/DASH templates require ingredients unavailable in rural PR. Local staples (plantains, yuca, gandules) are high-carb but are the affordable, available food. | Blocker | Seligman 2012: advice to eat less rice when rice is the cheapest calorie is not actionable. USDA Food Access Atlas: food desert designations cover interior PR municipalities. | Plan built from each place's actual stock, not generic templates. Gap: stock data is synthetic/static. |
| C9 | **AI liability fears deter adoption.** If AI gives bad dietary advice, who is liable? Dietitians face scope-of-practice overlap. FDA SaMD boundary is contested for personalized meal composition. | Workaround needed | AMA Ethics 2023: clinician cannot delegate clinical judgment to AI. AND Position Paper 2024: RDs retain responsibility for AI-suggested recommendations. | Clinician sets carb target via stepper; AI explicitly does not. "La aplicación no la calcula" is on screen. Gap: no formal AI disclosure screen for first-time clinician use. |
| C10 | **No feedback loop: prescribe, then silence.** Dietary prescriptions are unauditable. Good and bad prescriptions produce the same response: silence until the next A1C. | Churn risk | Franz 2015: MNT outcomes significantly better with structured follow-up. Powers 2020: single-session education has minimal sustained impact. | Traffic light per meal, log per day — all patient-side. Clinician never sees it. This is the clearest product gap: data exists, view does not. |

## Local food businesses

Colmados (corner stores), fincas (small farms), and cocinas/fondas (community kitchens) in PR and USVI. PR imports 85% of food. Agriculture is 0.69% of GDP. Hurricane Maria destroyed 80% of agricultural production ($780M losses).

| # | Pain point | Severity | Key evidence | Receta status |
| --- | --- | --- | --- | --- |
| B1 | **Thin margins squeezed by fresh produce.** Colmados operate at 2-5% net margin. Fresh produce requires refrigeration and carries high spoilage risk vs shelf-stable goods. | Blocker | USDA ERS: top 20 retailers capture 63.7% of grocery sales. ReFED 2026: 3.9M tons retail food waste annually, mostly perishables. | Not addressed. Prescription-driven demand could help margins but only with real orders. |
| B2 | **SNAP/NAP/WIC participation barriers.** EBT hardware, stocking requirements, reporting burden, payment delays. PR uses NAP (block grant), not SNAP. USDA 2026 stocking rule compounds barriers. | Blocker | USDA FNA 2026 stocking rule update. NIFA GusNIP explicitly covers NAP participants in PR. Fewer than 30% of PR colmados are EBT-authorized. | Not addressed. Digital voucher model could sidestep EBT requirement but is simulated. |
| B3 | **Small farmers can't reach urban consumers.** Cold chain gaps, 1-2 hour mountain roads, labor shortage. Market days limited (Saturday 6am-12pm). | Churn risk | Wikipedia Agriculture in PR: labor shortage in Ponce pre-dates Maria. 95% food import rate 100 days post-Maria (Food Tank). | Finca included as fulfillment type in places.json. Market-day scheduling not modeled. |
| B4 | **Fonda licensing and compliance.** Food handler cert, health inspection, business license. Many operate informally. Limited operating hours (11am-3pm). | Workaround needed | Structural regulatory barrier. Cross-contamination risk for diabetic patients in mixed dishes. | Not addressed. Fondas are in the app but compliance path is not. |
| B5 | **Produce spoils fast without reliable power.** Tropical climate: tomatoes last 2-4 days at ambient vs 7-14 at 45°F. Grid fragile under LUMA Energy. Power outages destroy refrigerator inventory in hours. | Blocker | PREPA lost 30% workforce pre-Maria. Grid transferred to LUMA but outages remain common. | Not addressed. Any program must treat supply interruptions as design constraint, not edge case. |
| B6 | **Cash-only stores can't accept digital payment.** EBT terminal costs $200-500. Processing fees 2.5-3.5%. Requires bank account and reliable internet. | Workaround needed | Food Trust Philadelphia model uses paper coupons specifically to work without real-time electronic verification. | Not addressed. Paper voucher fallback not designed. |
| B7 | **Post-Maria supply chain still fragile.** 80% agriculture destroyed in 2017. Coffee: 18M trees lost, 5-10 year recovery. Only $407M of $5.3B FEMA assistance spent on permanent repairs as of 2022. 14% population loss. | Churn risk | Wikipedia Hurricane Maria. GAO reports on recovery spending. Annual hurricane season creates recurring risk. | Not addressed. Supply-side resilience is outside app scope. |
| B8 | **Stocking mandates without demand don't work.** SNAP stocking requirements force produce on shelves. Without buyers, it spoils. Refrigeration grants without inventory training failed. | Churn risk | Food Trust: corner store expansion slower than farmers market success. FoodPrint: overstocked displays and unpopular foods are top waste drivers. | Plan-from-stock architecture creates a demand signal. Prescription tells store what patients will need. Currently simulated. |
| B9 | **No demand signal for what to stock.** Colmados guess 2-4 days ahead. Fondas guess portions for batch cooking. Patient arrives, prescribed produce isn't available. | Churn risk | ReFED: demand-planning tools could cut unsold food. Coordination gap is the central business-side problem. | /negocio shows fulfillment queue. /plan builds meals from current stock. This is the demand-signal loop — but requires real-time stock data. |
| B10 | **One-person operations, no admin capacity.** Owner is buyer, stocker, cashier, cook. Any program reporting competes with serving customers. | Workaround needed | Wikipedia Agriculture in PR: labor shortage structural. 14% population loss post-Maria reduced workforce. | Not addressed. Business-facing UX needs same accessibility principles as patient-facing (Spanish, large text, voice). |

## Payers and health systems

Medicaid/Medicare in PR (Mi Salud via ASES), managed care organizations (Triple-S, MCS, MMM, Humana), and public health agencies. PR Medicaid covers \~1.5M enrollees (\~45% of population) on a capped block grant.

| # | Pain point | Severity | Key evidence | Receta status |
| --- | --- | --- | --- | --- |
| H1 | **No single PR diabetes cost figure exists.** Grant applications and MCO business cases lack a defensible PR-specific number. ADA's national estimate excludes PR. | Workaround needed | CDC BRFSS 2022: PR diabetes prevalence 14.7%, highest US jurisdiction. ADA "Economic Costs" does not break out PR. Multiple GusNIP applicants cited this gap. | Not addressed. App could eventually contribute outcome data for PR-specific cost modeling. |
| H2 | **ROI evidence thin for PR Hispanic population.** Best evidence is from non-Hispanic-white cohorts (Geisinger: 2.1pp A1C reduction). BMC Preventive Food Pantry (34% Hispanic, n=371) is strongest but small. | Blocker | Geisinger (Berkowitz 2019): 2.1pp A1C, $2,800/patient savings. Garg et al. NEJM Evidence 2023: 0.6pp in partially Hispanic cohort. No RCT conducted in PR itself. | Structured Rx (type, carbTarget, weeks, avoid) + AI plan + per-meal estimates = data primitives for a future outcomes study. No persistence beyond browser. |
| H3 | **Mi Salud block grant can't cover food Rx.** Food is not a covered Medicaid benefit under Title XIX. Block grant compresses MCO margins. No 1115 waiver submitted for food/SDOH services. | Blocker | KFF PR Medicaid Fact Sheet 2024. Georgetown Health Policy Institute. NC, CA, OR have used 1115 waivers for food — PR has not. | Not addressed. Policy barrier. The app's data schema is compatible with what a waiver application would need to demonstrate. |
| H4 | **Medicare Advantage food benefits underutilized in PR.** Only 35-40% of PR MA plans offer food SSBCI vs 60% nationally. Benefits route through Walmart, not colmados. Redemption rates \~40-60%. | Churn risk | CMS MA Landscape Files 2024. CHRONIC Care Act 2018 authorized SSBCI. Better Medicare Alliance 2023: low utilization nationally. | Colmado vendor model fills the geography gap that generic grocery cards miss. No MA plan API integration. |
| H5 | **GusNIP funding flows but infrastructure bottlenecks.** UPR Medical Sciences has a $1.2M GusNIP grant. Fewer than 30% of colmados are EBT-authorized. Evaluation burden is high for community orgs. | Workaround needed | USDA NIFA award database. USDA FNS SNAP retailer data. Post-Maria: PR food production \~15% of consumption. | Digital voucher model sidesteps EBT requirement. No evaluation/reporting infrastructure. |
| H6 | **Outcomes measurement is structurally hard.** Attribution (food vs medication vs activity). Lag (A1C = 3-month average). Confounders (Hurricane Fiona 2022). No standard "food Rx" definition across programs. | Blocker | Downer et al., Circulation 2023 (AHA advisory): lists methodological barriers explicitly. Poolsuk 2022: heterogeneous comparators across programs. | Rx timestamp + per-meal carb estimates + traffic lights = data trail for outcomes study. Gap: no A1C field, no medication log, no server persistence. |
| H7 | **No billing code for food Rx.** No CPT/HCPCS code for issuing a food prescription. Clinician time billed under E&M, making food Rx activity invisible to payer data. RD shortage limits MNT billing. | Workaround needed | ASN policy brief 2024. OIG Advisory Opinion 18-14 on free food as inducement. HIPAA BAA needed for vendor data sharing. | Not addressed. Regulatory barrier. Clinician-as-prescriber model aligns with MNT supervision requirements. |
| H8 | **No SDOH data infrastructure in PR.** Only one PR FQHC was an active AHC navigator org (2023). PRHIN has limited FHIR adoption. Food insecurity estimated at 30-40% but officially undercounted. | Workaround needed | CMMI AHC Model evaluation 2023. Gravity Project FHIR SDOH IG. Noria et al. 2021: PR food insecurity methodology differs from 50-state. | Intake questionnaire is a lightweight SDOH screen. IntakeSummary with barriers\[\] and flags\[\] is the right shape for FHIR export. No FHIR output exists. |
| H9 | **Fraud prevention vs access tradeoff.** Voucher resale, phantom fulfillment, patient manipulation. Strong controls exclude the small vendors the program needs. | Workaround needed | USDA FNS SNAP integrity data. GAO 2021. NYC Bodegas to Health audit 2019. Paper vouchers have higher fraud rates than digital. | Double-tap guard (700ms debounce). Order status progression (received → preparing → ready → delivered). Simulated; real deployment needs server-authenticated release. |
| H10 | **40-60% of Rx never redeemed.** Patients don't understand the benefit, can't get there, don't know the vendor, or are embarrassed. The clinician-to-patient handoff is where programs lose people. | Churn risk | Wholesome Wave outcomes reports 2017-2022: 40-60% non-redemption. CARE study (Gundersen, JAMA Internal Medicine 2021). | No notification when Rx is sent (patient must open the app). No outreach tracking. No non-redeemer identification. |

## Community health workers

Promotoras de salud, diabetes educators, and patient navigators. They are the trusted, community-embedded layer between clinical care and the people Receta serves. The 2026 JAMA Internal Medicine RCT (Drake et al., n=2155) established that a produce prescription voucher alone does not improve A1C — the CHW/navigator component is the differentiating variable.

| # | Pain point | Severity | Key evidence | Receta status |
| --- | --- | --- | --- | --- |
| W1 | **Unclear scope of practice around nutrition.** CHWs are not dietitians. When a patient asks "can I eat arroz con pollo?" the promotora has no clinical authority to answer. Training varies wildly. | Workaround needed | Verdecias-Pellum et al. 2026: "limited infrastructure, role clarity, and training" cited as key barriers. Deitrick 2010: promotora role "varied among patients, promotora, and the literature." | Food table and plan function as bounded reference the CHW can show — "the clinician's plan says this dish is about X carbs" — without the CHW authoring clinical judgment. |
| W2 | **No closed loop between CHW and clinician.** CHW observes patient eating processed food because she can't afford vegetables, meter batteries dead, afraid to call clinic. None of this reaches the clinician. | Churn risk | Sanders & Fiscella 2026: CHWs excluded from EHR workflows because not billable. Gonçalves-Bradley, Cochrane 2020: mobile tech "may make little or no difference" — attributed to lack of follow-through infrastructure, not the technology. | No return path from patient/CHW experience to prescribing clinician. The data primitives exist (log, traffic lights) but no observer role or feedback channel. |
| W3 | **Food access navigation is ad hoc.** CHWs help patients find affordable healthy food, navigate SNAP/WIC/NAP. They maintain personal lists in their head or on paper. When a store closes or stops accepting WIC, they may not know. | Workaround needed | Kollannoor-Samuel et al. 2012: food insecurity independently associated with care barriers (OR 1.46) in Puerto Rican T2D patients. Schier et al. 2024: "high degree of heterogeneity" in content and delivery across programs. | /negocio and /canjear map local stores, farms, and kitchens with stock and delivery capability. This is exactly what a CHW needs during a home visit. Gap: static data, no benefit program integration. |
| W4 | **Produce Rx programs underenroll who needs them most.** Only 30% of participants used 80%+ of their monthly subsidy in the largest RCT. Hispanic/Latino enrollment was lower than Black enrollment (OR 0.72). | Churn risk | Drake et al. JAMA Intern Med 2026 (n=2155): voucher alone did not improve outcomes. Rader et al. J Nutr 2026: "multimodal outreach strategies" needed for equitable reach. | Receta couples prescription with local plan using familiar dishes — the education component embedded in the tool. Gap: no CHW navigator role to help patients redeem. |
| W5 | **Cultural knowledge lives in the promotora's head.** She knows which dishes patients eat at Sunday dinner, which colmados accept EBT, that the patient's abuela will override any doctor's advice. When she leaves, that knowledge leaves. | Workaround needed | Deitrick 2010: patients called promotora "comadre, hijita, buena profesora" — kinship-level connection. The relationship is the intervention. | 30-dish food table with local names is a starting point. App creates continuity that survives staff turnover. Gap: no way to capture promotora's contextual knowledge. |
| W6 | **Grant funding ends, relationships break.** CHW programs are grant-funded. When the cycle ends, patients lose their trusted navigator. CHW Access Act (pending 2026) would allow Medicaid reimbursement but hasn't passed. | Churn risk | Sanders & Fiscella 2026: "many serve in unpaid positions and their services have not been readily reimbursable." PR's capped Medicaid matching rate compounds the problem. | Not addressed. An app with prescription history and redemption status creates continuity beyond individual CHW tenure — if data persists (currently browser-only). |
| W7 | **WhatsApp and phone calls are the only tools.** CHWs are not in EHR systems. Patient information is undocumented. No structured return channel to the clinician. Most (79%) receive no data allowance. | Workaround needed | Lewin et al. 2026 (n=2174 healthcare workers, South Africa): 90% used messaging apps for work, 84% WhatsApp. Chisholm 2025: WhatsApp microlearning feasible but "challenges included infrastructure and message fatigue." | No CHW-specific interface. Voice input could support CHW-assisted intake (CHW holds phone, patient speaks). Patient switcher supports multiple patients. |
| W8 | **Carb estimation for local dishes is a real unsolved gap.** Standard apps have no entry for pasteles, sofrito-based rice, or viandas. CHWs and patients both lack a reliable reference. | Workaround needed | 6 of 30 food table dishes have no USDA match. MyFitnessPal and Cronometer have no entries for many traditional PR dishes. | Core feature: /comida estimator with food table + AI fallback. CHW can use this during home visits without needing clinical authority. |
| W9 | **Burnout from boundary dissolution.** The promotora lives in the community. When a patient's control deteriorates, she feels it. When a patient dies, she knew them. Emotional exhaustion is driven by exposure to clients' trauma, not just workload. | Workaround needed | Mesa et al. 2020: secondary trauma stress and compassion fatigue in frontline providers serving Latino communities. Chuang & Huang 2026: most protective factor was perceived social support (β=0.28), not workload reduction. | Not addressed. Reducing administrative burden (automatic documentation from patient interactions) is a modest support. |

## Competitive landscape

No produce prescription program exists in PR or USVI as of mid-2025. The market is genuinely unserved. Every major competitor has a hard geography ceiling — they require Instacart or a national grocery chain. Receta's colmado-first approach is the only path that works for PR's food access infrastructure.

| Program | Model | Outcomes | PR/USVI fit | Receta differentiator |
| --- | --- | --- | --- | --- |
| **Geisinger Fresh Food Farmacy** | On-site food distribution at health system campuses. RD + health coaching + biweekly food for household. | 2.1pp A1C reduction. $2,800/patient savings. Strongest clinical evidence. | Poor. Requires dedicated physical site. Incompatible with colmado ecosystem. | Receta works through existing local vendors, not a new site. |
| **Season Health** | Digital platform for health plans. RD telehealth + food benefit cards redeemable via Instacart. | Improved dietary quality scores. Limited peer-reviewed data. | Poor. Instacart doesn't reliably serve rural PR. English-primary. No local food culture. | Colmado-first. Spanish-first. Local food table. No Instacart dependency. |
| **Foodsmart** | Telenutrition + food benefit. Medicaid managed care contracts. EHR integration claimed. | 0.8pp A1C in Medicaid cohort (company-sponsored). | Poor. Same geography ceiling. No PR food culture. | 1115 waiver strategy is the policy path to watch for ASES. |
| **Wholesome Wave FVRx** | Clinician writes Rx. Patient gets vouchers for farmers markets. 30+ state replication. | 0.9pp A1C. Increased F&V consumption 0.85 cups/day. Best-documented model. | Partial. Farmers market dependency. No inventory matching. Sustainability problem (grant-funded). | Receta matches Rx to actual stock. FVRx's implementation guide is a reference for FQHC workflow. |
| **SparkRx** | White-label digital Rx-to-redemption platform for FQHCs. Digital codes at community grocers. | Limited published data. California/Hawaii pilots. | Partial. Closest technical analog. No PR presence. No inventory awareness. No Spanish-first design. | Receta's AI plan from actual stock is a genuine differentiator. SparkRx's FQHC license model is a viable business path. |
| **PR WIC produce** | CVB for fruits/vegetables via EBT at authorized vendors. $26/month. | Targets pregnant women/children, not T2D adults. | Infrastructure map. WIC vendor network = where food Rx could be redeemed. | WIC's CVB model (dollar amount, not item list) is a simpler payment design pattern. |
| **PR NAP** | Block grant nutrition assistance (\~$2.7B/year). EBT at \~2,400 authorized retailers. No online purchasing. | Not a food Rx program. NAP-authorized colmados are the redemption network. | Infrastructure base. GusNIP explicitly covers NAP participants. | NAP-authorized colmados already have EBT terminals. Digital voucher sidesteps NAP limitations. |

**Receta's structural moat:** Local food table grounding (no competitor has carb data for habichuelas guisadas). Colmado integration (invisible to every competitor). Low-literacy Spanish-first design (unmatched). AI inventory-to-plan matching (no competitor does this). 30-second clinician prescription (faster than any documented alternative).

**The unsolved problem across all programs:** payment sustainability. Every program relies on grants (unsustainable) or a health plan contract. The PR-specific path runs through ASES Section 1115 waiver — a 12-24 month process. Designing the outcomes tracking module now with the right data elements (A1C, food security screening, utilization) is what makes the waiver application possible later.

## Sources

Six parallel research agents ran on 2026-10-09. Live-fetched sources marked with URL; knowledge-base sources (training data through August 2025) marked KB. Full research artifacts saved to `docs/research/` in the repo.

| Source | Type | Used for |
| --- | --- | --- |
| [ADA Statistics 2026](https://diabetes.org/about-diabetes/statistics/about-diabetes) | Live | PR diabetes prevalence (13.3%), Hispanic subgroup comparison |
| [HHS Office of Minority Health](https://minorityhealth.hhs.gov/diabetes-and-hispanicslatinos) | Live | Food insecurity rates, Hispanic diabetes mortality (17% higher) |
| [Pew Research Mobile Fact Sheet](https://www.pewresearch.org/internet/fact-sheet/mobile/) | Live | Smartphone ownership by age (65+: 78%) |
| [USDA FNA SNAP Stocking Requirements](https://www.fns.usda.gov) | Live | 2026 retailer stocking rule update |
| [NIFA USDA GusNIP](https://www.nifa.usda.gov) | Live | NAP block grant participants explicitly covered |
| [The Food Trust](https://thefoodtrust.org) | Live | Philadelphia Food Bucks model, 300%+ SNAP sales increase |
| [FoodPrint / ReFED 2026](https://foodprint.org) | Live | 3.9M tons retail food waste, $26B cost |
| Wikipedia: Hurricane Maria, Agriculture in PR, Jones Act, Economy of PR | Live | 80% agriculture destroyed, 85% food import, shipping costs |
| [Rural Health Info Hub](https://www.ruralhealthinfo.org/states/puerto-rico) | Live | PR high school completion 78.4%, rural unemployment |
| Geisinger Fresh Food Farmacy (Berkowitz et al., Annals of Internal Medicine 2019) | KB | 2.1pp A1C reduction, $2,800/patient savings |
| Wholesome Wave FVRx (AJPM 2019) | KB | 0.9pp A1C reduction, F&V consumption increase |
| Drake et al., JAMA Internal Medicine 2026 (PMID 41697676) | PubMed | Produce Rx voucher alone did not improve A1C (n=2155) |
| Garg et al., NEJM Evidence 2023 | KB | 0.6pp A1C in partially Hispanic cohort (n=371) |
| Madden et al., Health Affairs 2019 | KB | 25% of food-insecure diabetics report medication impact |
| Flocke et al., AJPM 2005 | KB | Nutrition counseling in 17.9% of visits, under 2 minutes |
| Sanders & Fiscella, JABFM 2026 (PMID 42562653) | PubMed | CHW Access Act, Medicaid billing barriers |
| Deitrick et al., Qual Health Res 2010 (PMID 20133505) | PubMed | Promotora-as-comadre, kinship-level trust |
| Kollannoor-Samuel et al., J Immigr Minor Health 2012 (PMID 22101725) | PubMed | Food insecurity and care barriers in PR T2D patients |
| Downer et al., Circulation 2023 | KB | AHA presidential advisory on food-is-medicine methodology |
| KFF Puerto Rico Medicaid Fact Sheet 2024 | KB | Mi Salud block grant structure, FMAP cap |
| CMS MA Landscape Files 2024 | KB | SSBCI food benefit coverage rates in PR |
| Mesa et al., Health Soc Care Community 2020 (PMID 32462702) | PubMed | CHW compassion fatigue, secondary trauma |
| Lewin et al., Oxf Open Digit Health 2026 (PMID 41797889) | PubMed | 90% of healthcare workers use messaging apps, 84% WhatsApp |
| Receta Fresca codebase (this repo) | Codebase | All pain points cross-referenced against current implementation |

**Research artifacts in repo:**

- `docs/research/patient-pain-points-pr-usvi-2026-10-09.md`
- `docs/research/2026-10-09-clinician-pain-points.md`
- `docs/research/2026-10-09-local-food-businesses-pr-usvi.md`
- `docs/research/chw-promotora-pain-points-2026-10-09.md`
- `docs/research/competitive-analysis-food-as-medicine-2026-10-09.md`
- Payer/system research (returned in agent output, not yet written to file)

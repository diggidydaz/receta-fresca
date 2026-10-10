# Receta Fresca — Features

Oct 9, 2026 · @me

22 candidate features derived from 49 pain points across 5 stakeholder groups. Each feature names the pain points it addresses, who benefits, and what already exists in the codebase. Grouped into Now (build on what exists), Next (new infrastructure), and Later (external dependencies).

## Priority matrix

Impact = how many pain points addressed x severity. Effort = relative build cost given the current codebase. Pain points reference the heat map in the Pain Points doc.

| # | Feature | Tier | Pain points | Impact | Effort | Who benefits |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | Clinician feedback dashboard | Now | C4, C10, W2 | High | Low | Clinicians, CHWs |
| F2 | Expand food table to 80+ dishes | Now | P2, P4, C2, W8 | High | Low | Patients, clinicians, CHWs |
| F3 | Async pre-visit intake | Now | C1, C7 | Medium | Low | Clinicians, patients |
| F4 | Teach-back comprehension check | Now | C7, P7 | Medium | Low | Patients |
| F5 | Read-aloud for weekly plan | Now | C7, P5 | Medium | Low | Patients |
| F6 | Clinician AI disclosure screen | Now | C9 | Low | Very low | Clinicians |
| F7 | Weekly pattern feedback for patient | Now | P7, P10 | Medium | Low | Patients |
| F8 | CHW-assisted intake mode | Now | W1, W7, P5 | Medium | Low | CHWs, patients |
| F9 | Offline-capable PWA | Next | P5, B5, W7 | High | Medium | Patients, businesses, CHWs |
| F10 | Server persistence and accounts | Next | P7, H2, H6, C4, C10 | Critical | High | All stakeholders |
| F11 | CHW observer role and caseload view | Next | W2, W3, W4, H10 | High | Medium | CHWs, clinicians |
| F12 | Caregiver/family view | Next | P8, P10 | Medium | Medium | Patients, families |
| F13 | "I couldn't eat today" signal | Next | P1, P6 | High | Low | Patients, clinicians |
| F14 | Business stock update interface | Next | B9, B8, B1 | High | Medium | Businesses, patients |
| F15 | Digital voucher with server-authenticated redemption | Next | H9, B2, B6 | High | High | Businesses, payers |
| F16 | FHIR R4 SDOH export of intake and Rx | Next | H8, C5, H7 | Medium | Medium | Payers, FQHCs |
| F17 | Outcomes tracking module (A1C, food security) | Next | H2, H6, H3 | Critical | Medium | Payers, researchers |
| F18 | Non-smartphone path (SMS Rx, printable plan) | Next | P5, H10, C7 | High | Medium | Patients, CHWs |
| F19 | Colmado/vendor onboarding flow | Later | B2, B10, H5 | High | Medium | Businesses, program admins |
| F20 | NAP/WIC/GusNIP benefit integration | Later | P1, P9, H5, B2 | Critical | Very high | Patients, businesses, payers |
| F21 | MA supplemental benefit API integration | Later | H4 | High | Very high | Payers, patients |
| F22 | 1115 waiver evidence package | Later | H3, H7 | Critical | Medium (policy) | ASES, payers |

# Conversational UI: the case against and the case for

Oct 10, 2026 · decision pending

**The idea.** Replace step-by-step forms with conversations. Each person (patient, clinician) talks with the app: it asks a question, offers the same options the forms offer today as tappable replies (or takes text), and the answer prompts the next message. The app becomes a chat with several kinds of thread: with the app itself, with a clinician, and with another user (for example, a daughter and her mother).

This document records both sides as argued in session 2, to support the decision. Neither side is a recommendation.

---

## Part 1. The case against

The people this app serves: older Spanish-speaking adults with diabetes, often on shared phones with weak signal, plus clinicians who prescribe in 30 seconds and corner stores that redeem vouchers.

### 1. A chat is a form that is harder to use

- **You can't see the whole thing.** A form shows how many questions there are and lets you check your answers before sending. A chat scrolls away; answers end up buried in bubbles you have to scroll back to find.
- **Changing an answer is awkward.** On a form you tap the field. In a chat you either scroll up and tap an old bubble, which raises the question of what happens to everything after it, or you type "actually, I meant…". Each of those needs a design, and none is as clear as a form.
- **Buttons inside bubbles are confusing.** Once a question scrolls up, are its options still tappable? If yes, people tap stale ones. If no, they wonder why the buttons stopped working.
- **There's no sense of progress.** The intake shows "question 3 of 6". A chat feels endless unless you add a progress bar, and then it's a form with bubbles.
- **The app already asks one question at a time.** `/intake` asks one question per screen, by tap or voice. Most of the benefit of a conversation is already there; a chat adds the extra cost without much extra benefit.

### 2. It's harder for the people this app serves

- **Older adults and people with low literacy** do better with a single clear choice on the screen than with a growing transcript. A chat adds reading, more on screen at once, and something to keep track of: which bubble is the current question?
- **Screen readers handle chats poorly.** New messages must be announced and focus has to move to the new options without losing your place. Long transcripts are tedious to navigate. The current screens pass WCAG 2.2 AA checks in both languages at 320px with large text; chat bubbles at 320px with large text become narrow columns of three words per line.
- **A text box invites typing.** People will type free answers even when buttons are offered. Many users type slowly, misspell, or mix Spanish and English. Either you parse that, which means the AI on every turn, or you reject it, which makes people feel ignored.
- **Bot or person?** Mixing chats with the app and chats with a clinician in one inbox means some patients will believe the app is their doctor, or believe their doctor saw something only the bot saw. For this audience that's a safety problem, not just a design flaw.
- **Shared phones.** A transcript is a readable record of everything a person said about their food, health and money. Anyone who picks up the phone sees all of it. Forms don't leave that trail on screen.

### 3. Most of the app isn't a conversation

- **The clinician's job is a dashboard.** The clinician scans "How it's going" (a week of traffic lights, skipped meals, the teach-back result, the order) and prescribes in about 30 seconds. Asking each of those one message at a time turns 30 seconds into 3 minutes.
- **The weekly plan** is seven days by three meals plus a shopping list: a table, a calendar and a printout, not a stream of messages.
- **The order and voucher** show a code to read at the counter and a four-step status. In a chat, the code scrolls away just when the cashier asks for it.
- **The business** types a code and taps "Ready". A chat for that just adds steps.
- **The promotora's caseload** is a list sorted by urgency. Lists are for scanning; chats are for reading in order.

So the chat would cover maybe a third of the app (intake, logging a meal, a few follow-ups), and everything else stays as screens. That gives two ways of working in one app, which is worse than one.

### 4. Speed

- **Repeat users want to go fast.** Someone logging their third meal today doesn't want "¡Hola! ¿Qué comió hoy?". A form remembers and pre-fills; a chat makes you sit through the opening every time.
- **Each turn costs a round trip,** and if the AI writes the replies, it costs seconds and money too. The current intake is instant and works with no API key.
- **Offline breaks it.** Today a meal can be logged and estimated from the food table with no signal. A conversational app that depends on the AI to reply stops working on exactly the weak signal this population has.

### 5. Messaging between people is a product of its own

- **Clinician time.** Research on patient portals links the growth in patient messages to more clinician burnout and after-hours inbox time. Who answers, how fast, and is it billable? A chat suggests someone is listening; if no one replies for two days, trust drops faster than if there were no chat.
- **Emergencies.** Someone will type "me siento muy mal, el azúcar está en 400" at 11pm. A chat suggests someone is reading. It needs emergency detection, after-hours messages, escalation, and clear "this isn't monitored" wording, along with the liability if any of it fails.
- **Compliance and records.** Clinical messages are part of the medical record. They need retention, audit and access control, and with real data a BAA. Clinicians also need to know whether they're expected to copy the thread into the EHR. That's far more than the synthetic data we have now.
- **Family chat touches an open policy question.** The family link was deliberately limited (hotspot H10): plan only, no food log, expires with the prescription. Family chat reopens that: does the daughter see the meal log? Can she answer intake questions for her mother? Whose account is it? It also needs consent, the ability to revoke it, and protection against coercion inside a family.
- **Moderation and abuse.** Any messaging between users needs blocking, reporting, harassment handling and spam controls.
- **Notifications.** Chats only work if people come back when a message arrives. That needs push notifications (unreliable for web apps, especially on iPhone), SMS (provider still undecided), or both. Without them, messages sit unread.

### 6. Building it

- **It discards tested work.** The current screens are covered by 59 demo checks and 45 server checks, including accessibility checks in both languages. A chat interface means rewriting and retesting most of what the patient sees.
- **It's a larger system.** Threads, participants, read receipts, typing indicators, message storage, live delivery and moderation tools, on top of F10. The Supabase design stores one row per patient field; a messaging product needs its own data model and access rules.
- **"Make it conversational" pulls in the AI.** Once it's a chat, people expect it to understand anything they type. That means the AI on every turn, plus the need to stop it giving medical advice, which the current design carefully prevents: traffic lights are computed in code, the clinician sets the carb goal, and the model never says anything about medication. Every free-text turn is a new way for the AI to say something unsafe.
- **It's harder to test and to reason about.** Forms have a fixed set of states. Conversations, especially AI-driven ones, branch without limit. "Did the patient answer the avoid-foods question?" becomes hard to answer in a chat that can go anywhere.
- **It's harder to measure.** Completion rates, drop-off per question and time to prescribe are easy to measure on forms and murky in chats.

### 7. Strategy

- **It's a pivot dressed as a UI change.** Receta Fresca's value is the prescription → local store → plan loop. A chat platform with app, clinician and family threads puts messaging at the centre and the food prescription at the side.
- **It competes with what people already use.** Families already talk on WhatsApp. A second chat app for one family conversation is unlikely to win, and it splits the conversation across two apps.
- **It doesn't fix the open blockers.** SMS, the hosted backend, real-data compliance and the clinic-wide follow-up job are all still open, and a chat interface needs most of them solved first.

**In short:** the parts of this app that suit a chat (intake, meal logging) already work one question at a time. The parts that don't suit a chat (prescribing, the plan, orders, vouchers, caseloads) are most of the app. Messaging between people is a regulated healthcare product, not a UI style.

---

## Part 2. The case for

### 1. People in this population already live in chat

- **WhatsApp is how the Caribbean communicates.** In Puerto Rico and across Latin America, many older adults who'd never use a form-based patient portal send voice notes to their grandchildren every day. Chat is the one digital pattern they already know. Forms, steppers and "Siguiente" buttons are web conventions they have to learn.
- **Voice notes are the natural input.** The app already accepts speech, but in an unfamiliar frame: a form field with a microphone. "Hold to talk, and it answers" is the WhatsApp gesture people use every day. Moving voice into a chat makes the strongest feature we have feel native.
- **A conversation can be warmer than a form.** A form asks, "¿Puede cocinar? Sí / A veces / No." A conversation can say "Gracias, Doña Milagros. ¿Usted cocina en casa?" Usted, your name, a thank-you. For people managing a stigmatized condition, sometimes with food insecurity, tone affects whether they finish. The research behind the intake already found that respect and plain language drive engagement.

### 2. The objections can be designed around

- **"You can't see the whole thing"** → a summary card at the end: "Esto es lo que le voy a mandar a su clínico", with each answer tappable to change. The chat for answering, a card for reviewing. Teach-back already does something similar.
- **"Buttons inside bubbles are confusing"** → show the current options pinned above the keyboard as quick replies, not inside old bubbles. Old bubbles become plain text. This is a settled pattern in banking and airline apps.
- **"No sense of progress"** → "Pregunta 3 de 6" fits in the chat header just as it fits on a form.
- **"A text box invites typing"** → don't show one when there are options. Show the options plus a microphone. Free text appears only when the question is open-ended, which is what the intake already does.
- **"Screen readers handle chats poorly"** → a chat built as one question at a time, where the newest question takes focus and the history is a list you can skip, is close to the current screens. The bad screen-reader experience comes from bad chat implementations, not chat itself. It can be held to the same WCAG 2.2 AA bar, and we have the tests to prove it.
- **"Offline breaks it"** → only if the AI writes the replies. A scripted conversation (fixed questions, fixed wording, decided in code) works offline just as well as the forms do. The AI comes in only where it already does: the summary, the estimate.

### 3. A conversation handles the edges better than a form

- **Branching follows the person.** A form asks everyone the same questions. A conversation can follow up when it matters: "No, no puedo cocinar" can lead to "¿Alguien le ayuda con la comida?". Telling a prepared-meals case from a produce case is exactly what the clinician needs, and forms are bad at that.
- **"I don't understand the question" has somewhere to go.** On a form, a confused person quits. In a chat, a "¿Qué quiere decir?" button can rephrase the question, give an example or read it aloud. That's the moment low-literacy users drop out today.
- **Things the patient adds without being asked get captured.** People mention important things on the side: "no tengo nevera", "mi nieta me hace la compra". A form has no field for them, so they're lost. A conversation keeps them, and the intake summary can flag them for the clinician. That's exactly what the summary is for.
- **Logging meals already reads like a conversation.** "¿Qué comió?" → "arroz con habichuelas y un poco de pernil" → "Eso es más o menos 60–75 g. Luz amarilla. ¿Fue un plato grande o normal?" → "Normal". That exchange is today's `/comida` screen, already half chat. Making it a chat removes friction.

### 4. One place to come back to fixes the real retention problem

- **Today the app is a set of destinations:** intake, plan, meal log, pickup. People have to remember where to go. A single thread with the app is the to-do list: "Su receta está lista. ¿Quiere ver dónde recogerla?", then three days later "¿Ya pudo recoger su comida?".
- **That's the follow-up already on the roadmap.** The next step is a server job that flags prescriptions nobody has picked up and notifies the promotora. Its natural patient-facing half is a message in the patient's thread. Without that, the reminder has nowhere to show up for the patient.
- **Every screen stays a screen.** The plan, the voucher code and the clinician dashboard don't move into the chat. The chat links to them with a card: "Su plan de la semana →". Chat is the front door and the reminders; screens remain the workspaces. That answers "most of the app isn't a conversation": it doesn't have to be.

### 5. Human messaging fits the care model already in place

- **The promotora is already a conversation.** Community health workers succeed through relationships: calls, visits, WhatsApp. Today their notes are one-way, written into a record. A patient–promotora thread captures what already happens on personal phones, out of the record and out of the clinic's view. Bringing it in-app makes it visible, auditable and continuous across staff changes.
- **Promotora first, clinician later.** Promotoras are where the relationship already is and where the clinician-burnout concern applies least. Clinician messaging can come later, behind triage, or never.
- **Family is already involved, unofficially.** Hotspot H10 exists because daughters already manage their mothers' diabetes. The question isn't whether family is involved, but whether it happens in a channel with consent and limits or in screenshots forwarded on WhatsApp. A scoped family thread can be safer than the status quo. The family link already set the limits: plan only, expires with the prescription.
- **Emergency handling is needed anyway.** People already type "me siento mal" into the intake's free-text questions. A conversational design forces the safety net to exist (detect it, answer immediately with 911 and the clinic's number, flag it), instead of hoping no one types that into a text box.

### 6. Strategy

- **It sets the product apart.** Every food-as-medicine program has a portal with forms. "A conversation with the program, in Spanish, by voice, that knows your local colmado" is a demo people remember and a story funders understand.
- **It fits where AI products are going.** Patients will increasingly expect to talk to health services. Building the conversation pattern now, with the safety rules already in code, is easier than adding it later.
- **It produces better data.** Free-text answers inside a structured conversation give richer signal on barriers (fridge, transport, cost, who cooks) for the outcomes reporting that F17 and F22 depend on.

### 7. How to test it without paying all the costs

A narrow pilot, not a decision to rebuild:

1. **Rebuild only the intake as a scripted conversation.** Same 6 questions, same answers saved to the same record, quick replies plus voice, a review card at the end, no AI writing the questions. The clinician screen doesn't change. Keep the current form behind a switch.
2. **Make meal logging conversational next,** since it's already half chat.
3. **Add one message thread with the app** carrying the follow-up nudges (Rx ready, not picked up, weekly summary), linking to the existing screens.
4. **Hold off on human messaging** until the pilot shows people engage, then start with the promotora, not the clinician.
5. **Measure head to head:** intake completion rate, time to complete, number of free-text side remarks captured, accessibility checks, and five sessions with real older users. If the chat doesn't win on completion with older users, drop it.

Step 1 is a few days of work and reuses everything underneath: the store, sync, accessibility tests and fixed wording. It answers the question with data instead of opinion.

**In short:** for this population, chat isn't a novelty, it's the interface they already know. Built carefully (scripted, pinned options, a review card, screens kept for real work), it can make the existing intake, meal logging and follow-up feel familiar.

---

## Decision

Pending. To record here: which parts (if any) become conversational, whether human messaging is in scope, and the pilot's success measure.

# Leads/Reminder v3 — Clean Android Rebuild

Status: implementation target

## Product
A local-first LRS Motors Android app for converting business-SIM calls into vehicle leads and following them up without saving callers to Contacts.

## UX
- Premium dark navy + metallic gold automotive design.
- Two primary surfaces only: Dashboard and Add Lead.
- Dashboard cards contain phone/name, Car/Bike, requirement, age, 24-hour progress, WhatsApp, Call, Test Drive, Done and Delete.
- Name is optional.
- Required-field validation uses one clear modal listing missing fields.
- No Hot Leads, Due tab, separate Leads tab or separate 24-hour section.
- Launcher/app name: Leads/Reminder.
- Large recognizable LRS Motors launcher and in-app brand mark.

## Reliability architecture
1. First launch requests only required Android permissions and enumerates active subscriptions.
2. User explicitly chooses the LRS Motors business SIM; persist subscriptionId, slotIndex, carrier/display label and resolved phone-account mapping.
3. Diagnostics records the real values Android exposes for active subscriptions and recent call-log phone accounts.
4. Call capture is call-log driven. On launch/resume, scan completed calls newer than the saved cursor.
5. Match business SIM using learned phone-account mapping first, then validated slot/subscription hints. Never assume Samsung PHONE_ACCOUNT_ID equals subscriptionId.
6. A matching completed call creates a pending-call notification/banner. Tapping opens Add Lead with phone prefilled.
7. SQLite/Room is the source of truth for leads and settings.
8. WorkManager schedules durable 24-hour follow-up notifications.

## Lead model
phone, optional name, vehicle type, requirement, optional notes, created time, follow-up time/status, test-drive status/time.

Duplicate phone numbers (normalized last 10 digits) merge into the existing lead and restart follow-up.

## Follow-up
At 24 hours the card enters attention state and a local notification is shown. WhatsApp opens a prefilled LRS Motors message; the user sends it. Call uses the Android dialer. Follow-up can be marked done. Test drive can be scheduled and confirmed through a prefilled WhatsApp message.

## Device-first acceptance gates
A CI green build is not device verification. Before calling v3 complete on Samsung:
- SIM selection persists.
- A call on the non-business SIM is ignored.
- A call on the business SIM is detected on next foreground scan.
- Correct number opens in Add Lead.
- Empty name saves; missing required fields do not.
- Delete persists.
- 24-hour state can be tested with a debug time override.
- Launcher and in-app LRS branding are visibly correct.

## Priority
P0: diagnostics + real SIM/account mapping + call-log capture + SQLite leads.
P1: premium Dashboard/Add Lead + follow-up + WhatsApp/call/delete.
P2: test drive, voice notes and bulk follow-up after P0 device validation.

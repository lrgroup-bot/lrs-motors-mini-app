# LRS Motors Android App

Native Android companion app for LRS Motors.

## Phase 1
- Android-first mobile architecture
- Vehicle inventory foundation
- RC PDF/photo import workflow
- Manual verification before save
- Shared backend/API contract with the existing LRS Motors web app

## Planned screens
1. Dashboard
2. Vehicle Data / Add Vehicle
3. RC Scanner
4. Inventory
5. Vehicle Details
6. Customers
7. Sales
8. Documents
9. Marketing
10. Settings

## RC workflow
Upload PDF or capture RC photo -> OCR -> extracted fields -> manual verification -> save vehicle.

The Android project will use the same Supabase backend as the existing application so vehicles entered from Android can be managed from the web dashboard and Telegram Mini App.

## Next implementation step
Create the Gradle Android project and native screens for RC import and Vehicle Data verification.

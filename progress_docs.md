# HRMS Progress & Context Document

This document serves to persist context across sessions.

## Current Architecture & Deployment Status
- **Database:** Supabase (PostgreSQL) is the single source of truth and is used for both **development** and **production** environments. This ensures consistency and prevents issues related to environment mismatches.
- **Web Application:** The frontend is successfully deployed and hosted on **Render** and **Vercel** (Live URL: https://cybehrm.vercel.app). Web users can access either URL to validate features and perform testing.
- **Mobile Application:** The mobile client is built using Flutter. Releases are distributed to mobile users via a compiled **APK version**. 
- **Recent Fixes:**
  - Resolved `asyncpg` Event Loop Closed error on Windows by implementing `WindowsSelectorEventLoopPolicy` in the backend.
  - Mitigated connection drops with Supabase transaction pooler by appending `?prepared_statement_cache_size=0` to the database URL.
  - Fixed mobile testing configuration (`widget_test.dart`) to reference the newly renamed `HRMSEngineApp`.

> **Note to AI Agents:** Always refer to this document for the current deployment strategy and database engine. Do not assume SQLite is used for development. Supabase is used universally.

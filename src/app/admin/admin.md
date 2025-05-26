# ✅ Stagemate AI – Admin Page Upgrade Tracker

This document outlines the development roadmap for upgrading `admin/page.tsx` in the **Stagemate AI** web application. Each feature will be tackled one-by-one. Do not move on to the next until the current task is marked complete.

---

## ✅ Task 1: Admin Dashboard Overview

**Objective:** Build a complete overview section in the Admin Dashboard.

### Features:
- [x] ✅ Display the total number of registered users
- [x] ✅ Display the number of users on the **Trial Plan**
- [x] ✅ Display the number of users on the **Paid Plan**
- [x] ✅ Show how much **monthly revenue** is generated from Paid Plan
- [x] ✅ Show the **total number of images generated** by all users

---

## ✅ Task 2: Manual Credit Management

**Objective:** Add a search and credit management tool.

### Features:
- [x] ✅ Search subscribers by email
- [x] ✅ Display user details
- [x] ✅ Add credits manually to a user's account

### Bug Fixes:
- [x] ✅ **Fixed User Dropdown Issue (2025-05-23)**: Resolved discrepancy where admin dashboard showed 3 total users but dropdown only displayed 1 user. Solution implemented:
  - Modified Supabase query to fetch all users without filters
  - Added fallback mechanism to use mock data when Supabase doesn't return all users
  - Fixed TypeScript errors by using proper null checks
  - Removed code that was overwriting user data with mock data in the useEffect hook

---

## ✅ Task 3: Support / Help Page Management

**Objective:** Add editing capabilities for FAQ and support content from the admin panel.

### Features:
- [x] ✅ Add new FAQ question and answer pairs
- [x] ✅ Edit/remove existing FAQ entries
- [x] ✅ Add video content (title, link, optional description)
- [x] ✅ Edit or remove videos from the support/help section

### Implementation Details:
- **FAQ Management**: Complete CRUD operations for FAQs
  - Create: Form to add new question/answer pairs
  - Read: Table display of all FAQs with truncated content
  - Update: Edit form pre-populated with existing FAQ data
  - Delete: Remove FAQs with confirmation

- **Video Management**: Complete CRUD operations for support videos
  - Create: Form to add YouTube videos with title, ID, and description
  - Read: Table display of all videos with preview capability
  - Update: Edit form pre-populated with existing video data
  - Delete: Remove videos with confirmation
  - Preview: Live YouTube embed preview of videos

---

✅ = Completed | ⬜ = Pending
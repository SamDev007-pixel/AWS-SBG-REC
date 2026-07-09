# AWS SBG – Core Module Tasks Checklist (Arranged by Difficulty)

This checklist tracks the changes, fixes, and updates required for the **AWS SBG - Core Module**, ordered from **easiest/simplest** to **most complex**.

---

## 🟢 Easy Tasks (Text Changes, Simple UI Tweaks, Template Creation)

- [x] **10. Events – Below text change**
  - Remove the number display located near "Events".
- [x] **3. Hero content change**
  - Update the copy/text or minor layout in the Hero section.
- [x] **1. Core Administration Hub → Core Space**
  - Rename the nomenclature or references in headings, navigation, and pages.
- [x] **15. New page – Blank space**
  - Create a new page with a blank space template.
- [x] **6. Dimension of the Core page**
  - Adjust dimensions, margins, or basic responsive layout of the Core page.
- [x] **2. Button types**
  - Review and implement button types/variants.

---

## 🟡 Medium Tasks (Form Fields, State Logic, Styling & Animations)

- [x] **5. Mode – Online / Offline / Hybrid buttons**
  - Add or update selectors/buttons for Online, Offline, and Hybrid event modes.
- [x] **7. Speaker section – LinkedIn**
  - Add the LinkedIn URL field to the speaker details database schema and UI form.
- [x] **4. Category – Custom category**
  - Support or configure custom event categories (input or select option).
- [x] **9. Events – Search category change & Search tab**
  - Update frontend filter logic and search tabs.
- [ ] **14. All pages – Navbar changes**
  - Apply global UI updates to the navigation bar across all pages.
- [x] **16. Animation in Certification**
  - Add transitions or animations in the certification module/view.
- [x] **18. Ticket – Registration fail**
  - Add error handling/UI displays/messages for failed ticket registrations.

---

## 🔴 Hard / Complex Tasks (File Uploads, Complex Logic, Custom Builders & 3D)

- [x] **7. Speaker section – Upload photo (not working)**
  - Debug file uploads (multer backend controller, storage, and frontend multipart/form-data).
- [x] **12. Registration close issue**
  - Investigate and resolve bugs related to closing event registration automatically or manually.
- [x] **9. Events – Registration states (Open / Close / Completed)**
  - Implement full backend lifecycle state transitions for event registrations.
- [x] **11. Edit event UI update**
  - Redesign or polish the edit event screen/modal (multiple complex fields, date Pickers, file uploads).
- [x] **13. On-spot registration**
  - Implement or fix on-spot registration functionality (quick ticket generation, attendee creation).
- [x] **8. Form Builder – Custom form**
  - [x] Implement and test mandatory fields validation.
  - [x] Run custom field testing.
- [x] **17. Announcement Page – Custom & Crew Module**
  - [x] Customize the Announcement page.
  - [x] Integrate/build the Crew Module.
- [x] **19. Globe point**
  - Add or update coordinates/visualization points on the 3D globe (WebGL/Three.js or globe library logic).

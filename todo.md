# Project Tasks - CodeShare

## Active Tasks
- [x] Implement local file upload enhancement
    - [x] Add `localFileUploadEnabled` to User model
    - [x] Add `local_disk` storage method to File model
    - [x] Create `LocalStorageService` with path fallback logic (`/home/ubuntu/...` -> `backend/public/...`)
    - [x] Update `fileController` to support local storage operations (upload, download/stream, delete)
    - [x] Configure static route in `app.js` for file previews
- [ ] Implement file preview in frontend (UI update)
- [ ] Add toggle in User Profile for `localFileUploadEnabled`

## Completed Tasks
- [x] Consolidate middleware files (Conversation 7051166b)
- [x] Fix player image displays (Conversation efdee3cb)
- [x] Refactor service tests (Conversation 71ea5d79)

# TODO: Implement User Accounts and Favorites (v2)

## Phase 1: Setup and Dependencies
- [x] Add bcryptjs and jsonwebtoken to package.json
- [x] Install dependencies

## Phase 2: Database Models
- [x] Create models/user.js with User schema (email, password, favorites)

## Phase 3: API Endpoints
- [x] Create pages/api/auth/user/register.js
- [x] Create pages/api/auth/user/login.js
- [x] Create pages/api/auth/user/logout.js
- [x] Create pages/api/auth/user/verify.js
- [x] Create pages/api/user/favorites.js (GET, POST, DELETE)

## Phase 4: Auth Utilities
- [x] Extend lib/auth.js with user auth functions

## Phase 5: Client-side Auth
- [x] Create src/app/components/AuthContext.jsx
- [x] Update src/app/layout.js to include AuthProvider and Nav

## Phase 6: UI Components
- [x] Create src/app/components/Nav.jsx
- [x] Create src/app/components/LoginModal.jsx
- [x] Create src/app/components/SignupModal.jsx

## Phase 7: Favorites Page
- [x] Create src/app/favorites/page.js

## Phase 8: Integrate Favorites in Search
- [x] Update src/app/search/page.js to add favorite icons and logic
- [x] Update src/app/search/components/ProductModal.jsx to add favorite icon

## Phase 9: Testing
- [ ] Test user registration and login
- [ ] Test adding/removing favorites
- [ ] Test UI responsiveness
- [ ] Verify existing search works without login

# Beta Access Request System Implementation

## Tasks to Complete

### 1. Database Models
- [x] Create `models/betaAccessRequest.js` with fields: fullName, email, designFirmLocation, roleDesignFocus, curiosity, howHeard, status, verificationToken, createdAt
- [x] Update `models/user.js` to add additional fields: fullName, designFirmLocation, roleDesignFocus, curiosity, howHeard

### 2. Frontend Components
- [x] Modify `src/app/components/SignupModal.jsx` to "Request Beta Access" form with specified fields
- [x] Create `src/app/setup-password/page.js` for password setup with verification token

### 3. API Endpoints
- [x] Create `pages/api/auth/beta-request.js` for handling beta access request submission
- [x] Create `pages/api/admin/beta-requests.js` for admin CRUD operations on beta requests
- [x] Create `pages/api/auth/setup-password.js` for verifying token and completing user registration

### 4. Admin Interface
- [x] Modify `src/app/admin/page.js` to tabbed interface with "Products" and "Beta Requests" tabs
- [x] Add beta requests management functionality (view, accept/decline, send verification emails)

### 5. Dependencies & Configuration
- [x] Install nodemailer for email sending
- [ ] Configure email service environment variables (SMTP settings)

### 6. Testing
- [ ] Test complete flow: request → admin review → email → password setup → login

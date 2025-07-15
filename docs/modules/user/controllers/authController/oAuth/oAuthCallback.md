# oAuthCallback.md

This function handles the **OAuth callback flow** after a user authenticates with a third-party provider (e.g., GitHub, Facebook). It validates the OAuth state, processes the user data, and either logs in an existing user or registers a new one, returning JWT tokens for session management.

---

## Step-by-Step Explanation

### 1. Extract Provider
- Reads `provider` from route params (`req.params.provider`) to identify which OAuth strategy to use.

### 2. Validate `state` Parameter
- Ensures the `state` query parameter exists to prevent CSRF attacks.
- Retrieves the stored state token from Redis (`oauth:state:<state>`).
- If missing or expired, returns HTTP 400 error.
- Deletes the state token from Redis to prevent reuse.

### 3. Passport Authentication
- Calls `passport.authenticate(provider, callback)` to finalize OAuth.
- Callback receives `(err, userData, info)`.

### 4. Error Handling & Validation
- If `err` exists, logs it and throws.
- If no `userData` received, throws error.
- Double-checks `state` parameter and Redis token again (redundant but defensive).
- Deletes state token again (ensures cleanup).

### 5. Normalize and Hash Email
- Uses `validator.normalizeEmail` to standardize the email from `userData`.
- Converts to lowercase and trims whitespace.
- Creates a secure hash of the normalized email for user lookup (avoids storing plain emails).

### 6. User Lookup
- Searches for an existing user in the database by `emailHash`.

### 7. If User Exists (Login Flow)
- Updates the user's `auth[provider]` object with latest profile and timestamp.
- Generates:
  - **Access Token**: JWT including user ID and role.
  - **Refresh Token**: JWT for session refresh.
- Creates an audit log entry recording the login event, including:
  - IP address
  - User agent
  - Registration method and provider ID
  - Device fingerprint (if provided)
  - Risk score (from custom function analyzing request)
- Returns HTTP 200 with user info and tokens.

### 8. If User Does Not Exist (Registration Flow)
- Generates a unique username based on OAuth profile name or fallback random string.
- Encrypts sensitive user data (email, first and last names).
- Sets user status as `active`, default role `customer`.
- Saves OAuth provider info under `auth`.
- Sets user preferences for language (based on request) and theme.
- Registers the user in the database.
- Generates access and refresh tokens similarly to login.
- Logs a successful registration event with similar metadata.
- Returns HTTP 200 with new user info and tokens.

### 9. Error Catching
- Logs any unexpected errors during the process.
- Returns HTTP 500 with error message.
- If in development, includes error stack trace for debugging.

---

## Summary

This function is the **central OAuth callback handler** that:
- Protects against CSRF with strict `state` validation using Redis.
- Integrates Passport for provider-specific OAuth verification.
- Ensures secure user matching via hashed email.
- Supports both login and new user registration flows seamlessly.
- Provides comprehensive audit logging for security monitoring.
- Returns JSON responses with relevant user data and authentication tokens.

## 📥 Request Body Example (JSON)

This endpoint is a callback triggered by the OAuth provider after user authentication. The request does **not** contain a JSON body because it is typically a GET request with query parameters provided by the OAuth provider, such as:

```json
{
  "state": "random_state_token_from_initial_request",
  "code": "authorization_code_from_provider"
}

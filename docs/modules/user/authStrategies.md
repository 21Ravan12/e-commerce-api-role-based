# authStrategies.md

This file sets up **OAuth authentication strategies** and **serialization logic** using `passport.js`. It supports third-party logins via GitHub and Facebook, handles secure user session management, and validates redirect URIs for redirection safety.

---

## 🔐 Serialization & Deserialization

### `initializeSerializers()`
This function sets up how Passport serializes and deserializes users to/from the session.

- **`serializeUser`**: Converts a user object to a unique identifier (`user._id`) to be stored in the session.
- **`deserializeUser`**: Retrieves the user from the database using the stored ID. It uses a custom `findUser` method to load only necessary fields (e.g., `auth` info).
- **Error Handling**: All steps log errors using a custom `logger` service and gracefully handle invalid user states or malformed IDs using `validator`.

---

## 🔧 OAuth Strategy Configuration

### `configureOAuthStrategies()`
Registers third-party OAuth strategies dynamically based on environment variables.

- Uses `passport-github2` and `passport-facebook`.
- Applies shared `commonStrategyOptions`, such as:
  - `passReqToCallback`: Required for handling OAuth inside route middlewares.
  - `state`: Mitigates CSRF attacks.
  - `proxy`: Ensures correct callback behavior behind proxies (like in production).

#### ✅ GitHub Strategy
- Activated only if `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` are set.
- Requests GitHub email access (`scope: ['user:email']`).
- Logs a warning and skips if credentials are missing.

#### ✅ Facebook Strategy
- Requires `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`.
- Requests name, email, and profile info (`profileFields`).
- Uses `enableProof` for extra security (hash-based validation).
- Logs a warning and skips if credentials are missing.

---

## 🤝 OAuth Profile Handling

### `createOAuthHandler(provider)`
This function returns a middleware used by OAuth strategies for processing user profiles.

- Validates the third-party `profile` and extracts the email.
- Normalizes the email using `validator.normalizeEmail`.
- Returns a unified `userData` object containing:
  - `provider`, `providerId`, `email`, `name`
  - Access/refresh tokens
  - Raw profile object
- Any failure is logged and passed to `done()` for Passport to handle errors.

---

## 👤 Name Extraction Helper

### `getProfileName(profile, provider)`
Provides a consistent way to extract the user's display name based on the OAuth provider:

- **GitHub**: Uses `displayName` or `username`.
- **Facebook**: Builds full name from `givenName` and `familyName`.

---

## 🌐 Redirect URI Validation

### `isValidRedirectUri(uri)`
Checks if a given redirect URI is valid and safe for use.

- Parses the URI and ensures:
  - It matches one of the domains in `ALLOWED_REDIRECT_DOMAINS` (from `.env`, comma-separated).
  - In production, only `https:` URIs are allowed.
  - Subdomain support: allows `sub.example.com` if `example.com` is whitelisted.
- Logs a warning if no domains are configured or URI is malformed.

---

## 📦 Exported Functions

- `initializeSerializers`: Setup session-based auth handlers.
- `configureOAuthStrategies`: Register GitHub/Facebook strategies dynamically.
- `isValidRedirectUri`: Whitelist-based redirect checker.
- `createOAuthHandler`: Generates OAuth profile handler middleware.
- `getProfileName`: Utility to extract a name from an OAuth profile.

---

This file provides **modular and secure** integration of OAuth into your authentication system while ensuring consistent structure, logging, and error handling throughout the flow.

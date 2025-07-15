# oAuthRedirect.md

This function handles the initial **OAuth login redirect** to third-party providers (GitHub or Facebook). It prepares necessary parameters, validates inputs, and triggers Passport.js authentication middleware.

---

## Function: `async oAuthRedirect(req, res, next)`

### Purpose:
- Validates the OAuth `provider` from URL params.
- Validates optional `redirect_uri` query parameter to ensure safe redirection after login.
- Generates or uses an existing `state` token to protect against CSRF attacks.
- Stores this `state` token and related metadata in Redis with a 5-minute expiration.
- Initiates Passport's OAuth flow with appropriate scopes based on the provider.

---

### Detailed Explanation:

1. **Extract Parameters**:
   - `provider` (e.g., "github" or "facebook") from URL path parameters.
   - `state` and `redirect_uri` from query parameters.

2. **Provider Validation**:
   - Confirms that `provider` is either `'github'` or `'facebook'`.
   - Throws an error if unsupported, preventing invalid OAuth flows.

3. **Redirect URI Validation**:
   - If a `redirect_uri` is provided, it checks its validity with `isValidRedirectUri()` (ensuring domain whitelist and HTTPS in production).
   - Throws an error on invalid URIs to prevent open redirect vulnerabilities.

4. **State Token Management**:
   - Uses the incoming `state` query parameter if available; otherwise, generates a new random `stateToken` with 32 bytes length using `createChallenge()`.
   - The `state` acts as a CSRF protection token.

5. **Store State in Redis**:
   - Saves the `stateToken` key in Redis with JSON metadata:
     - Client IP address (`req.ip`)
     - User agent string
     - Timestamp of the request
     - OAuth provider name
     - Original request URL
     - Provided redirect URI or `null`
   - Sets expiry of 300 seconds (5 minutes) to limit token lifetime.

6. **Trigger Passport Authentication**:
   - Calls `passport.authenticate` middleware for the chosen `provider`.
   - Requests scopes specific to the provider:
     - GitHub: `['user:email']`
     - Facebook: `['email']`
   - Disables session since this flow likely uses token-based auth.
   - Passes control to Passport which redirects the user to the OAuth provider's login page.

7. **Error Handling**:
   - Catches any synchronous or asynchronous errors.
   - Logs errors via a custom `logger`.
   - Responds with HTTP 500 and a generic error message.
   - In development mode, includes the error message details in the JSON response.

---

### Summary:

`oAuthRedirect` is a crucial entry point for OAuth login flows, ensuring input validation, state security, and smooth redirection to third-party providers, while protecting the app from CSRF and open redirect attacks.

## 📥 Request Body Example (JSON)

This endpoint does not accept a request body since it is an OAuth redirect initiator using URL parameters and query strings.

---

### Request Method
`GET`

### URL Parameters
- `provider` (string, required): The OAuth provider to authenticate with. Allowed values:
  - `"github"`
  - `"facebook"`

### Query Parameters
- `state` (string, optional): An opaque string to maintain state between the request and callback. If omitted, a random token is generated.
- `redirect_uri` (string, optional): A URL to redirect the user after successful authentication. Must be a valid, whitelisted URI.

---

### Example Request URL
`GET` /oauth/github?state=abc123&redirect_uri=https://example.com/callback

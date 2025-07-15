# updatePreferences.md

This method `updatePreferences` handles updating a logged-in user's preference settings such as language, theme, and notification options. It performs validation, updates the database, and logs the operation for auditing purposes.

---

## Step-by-step Explanation:

### 1. Extract User ID and Input Data
- Retrieves the authenticated user's ID from `req.user._id`.
- Destructures `language`, `theme`, and `notifications` from the request body.

### 2. Initialize Update Containers
- Creates an empty object `preferencesUpdate` to accumulate validated preference changes.
- Creates `updatedFields` array to track which specific fields are updated (useful for audit logs).

### 3. Validate & Prepare Language Preference
- If `language` is provided, verifies it is one of the allowed codes: `'en'`, `'es'`, `'fr'`, `'de'`, `'tr'`.
- If invalid, responds with HTTP 400 and error message.
- If valid, adds `language` to `preferencesUpdate` and marks it in `updatedFields`.

### 4. Validate & Prepare Theme Preference
- Checks if `theme` is one of `'light'`, `'dark'`, or `'system'`.
- Invalid values respond with HTTP 400 error.
- Valid values update `preferencesUpdate.theme` and `updatedFields`.

### 5. Validate & Prepare Notifications Preferences
- If `notifications` is present, initializes `preferencesUpdate.notifications` if not already set.
- Checks boolean values for notification channels:
  - `email`
  - `push`
  - `sms`
- Each valid boolean field is added to `preferencesUpdate.notifications` and recorded in `updatedFields`.

### 6. Early Return if No Valid Updates
- If no valid preference fields were provided (empty `preferencesUpdate`), respond with HTTP 400 and error.

### 7. Update User Preferences in Database
- Calls a static `User.updateUser` method to apply the updates in the database using the user's ID.
- Updates only the `preferences` subtree.

### 8. Create Audit Log for Success
- Logs the event `PREFERENCES_UPDATE` with:
  - User ID
  - Action and status (`update`, `success`)
  - Source (`api`)
  - IP address and truncated user-agent string
  - Metadata including updated fields, device fingerprint, and geo-location headers (if present)

### 9. Respond with Success
- Returns HTTP 200 with a success message and the updated preferences from the database.

---

## Error Handling

- Logs the error using a custom `logger`.
- Creates a failure audit log with error details and optional stack trace (only in development).
- Responds with HTTP 500 and the error message or a generic failure message.

---

## Summary

- Ensures robust validation of user input.
- Updates only allowed preference fields.
- Maintains detailed audit trails for both successful and failed operations.
- Provides clear client responses with appropriate HTTP status codes.

## 📥 Request Body Example (JSON)
```json
{
  "language": "en",
  "theme": "dark",
  "notifications": {
    "email": true,
    "push": false,
    "sms": true
  }
}

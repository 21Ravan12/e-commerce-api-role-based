# getPersonalData.md

This file documents the functionality of the `getPersonalData` controller method, which is responsible for securely retrieving and decrypting a user's sensitive personal information (such as email, name, phone, and date of birth). The method includes audit logging, structured error handling, and security best practices.

---

## 🧠 Purpose

The route serves **authenticated users** who want to **access their personal data**. It ensures:
- Only verified and logged-in users can access the route.
- All sensitive data is **decrypted securely** before being returned.
- All access attempts are **audited**, including both success and failure.

---

## 🛠️ Breakdown of Core Logic

### 1. **Retrieve User**
```js
const userId = req.user._id;
const user = await User.findUser({ id: userId }, { accountVerified: 1, encryptedData: 1, username: 1 });
````

* Extracts the user's ID from the JWT-authenticated request.
* Fetches the user from the database using a custom `findUser` method.
* Retrieves only essential fields: `accountVerified`, `encryptedData`, and `username`.

---

### 2. **Handle Missing User or Data**

```js
if (!user || !user.encryptedData) { ... }
```

* If the user or their encrypted data is not found:

  * Logs a **failure audit event** (`PERSONAL_DATA_ACCESS_FAILED`).
  * Returns a `404 Not Found` response with a context-specific error.

---

### 3. **Log Access Attempt**

```js
logger.info('Encrypted data accessed', { fields: Object.keys(encryptedData).filter(k => encryptedData[k] !== null) });
```

* Logs which encrypted fields were accessed (excluding null ones).

---

### 4. **Decrypt Data**

```js
decryptedData = {
  email: (await decrypt(encryptedData.email)).slice(1,-1),
  ...
};
```

* Decrypts each encrypted field (email, first/last name, phone, birth date).
* Uses `slice(1,-1)` to remove extra quotation marks if present from the encryption method.
* If any decryption fails, it logs an error and throws an exception.

---

### 5. **Audit Successful Access**

```js
await AuditLog.createLog({
  event: 'PERSONAL_DATA_ACCESSED',
  ...
  status: 'success',
});
```

* Records a **successful audit log entry**, including:

  * Fields accessed
  * Source, IP, user agent
  * User and transaction metadata

---

### 6. **Return Decrypted Data**

```js
res.status(200).json({
  message: 'Personal data retrieved successfully',
  decryptedData: decryptedData
});
```

* Sends decrypted personal data back to the client in a structured response.

---

### 7. **Global Error Handling**

If any unexpected error occurs:

* Logs the error (`logger.error(...)`)
* Records a **failure audit log** for traceability
* Responds with a generic `500 Internal Server Error`
* Optionally includes full error message if in development mode

---

## 🧾 Audit Log Events

The following structured events are recorded using `AuditLog.createLog()`:

* `PERSONAL_DATA_ACCESS_FAILED`: When user or data not found, or an error occurs
* `PERSONAL_DATA_ACCESSED`: When data is successfully retrieved and decrypted

Each audit record includes:

* `event`, `action`, `entityType`, `entityId`, `user`
* `source`, `ip`, `userAgent`, `metadata`
* `status` (success/failure)
* `transactionId` from headers (if provided)

---

## ✅ Security & Privacy Notes

* Personal data is stored encrypted and decrypted only on demand.
* Strict error logging and audit trails are maintained.
* Data is never exposed unless decryption is successful.
* All requests must pass `authenticate` middleware beforehand (not shown in this file but assumed via route protection).

---

## 🧪 Example Response

```json
{
  "message": "Personal data retrieved successfully",
  "decryptedData": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-01"
  }
}
```

## 📥 Request Body Example (JSON)

This endpoint does not require a request body as it retrieves personal data for the authenticated user based on their token/session.

```json
{}

# getProfile.md

This function handles retrieving the authenticated user's profile information.

---

## Function: `getProfile(req, res)`

- **Purpose:**  
  Fetches basic profile details for the currently authenticated user and sends them in the response.

- **How it works:**  
  1. Extracts the user's ID (`_id`) from the `req.user` object, which is populated by authentication middleware.  
  2. Calls a custom `User.findUser` method with:  
     - A filter to find the user by ID.  
     - A projection specifying that only `accountVerified` and `username` fields should be returned.  
  3. Checks if a user was found:  
     - If not, responds with HTTP 404 and an error message "User not found".  
  4. If found, responds with HTTP 200 and the user data in JSON format.  

- **Error Handling:**  
  Any exceptions during database retrieval or other operations are logged with an error message. The client receives a 500 status with a generic failure message.

---

## Summary

This method provides a secure, minimal user profile response, exposing only necessary fields, and handles missing users and unexpected errors gracefully.
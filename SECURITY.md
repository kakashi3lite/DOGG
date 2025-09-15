# Security Policy

## Reporting a Vulnerability

We take the security of DoggieGrowl seriously. If you discover a security vulnerability, please report it to us immediately. We appreciate your efforts to responsibly disclose your findings, and we will work with you to address the issue promptly.

**Please do NOT disclose vulnerability information publicly until we have had a chance to analyze and address the issue.**

To report a vulnerability, please send an email to [security@example.com] (replace with actual security contact).

## Security Best Practices

- **Input Validation:** All user input is validated on both the client and server sides to prevent common vulnerabilities like SQL injection, XSS, and command injection.
- **Authentication and Authorization:**
  - We use JWT-based authentication with access and refresh tokens.
  - Access tokens are short-lived and stored in memory on the client-side.
  - Refresh tokens are HTTP-only, SameSite=Lax cookies to prevent XSS attacks.
  - All API endpoints are protected with appropriate authorization checks.
- **Password Security:** User passwords are never stored in plain text. They are hashed using a strong, modern hashing algorithm (e.g., bcrypt) before being stored in the database.
- **HTTPS Only:** The application is designed to be served over HTTPS only to ensure data in transit is encrypted.
- **CORS:** Cross-Origin Resource Sharing (CORS) is configured with a strict allowlist to prevent unauthorized domains from accessing the API.
- **Rate Limiting:** API endpoints are rate-limited to prevent abuse and denial-of-service attacks.
- **Dependency Management:** We regularly update our dependencies to ensure we are using the latest versions with known security patches. Dependabot is configured to automate this process.
- **Error Handling:** Generic error messages are returned to clients to avoid leaking sensitive information about the server's internal workings.
- **Logging:** Security-relevant events (e.g., failed login attempts, unauthorized access) are logged for auditing and incident response.

## Dependabot

Dependabot is configured to automatically scan for and update vulnerable dependencies. Pull requests will be automatically created for security updates.

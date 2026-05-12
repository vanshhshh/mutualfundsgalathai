## Security Policy

### Reporting a Vulnerability

If you discover a security vulnerability in Mutual Fund Insight Engine, please email us at:
**security@mutualfundsgalathai.co.in**

Please do NOT open a public issue for security vulnerabilities.

### What to Include

When reporting a vulnerability, please provide:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

### Response Timeline

- **24 hours**: Acknowledgment of report
- **72 hours**: Initial assessment
- **7 days**: Security patch released (if critical)

### Security Features

✅ **Input Validation**: Zod schemas validate all inputs
✅ **SQL Injection Prevention**: Prisma ORM parameterized queries
✅ **CORS Protection**: Properly configured CORS headers
✅ **Environment Variables**: Sensitive data in .env files
✅ **HTTPS**: Enforced in production
✅ **Rate Limiting**: Planned for future release
✅ **Error Messages**: Sanitized to prevent information disclosure
✅ **Dependencies**: Regular security updates

### Secure Deployment

1. Never commit `.env` files to git
2. Use environment variable management in production
3. Keep dependencies updated
4. Use HTTPS with valid certificates
5. Enable database encryption at rest
6. Regular database backups
7. Monitor logs for suspicious activity
8. Use WAF (Web Application Firewall) if available

### Supported Versions

| Version | Status | Security Updates |
|---------|--------|------------------|
| 1.0.x | Current | ✅ Yes |
| 0.x | Deprecated | ❌ No |

### Security Considerations for Users

- ✅ Fund data is non-sensitive and public
- ✅ No personal investment data stored (in v1.0)
- ✅ No payment processing
- ✅ No user credentials stored yet

### Future Security Enhancements

- [ ] Two-factor authentication
- [ ] API key management
- [ ] Encryption for user data
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Bug bounty program

---

**Last Updated**: January 2024

# Contributing to Mutual Fund Insight Engine

Thank you for your interest in contributing to our project! This guide will help you get started.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
3. **Create a feature branch** for your changes
4. **Make your changes** and commit them
5. **Push to your fork** and submit a pull request

## Development Setup

```bash
# Run the setup scripts
./setup.dev.sh          # macOS/Linux
./setup.dev.ps1         # Windows (PowerShell)
```

## Project Structure

```
backend/          → Express API
frontend/         → Next.js application
prisma/           → Database schema
docs/             → Documentation
```

## Code Standards

### TypeScript
- Use strict mode
- Add type annotations for all functions
- Avoid `any` types

### Components
- Keep components under 300 lines
- Use functional components with hooks
- Props should be well-typed

### API Routes
- Use consistent naming conventions
- Add input validation with Zod
- Handle errors gracefully

## Commit Messages

```
feat: Add new fund search feature
fix: Resolve memory leak in cache
docs: Update API documentation
style: Format code with Prettier
test: Add unit tests for fund service
```

## Pull Request Process

1. Update README.md if needed
2. Add tests for new functionality
3. Ensure all tests pass: `npm test`
4. Update documentation
5. Provide clear PR description

## Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Code Review

All pull requests require review before merging. Our team will:
- Review code quality
- Check for security issues
- Verify functionality
- Ensure documentation

## Reporting Issues

Use GitHub Issues to report bugs or suggest features. Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Questions?** Feel free to ask in GitHub Discussions or create an issue!

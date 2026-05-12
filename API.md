# API Documentation

## Base URL
```
Production: https://api.mutualfundsgalathai.co.in/api
Development: http://localhost:3000/api
```

## Authentication
Currently, the API is public. JWT authentication will be added in future versions.

## Endpoints

### 1. Search Funds

**Endpoint**: `GET /funds/search`

**Parameters**:
- `q` (string, required): Search query (fund name, category, or AMC)
- `limit` (number, optional): Number of results to return (default: 10, max: 50)

**Example**:
```bash
curl "http://localhost:3000/api/funds/search?q=Axis&limit=10"
```

**Response**:
```json
[
  {
    "id": "fund-id-1",
    "name": "Axis Bluechip Fund",
    "category": "Large Cap",
    "amc": "Axis Asset Management",
    "fundManager": "Deepak Notani",
    "aum": 25000,
    "expenseRatio": 0.95,
    "categoryAvgExpense": 0.85,
    "volatility": 9.5,
    "concentration": 35.2,
    "consistency": 78,
    "riskLevel": "Moderate"
  }
]
```

---

### 2. Get Fund Details

**Endpoint**: `GET /funds/:id`

**Parameters**:
- `id` (string, required): Fund ID

**Example**:
```bash
curl "http://localhost:3000/api/funds/fund-id-1"
```

**Response**:
```json
{
  "id": "fund-id-1",
  "name": "Axis Bluechip Fund",
  "category": "Large Cap",
  "amc": "Axis Asset Management",
  "fundManager": "Deepak Notani",
  "aum": 25000,
  "expenseRatio": 0.95,
  "categoryAvgExpense": 0.85,
  "volatility": 9.5,
  "concentration": 35.2,
  "consistency": 78,
  "riskLevel": "Moderate",
  "performance": {
    "returns1Y": 15.32,
    "returns3Y": 12.18,
    "returns5Y": 13.45,
    "returnsYTD": 8.92,
    "benchmarkReturns1Y": 12.50,
    "benchmarkReturns3Y": 11.20,
    "benchmarkReturns5Y": 13.80,
    "benchmarkName": "Nifty 50"
  },
  "holdings": [
    {
      "id": "holding-1",
      "stockName": "RELIANCE",
      "companyName": "Reliance Industries Ltd.",
      "sector": "Energy",
      "percentage": 8.5
    }
  ],
  "riskFlags": {
    "highExpense": true,
    "highConcentration": false,
    "highVolatility": false,
    "lowConsistency": false
  },
  "aiExplanation": {
    "summary": "A solid large-cap fund with consistent returns...",
    "risks": ["Slightly high expense ratio", "Moderate concentration risk"],
    "strengths": ["Good track record", "Experienced fund manager"],
    "suitability": {
      "good_for": ["Long-term investors", "Risk-averse investors"],
      "avoid_for": ["Cost-conscious investors", "Active traders"]
    },
    "verdict": "Good for long-term investors but slightly expensive"
  },
  "alternatives": [
    {
      "id": "alt-fund-1",
      "name": "Mirae Asset Large Cap Fund",
      "reason": "Lower expense ratio",
      "expenseRatio": 0.75,
      "returns1Y": 14.89
    }
  ]
}
```

---

### 3. Compare Funds

**Endpoint**: `POST /funds/compare`

**Request Body**:
```json
{
  "fundIds": ["fund-id-1", "fund-id-2", "fund-id-3"]
}
```

**Constraints**:
- Minimum 2 fund IDs required
- Maximum 3 fund IDs accepted

**Example**:
```bash
curl -X POST http://localhost:3000/api/funds/compare \
  -H "Content-Type: application/json" \
  -d '{"fundIds": ["fund-1", "fund-2"]}'
```

**Response**:
```json
{
  "funds": [
    {
      "id": "fund-1",
      "name": "Axis Bluechip Fund",
      "expenseRatio": 0.95,
      "returns1Y": 15.32,
      "returns3Y": 12.18,
      "returns5Y": 13.45,
      "volatility": 9.5,
      "riskLevel": "Moderate"
    },
    {
      "id": "fund-2",
      "name": "Mirae Asset Large Cap Fund",
      "expenseRatio": 0.75,
      "returns1Y": 14.89,
      "returns3Y": 13.02,
      "returns5Y": 14.12,
      "volatility": 8.8,
      "riskLevel": "Low"
    }
  ],
  "comparison": "Mirae Asset has lower expense ratio and volatility, making it better for cost-conscious investors. Axis Bluechip offers slightly higher returns but at a higher cost."
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid search parameters",
  "status": 400
}
```

### 404 Not Found
```json
{
  "error": "Fund not found",
  "status": 404
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch fund details",
  "status": 500
}
```

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: number of remaining requests
  - `X-RateLimit-Reset`: UNIX timestamp when limit resets

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Caching

API responses are cached for 1 hour to improve performance. Clear cache by:
```bash
# Via API (admin only)
POST /api/admin/cache/clear
```

---

## Changelog

### v1.0.0 (Current)
- ✅ Fund search
- ✅ Fund details with AI insights
- ✅ Fund comparison
- ✅ Portfolio breakdown
- ✅ Performance analytics

### v1.1.0 (Planned)
- 🔜 Watchlist functionality
- 🔜 User authentication
- 🔜 Personalized recommendations
- 🔜 Portfolio analyzer

---

## Examples

### Search with JavaScript/TypeScript

```typescript
const searchFunds = async (query: string) => {
  const response = await fetch(
    `http://localhost:3000/api/funds/search?q=${query}&limit=10`
  );
  const funds = await response.json();
  return funds;
};
```

### Compare Funds with Python

```python
import requests

response = requests.post(
    'http://localhost:3000/api/funds/compare',
    json={'fundIds': ['fund-1', 'fund-2']}
)
comparison = response.json()
print(comparison['comparison'])
```

### Get Fund Details with cURL

```bash
curl -H "Accept: application/json" \
  http://localhost:3000/api/funds/fund-id-1 | jq .
```

---

## Support

For API issues or questions, please:
1. Check this documentation
2. Review error messages carefully
3. Check GitHub issues
4. Contact support@mutualfundsgalathai.co.in

---

**API Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Active

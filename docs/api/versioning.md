# API Versioning Strategy

Vibewell implements a robust API versioning strategy to ensure backward compatibility while allowing for API evolution. This document outlines our approach to API versioning and how clients should interact with different API versions.

## Versioning Scheme

We use a path-based versioning scheme with the following structure:

```
/api/{version}/{resource}/{endpoint}
```

For example:
- `/api/v1/users/profile`
- `/api/v2/bookings/upcoming`

## Available Versions

| Version | Status | Description |
|---------|--------|-------------|
| `v1` | Stable | Initial API version |
| `v2` | Stable | Enhanced booking system, improved notification endpoints |
| `v3` | Current | Latest version with virtual try-on capabilities |
| `legacy` | Deprecated | Legacy endpoints (to be removed) |
| `latest` | Alias | Always points to the most current version (currently `v3`) |

## How to Specify API Version

### 1. Path-based Versioning (Preferred)

Include the version in the request path:

```
GET https://api.vibewell.com/api/v2/users/profile
```

### 2. Accept Header Versioning

Alternatively, you can specify the version in the `Accept` header:

```
Accept: application/json; version=v2
```

If a request doesn't specify a version, it will be routed to the latest version.

## Version Compatibility

We follow these principles to ensure a smooth evolution of our API:

1. **Non-breaking Changes**: We may add new fields to existing endpoints without incrementing the version number.
2. **Breaking Changes**: Any breaking changes (removing fields, changing field types, etc.) require a new API version.
3. **Deprecation Process**: Deprecated endpoints will continue to function for at least 6 months before removal.

## Using the 'latest' Alias

The `latest` alias always points to the current stable API version. While convenient for development, we recommend using an explicit version in production to avoid unexpected changes.

```
GET https://api.vibewell.com/api/latest/users/profile
```

## Version Lifecycle

Each API version goes through the following lifecycle:

1. **Preview**: Early access to upcoming features (may have breaking changes)
2. **Stable**: Generally available and fully supported
3. **Deprecated**: Still works but scheduled for removal
4. **Sunset**: No longer available

## Migration Guidelines

When migrating between API versions:

1. Review the [changelog](changelog.md) for breaking changes
2. Update all API client calls to use the new version
3. Test your integration thoroughly
4. Consider implementing a feature flag system for a gradual rollout

## Version Headers

All API responses include the following headers:

- `X-API-Version`: The actual version that processed the request
- `X-API-Deprecated`: Present if the endpoint is deprecated, with a date of removal

## Version-specific Documentation

Each API version has its own documentation:

- [API v1 Documentation](v1/README.md)
- [API v2 Documentation](v2/README.md)
- [API v3 Documentation](v3/README.md)

## Implementation Details

Our API versioning is implemented using:

1. **Middleware Layer**: Handles version routing and selection
2. **Separate Controllers**: Each version has dedicated controller implementations
3. **Shared Models**: Core data models remain consistent across versions
4. **Version-specific Transformers**: Transform data between API versions

For more details on how this is implemented, see the [API Architecture](../architecture/api-design.md) document.

## Best Practices for API Clients

1. **Always specify a version**: Don't rely on the default version behavior
2. **Set up monitoring**: Watch for deprecation headers in responses
3. **Implement version fallback**: If a version becomes unavailable, try a fallback version
4. **Update regularly**: Stay current with the latest API version

## Support and Feedback

If you have questions about API versioning or need assistance migrating between versions:

- Contact our API support team at api-support@vibewell.com
- Submit feedback through the [Developer Portal](https://developers.vibewell.com/feedback)
- Join our [API Slack channel](https://vibewell-team.slack.com/channels/api-developers) 
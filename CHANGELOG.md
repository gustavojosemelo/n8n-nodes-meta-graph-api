# Changelog

## [1.0.0] - 2026-02-13

### Added
- Auto-pagination: automatically follows `next` cursors from Meta Graph API
- Batch interval: configurable delay between pagination requests
- Max pages limit: control how many pages to fetch
- Output mode: Individual Items or Raw Response
- Simplified Fields input (comma-separated string)
- Support for Graph API versions v18.0 through v24.0
- Binary file upload support for POST requests
- Query parameters via UI or JSON
- English UI descriptions
- Bilingual README (English + Portuguese)
- MIT License

### Changed
- Upgraded default API version to v24.0
- Improved error handling with Graph API error details

## [0.0.4] - 2026-02-13

### Added
- Initial beta release
- Basic auto-pagination
- Token authentication
- GET / POST / DELETE support

# Changelog

## [0.5.3] - 2024-03-20

### Security

- Fix [CVE-2024-21501](https://github.com/advisories/GHSA-rm97-x556-q36h)

## [0.5.2] - 2023-12-17

### Security

- Fix [CVE-2023-45133](https://github.com/advisories/GHSA-67hx-6x53-jw92)

### Changed

- Upgrade dependencies: Rollup v4

## [0.5.1] - 2023-10-11

### Security

- Fix [CVE-2023-44270](https://github.com/advisories/GHSA-7fh5-64p2-3v2j)

## [0.5.0] - 2023-07-22

### ⚠ Breaking Changes

- Header options are now renamed to Column options. Need to change `headers` to `columns`.

## [0.4.2] - 2023-02-15

### Changed

- Upgrade dependencies: Rollup v3

### Security

- Fix [CVE-2022-25881](https://github.com/advisories/GHSA-rc47-6667-2j5j)

## [0.4.1] - 2023-01-11

### Security

- Fix [CVE-2022-46175](https://github.com/advisories/GHSA-9c47-m6qq-7p4h)

## [0.4.0] - 2022-10-01

### Added

- Allow no `headers`. The first row's properties will be headers.

## [0.3.2] - 2022-07-23

### Security

- Fix [CVE-2022-25858](https://github.com/advisories/GHSA-4wf5-vphf-c2xc)

## [0.3.1] - 2022-07-05

### Fixed

- Fixed text align for autonumber to be "right" as default.

## [0.3.0] - 2022-07-05

### Changed

- Changed hook to beforeEach from `afterEach`.
  - Now this package won't generate HTML tags directly but convert the code block to markdown table.  
    The table will be rendered by the markdown parser.


[0.5.3]: https://github.com/tknghr/docsify-yaml-table/compare/v0.5.1...v0.5.3
[0.5.2]: https://github.com/tknghr/docsify-yaml-table/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/tknghr/docsify-yaml-table/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/tknghr/docsify-yaml-table/compare/v0.4.2...v0.5.0
[0.4.2]: https://github.com/tknghr/docsify-yaml-table/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/tknghr/docsify-yaml-table/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/tknghr/docsify-yaml-table/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/tknghr/docsify-yaml-table/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/tknghr/docsify-yaml-table/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/tknghr/docsify-yaml-table/compare/v0.2.0...v0.3.0

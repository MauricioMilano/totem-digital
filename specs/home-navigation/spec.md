## ADDED Requirements

### Requirement: Root Landing Page
The system MUST provide a landing page at the root path (`/`) that allows users to choose their destination.

#### Scenario: User chooses Totem
- **WHEN** user clicks on the "Totem" or "Cliente" option
- **THEN** system redirects them to `/totem`

#### Scenario: User chooses Admin
- **WHEN** user clicks on the "Admin" or "Gestão" option
- **THEN** system redirects them to `/admin/login`

### Requirement: UI Consistency
The landing page SHALL adhere to the brand identity, using existing design tokens for colors (e.g., `brand-primary`) and typography.

#### Scenario: Visual Check
- **WHEN** the page is rendered
- **THEN** it MUST use a layout similar to other pages in the app (centered content, consistent spacing)

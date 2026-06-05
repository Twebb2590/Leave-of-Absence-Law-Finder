# Contributing to Leave of Absence Laws Database

Thank you for your interest in contributing to this database! Here's how you can help keep this resource accurate and comprehensive.

## How to Contribute

### 1. Report Inaccuracies or Outdated Information

If you find information that is incorrect or outdated, please open an Issue with:
- The jurisdiction and law affected
- What is currently in the database
- What the correct information should be
- Links to official sources confirming the change

### 2. Add or Update State Laws

We welcome contributions to add or update state-specific leave laws.

#### Format Requirements

- Follow the schema defined in `schema.json`
- Ensure all information comes from official government sources
- Include the source URL in the `official_url` field
- Update the `last_updated` timestamp

#### Steps

1. Fork the repository
2. Create a new branch: `git checkout -b add-state-laws-XX` (where XX is state code)
3. Add or update the law file: `states/XX/laws.json`
4. Test your JSON for validity
5. Submit a pull request with a clear description

### 3. Add New Leave Types

If a new category of leave should be tracked, please:
1. Open an Issue proposing the new leave type
2. Discuss with maintainers
3. Submit PR updating `schema.json`

## Guidelines

### Data Quality
- **Accuracy**: All information must come from official government sources
- **Currency**: Laws change frequently; verify effective dates and amendments
- **Completeness**: Include all mandatory details for each law type

### Sources
- Prefer official government websites (.gov domains)
- Link to official statute text when available
- Document any amendments or modifications

### JSON Formatting
- Use 2-space indentation
- Validate JSON before submitting
- Follow schema exactly

### Commit Messages
Use clear, descriptive commit messages:
- `Add California leave laws`
- `Update FMLA eligibility requirements`
- `Fix typo in Texas bereavement leave duration`

## Pull Request Process

1. Ensure your changes follow the schema and guidelines
2. Provide clear description of what was changed and why
3. Link to official sources supporting the changes
4. Wait for review and address feedback
5. Merge once approved

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## Questions?

Open an Issue or start a Discussion if you have questions about how to contribute.

Thank you for helping keep this resource accurate and useful!
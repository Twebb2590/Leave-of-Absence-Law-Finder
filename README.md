# Leave of Absence Laws Database

A comprehensive database of leave of absence laws covering US Federal laws and individual state regulations.

## Repository Structure

```
leave-of-absence-laws/
├── federal/
│   └── laws.json
├── states/
│   ├── AL/
│   │   └── laws.json
│   ├── AK/
│   │   └── laws.json
│   └── ... (all 50 states)
├── README.md
├── CONTRIBUTING.md
├── schema.json
└── LICENSE
```

## Content Overview

This database includes information on:

- **Types of Leave**: Sick leave, parental leave, bereavement leave, military leave, jury duty, voting leave, domestic violence leave, etc.
- **Duration Requirements**: Minimum and maximum leave periods
- **Eligibility Criteria**: Employee qualifications and employer size thresholds
- **Employer Obligations**: Requirements for employers to provide leave
- **Pay Requirements**: Paid vs. unpaid leave provisions
- **Notice Requirements**: Advance notice needed
- **Job Protection**: Guarantee of employment upon return
- **State/Federal Specifics**: Applicable jurisdiction and effective dates

## Data Format

All laws are stored in JSON format following a standardized schema. See `schema.json` for the complete structure.

## Usage

### Federal Laws
See `federal/laws.json` for federal leave of absence laws (FMLA, military leave, jury duty, etc.).

### State Laws
Each state has its own directory with leave laws:
- `states/CA/laws.json` - California
- `states/NY/laws.json` - New York
- `states/TX/laws.json` - Texas
- etc.

## Quick Links to Key Federal Laws

- [Family and Medical Leave Act (FMLA)](https://www.dol.gov/agencies/whd/fmla/)
- [Military Caregiver Leave](https://www.dol.gov/agencies/whd/fmla/military-caregiver-leave)
- [Jury Duty Leave](https://www.eeoc.gov/statutes/federal-jury-duty-leave)
- [Voting Leave](https://www.eac.gov/)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this database.

## Sources

Laws are sourced from:
- Official US Government websites (congress.gov, DOL.gov, EEOC.gov)
- State legislative websites
- State Department of Labor websites
- Official state government portals

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Disclaimer

⚠️ **Important**: This database is for informational purposes only and should not be considered legal advice. Laws change frequently and may vary based on specific circumstances. Always consult with a qualified employment attorney for specific legal guidance regarding leave of absence rights and obligations.

## Last Updated

This database is maintained by community contributors. Please help keep it current by reporting outdated information.
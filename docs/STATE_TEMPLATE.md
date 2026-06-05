# State Leave Laws Template

## How to Use This Template

When adding a new state's leave of absence laws, follow this structure:

1. **Create a directory** for the state using its two-letter abbreviation: `states/[STATE_CODE]/laws.json`
2. **Follow the schema** defined in the root `schema.json` file
3. **Include all major leave types** applicable to the state
4. **Link to official sources** for each law
5. **Update the `last_updated` timestamp** to the current date

## Required Fields for Each Law

- `id`: Unique identifier (lowercase, hyphens)
- `name`: Full name of the law
- `abbreviation`: Common abbreviation (if applicable)
- `statute_code`: Legal reference code
- `effective_date`: Date law became/becomes effective (YYYY-MM-DD)
- `description`: 1-2 sentence summary
- `leave_types`: Array of leave types covered
- `official_url`: Link to authoritative government source
- `last_updated`: ISO 8601 timestamp

## Leave Types to Consider

Common state leave types to research:

- **sick_leave**: Time for employee's own illness or family member illness
- **parental_leave**: Birth, adoption, or foster care placement
- **bereavement_leave**: Death of family member
- **domestic_violence_leave**: For domestic violence, stalking, or sexual assault situations
- **voting_leave**: Time to vote in elections
- **jury_duty**: Time for jury service
- **military_leave**: Military service or training
- **adoption_leave**: Specific adoption provisions
- **medical_leave**: General medical treatment
- **disability_leave**: Temporary or permanent disability
- **sabbatical_leave**: Extended leave for personal reasons (if applicable)
- **other**: Any state-specific leave types

## Data Quality Guidelines

✅ **DO:**
- Source information from official state government websites (.gov)
- Link to the actual statute or regulation
- Include all eligibility requirements
- Verify effective dates and any amendments
- List minimum employment duration and employer size requirements
- Note whether leave is paid or unpaid
- Document notice requirements
- Specify job protection guarantees

❌ **DON'T:**
- Use secondary sources (news articles, blogs)
- Make assumptions about applicability
- Mix different versions of laws
- Omit eligibility restrictions
- Guess at dates or requirements

## Example: Minimal State Entry

Here's the minimal structure for a state with basic leave laws:

```json
{
  "jurisdiction": "US-XX",
  "jurisdiction_name": "State Name",
  "laws": [
    {
      "id": "state-sick-leave-law",
      "name": "State Sick Leave Act",
      "abbreviation": "SSLA",
      "statute_code": "State Code § 123.456",
      "effective_date": "2024-01-01",
      "description": "Requires employers with X+ employees to provide paid sick leave.",
      "leave_types": [
        {
          "type": "sick",
          "duration": {
            "value": 5,
            "unit": "days",
            "notes": "Per calendar year"
          },
          "paid": true,
          "eligibility": {
            "min_employment_duration": "90 days",
            "min_employer_size": 5,
            "other_requirements": [
              "Applies to private employers with 5+ employees"
            ]
          },
          "notice_requirement": "Reasonable advance notice when foreseeable",
          "job_protection": true
        }
      ],
      "official_url": "https://example.state.gov/laws/sick-leave",
      "last_updated": "2024-06-05T00:00:00Z",
      "notes": "May be used for employee's own illness or family member's illness."
    }
  ]
}
```

## Official Sources by State

| State | Department | Primary URL |
|-------|-----------|----------|
| AL | Department of Labor | www.alabamaworks.alabama.gov |
| AK | Department of Labor & Workforce Development | labor.alaska.gov |
| AZ | Department of Labor | azlabor.gov |
| AR | Department of Labor | labor.arkansas.gov |
| CA | Department of Industrial Relations | dir.ca.gov |
| CO | Department of Labor | colorado.gov/dol |
| CT | Department of Labor | ct.gov/dot |
| DE | Department of Labor | delaware.gov/labor |
| FL | Department of Economic Opportunity | floridajobs.org |
| GA | Department of Labor | dol.georgia.gov |
| HI | Department of Labor & Industrial Relations | labor.hawaii.gov |
| ID | Department of Labor | labor.idaho.gov |
| IL | Department of Labor | ildol.org |
| IN | Department of Labor | in.gov/dol |
| IA | Department of Labor | iowalaborboard.gov |
| KS | Department of Labor | dol.ks.gov |
| KY | Department of Labor | labor.ky.gov |
| LA | Department of Labor | ldhh.la.gov |
| ME | Department of Labor | maine.gov/labor |
| MD | Department of Labor | mdle.maryland.gov |
| MA | Department of Labor | mass.gov/dol |
| MI | Department of Labor & Economic Opportunity | michigan.gov/leo |
| MN | Department of Labor & Industry | pca.state.mn.us |
| MS | Department of Employment Security | mdes.ms.gov |
| MO | Department of Labor & Industrial Relations | labor.mo.gov |
| MT | Department of Labor & Industry | montanajobs.mt.gov |
| NE | Department of Labor | dol.nebraska.gov |
| NV | Division of Industrial Relations | ndep.nv.gov |
| NH | Department of Labor | nh.gov/labor |
| NJ | Department of Labor & Workforce Development | nj.gov/labor |
| NM | Department of Workforce Solutions | dws.state.nm.us |
| NC | Department of Commerce | commerce.nc.gov |
| ND | Department of Labor & Human Rights | nd.gov/labor |
| OH | Division of Industrial Compliance & Labor | ohiodislocatedworker.com |
| OK | Department of Labor | oklahoma.gov/labor |
| OR | Bureau of Labor & Industries | oregon.gov/boli |
| PA | Department of Labor & Industry | pa.gov/dli |
| RI | Department of Labor & Training | dlt.ri.gov |
| SC | Department of Employment & Workforce | scdew.org |
| SD | Department of Labor & Regulation | dlr.sd.gov |
| TN | Department of Labor & Workforce Development | tn.gov/workforce |
| TX | Texas Workforce Commission | twc.texas.gov |
| UT | Division of Antidiscrimination & Labor | antidiscriminationlabor.utah.gov |
| VT | Department of Labor | labor.vermont.gov |
| VA | Department of Labor & Industry | doli.virginia.gov |
| WA | Department of Labor & Industries | lni.wa.gov |
| WV | Division of Labor | labor.wv.gov |
| WI | Department of Safety & Professional Services | dsps.wi.gov |
| WY | Department of Workforce Services | wyomingworkforce.wyo.gov |

## Contribution Checklist

Before submitting your pull request:

- [ ] JSON is valid (use a JSON validator)
- [ ] All fields follow the schema exactly
- [ ] Official sources are linked
- [ ] Dates are in YYYY-MM-DD format
- [ ] Leave type enums match schema (sick, parental, bereavement, etc.)
- [ ] Eligibility requirements are complete
- [ ] Information is current as of the date in `last_updated`
- [ ] No typos or formatting issues
- [ ] File is located at `states/[STATE_CODE]/laws.json`

## Questions?

Refer to:
- Root `schema.json` for field definitions
- `federal/laws.json` for example formatting
- `CONTRIBUTING.md` for general guidelines

Open an issue if you need clarification!

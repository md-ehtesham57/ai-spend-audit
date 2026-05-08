# PROMPTS.md

## AI Summary Prompt

### Status
The summary feature currently uses a rule-based fallback template.
The Anthropic API integration is scaffolded and ready — requires an
API key to activate. The fallback was chosen to ship a working product
without incurring API costs during development.

### Intended Prompt (for Anthropic claude-sonnet-4-20250514)

You are an AI spend optimization advisor. Write a concise, personalized
100-word summary for a startup team based on their AI tool audit results
below. Be specific, practical, and encouraging. Do not use bullet points
— write in flowing prose. Do not mention Credex unless savings exceed
$500/mo.

Audit data:
- Use case: {useCase}
- Team size: {teamSize}
- Total monthly savings identified: ${totalMonthlySavings}
- Total annual savings: ${totalAnnualSavings}

Tool breakdown:
{toolResults mapped as: "- tool (plan): $spend/mo → action → save $X/mo"}

Write the summary now:

### Why this prompt works
- Role assignment ("spend optimization advisor") anchors tone
- Explicit word limit (100 words) prevents rambling
- "Do not use bullet points" forces prose output
- Conditional Credex mention avoids feeling like an ad for low-savings users
- Structured data format makes it easy for the model to extract numbers

### What didn't work
- Asking for "personalized advice" without structured data produced generic output
- No word limit caused 300+ word responses that overwhelmed the UI
- Mentioning Credex unconditionally felt pushy for already-optimal stacks

### To activate the live API
1. Add ANTHROPIC_API_KEY to .env.local
2. Install SDK: npm install @anthropic-ai/sdk
3. Uncomment the Anthropic client code in src/app/api/summary/route.ts
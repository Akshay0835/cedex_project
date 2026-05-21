import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AuditResult } from '@/types/audit';

export async function POST(request: Request) {
  try {
    const auditResult: AuditResult = await request.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      const anthropic = new Anthropic({ apiKey });
      const prompt = `You are a witty, professional fintech spend auditor.
Analyze the following JSON audit result of our AI spend:
${JSON.stringify(auditResult, null, 2)}

Provide a sharp, professional, and slightly witty/sarcastic financial summary.
Guidelines:
- Explain where the biggest leaks are (redundancy, over-provisioning, seat-vs-api).
- Keep it under 100 words.
- Tone: High-caliber VC CFO meets tech-savvy auditor.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 250,
        messages: [{ role: 'user', content: prompt }],
      });

      const summary = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
      if (summary) {
        return NextResponse.json({ summary });
      }
    }

    // Fallback Summary Generator if API key is not present
    const savings = auditResult.totalMonthlySavings;
    const recommendations = auditResult.recommendations;
    let fallbackSummary = '';

    if (savings === 0) {
      fallbackSummary = "Your SaaS spend is tighter than a drum. You are squeezing every drop of efficiency out of Cursor and your AI assistants. CFOs weep in your presence; there is literally nothing to optimize here. Keep keeping on, you productivity-obsessed legend.";
    } else if (savings > 500) {
      const majorIssue = recommendations[0]?.title || 'over-provisioning';
      fallbackSummary = `Houston, we have a leak. You're currently burning money faster than a GPU cluster training a 70B parameter model. With ${recommendations.length} major flags, primarily due to ${majorIssue}, you're spending like it's a 2021 VC-funded party. Consolidation is your best friend here. Trim the bloat and pocket $${savings}/mo.`;
    } else if (savings > 100) {
      fallbackSummary = `You're doing okay, but there's definitely loose change sliding down the sofa. You've got overlapping AI coding tools and team tiers where cheaper individual plans fit. Clean up those seat allocations, ditch the duplicate subscriptions, and reclaim a clean $${savings}/mo. Your balance sheet will thank you.`;
    } else {
      fallbackSummary = `Your SaaS portfolio is almost optimized, but you're still leaving about $${savings}/mo on the table. A quick tweak to seat tiers or pruning a single redundant license will patch up the minor leaks. You're in the green zone, just needs a tiny polish!`;
    }

    return NextResponse.json({ summary: fallbackSummary });
  } catch (error: any) {
    console.error('Error in summarize API:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary', message: error.message },
      { status: 500 }
    );
  }
}

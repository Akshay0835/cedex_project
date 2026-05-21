import { UserPayload, AuditResult, AuditRecommendation } from '@/types/audit';
import { PRICING_DATA } from '@/constants/pricing';

function getToolPrice(toolId: string, tierId: string): number {
  const tool = PRICING_DATA[toolId];
  if (!tool) return 0;
  const tier = tool.tiers[tierId];
  return tier ? tier.pricePerSeat : 0;
}

export function runAudit(payload: UserPayload): AuditResult {
  const { teamSize, primaryUseCase, tools } = payload;
  
  // Calculate current spend
  let totalCurrentSpend = 0;
  Object.entries(tools).forEach(([toolId, config]) => {
    const price = getToolPrice(toolId, config.tier);
    totalCurrentSpend += price * config.seats;
  });

  const recommendations: AuditRecommendation[] = [];
  const recommendedTools = JSON.parse(JSON.stringify(tools));

  // Rule 1: Redundancy check (Cursor Pro/Business + Copilot Individual/Business)
  const hasCursor = tools.cursor.tier === 'pro' || tools.cursor.tier === 'business';
  const hasCopilot = tools.copilot.tier === 'individual' || tools.copilot.tier === 'business';
  
  if (hasCursor && hasCopilot && tools.copilot.seats > 0) {
    const copilotPrice = getToolPrice('copilot', tools.copilot.tier);
    const currentCopilotCost = copilotPrice * tools.copilot.seats;
    
    recommendedTools.copilot.tier = 'none';
    recommendedTools.copilot.seats = 0;
    
    recommendations.push({
      id: 'redundancy-copilot',
      tool: 'GitHub Copilot',
      type: 'redundancy',
      severity: 'high',
      title: 'Redundant Copilot + Cursor Setup',
      description: 'Since your team uses Cursor (which has built-in AI completions and chat), maintaining separate GitHub Copilot licenses is redundant. We recommend cancelling GitHub Copilot.',
      currentCost: currentCopilotCost,
      recommendedCost: 0,
      monthlySavings: currentCopilotCost,
    });
  }

  // Rule 2: API vs Seat check (primaryUseCase === 'api_direct')
  if (primaryUseCase === 'api_direct') {
    // ChatGPT seats to API
    if ((tools.chatgpt.tier === 'team' || tools.chatgpt.tier === 'enterprise') && tools.chatgpt.seats > 0) {
      const currentCost = getToolPrice('chatgpt', tools.chatgpt.tier) * tools.chatgpt.seats;
      recommendedTools.chatgpt.tier = 'none';
      recommendedTools.chatgpt.seats = 0;
      recommendations.push({
        id: 'api-vs-seat-chatgpt',
        tool: 'ChatGPT',
        type: 'api_vs_seat',
        severity: 'high',
        title: 'ChatGPT Seat vs. API Direct Billing',
        description: 'Your primary use case is direct API integration. We recommend migrating from ChatGPT Team/Enterprise seat licenses to a pay-as-you-go OpenAI API key configuration.',
        currentCost,
        recommendedCost: 0,
        monthlySavings: currentCost,
      });
    }

    // Claude seats to API
    if ((tools.claude.tier === 'team' || tools.claude.tier === 'pro') && tools.claude.seats > 0) {
      const currentCost = getToolPrice('claude', tools.claude.tier) * tools.claude.seats;
      recommendedTools.claude.tier = 'none';
      recommendedTools.claude.seats = 0;
      recommendations.push({
        id: 'api-vs-seat-claude',
        tool: 'Claude',
        type: 'api_vs_seat',
        severity: 'high',
        title: 'Claude Seat vs. Anthropic API Direct Billing',
        description: 'Your primary use case is direct API integration. We recommend migrating Claude Pro/Team seats to Anthropic API pay-as-you-go keys.',
        currentCost,
        recommendedCost: 0,
        monthlySavings: currentCost,
      });
    }

    // Gemini seats to API
    if (tools.gemini.tier === 'advanced' && tools.gemini.seats > 0) {
      const currentCost = getToolPrice('gemini', tools.gemini.tier) * tools.gemini.seats;
      recommendedTools.gemini.tier = 'api';
      recommendedTools.gemini.seats = 0;
      recommendations.push({
        id: 'api-vs-seat-gemini',
        tool: 'Gemini',
        type: 'api_vs_seat',
        severity: 'medium',
        title: 'Gemini Advanced vs. Google AI Studio API',
        description: 'Your primary use case is direct API integration. Switch Gemini Advanced seats to Google AI Studio pay-as-you-go API keys.',
        currentCost,
        recommendedCost: 0,
        monthlySavings: currentCost,
      });
    }
  }

  // Rule 3: Over-provisioning check (teamSize < 3 and user is on Team/Enterprise plans)
  if (teamSize < 3) {
    // ChatGPT over-provisioning
    if (
      recommendedTools.chatgpt.tier !== 'none' &&
      recommendedTools.chatgpt.seats > 0 &&
      (recommendedTools.chatgpt.tier === 'team' || recommendedTools.chatgpt.tier === 'enterprise')
    ) {
      const currentCost = getToolPrice('chatgpt', recommendedTools.chatgpt.tier) * recommendedTools.chatgpt.seats;
      const recommendedCost = getToolPrice('chatgpt', 'plus') * recommendedTools.chatgpt.seats;
      const savings = currentCost - recommendedCost;
      
      if (savings > 0) {
        recommendedTools.chatgpt.tier = 'plus';
        recommendations.push({
          id: 'overprovision-chatgpt',
          tool: 'ChatGPT',
          type: 'over_provisioning',
          severity: 'medium',
          title: 'Over-provisioned ChatGPT Team/Enterprise',
          description: `With a team size of ${teamSize}, paying for Team/Enterprise plans is inefficient. We recommend downgrading to ChatGPT Plus.`,
          currentCost,
          recommendedCost,
          monthlySavings: savings,
        });
      }
    }

    // Claude over-provisioning
    if (
      recommendedTools.claude.tier !== 'none' &&
      recommendedTools.claude.seats > 0 &&
      recommendedTools.claude.tier === 'team'
    ) {
      const currentCost = getToolPrice('claude', recommendedTools.claude.tier) * recommendedTools.claude.seats;
      const recommendedCost = getToolPrice('claude', 'pro') * recommendedTools.claude.seats;
      const savings = currentCost - recommendedCost;
      
      if (savings > 0) {
        recommendedTools.claude.tier = 'pro';
        recommendations.push({
          id: 'overprovision-claude',
          tool: 'Claude',
          type: 'over_provisioning',
          severity: 'medium',
          title: 'Over-provisioned Claude Team',
          description: `With a team size of ${teamSize}, Claude Team is over-provisioned. We recommend downgrading to Claude Pro.`,
          currentCost,
          recommendedCost,
          monthlySavings: savings,
        });
      }
    }

    // Cursor over-provisioning
    if (
      recommendedTools.cursor.tier !== 'none' &&
      recommendedTools.cursor.seats > 0 &&
      recommendedTools.cursor.tier === 'business'
    ) {
      const currentCost = getToolPrice('cursor', recommendedTools.cursor.tier) * recommendedTools.cursor.seats;
      const recommendedCost = getToolPrice('cursor', 'pro') * recommendedTools.cursor.seats;
      const savings = currentCost - recommendedCost;
      
      if (savings > 0) {
        recommendedTools.cursor.tier = 'pro';
        recommendations.push({
          id: 'overprovision-cursor',
          tool: 'Cursor',
          type: 'over_provisioning',
          severity: 'medium',
          title: 'Over-provisioned Cursor Business',
          description: `With a team size of ${teamSize}, Cursor Business licenses are unnecessary. We recommend downgrading to Cursor Pro.`,
          currentCost,
          recommendedCost,
          monthlySavings: savings,
        });
      }
    }

    // Copilot over-provisioning
    if (
      recommendedTools.copilot.tier !== 'none' &&
      recommendedTools.copilot.seats > 0 &&
      recommendedTools.copilot.tier === 'business'
    ) {
      const currentCost = getToolPrice('copilot', recommendedTools.copilot.tier) * recommendedTools.copilot.seats;
      const recommendedCost = getToolPrice('copilot', 'individual') * recommendedTools.copilot.seats;
      const savings = currentCost - recommendedCost;
      
      if (savings > 0) {
        recommendedTools.copilot.tier = 'individual';
        recommendations.push({
          id: 'overprovision-copilot',
          tool: 'GitHub Copilot',
          type: 'over_provisioning',
          severity: 'medium',
          title: 'Over-provisioned Copilot Business',
          description: `With a team size of ${teamSize}, Copilot Business is inefficient. We recommend downgrading to Copilot Individual.`,
          currentCost,
          recommendedCost,
          monthlySavings: savings,
        });
      }
    }
  }

  // Calculate recommended spend
  let totalRecommendedSpend = 0;
  Object.entries(recommendedTools).forEach(([toolId, config]: [string, any]) => {
    const price = getToolPrice(toolId, config.tier);
    totalRecommendedSpend += price * config.seats;
  });

  const totalMonthlySavings = Math.max(0, totalCurrentSpend - totalRecommendedSpend);
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    payload,
    totalCurrentSpend,
    totalRecommendedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    recommendations,
    timestamp: Date.now(),
  };
}

export interface ToolConfig {
  tier: string;
  seats: number;
}

export interface UserPayload {
  companyName: string;
  teamSize: number;
  primaryUseCase: 'coding' | 'content' | 'research' | 'api_direct' | 'general';
  tools: {
    cursor: ToolConfig;
    chatgpt: ToolConfig;
    claude: ToolConfig;
    gemini: ToolConfig;
    copilot: ToolConfig;
  };
}

export interface AuditRecommendation {
  id: string;
  tool: string;
  type: 'redundancy' | 'over_provisioning' | 'api_vs_seat' | 'savings';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  currentCost: number;
  recommendedCost: number;
  monthlySavings: number;
}

export interface AuditResult {
  payload: UserPayload;
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  recommendations: AuditRecommendation[];
  timestamp: number;
}

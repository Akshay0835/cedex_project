export interface PricingTier {
  id: string;
  name: string;
  pricePerSeat: number;
  isPerSeat: boolean;
}

export interface ToolPricing {
  id: string;
  name: string;
  tiers: Record<string, PricingTier>;
}

export const PRICING_DATA: Record<string, ToolPricing> = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    tiers: {
      none: { id: 'none', name: 'None', pricePerSeat: 0, isPerSeat: true },
      hobby: { id: 'hobby', name: 'Hobby', pricePerSeat: 0, isPerSeat: true },
      pro: { id: 'pro', name: 'Pro', pricePerSeat: 20, isPerSeat: true },
      business: { id: 'business', name: 'Business', pricePerSeat: 40, isPerSeat: true },
    },
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    tiers: {
      none: { id: 'none', name: 'None', pricePerSeat: 0, isPerSeat: true },
      plus: { id: 'plus', name: 'Plus', pricePerSeat: 20, isPerSeat: true },
      team: { id: 'team', name: 'Team', pricePerSeat: 25, isPerSeat: true },
      enterprise: { id: 'enterprise', name: 'Enterprise (Est.)', pricePerSeat: 60, isPerSeat: true },
    },
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    tiers: {
      none: { id: 'none', name: 'None', pricePerSeat: 0, isPerSeat: true },
      free: { id: 'free', name: 'Free', pricePerSeat: 0, isPerSeat: true },
      pro: { id: 'pro', name: 'Pro', pricePerSeat: 20, isPerSeat: true },
      team: { id: 'team', name: 'Team', pricePerSeat: 30, isPerSeat: true },
    },
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    tiers: {
      none: { id: 'none', name: 'None', pricePerSeat: 0, isPerSeat: true },
      api: { id: 'api', name: 'API (Pay-as-you-go)', pricePerSeat: 0, isPerSeat: true },
      advanced: { id: 'advanced', name: 'Advanced', pricePerSeat: 20, isPerSeat: true },
    },
  },
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    tiers: {
      none: { id: 'none', name: 'None', pricePerSeat: 0, isPerSeat: true },
      individual: { id: 'individual', name: 'Individual', pricePerSeat: 10, isPerSeat: true },
      business: { id: 'business', name: 'Business', pricePerSeat: 19, isPerSeat: true },
    },
  },
};

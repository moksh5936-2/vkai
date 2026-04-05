export const PLAN_LIMITS = {
  FREE: {
    chat: 5,
    pitch: 1,
    pitchDeck: 0,
    leads: 0,
  },
  STARTER: {
    chat: 50,
    pitch: 3,
    pitchDeck: 1,
    leads: 3,
  },
  PRO: {
    chat: 200,
    pitch: 15,
    pitchDeck: 10,
    leads: 20,
  },
  ENTERPRISE: {
    chat: 999999,
    pitch: 999999,
    pitchDeck: 999999,
    leads: 999999,
  },
};

export type PlanType = keyof typeof PLAN_LIMITS;

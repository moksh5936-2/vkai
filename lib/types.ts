

import { JourneyStage, type StartupJourney } from "@prisma/client";

export { JourneyStage };
export type { StartupJourney };

export interface JourneyTask {
  title: string;
  description: string;
  priority: number;
  completed?: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  subscription?: {
    plan: string;
    expiresAt?: Date | null;
  } | null;
}

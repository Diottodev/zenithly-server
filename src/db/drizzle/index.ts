import { account } from './account.ts';
import { session } from './session.ts';
import { tutorialProgress } from './tutorial-progress.ts';
import { user } from './user.ts';
import { userIntegrations } from './user-integration.ts';
import { verification } from './verification.ts';

export const schema = {
  user,
  account,
  session,
  tutorialProgress,
  userIntegrations,
  verification,
};

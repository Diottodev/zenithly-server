CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"token" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutorialProgress" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"step" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userIntegrations" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"googleCalendarEnabled" boolean DEFAULT false NOT NULL,
	"googleCalendarAccessToken" text,
	"googleCalendarRefreshToken" text,
	"googleCalendarTokenExpiresAt" timestamp,
	"gmailEnabled" boolean DEFAULT false NOT NULL,
	"gmailAccessToken" text,
	"gmailRefreshToken" text,
	"gmailTokenExpiresAt" timestamp,
	"outlookEnabled" boolean DEFAULT false NOT NULL,
	"outlookAccessToken" text,
	"outlookRefreshToken" text,
	"outlookTokenExpiresAt" timestamp,
	"settings" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"hasCompletedOnboarding" boolean DEFAULT false NOT NULL,
	"onboardingStep" text DEFAULT 'welcome'
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutorialProgress" ADD CONSTRAINT "tutorialProgress_user_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userIntegrations" ADD CONSTRAINT "userIntegrations_user_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_accountId_unique" ON "account" USING btree ("userId","accountId");--> statement-breakpoint
CREATE INDEX "session_token_unique" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "tutorialProgress_userId_step_unique" ON "tutorialProgress" USING btree ("userId","step");--> statement-breakpoint
CREATE INDEX "userIntegrations_userId_unique" ON "userIntegrations" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_email_unique" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verification_identifier_unique" ON "verification" USING btree ("identifier");
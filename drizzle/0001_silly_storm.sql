CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`role` varchar(64) NOT NULL,
	`status` enum('idle','busy','error','paused') NOT NULL DEFAULT 'idle',
	`currentTaskId` int,
	`capabilities` json,
	`maxContextLength` int DEFAULT 16000,
	`tasksCompleted` int DEFAULT 0,
	`totalTokensUsed` int DEFAULT 0,
	`averageResponseTime` decimal(10,2) DEFAULT '0',
	`successRate` decimal(5,2) DEFAULT '100',
	`lastActivityAt` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`model` varchar(64),
	`tokensUsed` int,
	`cost` decimal(10,4),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`modelUsed` varchar(64) NOT NULL,
	`totalTokensUsed` int DEFAULT 0,
	`totalCost` decimal(10,4) DEFAULT '0',
	`messageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generatedSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`skillCode` text,
	`generatedFrom` varchar(255),
	`successRate` decimal(5,2) DEFAULT '0',
	`usageCount` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`performanceMetrics` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generatedSkills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledgeBase` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` varchar(64),
	`embedding` json,
	`source` varchar(255),
	`relevanceScore` decimal(5,2),
	`accessCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledgeBase_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`provider` varchar(64) NOT NULL,
	`contextLength` int,
	`costPer1kInputTokens` decimal(10,6),
	`costPer1kOutputTokens` decimal(10,6),
	`supportsVision` boolean DEFAULT false,
	`supportsStreaming` boolean DEFAULT true,
	`capabilities` json,
	`isAvailable` boolean DEFAULT true,
	`totalUsageCount` int DEFAULT 0,
	`totalTokensUsed` int DEFAULT 0,
	`totalCost` decimal(10,4) DEFAULT '0',
	`averageLatencyMs` decimal(10,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `models_id` PRIMARY KEY(`id`),
	CONSTRAINT `models_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `systemMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`totalTasksCompleted` int DEFAULT 0,
	`totalTasksFailed` int DEFAULT 0,
	`successRate` decimal(5,2) DEFAULT '100',
	`averageResponseTimeMs` decimal(10,2) DEFAULT '0',
	`totalTokensUsed` int DEFAULT 0,
	`totalCostUSD` decimal(12,4) DEFAULT '0',
	`activeAgents` int DEFAULT 0,
	`idleAgents` int DEFAULT 0,
	`errorAgents` int DEFAULT 0,
	`systemHealth` decimal(5,2) DEFAULT '100',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `systemMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`agentId` int,
	`status` enum('pending','running','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`input` json,
	`output` json,
	`error` text,
	`tokensUsed` int DEFAULT 0,
	`estimatedCost` decimal(10,4) DEFAULT '0',
	`actualCost` decimal(10,4) DEFAULT '0',
	`executionTimeMs` int,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);

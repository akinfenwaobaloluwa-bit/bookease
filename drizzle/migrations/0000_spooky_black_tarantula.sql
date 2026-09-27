CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`service_id` int NOT NULL,
	`customer_name` varchar(120) NOT NULL,
	`customer_phone` varchar(30) NOT NULL,
	`customer_email` varchar(160),
	`booking_date` varchar(10) NOT NULL,
	`start_time` varchar(5) NOT NULL,
	`note` text,
	`status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`description` text,
	`whatsapp_number` varchar(20) NOT NULL,
	`phone` varchar(30),
	`address` varchar(255),
	`primary_color` varchar(20) NOT NULL DEFAULT '#7c3aed',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`),
	CONSTRAINT `businesses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`currency` varchar(5) NOT NULL DEFAULT 'NGN',
	`duration_minutes` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);

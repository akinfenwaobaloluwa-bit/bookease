CREATE TABLE `availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`day_of_week` int NOT NULL,
	`is_open` boolean NOT NULL DEFAULT true,
	`start_time` varchar(5) NOT NULL,
	`end_time` varchar(5) NOT NULL,
	CONSTRAINT `availability_id` PRIMARY KEY(`id`)
);

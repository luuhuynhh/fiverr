create database db_fiverr;
use db_fiverr;

create table `user` (
	`user_id` int primary key auto_increment,
    `full_name` varchar(255) not null,
    `email` varchar(255) not null,
    `password` varchar(255) not null,
    `phone` varchar(20),
	`birthday` date,
    `gender` varchar(6),
    `role` varchar(6), 
    `skills` text,
    `avatar` mediumtext
);

create table `skill` (
	`skill_id` int primary key auto_increment,
    `skill_name` varchar(255) not null
);

create table `category` (
	`category_id` int primary key auto_increment,
    `category_name` varchar(255) not null
);

create table `job` (
	`job_id` int primary key auto_increment,
    `job_name` varchar(255) not null,
    `job_price` double not null,
    `job_description` text,
    `job_category` int,
    `creator` int,
    constraint FK_Job_Category_1 foreign key (`job_category`) references `category` (`category_id`),
    constraint FK_Job_User_1 foreign key (`creator`) references `user` (`user_id`)
);

create table `job_image` (
	`image_id` int primary key auto_increment,
    `path` mediumtext not null,
    `job` int,
    constraint FK_Image_Job foreign key (`job`) references `job` (`job_id`)
);

create table `hire_job` (
	`id` int primary key auto_increment,
    `job` int not null,
    `employee` int not null,
    `hire_date` date not null,
    `is_solved` bool not null,
    `status` enum('resolve', 'reject'),
    constraint FK_Hire_Job foreign key (`job`) references `job` (`job_id`),
    constraint FK_Hire_User foreign key (`employee`) references `user` (`user_id`)
);

create table `review`(
	`review_id` int primary key auto_increment,
    `job` int not null,
    `author` int not null,
    `review_date` date not null,
    `content` text not null,
    `star` int not null,
    constraint FK_Comment_Job foreign key (`job`) references `job` (`job_id`),
    constraint FK_Comment_User foreign key (`author`) references `user` (`user_id`)
);


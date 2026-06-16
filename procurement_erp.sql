-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 15, 2026 at 04:10 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `procurement_erp`
--

-- --------------------------------------------------------

--
-- Table structure for table `boqs`
--

CREATE TABLE `boqs` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `boqs`
--

INSERT INTO `boqs` (`id`, `project_id`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `boq_items`
--

CREATE TABLE `boq_items` (
  `id` int(11) NOT NULL,
  `boq_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `ref_code` varchar(20) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `qty` decimal(12,2) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `rate` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `boq_items`
--

INSERT INTO `boq_items` (`id`, `boq_id`, `parent_id`, `ref_code`, `name`, `description`, `qty`, `unit`, `rate`) VALUES
(1, 1, NULL, '1.0', 'Joinery Works', NULL, NULL, NULL, NULL),
(2, 1, 1, '1.1', 'Interior Doors', NULL, NULL, NULL, NULL),
(3, 1, 2, '1.1.1', 'Concealed Door', 'Structural drawings, load calculation, stability reports and certificate; third-party consultancy (DM-approved engineer) consultation and assessment fees for the existing structural drawings; documentation submission and approval fees; pre-approval service to obtain NOC, drawing submissions and coordination, estimation and inspection; as-built drawings and other documentation.', 1.00, 'Item', 150000.00);

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `default_unit` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`id`, `category_id`, `name`, `default_unit`) VALUES
(1, 2, 'MDF 12X300MM', 'SQM'),
(2, 4, 'Concealed Hinge 35mm', 'No');

-- --------------------------------------------------------

--
-- Table structure for table `material_categories`
--

CREATE TABLE `material_categories` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `material_categories`
--

INSERT INTO `material_categories` (`id`, `parent_id`, `name`) VALUES
(1, NULL, 'Wood'),
(2, 1, 'Boards & Panels'),
(3, NULL, 'Hardware'),
(4, 3, 'Hinges & Fittings');

-- --------------------------------------------------------

--
-- Table structure for table `material_requests`
--

CREATE TABLE `material_requests` (
  `id` int(11) NOT NULL,
  `mr_number` varchar(30) NOT NULL,
  `project_id` int(11) NOT NULL,
  `requestor_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `required_date` date NOT NULL,
  `purpose` varchar(60) NOT NULL,
  `stage` enum('Draft','QS Price Check','Approved','Ordered','Completed') NOT NULL DEFAULT 'Draft',
  `status` enum('Paid','Unpaid') NOT NULL DEFAULT 'Unpaid',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `material_requests`
--

INSERT INTO `material_requests` (`id`, `mr_number`, `project_id`, `requestor_id`, `supplier_id`, `required_date`, `purpose`, `stage`, `status`, `created_at`) VALUES
(1, 'MR-2026-001', 1, 1, 1, '2026-06-25', 'New Work', 'Completed', 'Paid', '2026-06-13 19:08:19'),
(2, 'MR-2026-002', 1, 1, 2, '2026-06-28', 'New Work', 'QS Price Check', 'Unpaid', '2026-06-13 19:08:19');

-- --------------------------------------------------------

--
-- Table structure for table `mr_line_items`
--

CREATE TABLE `mr_line_items` (
  `id` int(11) NOT NULL,
  `mr_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `boq_item_id` int(11) NOT NULL,
  `qty` decimal(12,2) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `mr_line_items` (`id`, `mr_id`, `material_id`, `boq_item_id`, `qty`, `unit`, `unit_price`) VALUES
(1, 1, 1, 3, 100.00, 'SQM', 10.00),
(2, 2, 2, 3, 20.00, 'No', 25.00);


CREATE TABLE `mr_tags` (
  `mr_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `mr_tags` (`mr_id`, `tag_id`) VALUES
(2, 1);


CREATE TABLE `price_history` (
  `id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `quoted_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `area_sqm` int(11) NOT NULL,
  `location` varchar(150) NOT NULL,
  `scope` varchar(150) NOT NULL,
  `budget` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `projects` (`id`, `name`, `area_sqm`, `location`, `scope`, `budget`) VALUES
(1, 'Private Villa, Test', 12000, 'Dubai, UAE', 'Interior Fit Out', 100000.00);


CREATE TABLE `requestors` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `department` varchar(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `requestors` (`id`, `name`, `department`) VALUES
(1, 'Shinto Antony', 'Joinery Works');



CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `location` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `suppliers` (`id`, `name`, `location`) VALUES
(1, 'Al Manara Building Materials Trading LLC', 'Dubai, UAE'),
(2, 'Gulf Fixings & Hardware Trading LLC', 'Dubai, UAE');



CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `tags` (`id`, `name`) VALUES
(2, 'Budget overrun'),
(1, 'Important');


ALTER TABLE `boqs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_boq_project` (`project_id`);


ALTER TABLE `boq_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_boqitem_boq` (`boq_id`),
  ADD KEY `idx_boq_parent` (`parent_id`);

ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_material_category` (`category_id`);


ALTER TABLE `material_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_material_category_parent` (`parent_id`);

ALTER TABLE `material_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mr_number` (`mr_number`),
  ADD KEY `idx_mr_project` (`project_id`),
  ADD KEY `idx_mr_supplier` (`supplier_id`),
  ADD KEY `idx_mr_requestor` (`requestor_id`);


ALTER TABLE `mr_line_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_mrline_mr` (`mr_id`),
  ADD KEY `idx_mrline_material` (`material_id`),
  ADD KEY `idx_mrline_boqitem` (`boq_item_id`);


ALTER TABLE `mr_tags`
  ADD PRIMARY KEY (`mr_id`,`tag_id`),
  ADD KEY `fk_mrtag_tag` (`tag_id`);


ALTER TABLE `price_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_price_material` (`material_id`),
  ADD KEY `idx_price_supplier` (`supplier_id`);

ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `requestors`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);


ALTER TABLE `boqs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;


ALTER TABLE `boq_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `material_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;


ALTER TABLE `material_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `mr_line_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;


ALTER TABLE `price_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `requestors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;


ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;


ALTER TABLE `boqs`
  ADD CONSTRAINT `fk_boq_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

ALTER TABLE `boq_items`
  ADD CONSTRAINT `fk_boqitem_boq` FOREIGN KEY (`boq_id`) REFERENCES `boqs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_boqitem_parent` FOREIGN KEY (`parent_id`) REFERENCES `boq_items` (`id`) ON DELETE CASCADE;

ALTER TABLE `materials`
  ADD CONSTRAINT `fk_material_category` FOREIGN KEY (`category_id`) REFERENCES `material_categories` (`id`);


ALTER TABLE `material_categories`
  ADD CONSTRAINT `fk_material_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `material_categories` (`id`) ON DELETE CASCADE;


ALTER TABLE `material_requests`
  ADD CONSTRAINT `fk_mr_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `fk_mr_requestor` FOREIGN KEY (`requestor_id`) REFERENCES `requestors` (`id`),
  ADD CONSTRAINT `fk_mr_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`);

ALTER TABLE `mr_line_items`
  ADD CONSTRAINT `fk_mrline_boqitem` FOREIGN KEY (`boq_item_id`) REFERENCES `boq_items` (`id`),
  ADD CONSTRAINT `fk_mrline_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  ADD CONSTRAINT `fk_mrline_mr` FOREIGN KEY (`mr_id`) REFERENCES `material_requests` (`id`) ON DELETE CASCADE;


ALTER TABLE `mr_tags`
  ADD CONSTRAINT `fk_mrtag_mr` FOREIGN KEY (`mr_id`) REFERENCES `material_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_mrtag_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;


ALTER TABLE `price_history`
  ADD CONSTRAINT `fk_price_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  ADD CONSTRAINT `fk_price_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- x67secretme database export
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `id` varchar(191) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `providerAccountId` varchar(191) NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `expires_at` int(11) DEFAULT NULL,
  `token_type` varchar(191) DEFAULT NULL,
  `scope` varchar(191) DEFAULT NULL,
  `id_token` text DEFAULT NULL,
  `session_state` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Account_provider_providerAccountId_key` (`provider`,`providerAccountId`),
  KEY `Account_userId_fkey` (`userId`),
  CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `image` longtext DEFAULT NULL,
  `isFeatured` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Category_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `category` (`id`, `name`, `createdAt`, `updatedAt`, `order`, `image`, `isFeatured`) VALUES ('3cb6f859-6fed-4bca-9e09-0a8a4c297575', '[ บริการ Account ต่างๆ ]', '2026-05-24 20:03:02', '2026-06-08 05:34:29', 0, 'https://cdn.discordapp.com/attachments/1511686390369226912/1513521579567616071/Account.png?ex=6a280850&is=6a26b6d0&hm=ab03410af587806cf1da7514b265411ba9751a508a803e2fc3f6523e8f247148&', 1);
INSERT INTO `category` (`id`, `name`, `createdAt`, `updatedAt`, `order`, `image`, `isFeatured`) VALUES ('9beec17c-82b5-4c77-993a-44fd3211acbd', '[ External Roblox ]', '2026-05-25 07:22:51', '2026-06-08 05:30:17', 0, 'https://cdn.discordapp.com/attachments/1511686390369226912/1513520424753954906/Roblox.png?ex=6a28073d&is=6a26b5bd&hm=a694a16df9456ac1583b41d1349a10fc160221c0c81d8778c1f2f81d725b9b94&', 1);
INSERT INTO `category` (`id`, `name`, `createdAt`, `updatedAt`, `order`, `image`, `isFeatured`) VALUES ('c37a331d-9367-4082-89e8-5b9759a47b21', '[ FIVEM ]', '2026-06-08 05:30:38', '2026-06-08 05:30:38', 0, 'https://cdn.discordapp.com/attachments/1511686390369226912/1513520418085011456/FiveM.png?ex=6a28073b&is=6a26b5bb&hm=9e7b83fbaf29aeb27978dad6a056690a00268710e736a7f85932157483099378&', 1);
INSERT INTO `category` (`id`, `name`, `createdAt`, `updatedAt`, `order`, `image`, `isFeatured`) VALUES ('d055e6d5-f7ba-4b4b-8e00-e557c4e6ab2c', '[ AIM COLOR]', '2026-06-07 20:02:02', '2026-06-08 05:30:10', 0, 'https://cdn.discordapp.com/attachments/1511686390369226912/1513520431661977750/Valorant.png?ex=6a28073e&is=6a26b5be&hm=a088741f1db7293c3354eb0838931684300b236a7f967ba6b3f78d8edef3a35c&', 1);

DROP TABLE IF EXISTS `coupon`;
CREATE TABLE `coupon` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `type` enum('PERCENT','FIXED') NOT NULL DEFAULT 'PERCENT',
  `value` double NOT NULL,
  `minPurchase` double NOT NULL DEFAULT 0,
  `maxDiscount` double DEFAULT NULL,
  `usageLimit` int(11) DEFAULT NULL,
  `usedCount` int(11) NOT NULL DEFAULT 0,
  `startDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `endDate` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Coupon_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `couponusage`;
CREATE TABLE `couponusage` (
  `id` varchar(191) NOT NULL,
  `userId` int(11) NOT NULL,
  `couponId` varchar(191) NOT NULL,
  `orderId` int(11) DEFAULT NULL,
  `usedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `CouponUsage_userId_couponId_key` (`userId`,`couponId`),
  KEY `CouponUsage_couponId_fkey` (`couponId`),
  CONSTRAINT `CouponUsage_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `coupon` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CouponUsage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `hwidprogram`;
CREATE TABLE `hwidprogram` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `price` double NOT NULL DEFAULT 20,
  `productId` varchar(191) DEFAULT NULL,
  `apiEndpoint` text DEFAULT NULL,
  `apiKey` text DEFAULT NULL,
  `apiKeyHeader` varchar(191) DEFAULT 'Authorization',
  `licenseKeyField` varchar(191) NOT NULL DEFAULT 'license',
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `HwidProgram_isActive_sortOrder_idx` (`isActive`,`sortOrder`),
  KEY `HwidProgram_productId_fkey` (`productId`),
  CONSTRAINT `HwidProgram_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `hwidresetlog`;
CREATE TABLE `hwidresetlog` (
  `id` varchar(191) NOT NULL,
  `userId` int(11) NOT NULL,
  `programId` varchar(191) NOT NULL,
  `licenseKey` varchar(512) NOT NULL,
  `price` double NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  `apiResponse` text DEFAULT NULL,
  `errorMsg` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `HwidResetLog_userId_createdAt_idx` (`userId`,`createdAt`),
  KEY `HwidResetLog_programId_idx` (`programId`),
  CONSTRAINT `HwidResetLog_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `hwidprogram` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `HwidResetLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `licensekey`;
CREATE TABLE `licensekey` (
  `id` varchar(191) NOT NULL,
  `key` varchar(64) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `orderId` int(11) DEFAULT NULL,
  `hwid` varchar(512) DEFAULT NULL,
  `status` enum('ACTIVE','REVOKED','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  `durationDays` int(11) DEFAULT NULL,
  `expiresAt` datetime(3) DEFAULT NULL,
  `lastValidatedAt` datetime(3) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `LicenseKey_key_key` (`key`),
  KEY `LicenseKey_productId_status_idx` (`productId`,`status`),
  KEY `LicenseKey_userId_idx` (`userId`),
  KEY `LicenseKey_orderId_idx` (`orderId`),
  CONSTRAINT `LicenseKey_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `LicenseKey_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `LicenseKey_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `productName` varchar(191) NOT NULL,
  `productImage` text DEFAULT NULL,
  `price` double NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `status` enum('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `couponDiscount` double NOT NULL DEFAULT 0,
  `couponId` varchar(191) DEFAULT NULL,
  `pointsEarned` int(11) NOT NULL DEFAULT 0,
  `pointsUsed` int(11) NOT NULL DEFAULT 0,
  `totalPrice` double NOT NULL,
  `optionLabel` varchar(191) DEFAULT NULL,
  `productOptionId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Order_userId_fkey` (`userId`),
  KEY `Order_productId_fkey` (`productId`),
  KEY `Order_couponId_fkey` (`couponId`),
  KEY `Order_productOptionId_fkey` (`productOptionId`),
  CONSTRAINT `Order_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `coupon` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Order_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Order_productOptionId_fkey` FOREIGN KEY (`productOptionId`) REFERENCES `productoption` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `order` (`id`, `userId`, `productId`, `productName`, `productImage`, `price`, `quantity`, `status`, `createdAt`, `updatedAt`, `couponDiscount`, `couponId`, `pointsEarned`, `pointsUsed`, `totalPrice`, `optionLabel`, `productOptionId`) VALUES (1, 2, '5190bb07-a2d6-42d5-b244-510e48c01cc7', 'Steam', 'https://cdn.discordapp.com/attachments/1505738621037314109/1508308316080701470/image_2026-03-15_073215031.png?ex=6a151115&is=6a13bf95&hm=914acbfd884c72e632af6ddea536668695795376d618e790718dddca75d683f3&', 3, 1, 'SUCCESS', '2026-05-24 20:49:31', '2026-05-24 20:49:31', 0, NULL, 0, 0, 3, NULL, NULL);
INSERT INTO `order` (`id`, `userId`, `productId`, `productName`, `productImage`, `price`, `quantity`, `status`, `createdAt`, `updatedAt`, `couponDiscount`, `couponId`, `pointsEarned`, `pointsUsed`, `totalPrice`, `optionLabel`, `productOptionId`) VALUES (2, 2, '0a298c34-57a9-4976-ace3-b10c3869b938', 'AIMCOLOR รันบนเว็บไซต์ (1 วัน)', 'https://cdn.discordapp.com/attachments/1511686390369226912/1513377436480569415/Logo_X67-SECRETME.png?ex=6a278212&is=6a263092&hm=bb20e13924fc679dba4556e6bc468d520f7b610a7ddc3734692651cd82a00725&', 30, 1, 'SUCCESS', '2026-06-08 07:14:15', '2026-06-08 07:14:15', 0, NULL, 0, 0, 30, '1 วัน', 'd6099cad-5012-4bc7-9e19-8b0fa2d6516b');

DROP TABLE IF EXISTS `pointshistory`;
CREATE TABLE `pointshistory` (
  `id` varchar(191) NOT NULL,
  `userId` int(11) NOT NULL,
  `points` int(11) NOT NULL,
  `type` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `orderId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `PointsHistory_userId_idx` (`userId`),
  CONSTRAINT `PointsHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `price` double NOT NULL,
  `discount` double DEFAULT 0,
  `image` longtext DEFAULT NULL,
  `isUnlimited` tinyint(1) NOT NULL DEFAULT 0,
  `isHot` tinyint(1) NOT NULL DEFAULT 0,
  `badge` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `pointsEarn` int(11) NOT NULL DEFAULT 0,
  `generatesLicenseKey` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `Product_categoryId_fkey` (`categoryId`),
  CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `product` (`id`, `name`, `description`, `price`, `discount`, `image`, `isUnlimited`, `isHot`, `badge`, `isActive`, `createdAt`, `updatedAt`, `categoryId`, `pointsEarn`, `generatesLicenseKey`) VALUES ('0a298c34-57a9-4976-ace3-b10c3869b938', 'AIMCOLOR รันบนเว็บไซต์', 'AIMBOT (COLOR BOT) ปรับค่าผ่านเว็บ
เป็นระบบกดปุ่มค้าง ( ตั้งปุ่มได้ )
ปรับ Fov ได้ สามารถตั้ง แกน X แกน Y ได้อิสระ (ทำให้ล็อคเนียนขึ้น)
สามารถตั้งระยะล็อค แกน Y ได้ เช่น หัว อก ท้อง
ปรับล็อคได้ 3 สี (ม่วง เหลือง แดง) แนะนำสีม่วงดีที่สุด
ตัวนี้ล็อคสมูท เป้าสั่นน้อยมาก ต้องหา config ที่เหมาะกับความไวตัวเอง
Driver ปลอดภัยมากของ logitect ใช้กับเมาส์อะไรก็ได้', 650, 0, '/uploads/products/3161ac9c-2d8f-445e-a62d-9d8e8d179cdb.png', 0, 0, NULL, 1, '2026-06-07 20:05:09', '2026-06-09 04:53:12', 'd055e6d5-f7ba-4b4b-8e00-e557c4e6ab2c', 0, 0);
INSERT INTO `product` (`id`, `name`, `description`, `price`, `discount`, `image`, `isUnlimited`, `isHot`, `badge`, `isActive`, `createdAt`, `updatedAt`, `categoryId`, `pointsEarn`, `generatesLicenseKey`) VALUES ('5190bb07-a2d6-42d5-b244-510e48c01cc7', 'Steam', '✔️ บัญชีเปล่า สร้างใหม่

✔️ รูปแบบที่ได้รับ

✔️ user----pass steam----email----pass email
✔️ เว็บเมล https://xomail.club/
✔️ ประกันสินค้า 30 นาที
!!หากคุณต้องการใช้ระยะยาว เปลี่ยนอีเมล!!', 3, 0, '/uploads/products/6c8cb1b1-4cee-4000-87d1-1b7690f17de8.png', 0, 0, NULL, 1, '2026-05-24 20:14:36', '2026-06-09 04:52:59', '3cb6f859-6fed-4bca-9e09-0a8a4c297575', 0, 0);
INSERT INTO `product` (`id`, `name`, `description`, `price`, `discount`, `image`, `isUnlimited`, `isHot`, `badge`, `isActive`, `createdAt`, `updatedAt`, `categoryId`, `pointsEarn`, `generatesLicenseKey`) VALUES ('537f4676-c209-4af2-a7f5-05d77fd9a9f2', 'External Roblox', 'ROBLOX EXTERNAL ใช้ได้กับทุกแมพใน Roblox ล็อคโหดๆ มองลั่นๆ
Combat, Visuals, World, Settings
Aimbot, Sticky Aim, AimPart, Smoothing, Predictions, FOV, Target Flags, Auto-Switch, SilentAim, SpoofMouse, HitChance, SilentFOV, Triggerbot, Trigger Delay / Range, Orbit
Master Visuals, Boxes, Skeleton, Snaplines, Chams, OOF Arrows, Name ESP, Health Bar, Distance, Tool ESP, Radar 2D, Map Tracers, Hit Tracer, World ESP, Crosshair
Speed, JumpPower, Flight, Spinbot, Hip Height, Noclip, Infinite Jump, Fullbright, RapidFire, AntiStomp, AutoReload, AutoArmor, Vehicle-Fly, Anti Aim, Underground AA, AutoStomp, Freecam, VoidHide', 100, 0, '/uploads/products/1d81ca17-cb90-47ab-a365-272e700bb1cd.png', 0, 0, NULL, 1, '2026-06-07 19:45:49', '2026-06-09 04:53:22', '9beec17c-82b5-4c77-993a-44fd3211acbd', 0, 0);

DROP TABLE IF EXISTS `productoption`;
CREATE TABLE `productoption` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `label` varchar(191) NOT NULL,
  `days` int(11) DEFAULT NULL,
  `price` double NOT NULL,
  `stockCount` int(11) NOT NULL DEFAULT 0,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ProductOption_productId_sortOrder_idx` (`productId`,`sortOrder`),
  CONSTRAINT `ProductOption_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `productoption` (`id`, `productId`, `label`, `days`, `price`, `stockCount`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES ('0d27ed4a-cd79-4b94-a4de-7062c13c9f61', '0a298c34-57a9-4976-ace3-b10c3869b938', '1 เดือน', 30, 350, 21, 2, 1, '2026-06-07 20:05:09', '2026-06-09 04:53:12');
INSERT INTO `productoption` (`id`, `productId`, `label`, `days`, `price`, `stockCount`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES ('929b1dcf-68db-4ee9-999e-8fe3cfb6ed44', '0a298c34-57a9-4976-ace3-b10c3869b938', '7 วัน', 7, 150, 18, 1, 1, '2026-06-07 20:05:09', '2026-06-09 04:53:12');
INSERT INTO `productoption` (`id`, `productId`, `label`, `days`, `price`, `stockCount`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES ('c708e197-2052-4cf3-af0c-c5a0023186c6', '0a298c34-57a9-4976-ace3-b10c3869b938', 'ถาวร', NULL, 650, 11, 3, 1, '2026-06-07 20:05:09', '2026-06-09 04:53:12');
INSERT INTO `productoption` (`id`, `productId`, `label`, `days`, `price`, `stockCount`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES ('d6099cad-5012-4bc7-9e19-8b0fa2d6516b', '0a298c34-57a9-4976-ace3-b10c3869b938', '1 วัน', 1, 30, 25, 0, 1, '2026-06-07 20:05:09', '2026-06-09 04:53:12');

DROP TABLE IF EXISTS `productstock`;
CREATE TABLE `productstock` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `accountEmail` varchar(191) NOT NULL,
  `accountPass` varchar(191) NOT NULL,
  `accountData` text DEFAULT NULL,
  `status` enum('AVAILABLE','SOLD','RESERVED') NOT NULL DEFAULT 'AVAILABLE',
  `orderId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ProductStock_productId_status_idx` (`productId`,`status`),
  KEY `ProductStock_orderId_fkey` (`orderId`),
  CONSTRAINT `ProductStock_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ProductStock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('036db068-a46c-4437-a1db-08fd630059a7', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'fdvnj80885----ddwiw53392----ss065245@knjgnz77.icu----98829008', 'SOLD', 1, '2026-05-24 20:22:51', '2026-05-24 20:49:31');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('08a6622b-edc2-4d53-a2d7-0f555357876b', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'qieeh83125----kuouu61968----dj187476@knjgnz86.icu----87771835', 'AVAILABLE', NULL, '2026-05-24 20:23:01', '2026-05-24 20:23:01');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('1730127f-ca2f-4225-8e8e-4f9eddd709de', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'hqtvw16882----rqnlc51373----qh357452@knjgnz33.icu----35707134', 'AVAILABLE', NULL, '2026-05-24 20:22:41', '2026-05-24 20:22:41');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('19990572-aee4-4c1c-8b18-1c8f3c6d9b0b', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'ubntj82566----gawdv89745----vz360711@knjgnz70.icu----35120243', 'AVAILABLE', NULL, '2026-05-24 20:23:07', '2026-05-24 20:23:07');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('215f0c86-5cc5-47ec-8295-6f729ad03cc8', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'zojzj27061----wmdto50994----gr593614@knjgnz44.icu----78773590', 'AVAILABLE', NULL, '2026-05-24 20:23:12', '2026-05-24 20:23:12');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('3fdf7b0d-3c75-4c93-81d3-c5a1ba07950d', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'hhdld46157----nwuaj87967----vi532429@knjgnz40.icu----61689806', 'AVAILABLE', NULL, '2026-05-24 20:23:15', '2026-05-24 20:23:15');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('41cfd3a4-3a96-47db-923e-8ecc93bd2f37', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'enycs23523----lxuvb18661----ij102599@knjgnz76.icu----18841541', 'AVAILABLE', NULL, '2026-05-24 20:22:59', '2026-05-24 20:22:59');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('4cdfbad3-5dd6-49e2-ae87-67975aded371', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'fdvnj80885----ddwiw53392----ss065245@knjgnz77.icu----98829008', 'AVAILABLE', NULL, '2026-05-24 20:50:15', '2026-05-24 20:50:15');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('64d8cedc-21ef-44f1-98df-a1c0bd6498b8', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'sfbpa36658----uqeln49364----cd268851@knjgnz56.icu----04297497', 'AVAILABLE', NULL, '2026-05-24 20:22:28', '2026-05-24 20:22:28');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('66d081d6-c06d-46a9-90a8-6740f86acc08', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'tebyc87664----wdrvf97492----fy133629@knjgnz83.icu----03968564', 'AVAILABLE', NULL, '2026-05-24 20:22:49', '2026-05-24 20:22:49');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('68907c4f-16af-4c07-873d-bc0166f20fe8', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'teojn17116----pjitp22673----sk637193@knjgnz46.icu----34033539', 'AVAILABLE', NULL, '2026-05-24 20:22:46', '2026-05-24 20:22:46');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('71a0d1a4-9a29-4d81-ba33-130ea2ef0745', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'xaneq57499----gnehw35224----ml623610@knjgnz83.icu----35078338', 'AVAILABLE', NULL, '2026-05-24 20:23:17', '2026-05-24 20:23:17');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('7424e63f-ec07-40b7-a6b0-04a1e8316de9', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'ahwvp02134----bmnea91776----yp243960@knjgnz32.icu----99825159', 'AVAILABLE', NULL, '2026-05-24 20:23:04', '2026-05-24 20:23:04');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('796c34e0-31d7-411a-895c-df2153e01837', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'pkgyd92460----jszwy18700----ni477607@knjgnz34.icu----73193289', 'AVAILABLE', NULL, '2026-05-24 20:22:34', '2026-05-24 20:22:34');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('7acba225-e119-49b4-8746-c4e7a67a5843', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'lugwq93885----nnayh15886----hs683015@knjgnz38.icu----08493410', 'AVAILABLE', NULL, '2026-05-24 20:22:43', '2026-05-24 20:22:43');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('a145e7e0-7d05-4815-96fb-971a9e481d4c', '537f4676-c209-4af2-a7f5-05d77fd9a9f2', '—', '—', 'test', 'AVAILABLE', NULL, '2026-06-08 01:15:05', '2026-06-08 01:15:05');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('bf19b584-44c6-4625-95fa-a638489a3069', '0a298c34-57a9-4976-ace3-b10c3869b938', '—', '—', 'test', 'AVAILABLE', NULL, '2026-06-08 07:16:58', '2026-06-08 07:16:58');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('c0a14424-f3c4-4882-8f89-176e892b3d5e', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'bldrs35911----nmjtn09006----et133252@knjgnz40.icu----78705457', 'AVAILABLE', NULL, '2026-05-24 20:22:57', '2026-05-24 20:22:57');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('c1c300d4-fb00-491d-b663-6d4874c675a1', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'jlzxx98281----mrwdz37657----mr058238@knjgnz46.icu----87337521', 'AVAILABLE', NULL, '2026-05-24 20:23:10', '2026-05-24 20:23:10');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('c24be255-c16d-4222-8cfb-53d28c86b68b', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'nenqt60185----lbdey81406----hk286015@knjgnz46.icu----55083307', 'AVAILABLE', NULL, '2026-05-24 20:22:54', '2026-05-24 20:22:54');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('d92e32b8-fdc8-4c23-b51c-ade967954c23', '0a298c34-57a9-4976-ace3-b10c3869b938', '—', '—', 'test', 'SOLD', 2, '2026-06-08 07:14:04', '2026-06-08 07:14:15');
INSERT INTO `productstock` (`id`, `productId`, `accountEmail`, `accountPass`, `accountData`, `status`, `orderId`, `createdAt`, `updatedAt`) VALUES ('f658f841-82af-4a8c-8e0c-84f2205b62af', '5190bb07-a2d6-42d5-b244-510e48c01cc7', '—', '—', 'iyjyt91066----tydme77206----sb558938@knjgnz93.icu----15431567', 'AVAILABLE', NULL, '2026-05-24 20:22:38', '2026-05-24 20:22:38');

DROP TABLE IF EXISTS `session`;
CREATE TABLE `session` (
  `id` varchar(191) NOT NULL,
  `sessionToken` varchar(191) NOT NULL,
  `userId` int(11) NOT NULL,
  `expires` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Session_sessionToken_key` (`sessionToken`),
  KEY `Session_userId_fkey` (`userId`),
  CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `sitesettings`;
CREATE TABLE `sitesettings` (
  `id` varchar(191) NOT NULL DEFAULT 'default',
  `siteName` varchar(191) NOT NULL DEFAULT 'x67secretme',
  `siteDescription` text DEFAULT NULL,
  `promptPayNumber` varchar(191) DEFAULT NULL,
  `promptPayName` varchar(191) DEFAULT NULL,
  `pointsPerBaht` double NOT NULL DEFAULT 1,
  `pointsValue` double NOT NULL DEFAULT 0.1,
  `minTopup` double NOT NULL DEFAULT 10,
  `maxTopup` double NOT NULL DEFAULT 10000,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `angpaoAllowedHosts` varchar(191) DEFAULT 'gift.truemoney.com,tmn.app',
  `angpaoApiEndpoint` text DEFAULT NULL,
  `angpaoApiKey` text DEFAULT NULL,
  `angpaoAutoApprove` tinyint(1) NOT NULL DEFAULT 0,
  `angpaoEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `angpaoReceiverPhone` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sitesettings` (`id`, `siteName`, `siteDescription`, `promptPayNumber`, `promptPayName`, `pointsPerBaht`, `pointsValue`, `minTopup`, `maxTopup`, `createdAt`, `updatedAt`, `angpaoAllowedHosts`, `angpaoApiEndpoint`, `angpaoApiKey`, `angpaoAutoApprove`, `angpaoEnabled`, `angpaoReceiverPhone`) VALUES ('default', 'x67secretme', 'Web site ที่ดีที่สุดให้กับการเล่นเกมระดับ PRO กับ X67SECRETME สินค้าอัปเดตใหม่ล่าสุดเสมอบอกเลยเล้าใจ', '', '', 1, 0.1, 20, 10000, '2026-05-23 18:47:01', '2026-06-09 04:11:56', 'gift.truemoney.com,tmn.app', 'http://apitrue.vornyx.pro/truemoney', NULL, 1, 1, '0926418809');

DROP TABLE IF EXISTS `topuptransaction`;
CREATE TABLE `topuptransaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `amount` double NOT NULL,
  `method` varchar(191) NOT NULL DEFAULT 'PROMPTPAY',
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `adminNote` varchar(191) DEFAULT NULL,
  `approvedAt` datetime(3) DEFAULT NULL,
  `approvedBy` int(11) DEFAULT NULL,
  `note` varchar(191) DEFAULT NULL,
  `slipImage` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `TopupTransaction_userId_fkey` (`userId`),
  CONSTRAINT `TopupTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `topuptransaction` (`id`, `userId`, `amount`, `method`, `status`, `createdAt`, `updatedAt`, `adminNote`, `approvedAt`, `approvedBy`, `note`, `slipImage`) VALUES (1, 2, 20, 'ANGPAO', 'APPROVED', '2026-05-24 21:40:11', '2026-05-24 21:41:36', '', '2026-05-24 21:41:36', NULL, 'test', NULL);

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) DEFAULT NULL,
  `username` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `password` varchar(191) DEFAULT NULL,
  `emailVerified` datetime(3) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `balance` double NOT NULL DEFAULT 0,
  `role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user` (`id`, `name`, `username`, `email`, `password`, `emailVerified`, `image`, `balance`, `role`, `createdAt`, `updatedAt`, `points`) VALUES (2, NULL, 'admin', 'admin@x67secretme.com', '$2b$10$DI6862I7wChQoFpaYpAJYOGxzrpT2c8ygtQ7t/jC73B24s7kaw2my', NULL, NULL, 544, 'ADMIN', '2026-05-24 01:01:00', '2026-06-08 07:14:15', 0);
INSERT INTO `user` (`id`, `name`, `username`, `email`, `password`, `emailVerified`, `image`, `balance`, `role`, `createdAt`, `updatedAt`, `points`) VALUES (3, NULL, 'hajj38683', 'hajj38683@gmail.com', '$2b$10$9TrR6z/xteCoCT.6rNWEOO8Y.DE.0r62fhRremGgubGAes1t1KZ.u', NULL, NULL, 0, 'USER', '2026-05-24 22:01:33', '2026-05-24 22:01:33', 0);
INSERT INTO `user` (`id`, `name`, `username`, `email`, `password`, `emailVerified`, `image`, `balance`, `role`, `createdAt`, `updatedAt`, `points`) VALUES (4, NULL, 'RTX4060', 'summerxt9@gmail.com', '$2b$10$qv2JD.e.SpeETL7xQauFeOUSnkT9OGKvMXNWFmp7BvtopVPS3J9.2', NULL, NULL, 0, 'USER', '2026-06-04 06:15:06', '2026-06-04 06:15:06', 0);

DROP TABLE IF EXISTS `verificationtoken`;
CREATE TABLE `verificationtoken` (
  `identifier` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL,
  UNIQUE KEY `VerificationToken_token_key` (`token`),
  UNIQUE KEY `VerificationToken_identifier_token_key` (`identifier`,`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


SET FOREIGN_KEY_CHECKS=1;

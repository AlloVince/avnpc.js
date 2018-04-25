# Dump of table eva_blog_posts
# ------------------------------------------------------------

CREATE TABLE `eva_blog_posts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '' COMMENT '标题',
  `status` enum('draft','published','pending') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '状态',
  `visibility` enum('public','private','password') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'public' COMMENT '可见性',
  `type` varchar(10) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'article' COMMENT '分类',
  `codeType` varchar(30) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'markdown' COMMENT '原始代码类型',
  `language` varchar(5) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'en' COMMENT '语言',
  `parentId` int(10) NOT NULL DEFAULT '0' COMMENT '父ID',
  `slug` varchar(100) COLLATE utf8_unicode_ci NOT NULL DEFAULT '' COMMENT '唯一标示',
  `contentStorage` enum('local','remote') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'local' COMMENT '正文存储方式[本地|远程]',
  `contentRemoteUrl` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '正文远程URL',
  `contentRemoteHash` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '正文远程Hash',
  `contentSynchronizedAt` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '正文上次同步时间',
  `sortOrder` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '排序',
  `createdAt` int(10) unsigned NOT NULL COMMENT '创建时间',
  `userId` bigint(19) unsigned NOT NULL DEFAULT '0' COMMENT '创建用户ID',
  `username` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '创建用户名',
  `updatedAt` int(10) NOT NULL DEFAULT '0' COMMENT '更新时间',
  `editorId` bigint(19) unsigned DEFAULT '0' COMMENT '更新用户ID',
  `editorName` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '更新用户ID',
  `commentStatus` enum('open','closed','authority') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'open' COMMENT '评论状态',
  `commentType` varchar(15) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'local' COMMENT '评论类型',
  `commentCount` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '评论数量',
  `viewCount` bigint(20) NOT NULL DEFAULT '0' COMMENT '访问量',
  `imageId` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '封面ID',
  `image` varchar(300) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '封面URL',
  `summary` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '摘要',
  `sourceName` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '来源',
  `sourceUrl` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '来源Url',
  `deletedAt` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `createdAt` (`createdAt`),
  KEY `status` (`status`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='文章表';



# Dump of table eva_blog_tags
# ------------------------------------------------------------

CREATE TABLE `eva_blog_tags` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `tagName` varchar(30) COLLATE utf8_unicode_ci NOT NULL DEFAULT '' COMMENT 'Tag名',
  `parentId` int(10) unsigned DEFAULT '0' COMMENT '父ID',
  `rootId` int(10) unsigned DEFAULT '0' COMMENT '根ID',
  `sortOrder` int(10) unsigned DEFAULT '0' COMMENT '排序编号',
  `count` int(10) unsigned DEFAULT '0' COMMENT '统计',
  PRIMARY KEY (`id`),
  UNIQUE KEY `tagName` (`tagName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;



# Dump of table eva_blog_tags_posts
# ------------------------------------------------------------

CREATE TABLE `eva_blog_tags_posts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `tagId` int(10) unsigned NOT NULL COMMENT 'TAG ID',
  `postId` int(10) unsigned NOT NULL COMMENT 'POST ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `tagId` (`tagId`,`postId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;



# Dump of table eva_blog_texts
# ------------------------------------------------------------

CREATE TABLE `eva_blog_texts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `postId` int(20) unsigned NOT NULL COMMENT '文章ID',
  `metaKeywords` text COLLATE utf8_unicode_ci COMMENT 'Meta Keywords',
  `metaDescription` text COLLATE utf8_unicode_ci COMMENT 'Meta Description',
  `content` longtext COLLATE utf8_unicode_ci NOT NULL COMMENT '文章正文',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

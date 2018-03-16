DROP VIEW IF EXISTS view_eva_blog_posts;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW view_eva_blog_posts
    AS SELECT
       `id` AS `id`,
       `title` AS `title`,
       `status` AS `status`,
       `visibility` AS `visibility`,
       `type` AS `type`,
       `codeType` AS `codeType`,
       `language` AS `language`,
       `parentId` AS `parentId`,
       `slug` AS `slug`,
       `sortOrder` AS `sortOrder`,
       FROM_UNIXTIME(IF(createdAt > 0, createdAt, NULL)) AS createdAt,
       `userId` AS `userId`,
       `username` AS `username`,
       FROM_UNIXTIME(IF(updatedAt > 0, updatedAt, NULL)) AS updatedAt,
       `editorId` AS `editorId`,
       `editorName` AS `editorName`,
       `commentStatus` AS `commentStatus`,
       `commentType` AS `commentType`,
       `commentCount` AS `commentCount`,
       `viewCount` AS `viewCount`,
       `imageId` AS `imageId`,
       `image` AS `image`,
       `summary` AS `summary`,
       `sourceName` AS `sourceName`,
       `sourceUrl` AS `sourceUrl`,
       FROM_UNIXTIME(IF(deletedAt > 0, deletedAt, NULL)) AS deletedAt
    FROM eva_blog_posts;

DROP VIEW IF EXISTS view_eva_blog_tags;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW view_eva_blog_tags
    AS SELECT
       `id` AS `id`,
       `tagName` AS `tagName`,
       `parentId` AS `parentId`,
       `rootId` AS `rootId`,
       `sortOrder` AS `sortOrder`,
       `count` AS `count`
    FROM eva_blog_tags;

DROP VIEW IF EXISTS view_eva_blog_tags_posts;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW view_eva_blog_tags_posts
    AS SELECT
       `id` AS `id`,
       `tagId` AS `tagId`,
       `postId` AS `postId`
    FROM eva_blog_tags_posts;

DROP VIEW IF EXISTS view_eva_blog_texts;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW view_eva_blog_texts
    AS SELECT
       `id` AS `id`,
       `postId` AS `postId`,
       `metaKeywords` AS `metaKeywords`,
       `metaDescription` AS `metaDescription`,
       `content` AS `content`
    FROM eva_blog_texts;


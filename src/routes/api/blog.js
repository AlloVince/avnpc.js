import {
  EvaEngine, DI, exceptions, wrapper, utils
} from 'evaengine';
import models from '../../models';
import entities from '../../entities';

const router = EvaEngine.createRouter();
const viewCache = DI.get('view_cache');


//@formatter:off
/**
 @swagger
 /blog/posts:
   get:
     summary: Posts list
     tags:
       - Blog
     parameters:
       - name: offset
         in: query
         type: integer
         description: Query offset
       - name: limit
         in: query
         type: integer
         description: Query limit
       - name: tag
         in: query
         type: string
         description: Tag name
       - name: withTag
         in: query
         type: integer
         description: Whether return with tags
       - name: withText
         in: query
         type: integer
         description: Whether return with text
       - name: order
         in: query
         type: string
         default: -created_at
         enum:
           - created_at
           - -created_at
     responses:
       200:
         description: success response
         schema:
           type: object
           required:
             - pagination
             - results
           properties:
             pagination:
               $ref: '#/definitions/Pagination'
             results:
               type: array
               items:
                 $ref: '#/definitions/BlogPosts'
 */
//@formatter:on
router.get('/posts', viewCache(10), wrapper(async (req, res) => {
  const orderScaffold = new utils.apiScaffold.OrderScaffold();
  orderScaffold.setFields([
    'createdAt'
  ], 'createdAt', 'DESC');

  const where = { status: 'published', deletedAt: 0 };
  let { order } = req.query;
  order = orderScaffold.getOrderByQuery(order);

  const { tag: tagName, withTag, withText } = req.query;
  const tag = tagName ? await entities.get('BlogTags').findOne({ where: { tagName } }) : null;
  if (tag) {
    Object.assign(where, {
      id: {
        $in: entities.getSequelize().literal(`(SELECT DISTINCT(postId) FROM ${entities.get('BlogTagsPosts').getTableName()} WHERE tagId = ${tag.id})`)
      }
    });
  }

  const include = [];
  if (withText) {
    include.push({
      model: entities.get('BlogTexts'),
      as: 'text'
    });
  }
  if (withTag) {
    include.push({
      model: entities.get('BlogTags'),
      as: 'tags'
    });
  }

  const { offset, limit } = utils.paginationFilter(req.query, 15, 500);
  const posts = await entities.get('BlogPosts').findAndCountAll({
    offset,
    limit,
    order,
    where,
    include
  });
  return res.json({
    pagination: utils.pagination({
      offset,
      limit,
      req,
      total: posts.count
    }),
    results: posts.rows
  });
}));


//@formatter:off
/**
 @swagger
 /blog/posts/{slug}:
   get:
     summary: Detail of a post
     tags:
       - Blog
     parameters:
       - name: slug
         in: path
         type: string
         description: Post slug
         required: true
     responses:
       200:
         description: success response
         schema:
           type: object
           $ref: '#/definitions/BlogPosts'
 */
//@formatter:on
router.get('/posts/:slug', viewCache(30), wrapper(async (req, res) => {
  const blogModel = new models.BlogPost();
  const { slug } = req.params;
  const post = await blogModel.getWithNeighbor(slug);
  if (!post) {
    throw new exceptions.ResourceNotFoundException('Blog post not exists');
  }
  return res.json(post);
}));

module.exports = router;

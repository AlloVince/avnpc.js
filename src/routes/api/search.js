import { EvaEngine, DI, wrapper, utils } from 'evaengine';

const router = EvaEngine.createRouter();

const googleResultsConvert = (input, req) => {
  const {
    queries: { request: [{ totalResults: total, count: limit, startIndex }] }
  } = input;
  return {
    pagination: utils.pagination({
      offset: startIndex - 1,
      limit,
      req,
      total
    }),
    results: input.items ? input.items.map((item) => {
      const {
        title,
        link: url,
        htmlSnippet: summary
      } = item;
      return {
        title,
        url,
        summary
      };
    }) : []
  };
};

const viewCache = DI.get('view_cache');

//@formatter:off
/**
 @swagger
 /search:
   get:
     summary: Search
     tags:
       - Search
     parameters:
       - name: offset
         in: query
         type: integer
         description: Query offset
       - name: limit
         in: query
         type: integer
         description: Query limit
       - name: q
         in: query
         type: string
         description: Search key word
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
router.get('/', viewCache(60 * 24), wrapper(async (req, res) => {
  const { q, offset } = req.query;
  const results = await DI.get('http_client').request({
    url: 'https://www.googleapis.com/customsearch/v1',
    method: 'get',
    qs: {
      q,
      key: DI.get('config').get('blog.googleCustomSearchKey'),
      cx: DI.get('config').get('blog.googleCustomSearchCx'),
      alt: 'json',
      start: offset
    },
    json: true
  });
  return res.json(googleResultsConvert(results, req));
}));


module.exports = router;

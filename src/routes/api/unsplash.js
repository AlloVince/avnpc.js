import {
  EvaEngine, wrapper, DI, utils
} from 'evaengine';
import { toJson } from 'unsplash-js';


const viewCache = DI.get('view_cache');
const router = EvaEngine.createRouter();
global.fetch = require('node-fetch');


//@formatter:off
/**
 @swagger
 /unsplash/auth:
   get:
     summary: Unsplash OAuth request
     tags:
       - Unsplash
     parameters:
     responses:
       200:
         description: success response
 */
//@formatter:on
router.get('/auth', wrapper(async (req, res) => {
  const authenticationUrl = DI.get('unsplash').getClient().auth.getAuthenticationUrl([
    'public',
    'read_photos'
  ]);
  return res.redirect(authenticationUrl);
}));


//@formatter:off
/**
 @swagger
 /unsplash/access:
   get:
     summary: Unsplash OAuth request
     tags:
       - Unsplash
     parameters:
     responses:
       200:
         description: success response
 */
//@formatter:on
router.get('/access', wrapper(async (req, res) => {
  const response = await DI.get('unsplash').getClient().auth.userAuthentication(req.query.code);
  const r = await toJson(response);
  return res.json(r);
}));


//@formatter:off
/**
 @swagger
 /unsplash/photos:
   get:
     summary: Unsplash Photo request
     tags:
       - Unsplash
     parameters:
     responses:
       200:
         description: success response
 */
//@formatter:on
router.get('/photos', viewCache(60), wrapper(async (req, res) => {
  const { offset, limit } = utils.paginationFilter(req.query, 30, 500);
  const response = await DI.get('unsplash').getClient().photos.listPhotos(offset, limit);
  const results = await toJson(response);
  return res.json({
    pagination: utils.pagination({
      offset,
      limit,
      req,
      total: 1000
    }),
    results: results.map(r => ({
      id: r.id,
      banngo: r.id,
      subBanngo: r.id,
      title: r.user.bio,
      images: [
        r.urls.regular,
        r.urls.small,
        r.urls.thumb
      ],
      width: r.width,
      height: r.height,
      color: r.color
    }))
  });
}));

module.exports = router;

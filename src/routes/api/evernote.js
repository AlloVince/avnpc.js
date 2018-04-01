import { EvaEngine, wrapper, DI, utils, exceptions } from 'evaengine';
import passport from 'passport';
import EvernoteManager from '../../models/evernote_manager';

const router = EvaEngine.createRouter();
const session = DI.get('session')();

passport.use(
  'evernote',
  EvernoteManager.getOAuthStrategy(
    '/v1/evernote/callback',
    (token, tokenSecret, profile, done) => {
      done(null, Object.assign(profile, { token }));
    }
  )
);
router.use(passport.initialize());


//@formatter:off
/**
 @swagger
 /evernote/auth:
   get:
     summary: Start request Evernote OAuth access token
     tags:
       - Evernote
     parameters:
     responses:
       200:
         description: success response
 */
//@formatter:on
router.get('/auth', session, passport.authenticate('evernote'));

//@formatter:off
/**
 @swagger
 /evernote/callback:
   get:
     summary: Evernote OAuth callback url
     tags:
       - Evernote
     parameters:
     responses:
       200:
         description: success response
 */
//@formatter:on
router.get('/callback', session, passport.authenticate('evernote', {
  failureRedirect: '/login',
  session: false,
  failWithError: true
}), wrapper(async (req, res) => {
  res.json(req.user);
}), (err, req, res, next) => { //eslint-disable-line
  DI.get('logger').warn(err);
  return res.json(err);
});

//@formatter:off
/**
 @swagger
 /evernote/notes:
   get:
     summary: Notes list
     tags:
       - Evernote
     parameters:
       - name: offset
         in: query
         type: integer
         description: Query offset
       - name: limit
         in: query
         type: integer
         description: Query limit
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
router.get('/notes', wrapper(async (req, res) => {
  const { offset, limit } = utils.paginationFilter(req.query, 15, 500);
  const em = new EvernoteManager();
  const { total, notes } = await em.listNotes({
    offset,
    limit
  });
  return res.json({
    pagination: utils.pagination({
      offset,
      limit,
      req,
      total
    }),
    results: notes
  });
}));


//@formatter:off
/**
 @swagger
 /evernote/notes/{slug}:
   get:
     summary: Detail of a note
     tags:
       - Evernote
     parameters:
       - name: slug
         in: path
         type: string
         description: Evernote slug
         required: true
     responses:
       200:
         description: success response
         schema:
           type: object
           $ref: '#/definitions/BlogPosts'
 */
//@formatter:on
router.get('/notes/:slug', wrapper(async (req, res) => {
  const em = new EvernoteManager();
  const { slug } = req.params;
  const note = await em.getNote(slug);
  if (!note) {
    throw new exceptions.ResourceNotFoundException('Note not exists');
  }
  return res.json(note);
}));

module.exports = router;

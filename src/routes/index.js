import { EvaEngine, wrapper } from 'evaengine';
import fs from 'fs';

const router = EvaEngine.createRouter(); // eslint-disable-line new-cap

router.get('/ci.txt', wrapper(async (req, res) => {
  let content = 'NOT FOUND';
  try {
    content = fs.readFileSync(`${__dirname}/../../build/ci.txt`).toString();
  } catch (e) {
    content = 'NOT FOUND';
  }
  res.header('content-type', 'text/plain');
  res.send(content);
}));

router.get('/', wrapper(async (req, res) => {
  res.render('index', { title: 'Express' });
}));

module.exports = router;

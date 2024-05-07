import express from 'express';
import { keys } from './keys.js';
import orderRouter from './routes/orderRouter.js';

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

const apiRouter = express.Router();
app.use('/api', apiRouter);
apiRouter.use('/order', orderRouter);

apiRouter.use('/docs', (_req, res) => {
  res.json({
    message: 'welcome to JWT Pizza Factory',
    endpoints: [...orderRouter.endpoints],
  });
});

app.get('/.well-known/jwks.json', (req, res) => {
  res.json({
    keys: keys.jwks,
  });
});

app.use('*', (_req, res) => {
  res.status(404).json({
    message: 'unknown endpoint',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

const port = process.argv[2] || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

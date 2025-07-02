import cors from 'cors';
import express from 'express';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { getLeaderboard } from './services/leaderboard.service';
import { getAllBadges } from './services/badges.service';
import { addHistoryEntry, getUserHistory, getAllHistory } from './services/historyStorage.service';
import 'dotenv/config';
import { PublicKey } from '@solana/web3.js';
import { HistoryEntryBody } from './models/HistoryEntry';

const app = express();
const PORT = 3000;

// app.options('*', cors({
//   origin: 'http://localhost:4200',
//   credentials: true,
// }));

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());
app.set('json spaces', 2);


app.get('/', (_req, res) => {
  res.send('BAWLS Staking Backend is running');
});

app.get('/api/leaderboard', async (_req, res, next) => {
  try {
    const data = await getLeaderboard();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

app.get('/api/badges', async (_req, res, next) => {
  try {
    const data = await getAllBadges();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

app.get('/api/history/:wallet', async (req, res, next) => {
    try{
        const wallet = req.params.wallet;
        const data = await getUserHistory(wallet);
        res.json(data);
    } catch (e) {
        next(e);
    }
});


app.get('/api/history', async (_req, res, next) => {
  try {
    const data = await getAllHistory();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

app.post('/api/history', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const body = req.body as Partial<HistoryEntryBody>;

      if (!body.wallet || !body.type || body.amount === undefined || !body.txHash) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const allowedTypes = ['stake', 'unstake', 'claim'];
      if (!allowedTypes.includes(body.type)) {
        return res.status(400).json({ error: 'Invalid type' });
      }

      if (typeof body.amount !== 'number' || isNaN(body.amount)) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      try {
        new PublicKey(body.wallet);
      } catch {
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      if (typeof body.txHash !== 'string' || body.txHash.length < 32) {
        return res.status(400).json({ error: 'Invalid txHash' });
      }

      await addHistoryEntry({
        wallet: body.wallet,
        type: body.type,
        amount: body.amount,
        txHash: body.txHash,
        timestamp: Date.now(),
      });

      res.status(201).json({ success: true });
    } catch (e) {
      next(e);
    }
  })();
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ API Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

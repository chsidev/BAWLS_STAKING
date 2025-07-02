import { Schema, model, Document } from 'mongoose';

export interface HistoryEntry extends Document {
  wallet: string;
  type: 'stake' | 'unstake' | 'claim';
  amount: number;
  timestamp: number;
  txHash: string;
}

export interface HistoryEntryBody {
  wallet: string;
  type: 'stake' | 'unstake' | 'claim';
  amount: number;
  txHash: string;
}

const HistoryEntrySchema = new Schema<HistoryEntry>({
  wallet: { type: String, required: true },
  type: { type: String, enum: ['stake', 'unstake', 'claim'], required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  txHash: { type: String, required: true }
});

export const HistoryEntryModel = model<HistoryEntry>('HistoryEntry', HistoryEntrySchema);

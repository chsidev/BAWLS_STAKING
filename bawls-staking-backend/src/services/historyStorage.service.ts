import { HistoryEntryModel, HistoryEntry, HistoryEntryBody } from '../models/HistoryEntry';
import { connectToMongo } from './mongo';

export async function addHistoryEntry(entry: HistoryEntryBody & { timestamp: number }) {
  await connectToMongo();
  await HistoryEntryModel.create(entry);
}

export async function getUserHistory(wallet: string): Promise<HistoryEntry[]> {
  await connectToMongo();
  return HistoryEntryModel.find({ wallet }).sort({ timestamp: -1 }).lean();
}

export async function getAllHistory(): Promise<HistoryEntry[]> {
  await connectToMongo();
  return HistoryEntryModel.find().sort({ timestamp: -1 }).lean();
}

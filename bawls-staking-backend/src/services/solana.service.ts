import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import bs58 from 'bs58';
import idl from '../../../bawls_staking_program/target/idl/bawls_staking.json';

const RPC_URL = 'https://api.devnet.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');
const provider = new AnchorProvider(connection, {} as any, {});
const program = new Program(idl as unknown as Idl, provider);
const programId = new PublicKey((idl as any).address);

const STAKING_ACCOUNT_DISCRIMINATOR = Buffer.from([
  72, 177, 85, 249, 76, 167, 186, 126
]);

export async function fetchAllUserStakes() {
  console.log('Fetching all UserState accounts...');
  console.log('Loaded programId:', (idl as any).address);
  const accounts = await connection.getProgramAccounts(programId, {
    filters: [
      { dataSize: 64 },
      { memcmp: { offset: 0, bytes: bs58.encode(STAKING_ACCOUNT_DISCRIMINATOR) } },
    ],
  });
  console.log(`Found ${accounts.length} UserState accounts.`);

  return accounts.map((acc) => {
    const decoded = program.coder.accounts.decode('userState', acc.account.data);
    return {
      wallet: decoded.authority.toBase58(),
      amount: Number(decoded.amount) / 1e9,
      startTime: Number(decoded.startTime),
    };
  });
}

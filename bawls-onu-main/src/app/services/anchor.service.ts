import { Injectable } from '@angular/core';
import { clusterApiUrl, Connection, ConfirmOptions, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, setProvider, Idl, Wallet } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import * as idlJson from '../../../../bawls_staking_program/target/idl/bawls_staking.json';

@Injectable({ providedIn: 'root' })
export class AnchorService {
  connection: Connection;
  provider!: AnchorProvider;
  program!: Program;

  readonly PROGRAM_ID: PublicKey = new PublicKey((idlJson as any).address);
  readonly IDL: Idl = idlJson as Idl;

  readonly SEED_CONFIG = "config";
  readonly SEED_POOL = "pool";
  readonly SEED_STATE = "state";


  constructor() {
    this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  }

  async init(wallet: Wallet): Promise<void> {
    const opts: ConfirmOptions = {
      preflightCommitment: 'processed',
      commitment: 'processed'
    };

    this.provider = new AnchorProvider(this.connection, wallet, opts);

    setProvider(this.provider);

    this.program = new Program(this.IDL as Idl, this.provider);

    console.log('Anchor Program loaded:', this.program.programId.toBase58());
  }

  async getPDAs(user: PublicKey, mint: PublicKey) {
    const [config] = PublicKey.findProgramAddressSync(
      [Buffer.from(this.SEED_CONFIG)],
      this.PROGRAM_ID
    );

    const [pool] = PublicKey.findProgramAddressSync(
      [Buffer.from(this.SEED_POOL)],
      this.PROGRAM_ID
    );

    const [userState] = PublicKey.findProgramAddressSync(
      [Buffer.from(this.SEED_STATE), user.toBuffer()],
      this.PROGRAM_ID
    );

    const vault = await getAssociatedTokenAddress(mint, config, true); 
    const from = await getAssociatedTokenAddress(mint, user); 

    return { config, pool, userState, vault, from };
  }
}

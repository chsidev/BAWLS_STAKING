import { Injectable } from '@angular/core';
import { clusterApiUrl, Connection, ConfirmOptions, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, setProvider, Idl, Wallet } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import * as idlJson from '../../../../bawls_staking_program/target/idl/bawls_staking.json';
// @ts-ignore
import { BN } from 'bn.js';

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

  readonly COMMUNITY_WALLET = new PublicKey(
    '79FSmHXEQzsizn57Rhfp9s4qgcNcCBRSK6LSLM1gfjWx'
  );

  readonly TOKEN_MINT = new PublicKey(
    'DxUTmqRt49dNsKwM1kzrquMpKsnyMGEpGKeZg1YfUdgJ'
  );


  constructor() {
    this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  }

  async ensureUserAccount(user: String) {
    const wallet = new PublicKey(user);
    const { userState } = await this.getPDAs(wallet);

    try {
      await (this.program.account as any)['userState'].fetch(userState);
      console.log('User account already exists:', userState.toBase58());
    } catch (error) {
      console.log('Creating user account:', userState.toBase58());
      
      const tx = await this.program.methods
        ['initializeUserState']()
        .accounts({
          userState,
          authority: wallet,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log('Create user tx:', tx);
    }
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

  async getPDAs(user: PublicKey) {
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

    const vault = await getAssociatedTokenAddress(this.TOKEN_MINT, config, true);
    const from = await getAssociatedTokenAddress(this.TOKEN_MINT, user);
    const to = await getAssociatedTokenAddress(this.TOKEN_MINT, user);

    const communityAta = await getAssociatedTokenAddress(this.TOKEN_MINT, this.COMMUNITY_WALLET, true);

    return { config, pool, userState, vault, from, to, communityAta };
  }

  async getUserState(user: string) {
    const wallet = new PublicKey(user);
    const { userState } = await this.getPDAs(wallet);
    const data = await (this.program.account as any)['userState'].fetch(userState);
    return data;
  }

  async getClaimableRewards(user: string): Promise<number> {
    const wallet = new PublicKey(user);
    const { pool, userState } = await this.getPDAs(wallet);

    const userData = await (this.program.account as any)['userState'].fetch(userState);
    const poolData = await (this.program.account as any)['stakingPool'].fetch(pool);

    const stakeAmount = new BN(userData.amount);
    const lastSnapshot = new BN(userData.lastTaxSnapshot);
    const totalTax = new BN(poolData.totalTaxCollected);
    const totalStaked = new BN(poolData.totalStaked);

    const newRewards = totalTax.sub(lastSnapshot);

    console.log( 'lastSnapshot:', lastSnapshot.toString());
    console.log( 'totalTax:', totalTax.toString());
    console.log( 'newRewards:', newRewards.toString());

    if (stakeAmount.isZero() || totalStaked.isZero() || newRewards.lte(new BN(0))) {
      return 0;
    }

    const reward = Math.floor((stakeAmount.mul(newRewards)).div(totalStaked).toNumber());
    return reward / 1e9;
  }

  async stake(user: string, amount: number) {
    const wallet = new PublicKey(user);
    const { config, pool, userState, from, vault } = await this.getPDAs(wallet);

    const tx = await this.program.methods
      ['stake'](new BN(amount).mul(new BN(1e9)))
      .accounts({
        userState,
        authority: wallet,
        config,
        pool,
        user: wallet,
        from,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log('Stake tx:', tx);
  }

  async unstake(user: string) {
    const wallet = new PublicKey(user);
    const { config, pool, userState, vault, to, communityAta } =
      await this.getPDAs(wallet);

    const tx = await this.program.methods
      ['unstake']()
      .accounts({
        userState,
        authority: wallet,
        config,
        pool,
        user: wallet,
        to,
        vault,
        communityAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log(' Unstake tx:', tx);
  }

  async claimRewards(user: string) {
    const wallet = new PublicKey(user);
    const { config, pool, userState, vault, to } = await this.getPDAs(wallet);

    const tx = await this.program.methods
      ['claimRewards']()
      .accounts({
        userState,
        authority: wallet,
        config,
        pool,
        user: wallet,
        to,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log('Claim tx:', tx);
  }
}

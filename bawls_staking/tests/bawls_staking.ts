import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BawlsStaking } from "../target/types/bawls_staking";
import {
  getAccount,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  mintTo,
  createMint,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Keypair,
  Connection,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { assert } from "chai";

const STAKE_AMOUNT = 1_000_000_000;
const DECIMALS = 9;
const USE_LOCALNET = false;

function formatToken(raw: bigint | number, decimals = 9) {
  return Number(raw) / 10 ** decimals;
}

const connection = new Connection(
  USE_LOCALNET ? "http://127.0.0.1:8899" : clusterApiUrl("devnet"),
  "confirmed"
);

const provider = new anchor.AnchorProvider(connection, anchor.Wallet.local(), {});
anchor.setProvider(provider);
const program = anchor.workspace.BawlsStaking as Program<BawlsStaking>;

const payer = provider.wallet.payer as Keypair;
const user = provider.wallet;

describe("BAWLS Staking", () => {
  let mint: PublicKey;
  let configPda: PublicKey;
  let poolPda: PublicKey;
  let userState: PublicKey;
  let userATA: PublicKey;
  let vault: PublicKey;
  let communityWallet: PublicKey;
  let communityATA: PublicKey;
  
  async function logState(label: string) {
    const balance = await getAccount(connection, userATA);
    const pool = await program.account.stakingPool.fetch(poolPda);
    const state = await program.account.userState.fetch(userState);

    // const startDate = new Date((state.startTime || 0) * 1000).toISOString();
    console.log(`\n[${label}] User balance: ${formatToken(balance.amount)} BAW`);
    // console.log(`[${label}] User state → Amount: ${formatToken(state.amount)} | Start: ${startDate} | TaxSnapshot: ${formatToken(state.lastTaxSnapshot)}`);
    console.log(`[${label}] Pool state → Tax: ${formatToken(pool.totalTaxCollected)} | Staked: ${formatToken(pool.totalStaked)} | Rewards: ${formatToken(pool.totalRewardsDistributed)}`);
  }

  before(async () => {
    console.log(" Starting test setup...");

    if (USE_LOCALNET) {
      mint = await createMint(connection, payer, payer.publicKey, null, DECIMALS);
      console.log("Localnet mint:", mint.toBase58());
    } else {
      mint = new PublicKey("DxUTmqRt49dNsKwM1kzrquMpKsnyMGEpGKeZg1YfUdgJ");
      console.log("Devnet mint:", mint.toBase58());
    }

    [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config-v1")], program.programId);
    [poolPda] = PublicKey.findProgramAddressSync([Buffer.from("pool-v1")], program.programId);
    [userState] = PublicKey.findProgramAddressSync(
      [Buffer.from("state-v1"), user.publicKey.toBuffer()],
      program.programId
    );
    vault = getAssociatedTokenAddressSync(mint, configPda, true);
    userATA = getAssociatedTokenAddressSync(mint, user.publicKey);
    communityWallet = Keypair.generate().publicKey;
    communityATA = getAssociatedTokenAddressSync(mint, communityWallet);

    const vaultInfo = await connection.getAccountInfo(vault);

    if (!vaultInfo) {
      console.log("Creating vault ATA on-chain...");

      const createIx = createAssociatedTokenAccountInstruction(
        payer.publicKey, 
        vault,           
        configPda,       
        mint             
      );

      const tx = new Transaction().add(createIx);
      await sendAndConfirmTransaction(connection, tx, [payer]);
      console.log("Vault ATA created.");
    } else {
      const vaultAcc = await getAccount(connection, vault);
      console.log("Vault exists. Owner:", vaultAcc.owner.toBase58());
    }

    // Ensure ATAs
    for (const [label, ata, owner] of [
      ["User ATA", userATA, user.publicKey],
      ["Community ATA", communityATA, communityWallet],
    ]) {
      if (!(await connection.getAccountInfo(ata))) {
        await sendAndConfirmTransaction(
          connection,
          new Transaction().add(
            createAssociatedTokenAccountInstruction(payer.publicKey, ata, owner, mint)
          ),
          [payer]
        );
        console.log(`Created ${label}`);
      }
    }

    await mintTo(connection, payer, mint, userATA, payer, STAKE_AMOUNT * 2);
    console.log(`Minted 2 tokens to user`);

    try {
      await program.methods.initialize(communityWallet).accounts({
        config: configPda,
        pool: poolPda,
        payer: user.publicKey,
        tokenMint: mint,
        systemProgram: SystemProgram.programId,
      }).rpc();
      console.log("Program initialized");
    } catch {
      console.log("Program may already be initialized");
    }

    try {
      await program.methods.createVault().accounts({
        user: user.publicKey,
        vault,
        config: configPda,
        tokenMint: mint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      }).rpc();
      console.log("Vault created");
    } catch {
      console.log("Vault may already exist");
    }

    if (!(await connection.getAccountInfo(userState))) {
      await program.methods.initializeUserState().accounts({
        userState,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
      }).rpc();
      console.log("User state initialized");
    } else {
      console.log("User state already exists");
    }
  });

  it("Stake 1 token", async () => {
    await logState("Before Stake");

    await program.methods.stake(new anchor.BN(STAKE_AMOUNT)).accounts({
      userState,
      config: configPda,
      pool: poolPda,
      user: user.publicKey,
      from: userATA,
      vault,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc();

    console.log(`User staked: ${formatToken(STAKE_AMOUNT)} BAWLS`);

    await logState("After Stake");
  });

  it("Early unstake to generate tax", async () => {
    await logState("Before Unstake");

    await program.methods.unstake().accounts({
      userState,
      config: configPda,
      pool: poolPda,
      user: user.publicKey,
      to: userATA,
      vault,
      communityAta: communityATA,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc();

    await logState("After Unstake");

    const community = await getAccount(connection, communityATA);
    console.log(`Community vault holds: ${formatToken(community.amount)} BAWLS`);
  });

  it("Stake again to be eligible for rewards", async () => {
    await logState("Before Re-stake");

    await program.methods.stake(new anchor.BN(STAKE_AMOUNT)).accounts({
      userState,
      config: configPda,
      pool: poolPda,
      user: user.publicKey,
      from: userATA,
      vault,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc();

    console.log(`User restaked: ${formatToken(STAKE_AMOUNT)} BAWLS`);

    await logState("After Re-stake");
  });

  it("Wait and claim rewards", async () => {
    console.log("Waiting 3s...");
    await new Promise((r) => setTimeout(r, 3000));

    await logState("Before Claim");

    const before = await getAccount(connection, userATA);
    const pool = await program.account.stakingPool.fetch(poolPda);
    const userStateData = await program.account.userState.fetch(userState);

    if (pool.totalTaxCollected > userStateData.lastTaxSnapshot) {
      await program.methods.claimRewards().accounts({
        userState,
        user: user.publicKey,
        pool: poolPda,
        config: configPda,
        to: userATA,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      }).rpc();

      const after = await getAccount(connection, userATA);
      const reward = BigInt(after.amount) - BigInt(before.amount);
      console.log(`Claimed reward: ${formatToken(reward)} BAWLS`);
      assert.ok(reward > 0n);
    } else {
      console.log("No rewards available to claim yet.");
    }

    await logState("After Claim");
  });
});

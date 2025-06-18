import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BawlsStaking } from "../target/types/bawls_staking";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  SystemProgram,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import { assert } from "chai";

function formatTokenAmount(rawAmount: bigint | number | string, decimals: number): number {
  return Number(rawAmount) / 10 ** decimals;
}

const STAKE_AMOUNT_A = 100_000_000; // 100M
const STAKE_AMOUNT_B = 500_000_000; // 500M
const INITIAL_MINT_AMOUNT = 600_000_000; // 1B
const DECIMALS = 9;

describe("bawls_staking with two users", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.BawlsStaking as Program<BawlsStaking>;
  const payer = provider.wallet.payer as anchor.web3.Keypair;

  const mint = new PublicKey("DxUTmqRt49dNsKwM1kzrquMpKsnyMGEpGKeZg1YfUdgJ");

  const userA = provider.wallet;
  const userAAccount = new PublicKey("HxPax3qFJGZ9bDRhZ1WB4Tm7NHqDC7YgX9MVY6gth8Ym");
  const userB = Keypair.generate();
  let userBAccount: PublicKey;

  let vaultAccount: PublicKey;
  let configPda: PublicKey;
  let poolPda: PublicKey;
  let userAStatePda: PublicKey;
  let userBStatePda: PublicKey;
  let communityWallet = Keypair.generate().publicKey;
  let communityAta: PublicKey;

  it("Initializes everything", async () => {
    [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config-v2")], program.programId);
    [poolPda] = PublicKey.findProgramAddressSync([Buffer.from("pool-v2")], program.programId);

    await program.methods.initialize(communityWallet).accounts({
      config: configPda,
      pool: poolPda,
      communityWallet,
      payer: userA.publicKey,
      systemProgram: SystemProgram.programId,
    }).rpc();

    communityAta = getAssociatedTokenAddressSync(mint, communityWallet);
    const info = await provider.connection.getAccountInfo(communityAta);
    if (!info) {
      const ix = createAssociatedTokenAccountInstruction(payer.publicKey, communityAta, communityWallet, mint);
      const tx = new Transaction().add(ix);
      await sendAndConfirmTransaction(provider.connection, tx, [payer]);
    }

    console.log("✅ Config & Pool initialized");
    console.log("  - Config PDA:", configPda.toBase58());
    console.log("  - Pool PDA:", poolPda.toBase58());
  });

  it("Sets up User B and vault", async () => {
    // Fund user B
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(userB.publicKey, 1_000_000_000),
      "confirmed"
    );

    userBAccount = getAssociatedTokenAddressSync(mint, userB.publicKey);
    const createIx = createAssociatedTokenAccountInstruction(payer.publicKey, userBAccount, userB.publicKey, mint);
    const tx = new Transaction().add(createIx);
    await sendAndConfirmTransaction(provider.connection, tx, [payer]);
    await mintTo(provider.connection, payer, mint, userBAccount, payer, STAKE_AMOUNT_B);

    console.log(`✅ Minted ${formatTokenAmount(INITIAL_MINT_AMOUNT, DECIMALS)} tokens to each user`);

    // Create vault
    vaultAccount = getAssociatedTokenAddressSync(mint, configPda, true);
    await program.methods.createVault().accounts({
      user: userA.publicKey,
      vault: vaultAccount,
      config: configPda,
      tokenMint: mint,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    }).rpc();

    console.log("✅ Created associated token accounts:");
    console.log("  - User A Token Account:", userAAccount.toBase58());
    console.log("  - User B Token Account:", userBAccount.toBase58());
  });

  it("User A stakes and unstakes early (creates tax)", async () => {
    [userAStatePda] = PublicKey.findProgramAddressSync([
      Buffer.from("state-v2"),
      userA.publicKey.toBuffer(),
    ], program.programId);

    await program.methods.initializeUserState().accounts({
      userState: userAStatePda,
      user: userA.publicKey,
      systemProgram: SystemProgram.programId,
    }).rpc();

    await program.methods.stake(new anchor.BN(STAKE_AMOUNT_A)).accounts({
      userState: userAStatePda,
      config: configPda,
      pool: poolPda,
      user: userA.publicKey,
      from: userAAccount,
      vault: vaultAccount,
      tokenMint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc();
    
    console.log(`📥 User A staked ${formatTokenAmount(STAKE_AMOUNT_A, DECIMALS)} tokens`);
    const vaultInfo = await getAccount(provider.connection, vaultAccount);
    const userAInfo = await getAccount(provider.connection, userAAccount);
    console.log("  - Vault Balance:", formatTokenAmount(vaultInfo.amount, DECIMALS));
    console.log("  - User A Balance:", formatTokenAmount(userAInfo.amount, DECIMALS));

    await program.methods.unstake().accounts({
      userState: userAStatePda,
      config: configPda,
      pool: poolPda,
      user: userA.publicKey,
      to: userAAccount,
      vault: vaultAccount,
      communityAta,
      tokenMint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc();

    const expectedTax = STAKE_AMOUNT_A * 0.05;
    const expectedReturned = STAKE_AMOUNT_A - expectedTax;
    const taxToPool = expectedTax * 0.6;
    const expectedCommunity = expectedTax * 0.4;

    console.log("📤 User A unstaked tokens early");
    console.log("  - Taxed Amount:", formatTokenAmount(expectedTax, DECIMALS));
    console.log("  - Sent back to User A:", formatTokenAmount(expectedReturned, DECIMALS));
    console.log("  - Vault keeps (pool share):", formatTokenAmount(taxToPool, DECIMALS));
    console.log("  - Community gets:", formatTokenAmount(expectedCommunity, DECIMALS));
    const afterUnstake = await getAccount(provider.connection, userAAccount);
    console.log("  - User A Balance After Unstake:", formatTokenAmount(afterUnstake.amount, DECIMALS));
    const vaultAfter = await getAccount(provider.connection, vaultAccount);
    console.log("  - Vault Balance After Unstake:", formatTokenAmount(vaultAfter.amount, DECIMALS));
    const communityAfter = await getAccount(provider.connection, communityAta);
    console.log("  - Community Balance After Unstake:", formatTokenAmount(communityAfter.amount, DECIMALS));
  });

  it("User B stakes and claims rewards", async () => {
    [userBStatePda] = PublicKey.findProgramAddressSync([
      Buffer.from("state-v2"),
      userB.publicKey.toBuffer(),
    ], program.programId);

    await program.methods.initializeUserState().accounts({
      userState: userBStatePda,
      user: userB.publicKey,
      systemProgram: SystemProgram.programId,
    }).signers([userB]).rpc();

    await program.methods.stake(new anchor.BN(STAKE_AMOUNT_B)).accounts({
      userState: userBStatePda,
      config: configPda,
      pool: poolPda,
      user: userB.publicKey,
      from: userBAccount,
      vault: vaultAccount,
      tokenMint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).signers([userB]).rpc();

    console.log("💤 Waiting for rewards to accumulate...");

    // Wait to accumulate some reward
    await new Promise((r) => setTimeout(r, 5000));
    console.log("⏰ Done waiting. Now claiming rewards...");    

    const before = await getAccount(provider.connection, userBAccount);
    await program.methods.claimRewards().accounts({
      userState: userBStatePda,
      user: userB.publicKey,
      pool: poolPda,
      config: configPda,
      to: userBAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      vault: vaultAccount,
    }).signers([userB]).rpc();
    const after = await getAccount(provider.connection, userBAccount);
    const diff = BigInt(after.amount) - BigInt(before.amount);

    console.log("✅ User B claimed:", formatTokenAmount(diff, DECIMALS), "tokens");
    console.log("  - User B Balance After Claim:", formatTokenAmount(after.amount, DECIMALS));
    assert.ok(diff > 0n);

    const poolState = await program.account.stakingPool.fetch(poolPda);
    const vaultFinal = await getAccount(provider.connection, vaultAccount);
    const communityFinal = await getAccount(provider.connection, communityAta);

    console.log("🏁 Final State:");
    console.log("  - Vault Balance:", formatTokenAmount(vaultFinal.amount, DECIMALS));
    console.log("  - Community Balance:", formatTokenAmount(communityFinal.amount, DECIMALS));
    console.log("  - Pool Total Tax Collected:", formatTokenAmount(poolState.totalTaxCollected.toString(), DECIMALS));
  });
});

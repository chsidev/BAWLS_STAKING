import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BawlsStaking } from "../target/types/bawls_staking";
import {
  createMint,
  createAccount,
  mintTo,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SystemProgram, PublicKey } from "@solana/web3.js";

describe("bawls_staking", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.BawlsStaking as Program<BawlsStaking>;

  let mint: PublicKey;
  let userTokenAccount: PublicKey;
  let vaultAccount: PublicKey;
  let configPda: PublicKey;
  let userStatePda: PublicKey;
  let bump: number;

  it("Initializes config", async () => {
    [configPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    await program.methods
      .initialize(provider.wallet.publicKey)
      .accounts({
        config: configPda,
        authority: provider.wallet.publicKey,
      })
      .remainingAccounts([
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ])
      .rpc();
  });

  it("Creates token mint and user ATA", async () => {
    mint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      9
    );

    userTokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      provider.wallet.publicKey
    );

    await mintTo(
      provider.connection,
      provider.wallet.payer,
      mint,
      userTokenAccount,
      provider.wallet.payer,
      1_000_000_000
    );
  });

  it("Creates vault ATA", async () => {
    vaultAccount = getAssociatedTokenAddressSync(mint, configPda, true);

    await program.methods
      .createVault()
      .accounts({
        user: provider.wallet.publicKey,
        vault: vaultAccount,
        config: configPda,
        tokenMint: mint,
      })
      .remainingAccounts([
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ])
      .rpc();
  });

  it("Initializes user state", async () => {
    [userStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("state"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeUserState()
      .accounts({
        userState: userStatePda,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  });

  it("Stakes tokens", async () => {
    await program.methods
      .stake(new anchor.BN(100_000_000))
      .accounts({
        userState: userStatePda,
        config: configPda,
        user: provider.wallet.publicKey,
        from: userTokenAccount,
        vault: vaultAccount,
      })
      .remainingAccounts([
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ])
      .rpc();
  });

  it("Unstakes tokens", async () => {
    await program.methods
      .unstake()
      .accounts({
        userState: userStatePda,
        config: configPda,
        user: provider.wallet.publicKey,
        to: userTokenAccount,
        vault: vaultAccount,
      })
      .remainingAccounts([
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ])
      .rpc();
  });
});

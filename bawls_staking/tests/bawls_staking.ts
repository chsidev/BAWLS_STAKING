import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BawlsStaking } from "../target/types/bawls_staking";
import { createMint, createAccount, mintTo } from "@solana/spl-token";

describe("bawls_staking", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.BawlsStaking as Program<BawlsStaking>;

  let mint: anchor.web3.PublicKey;
  let userTokenAccount: anchor.web3.PublicKey;
  let vaultAccount: anchor.web3.PublicKey;
  let configPda: anchor.web3.PublicKey;
  let userStatePda: anchor.web3.PublicKey;
  let bump: number;

  it("Initializes config", async () => {
    [configPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    await program.methods
      .initialize(provider.wallet.publicKey)
      .accounts({
        config: configPda,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  });

  it("Creates token mint and user ATA", async () => {
    mint = await createMint(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 9);
    userTokenAccount = await createAccount(provider.connection, provider.wallet.payer, mint, provider.wallet.publicKey);
    await mintTo(provider.connection, provider.wallet.payer, mint, userTokenAccount, provider.wallet.publicKey, 1_000_000_000);
  });

  it("Creates vault ATA", async () => {
    const vault = anchor.utils.token.associatedAddress({ mint, owner: configPda });
    vaultAccount = vault;

    await program.methods
      .createVault()
      .accounts({
        user: provider.wallet.publicKey,
        vault,
        config: configPda,
        tokenMint: mint,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      })
      .rpc();
  });

  it("Stakes tokens", async () => {
    [userStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .stake(new anchor.BN(100_000_000))
      .accounts({
        userState: userStatePda,
        config: configPda,
        user: provider.wallet.publicKey,
        from: userTokenAccount,
        vault: vaultAccount,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .rpc();
  });

  it("Unstakes tokens (with tax if before 90 days)", async () => {
    await program.methods
      .unstake()
      .accounts({
        userState: userStatePda,
        config: configPda,
        user: provider.wallet.publicKey,
        to: userTokenAccount,
        vault: vaultAccount,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .rpc();
  });
});

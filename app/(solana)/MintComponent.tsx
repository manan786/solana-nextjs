"use client";
// import { FC, useCallback, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  MINT_SIZE,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import UseConnect from "./UseConnect";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const MintComponent = () => {
  const [isMounted, setMount] = useState(false);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  useEffect(() => {
    setMount(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  //
  const dt = async () => {
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const mintKeypair = Keypair.generate();
    const { blockhash } = await connection.getLatestBlockhash();
    const tokenATA = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      publicKey!,
    );

    const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            PROGRAM_ID.toBuffer(),
            mintKeypair.publicKey.toBuffer(),
          ],
          PROGRAM_ID,
        )[0],
        mint: mintKeypair.publicKey,
        mintAuthority: publicKey!,
        payer: publicKey!,
        updateAuthority: publicKey!,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: "Yogo",
            symbol: "YG",
            uri: "https://via.placeholder.com/30x30?text=Yogo",
            creators: null,
            sellerFeeBasisPoints: 0,
            uses: null,
            collection: null,
          },
          isMutable: false,
          collectionDetails: null,
        },
      },
    );

    const createNewTokenTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey!,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        1,
        publicKey!,
        publicKey,
        TOKEN_PROGRAM_ID,
      ),
      createAssociatedTokenAccountInstruction(
        publicKey!,
        tokenATA,
        publicKey!,
        mintKeypair.publicKey,
      ),
      createMintToInstruction(
        mintKeypair.publicKey,
        tokenATA,
        publicKey!,
        1 * Math.pow(10, 1),
      ),
      createMetadataInstruction,
    );

    // console.log(createNewTokenTransaction);
    const ress = await sendTransaction(createNewTokenTransaction, connection, {
      signers: [mintKeypair],
    });
    console.log("ress", ress);
  };
  // dt()
  //   .then((res) => {
  //     console.log(res);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  // const createNewTokenTransaction = new Transaction().add(
  //   SystemProgram.createAccount({
  //     fromPubkey: publicKey!,
  //     newAccountPubkey: mintKeypair.publicKey,
  //     space: MINT_SIZE,
  //     lamports: lamports,
  //     programId: TOKEN_PROGRAM_ID,
  //   }),
  //   createInitializeMintInstruction(
  //     mintKeypair.publicKey,
  //     0.1,
  //     publicKey!,
  //     publicKey!,
  //     TOKEN_PROGRAM_ID,
  //   ),
  //   createAssociatedTokenAccountInstruction(
  //     publicKey!,
  //     tokenATA,
  //     publicKey!,
  //     mintKeypair.publicKey,
  //   ),
  //   createMintToInstruction(
  //     mintKeypair.publicKey,
  //     tokenATA,
  //     publicKey!,
  //     1 * Math.pow(10, 0.1),
  //   ),
  //   createMetadataInstruction,
  // );
  // createNewTokenTransaction.feePayer = publicKey!;
  // createNewTokenTransaction.recentBlockhash = blockhash;

  return (
    <div>
      <Button
        variant={"primary"}
        onClick={async () => {
          await dt();
        }}
      >
        Click To Minting
      </Button>
      {/* <h1>Mint Component</h1> */}
      <UseConnect />
    </div>
  );
};

export default MintComponent;

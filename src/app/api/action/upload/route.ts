/**
 * This is for blink
 */
import {
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";

import { NextResponse } from "next/server";
import simpleGit from "simple-git";
import path from "path";
import { generate } from "@/app/utils/idGenerator";
import { getAllFiles } from "@/app/utils/fileUtils";
import { createClient } from "redis";

import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { NextRequest } from "next/server";

const headers = createActionHeaders({ actionVersion: "2.2.1" });
const connection = new Connection("https://api.devnet.solana.com");

const publisher = createClient();
publisher.connect();

export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { toPubkey } = validatedQueryParams(requestUrl);

    const baseHref = new URL(
      `/api/actions/deploy-to-solynx?to=${toPubkey.toBase58()}`,
      requestUrl.origin
    ).toString();
    //https://imgcdn.dev/i/Fiu7e
    const payload: ActionGetResponse = {
      title: "Deploy on Solynx",
      icon: "https://s6.imgcdn.dev/Fiu7e.jpg",
      description: "One click decentralized deploy.",
      label: "Quick Deploy",
      links: {
        actions: [
          {
            label: "Deploy",
            href: "/api/action/upload?repo={repo}&amount={amount}",
            parameters: [
              {
                type: "select",
                name: "amount",
                label: "Select Deployment Plan",
                required: true,
                options: [
                  { label: "Free Deploy [0 SOL]", value: "0" },
                  { label: "Quick Deploy [1 SOL]", value: "1" },
                  { label: "Priority Deploy [5 SOL]", value: "5" },
                ],
              },
              {
                type: "text",
                name: "repo",
                label: "https://github.com/username/repo", // placeholder of the text input
                required: true,
              },
            ],
          },
        ],
      },
    };

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = async (req: Request) => {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
};

// export const POST = async (req: Request) => {
//   // try {
//   //   const requestUrl = new URL(req.url);
//   //   const { amount, toPubkey } = validatedQueryParams(requestUrl);

//   //   const body: ActionPostRequest = await req.json();

//   //   // validate the client provided input
//   //   let account: PublicKey;
//   //   try {
//   //     account = new PublicKey(body.account);
//   //   } catch (err) {
//   //     return new Response('Invalid "account" provided', {
//   //       status: 400,
//   //       headers: ACTIONS_CORS_HEADERS,
//   //     });
//   //   }

//   //   const connection = new Connection(
//   //     process.env.SOLANA_RPC! || clusterApiUrl("mainnet-beta")
//   //   );

//   //   // ensure the receiving account will be rent exempt
//   //   const minimumBalance = await connection.getMinimumBalanceForRentExemption(
//   //     0 // note: simple accounts that just store native SOL have `0` bytes of data
//   //   );
//   //   if (amount * LAMPORTS_PER_SOL < minimumBalance) {
//   //     throw `account may not be rent exempt: ${toPubkey.toBase58()}`;
//   //   }

//   //   // create an instruction to transfer native SOL from one wallet to another
//   //   const transferSolInstruction = SystemProgram.transfer({
//   //     fromPubkey: account,
//   //     toPubkey: toPubkey,
//   //     lamports: amount * LAMPORTS_PER_SOL,
//   //   });

//   //   // get the latest blockhash amd block height
//   //   const { blockhash, lastValidBlockHeight } =
//   //     await connection.getLatestBlockhash();

//   //   // create a legacy transaction
//   //   const transaction = new Transaction({
//   //     feePayer: account,
//   //     blockhash,
//   //     lastValidBlockHeight,
//   //   }).add(transferSolInstruction);

//   //   const payload: ActionPostResponse = await createPostResponse({
//   //     fields: {
//   //       type: "transaction",
//   //       transaction,
//   //       message: `Sent ${amount} SOL to Deploy: ${toPubkey.toBase58()}`,
//   //     },
//   //     // note: no additional signers are needed
//   //     // signers: [],
//   //   });

//   //   return Response.json(payload, {
//   //     headers: ACTIONS_CORS_HEADERS,
//   //   });
//   // }
//   try {
//     const { searchParams } = new URL(req.url);
//     const repo = searchParams.get("repo");
//     const amount = searchParams.get("amount");
//     console.log(repo, amount);
//   } catch (err) {
//     console.log(err);
//     let message = "An unknown error occurred";
//     if (typeof err == "string") message = err;
//     return new Response(message, {
//       status: 400,
//       headers: ACTIONS_CORS_HEADERS,
//     });
//   }
// };
export const POST = async (req: NextRequest) => {
  try {
    let { searchParams } = req.nextUrl;
    let repo = searchParams.get("repo") || "";
    let amount = searchParams.get("amount");
    console.log(`Repo is: ${repo}`);
    console.log(`Amount is: ${amount}`);

    // Generate Random Id
    const id = generate();

    // File
    const outputPath = path.join(process.cwd(), "output", id);
    await simpleGit().clone(repo, outputPath);
    const files = getAllFiles(outputPath);
    console.log(`Files are: ${files}`);

    // Redis
    publisher.lPush("build-queue", id);

    // Payload [transaction and message]
    let serialTx: string;
    const tx = new Transaction();
    const user = await req.json();
    tx.feePayer = new PublicKey(user.account);
    const bh = (
      await connection.getLatestBlockhash({ commitment: "finalized" })
    ).blockhash;
    console.log(`blockhash ${bh}`);
    tx.recentBlockhash = bh;
    serialTx = tx
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString("base64");

    const response = {
      transaction: serialTx,
      message: `Successfully cloned and queued for processing. ID: ${id}`,
    };

    return Response.json(response, {
      status: 200,
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (e) {
    console.error("Error cloning repo:", e);

    const errorResponse = {
      type: "error",
      title: "Cloning Failed",
      description:
        "Failed to clone the repository. Please check the URL and try again.",
    };
    return Response.json(errorResponse, {
      status: 500,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};
function validatedQueryParams(requestUrl: URL) {
  let toPubkey: PublicKey = new PublicKey(
    "6oSkwae3LxcrkDudFBS6Cwpzv8rkub5E587nSHY3KarG"
  );
  let amount: number = 0.1;

  try {
    if (requestUrl.searchParams.get("to")) {
      toPubkey = new PublicKey(requestUrl.searchParams.get("to")!);
    }
  } catch (err) {
    throw "Invalid input query parameter: to";
  }

  try {
    if (requestUrl.searchParams.get("amount")) {
      amount = parseFloat(requestUrl.searchParams.get("amount")!);
    }

    if (amount <= 0) throw "amount is too small";
  } catch (err) {
    throw "Invalid input query parameter: amount";
  }

  return {
    amount,
    toPubkey,
  };
}

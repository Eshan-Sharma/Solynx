/**
 * This is for blink
 */
import {
  createActionHeaders,
  ActionGetResponse,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";

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
      icon: "https://bafybeibagjmvlztpgswjqxzwwj7fuoct3a4tbkdxjk3qllj7nsrtoaigna.ipfs.w3s.link/Solynx_icon.jpg",
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
export const POST = async (req: NextRequest) => {
  try {
    let { searchParams } = req.nextUrl;
    let repo = searchParams.get("repo") || "";
    let amount = searchParams.get("amount") || "0";
    console.log(`Repo is: ${repo}`);
    console.log(`Amount is: ${amount}`);

    // Generate Random Id
    const id = generate();

    // File
    const outputPath = path.join(process.cwd(), "output", id);
    await simpleGit().clone(repo, outputPath);
    const files = getAllFiles(outputPath);
    //console.log(`Files are: ${files}`);

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
      .add(
        SystemProgram.transfer({
          fromPubkey: tx.feePayer,
          toPubkey: new PublicKey(
            "6oSkwae3LxcrkDudFBS6Cwpzv8rkub5E587nSHY3KarG"
          ),
          lamports: LAMPORTS_PER_SOL * parseInt(amount),
        })
      )
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

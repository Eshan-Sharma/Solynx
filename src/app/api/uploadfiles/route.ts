// app/api/upload/route.ts
import { uploadDirectoryToIPFS } from '@/app/utils/ipfsUploader';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const { directoryPath } = await request.json();
    const result = await uploadDirectoryToIPFS(directoryPath);
    return NextResponse.json({ cid: result.cid }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload directory to IPFS' }, { status: 500 });
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

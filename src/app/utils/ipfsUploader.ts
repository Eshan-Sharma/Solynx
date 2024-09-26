// utils/ipfsUploader.ts
import { create, globSource } from 'ipfs-http-client';
import { URL } from 'url';
import fetch from 'node-fetch';

const ipfs = create({
  url: new URL('https://ipfs.infura.io:5001/api/v0')
});

export async function uploadDirectoryToIPFS(directoryPath: string) {
  const files = globSource(directoryPath, '**/*');
  const result = await ipfs.addAll(files, { wrapWithDirectory: true });
  let cid = '';
  for await (const file of result) {
    if (file.path === '') {
      cid = file.cid.toString();
    }
  }
  return { cid };
}

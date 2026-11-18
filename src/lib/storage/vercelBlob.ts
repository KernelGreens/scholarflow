import { put, get, type PutBlobResult } from '@vercel/blob';

export type VercelBlobUploadInput = {
  pathname: string;
  data: Blob | string;
  access?: 'public' | 'private';
};

export type VercelBlobUploadResult = {
  url: string;
  downloadUrl: string;
};

export async function uploadToVercelBlob(input: VercelBlobUploadInput): Promise<VercelBlobUploadResult> {
  const result: PutBlobResult = await put(input.pathname, input.data, {
    access: input.access ?? 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN ?? undefined,
  });
  return { url: result.url, downloadUrl: result.downloadUrl };
}

export async function getVercelBlob(urlOrPathname: string, access: 'public' | 'private') {
  return get(urlOrPathname, {
    access,
    token: process.env.BLOB_READ_WRITE_TOKEN ?? undefined,
  });
}

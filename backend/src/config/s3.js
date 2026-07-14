import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const isDev = process.env.NODE_ENV !== 'production';

// Saat development: konek ke LocalStack (Docker) di localhost:4566
// Saat production: konek ke AWS S3 asli, cukup hapus AWS_S3_ENDPOINT di .env
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  ...(isDev && process.env.AWS_S3_ENDPOINT
    ? { endpoint: process.env.AWS_S3_ENDPOINT, forcePathStyle: true }
    : {})
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET;
export default s3Client;

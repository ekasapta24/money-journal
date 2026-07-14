#!/bin/bash
# Jalankan setelah docker-compose up, untuk membuat bucket S3 di LocalStack
echo "Membuat bucket S3 di LocalStack..."

awslocal s3 mb s3://money-journal-receipts 2>/dev/null || \
aws --endpoint-url=http://localhost:4566 s3 mb s3://money-journal-receipts

echo "Bucket 'money-journal-receipts' siap dipakai."

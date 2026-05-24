package storage

import (
	"context"
	"fmt"
	"io"
	"log"

	"hyper-realm/storage-api/internal/config"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var Client *minio.Client

func InitCeph(cfg config.Config) {
	var err error

	// 🎯 FIXED: Direct Path Lookup enabled to force precise path resolution
	Client, err = minio.New(cfg.S3Endpoint, &minio.Options{
		Creds:        credentials.NewStaticV4(cfg.S3AccessKey, cfg.S3SecretKey, ""),
		Secure:       false,
		Region:       "us-east-1",
		BucketLookup: minio.BucketLookupPath,
	})
	if err != nil {
		log.Fatalf("Ceph Dev Mock Connection Failed: %v", err)
	}

	ctx := context.Background()
	exists, err := Client.BucketExists(ctx, cfg.BucketName)
	if err != nil {
		log.Printf("[⚠️ WARN] Initializing node tracefallback: %v", err)
	}

	if !exists {
		log.Printf("Allocation partition [%s] bootstrapping...", cfg.BucketName)
		_ = Client.MakeBucket(ctx, cfg.BucketName, minio.MakeBucketOptions{Region: "us-east-1"})
	}

	// 🎯 CRITICAL FIXED: Direct Anonymous Read policy schema assignment.
	// This forces public read standard over the entire bucket which prevents immediate forced downloads.
	policyJson := fmt.Sprintf(`{
		"Version": "2012-10-17",
		"Statement": [
			{
				"Effect": "Allow",
				"Principal": {"AWS": ["*"]},
				"Action": ["s3:GetObject"],
				"Resource": ["arn:aws:s3:::%s/*"]
			}
		]
	}`, cfg.BucketName)

	err = Client.SetBucketPolicy(ctx, cfg.BucketName, policyJson)
	if err != nil {
		log.Printf("[⚠️ EXCEPTION] Unable to release bucket permissions: %v", err)
	} else {
		log.Printf("Storage partition [%s] now in ANONYMOUS READ mode standard.", cfg.BucketName)
	}
}

// REST OF THE MULTIPART STREAM HANDLERS REMAINS UNCHANGED:
func InitMultipart(ctx context.Context, bucket, objectName, contentType string) (string, error) {
	coreClient := minio.Core{Client: Client}
	return coreClient.NewMultipartUpload(ctx, bucket, objectName, minio.PutObjectOptions{ContentType: contentType})
}

func UploadChunkPart(ctx context.Context, bucket, objectName, uploadID string, partNumber int, reader io.Reader, size int64) (minio.ObjectPart, error) {
	coreClient := minio.Core{Client: Client}
	return coreClient.PutObjectPart(ctx, bucket, objectName, uploadID, partNumber, reader, size, minio.PutObjectPartOptions{})
}

func CompleteMultipart(ctx context.Context, bucket, objectName, uploadID string, parts []minio.CompletePart) (minio.UploadInfo, error) {
	coreClient := minio.Core{Client: Client}
	return coreClient.CompleteMultipartUpload(ctx, bucket, objectName, uploadID, parts, minio.PutObjectOptions{})
}

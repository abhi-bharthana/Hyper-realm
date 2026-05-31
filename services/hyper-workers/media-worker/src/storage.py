import boto3
import os

MINIO_ENDPOINT = os.getenv("S3_ENDPOINT", "http://hyper-minio:9000")
ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID", "7KF1I2CYE25G2R7HWCVL")
SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "2BYAzXng14JMBfjB3ZCj6SoHlSJqqzDL8Ke5LnBE")
BUCKET_NAME = "hyper-vision-bucket"

s3_client = boto3.client(
    's3',
    endpoint_url=MINIO_ENDPOINT,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY
)

def download_image(object_name, download_path):
    print(f"⬇️ Downloading {object_name} from MinIO...")
    s3_client.download_file(BUCKET_NAME, object_name, download_path)
    return download_path

def upload_image(file_path, object_name):
    print(f"⬆️ Uploading {object_name} to MinIO...")
    s3_client.upload_file(file_path, BUCKET_NAME, object_name)
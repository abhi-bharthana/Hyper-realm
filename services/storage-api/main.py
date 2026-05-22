from fastapi import FastAPI, UploadFile, HTTPException, Form
import redis
import boto3
import os

app = FastAPI()

# K8s env variables
S3_URL = os.getenv("S3_ENDPOINT", "http://192.168.29.67:7480")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")

# Connections
redis_client = redis.Redis(host=REDIS_HOST, port=6379, decode_responses=True)

s3_client = boto3.client(
    's3', 
    endpoint_url=S3_URL,
    aws_access_key_id='7KF1I2CYE25G2R7HWCVL',
    aws_secret_access_key='2BYAzXng14JMBfjB3ZCj6SoHlSJqqzDL8Ke5LnBE',
    region_name='us-east-1'
)

MAX_STORAGE_BYTES = 5 * 1024 * 1024 * 1024 

@app.post("/upload/")
async def upload_file(user_id: str = Form(...), file: UploadFile = Form(...)):
    file_content = await file.read()
    file_size = len(file_content)
    
    current_usage = redis_client.get(f"storage_usage:{user_id}")
    current_usage = int(current_usage) if current_usage else 0
    
    if current_usage + file_size > MAX_STORAGE_BYTES:
        raise HTTPException(status_code=400, detail="5GB Storage Limit Exceeded!")

    bucket_name = "hyper-users-data"
    object_name = f"{user_id}/{file.filename}"
    
    try:
        try:
            s3_client.head_bucket(Bucket=bucket_name)
        except:
            s3_client.create_bucket(Bucket=bucket_name)

        s3_client.put_object(Bucket=bucket_name, Key=object_name, Body=file_content)
        redis_client.incrby(f"storage_usage:{user_id}", file_size)
        
        return {"status": "Success", "used_storage_bytes": current_usage + file_size}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
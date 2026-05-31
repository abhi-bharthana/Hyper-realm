from fastapi import Request

def get_current_user_hid(request: Request):
    # API Gateway se aaya header pass kar rahe hain, ya default fallback
    user_hid = request.headers.get("x-user-hid", "abhishek-babu-node")
    return user_hid
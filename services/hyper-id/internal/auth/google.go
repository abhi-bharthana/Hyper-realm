package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// GoogleUserInfo holds the data returned by Google's UserInfo API
type GoogleUserInfo struct {
	Sub   string `json:"sub"` // Ye Google ka Unique ID (Subject) hota hai
	Email string `json:"email"`
}

// VerifyGoogleAccessToken ab strictly ID Token ko verify karega
func VerifyGoogleAccessToken(idToken string) (*GoogleUserInfo, error) {
	// 🚨 FIX: Endpoint changed to verify ID Tokens instead of Access Tokens
	reqURL := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken)

	resp, err := http.Get(reqURL)
	if err != nil {
		return nil, fmt.Errorf("failed to make request to Google: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid google id_token")
	}

	var userInfo GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("failed to decode google response: %v", err)
	}

	return &userInfo, nil
}

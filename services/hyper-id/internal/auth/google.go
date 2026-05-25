package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type GoogleUserInfo struct {
	Sub   string `json:"sub"`   // Google Unique Sub ID mapped correctly
	Email string `json:"email"` // Google Account Email address
}

func VerifyGoogleAccessToken(idToken string) (*GoogleUserInfo, error) {
	// Dynamic runtime client layer with timeout optimization bounds
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	reqURL := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken)

	resp, err := client.Get(reqURL)
	if err != nil {
		return nil, fmt.Errorf("network crash: failed to link with google auth clusters: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("google security layer rejected token with status: %d", resp.StatusCode)
	}

	var userInfo GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("failed parsing decoding network payload token data: %v", err)
	}

	return &userInfo, nil
}

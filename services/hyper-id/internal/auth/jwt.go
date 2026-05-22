package auth

import (
	"crypto/rsa"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var privateKey *rsa.PrivateKey

type HyperClaims struct {
	HID      string `json:"hid"`
	Username string `json:"username"`
	Status   string `json:"status"`
	jwt.RegisteredClaims
}

func InitKeys(privateKeyPath string) error {
	keyBytes, err := os.ReadFile(privateKeyPath)
	if err != nil {
		return err
	}

	key, err := jwt.ParseRSAPrivateKeyFromPEM(keyBytes)
	if err != nil {
		return err
	}

	privateKey = key
	return nil
}

func GenerateHyperToken(hid, username, status string) (string, error) {
	claims := HyperClaims{
		HID:      hid,
		Username: username,
		Status:   status,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "hyper-id",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	return token.SignedString(privateKey)
}

func VerifyHyperToken(tokenString string) (*HyperClaims, error) {
	claims := &HyperClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return &privateKey.PublicKey, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	return claims, nil
}

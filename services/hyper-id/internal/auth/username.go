package auth

import (
	"database/sql"
	"fmt"
	"math/rand"
	"strings"
	"time"
)

func GenerateUniqueUsername(db *sql.DB, emailOrName string) (string, error) {
	// 1. Email ka prefix ya name uthao, lowercase karo aur characters saaf karo
	base := strings.Split(emailOrName, "@")[0]
	base = strings.ToLower(strings.ReplaceAll(base, " ", ""))
	base = strings.ReplaceAll(base, ".", "")

	if base == "" {
		base = "commander"
	}

	rand.Seed(time.Now().UnixNano())

	for {
		// 2. Random 4 digit number append karo
		randNum := rand.Intn(9000) + 1000
		candidate := fmt.Sprintf("%s_%d", base, randNum)

		// 3. Check karo ki credentials/users table mein unique hai ya nahi
		var exists bool
		query := "SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)"
		err := db.QueryRow(query, candidate).Scan(&exists)
		if err != nil {
			return "", err
		}

		if !exists {
			return candidate, nil // Unique username mil gaya!
		}
	}
}

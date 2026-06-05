package handlers

import (
	"hyper-os/database"
	"hyper-os/models"

	"github.com/gofiber/fiber/v2"
)

// GET /api/v1/storage/files
func GetFileSystem(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)
	folder := c.Query("folder", "") // default root

	var nodes []models.VFSNode
	database.DB.Where("hyper_id = ? AND parent_path = ?", hyperID, folder).Find(&nodes)

	// Frontend ko specific JSON keys chahiye, isliye map kar rahe hain
	var files []fiber.Map
	var directories []fiber.Map

	for _, n := range nodes {
		if n.Type == "FOLDER" {
			directories = append(directories, fiber.Map{
				"name":       n.Name,
				"path":       n.FullPath,
				"isReadOnly": n.IsReadOnly,
			})
		} else {
			files = append(files, fiber.Map{
				"id":           n.FullPath,
				"file_name":    n.Name,
				"object_name":  n.ObjectKey,
				"file_size":    n.Size,
				"created_at":   n.CreatedAt,
				"content_type": n.MimeType,
			})
		}
	}

	// Nil arrays ko empty JSON array [] banake bhejo
	if files == nil {
		files = make([]fiber.Map, 0)
	}
	if directories == nil {
		directories = make([]fiber.Map, 0)
	}

	return c.JSON(fiber.Map{
		"files":       files,
		"directories": directories,
		"stats":       fiber.Map{"used_storage_bytes": 0}, // Future integration with MinIO Quota
	})
}

// POST /api/v1/storage/folder/create
func CreateFolder(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)

	type Req struct {
		FolderName string `json:"folder_name"`
		ParentPath string `json:"parent_path"`
	}
	var body Req
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid payload"})
	}

	fullPath := body.FolderName
	if body.ParentPath != "" {
		fullPath = body.ParentPath + "/" + body.FolderName
	}

	node := models.VFSNode{
		HyperID:    hyperID,
		Name:       body.FolderName,
		Type:       "FOLDER",
		ParentPath: body.ParentPath,
		FullPath:   fullPath,
		Owner:      "user",
	}

	if err := database.DB.Create(&node).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create folder. Might exist already."})
	}

	// 📝 Telemetry Footprint Record
	database.DB.Create(&models.AuditLog{
		HyperID: hyperID,
		Action:  "CREATE",
		Target:  body.FolderName,
		Details: "Provisioned new namespace directory",
	})

	return c.JSON(fiber.Map{"status": "success", "message": "Directory allocated"})
}

// DELETE /api/v1/storage/folder/purge
func PurgeFolder(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)
	folderPath := c.Query("folder_path", "")

	if folderPath == "" || folderPath == "vault" {
		return c.Status(403).JSON(fiber.Map{"error": "Restricted root namespace operation"})
	}

	// Folder aur uske andar ka saara data purge karna
	database.DB.Where("hyper_id = ? AND (full_path = ? OR parent_path LIKE ?)", hyperID, folderPath, folderPath+"/%").Delete(&models.VFSNode{})

	database.DB.Create(&models.AuditLog{
		HyperID: hyperID, Action: "DELETE", Target: folderPath, Details: "Directory tree purged from VFS",
	})

	return c.JSON(fiber.Map{"status": "success"})
}

// DELETE /api/v1/storage/asset/remove
func RemoveAsset(c *fiber.Ctx) error {
	hyperID := c.Locals("hyperID").(string)
	objectKey := c.Query("object_key", "")

	database.DB.Where("hyper_id = ? AND full_path = ? AND type = 'FILE'", hyperID, objectKey).Delete(&models.VFSNode{})

	// Note: Yahan actually MinIO se delete karne ki logic aayegi future mein

	database.DB.Create(&models.AuditLog{
		HyperID: hyperID, Action: "DELETE", Target: objectKey, Details: "Asset shard unlinked and purged",
	})

	return c.JSON(fiber.Map{"status": "success"})
}

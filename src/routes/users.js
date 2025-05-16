const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // Récupérer tous les utilisateurs
  router.get("/", async (req, res) => {
    try {
      const [users] = await db.query("SELECT * FROM users");
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
    }
  });

  // Ajouter un nouvel utilisateur
  router.post("/", async (req, res) => {
    const { name, email, password, role } = req.body;
  
    if (!password) {
      return res.status(400).json({ error: "Le mot de passe est requis." });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role]
      );
      const newUser = { id: result.insertId, name, email, role };
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur:", error);
      res.status(500).json({ error: "Erreur lors de l'ajout de l'utilisateur." });
    }
  });

  // Modifier un utilisateur
  router.put("/:id", async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      await db.query("UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?", [name, email, password, role, req.params.id]);
      res.json({ id: req.params.id, name, email, role });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la modification de l'utilisateur." });
    }
  });

  // Supprimer un utilisateur
  router.delete("/:id", async (req, res) => {
    try {
      await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur." });
    }
  });

  return router;
};
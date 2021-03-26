const { Router } = require("express");
const User = require("../db/models/user");
const auth = require("../middleware/auth");
const router = new Router();
router.post("/users", async (req, res) => {
  if (req.body) {
    try {
      const user = new User(req.body);
      await user.save();
      const token = await user.createAuthToken();

      res.status(201).send({ user, token });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isAllowed = updates.every((update) => {
    if (!allowedUpdates.includes(update)) {
      return false;
    }
    return true;
  });
  if (!isAllowed) {
    return res.status(400).send("update is not allowed");
  }
  try {
    const user = req.user;
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete("/users/:id", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user.name + " profile is deleted");
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.createAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;

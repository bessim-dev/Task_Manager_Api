const { Router } = require("express");
const multer = require("multer");
const sharp = require("sharp");

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

upload = multer({
  limits: { fileSize: 1000000 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) {
      return cb(new Error("Please upload an image format"));
    }
    cb(undefined, true);
  },
});
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),

  async function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    const avatar = await sharp(req.file.buffer)
      .resize(250, 250)
      .png()
      .toBuffer();
    req.user.avatar = avatar;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async function (req, res) {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("/users/me/avatar", auth, async function (req, res) {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("/users/:id/avatar", async function (req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;

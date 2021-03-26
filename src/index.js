const express = require("express");
const UsersRouter = require("./routes/users");
const TasksRouter = require("./routes/tasks");

require("./db/mongoose");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Tasks Endpoints
app.use(TasksRouter);
// Users Endpoints
app.use(UsersRouter);

app.listen(PORT, () => {
  console.log("server is setup on port", PORT);
});

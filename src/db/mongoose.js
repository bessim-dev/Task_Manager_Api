const mongoose = require("mongoose");
//WclKClac2C06BNlO
//if u are on local this si sthe uri : mongodb://127.0.0.1:27017/task-manager-api
const uri =
  "mongodb+srv://taskManagerUser:WclKClac2C06BNlO@cluster0.grjjz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("db is connected!");
});

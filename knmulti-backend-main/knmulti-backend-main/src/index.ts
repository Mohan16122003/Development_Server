import { connectDB } from "./db";
import server from "./server";
require("dotenv").config();

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 3001, () => {
      console.log("Server is running on port 3001");
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

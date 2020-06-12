const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");
const cors = require("cors");
const isAuth = require("./middleware/is-auth");
const userSchema = require("./graphql/schema/index");
const rootResolver = require("./graphql/resolvers/index");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(isAuth);
app.use(
  "/graphql",
  graphqlHttp({
    schema: userSchema,
    rootValue: rootResolver,
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://shubhamkojha:thisisshubham@cluster0-ecy7l.mongodb.net/todographql?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 4000);
    console.log("server is running on 4000");
  })
  .catch((err) => {
    console.log(err);
  });

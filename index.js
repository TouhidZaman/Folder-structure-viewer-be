require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ewkzdwk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("folderStructureDB");
    const foldersCollection = db.collection("folders");

    /*
      ###############################
      #### Create New Folder API ####
      ###############################
    */
    app.post("/folders", async (req, res) => {
      const user = req.body;
      const result = await foldersCollection.insertOne(user);
      res.send(result);
    });

    /*
      #############################
      #### Get All Folders API ####
      #############################
    */
    app.get("/folders/", async (req, res) => {
      let query = {};
      try {
        const result = foldersCollection.find(query);
        const folders = await result.toArray();
        res.status(200).json(folders);
      } catch (err) {
        res.status(500).json(err);
      }
    });

    /*
      ###################################
      ### Get Folders by ParentId API ###
      ###################################
    */
    app.get("/folders/parent/:parentId", async (req, res) => {
      const parentId = req.params.parentId;
      let query = { parentId };
      try {
        const result = foldersCollection.find(query);
        const foldersByParent = await result.toArray();
        res.status(200).json(foldersByParent);
      } catch (err) {
        res.status(500).json(err);
      }
    });

    /*
      #######################################
      ### Get Folders by ParentId Groping ###
      #######################################
    */
    app.get("/folders/parent", async (req, res) => {
      try {
        const result = foldersCollection.aggregate([
          {
            $group: {
              _id: "$parentId",
              children: {
                $push: {
                  _id: "$_id",
                  name: "$name",
                  // parentId: "$parentId",
                  readOnly: "$readOnly",
                },
              },
            },
          },
        ]);
        const foldersByParent = await result.toArray();
        res.status(200).json(foldersByParent);
      } catch (err) {
        res.status(500).json(err);
      }
    });

    /*
      #############################
      ### Get Folder By Id API ####
      #############################
    */
    app.get("/folders/:folderId", async (req, res) => {
      const folderId = req.params.folderId;
      try {
        const customer = await foldersCollection.findOne({
          _id: ObjectId(folderId),
        });
        res.status(200).json(customer);
      } catch (err) {
        res.status(500).json(err);
      }
    });

    /*
      #############################
      ##### Update Folder API #####
      #############################
    */
    app.patch("/folders/:folderId", async (req, res) => {
      const folderId = req.params?.folderId;
      const updatedFolder = req.body;
      try {
        const filter = { _id: ObjectId(folderId) };
        const updateDoc = {
          $set: {
            ...updatedFolder,
          },
        };
        const result = await foldersCollection.updateOne(filter, updateDoc);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send(error);
      }
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send({
    status: true,
    data: {
      message: "Welcome to folder-structure-viewer server",
      author: {
        name: "Muhammad Touhiduzzaman",
        email: "touhid4bd@gmail.com",
        url: "https://github.com/TouhidZaman",
      },
    },
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

import { MongoClient, ServerApiVersion } from "mongodb";
const uri =
  "mongodb+srv://mhfdias:IhR62dOk0pltTIfr@cluster0.ofpk0bw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

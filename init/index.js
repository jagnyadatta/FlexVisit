const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

//mongo url
const MONGO_URL = "mongodb://127.0.0.1:27017/FlexVisit";
//main function connection
main()
  .then(() => {
    console.log("Connected to the Database");
  })
  .catch((err) => {
    console.log(err);
  });
//main fuction declaration
async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner: "66bf8b98d798b28ea75e0476"}))
    await Listing.insertMany(initData.data);
    console.log("Data was Initialized");
};

initDB();
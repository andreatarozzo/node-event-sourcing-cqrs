import mongoose, { Mongoose } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import { seeder } from "../src/seeder";
import { SeederFunction } from "../src/types";

class TestDatabase {
  mongoose: Mongoose;
  mongo!: MongoMemoryServer;
  seeder: SeederFunction;

  constructor(mongoose: Mongoose, seeder: SeederFunction) {
    this.mongoose = mongoose;
    this.seeder = seeder;
  }

  /**
   * Creating in-memory DB and connecting to it
   */
  async connect() {
    this.mongo = await MongoMemoryServer.create();
    await this.mongoose.connect(this.mongo.getUri());
  }

  /**
   * Clear all data from all collection in DB
   */
  async clearDatabase() {
    const collections = this.mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }

  /**
   * Drop DB e close connection
   */
  async closeDatabase() {
    await this.mongoose.connection.dropDatabase();
    await this.mongoose.connection.close();
    await this.mongo.stop();
  }
}

const testDatabase = new TestDatabase(mongoose, seeder);
export default testDatabase;

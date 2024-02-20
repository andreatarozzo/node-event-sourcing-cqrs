import mongoose from "mongoose";

class DB {
  /**
   * Connect to mongodb
   * @param connectionString
   * @returns
   */
  static async connect(connectionString: string) {
    return mongoose
      .connect(connectionString)
      .then((conn) => {
        console.log(`DB Connected`);
      })
      .catch((err: any) => {
        console.log(`DB Connection Error: ${err.toString()}`);
      });
  }
}

export default DB;

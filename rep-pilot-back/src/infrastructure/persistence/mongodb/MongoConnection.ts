import mongoose from "mongoose";

let isConnected = false;

export async function connectToMongoDB(uri: string): Promise<void> {
  if (isConnected) return;

  await mongoose.connect(uri);
  isConnected = true;
  console.log("MongoDB connected");
}

export async function disconnectFromMongoDB(): Promise<void> {
  if (!isConnected) return;

  await mongoose.disconnect();
  isConnected = false;
  console.log("MongoDB disconnected");
}

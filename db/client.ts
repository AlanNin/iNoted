import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

export const expo_db = SQLite.openDatabaseSync("db");

export const db_client = drizzle(expo_db);

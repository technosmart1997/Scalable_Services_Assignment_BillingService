import "dotenv/config";
import postgres from "postgres";

const SSL = process.env.NODE_ENV === "production";

const sql = postgres({
  transform: {
    undefined: null,
  },
  ssl: SSL,
  idle_timeout: 60, // close idle connections after 30 seconds
  max_lifetime: 60 * 20, // kill connections after 20 minutes
  connection: {
    application_name: "billing_service",
  },
});

// Check for connection errors

const queryTimed = async (text, params) => {
  console.time("executed query");
  const res = await sql`${sql(text, ...params)}`;
  console.timeEnd("executed query");
  return res;
};

const ping = async () => {
  try {
    await sql`SELECT 1`;
    console.info("POSTGRES CONNECTION SUCCESSFUL");
  } catch (e) {
    console.error("POSTGRES CONNECTION FAILED");
    console.error("Error pinging postgres", e);
    process.exit(1);
  }
};

export { sql as dbPool, ping as pingPostgres, queryTimed };

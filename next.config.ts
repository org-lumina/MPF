import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fijamos la raíz de tracing al propio proyecto: en C:\tmp existe otro
  // package-lock.json que Next podría inferir erróneamente como workspace root.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;

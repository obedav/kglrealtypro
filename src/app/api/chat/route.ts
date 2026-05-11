import { chatRouteHandler } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

export const POST = chatRouteHandler;

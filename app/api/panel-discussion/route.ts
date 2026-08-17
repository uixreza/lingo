import { NextResponse } from "next/server";
import { getPanelTopic, PANEL_TOPICS, weekIndexFor } from "@/lib/panel-topics";

export async function GET() {
  const weekIndex = weekIndexFor();
  const topicNumber = ((weekIndex % PANEL_TOPICS.length) + PANEL_TOPICS.length) % PANEL_TOPICS.length + 1;

  return NextResponse.json({
    topic: getPanelTopic(),
    topicNumber,
    weekIndex,
  });
}

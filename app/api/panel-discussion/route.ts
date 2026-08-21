import { NextResponse } from "next/server";
import { getPanelTopic, PANEL_TOPICS, weekIndexFor } from "@/lib/panel-topics";
import { prisma } from "@/lib/auth";

export async function GET() {
  const weekIndex = weekIndexFor();
  const topicNumber = ((weekIndex % PANEL_TOPICS.length) + PANEL_TOPICS.length) % PANEL_TOPICS.length + 1;

  const record = await prisma.panelDiscussion.findFirst();
  const topic = record?.topic || getPanelTopic();

  return NextResponse.json({
    topic,
    topicNumber,
    weekIndex,
    link: record?.link ?? null,
  });
}

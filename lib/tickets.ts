import type { Ticket, TicketReply } from "@/app/generated/prisma";

export const statusToStr = {
  Open: "open",
  InProgress: "in-progress",
  Resolved: "resolved",
  Closed: "closed",
} as const;

export const priorityToStr = {
  Low: "low",
  Medium: "medium",
  High: "high",
  Urgent: "urgent",
} as const;

export const categoryToStr = {
  Technical: "technical",
  Payment: "payment",
  Content: "content",
  Certificate: "certificate",
  General: "general",
} as const;

export const strToStatus = {
  open: "Open",
  "in-progress": "InProgress",
  resolved: "Resolved",
  closed: "Closed",
} as const;

export const strToPriority = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
} as const;

export const strToCategory = {
  technical: "Technical",
  payment: "Payment",
  content: "Content",
  certificate: "Certificate",
  general: "General",
} as const;

export type ApiReply = {
  id: number;
  message: string;
  isAdmin: boolean;
  userName: string;
  createdAt: string;
};

export type ApiTicket = {
  id: number;
  title: string;
  message: string;
  status: (typeof statusToStr)[keyof typeof statusToStr];
  priority: (typeof priorityToStr)[keyof typeof priorityToStr];
  category: (typeof categoryToStr)[keyof typeof categoryToStr];
  createdAt: string;
  updatedAt: string;
  user: { name: string; email: string };
  replies: ApiReply[];
  attachment?: string | null;
};

export type TicketWithRelations = Ticket & {
  user: { fullname: string; email: string | null };
  replies: TicketReply[];
};

export function serializeReply(reply: TicketReply): ApiReply {
  return {
    id: reply.id,
    message: reply.message,
    isAdmin: reply.isAdmin,
    userName: reply.userName,
    createdAt: reply.createdAt.toISOString(),
  };
}

export function serializeTicket(ticket: TicketWithRelations): ApiTicket {
  return {
    id: ticket.id,
    title: ticket.title,
    message: ticket.message,
    status: statusToStr[ticket.status],
    priority: priorityToStr[ticket.priority],
    category: categoryToStr[ticket.category],
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    user: { name: ticket.user.fullname, email: ticket.user.email ?? "" },
    replies: ticket.replies.map(serializeReply),
    attachment: ticket.attachment,
  };
}

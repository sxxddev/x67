import { prisma } from "@/lib/prisma"

export async function approveTopupTransaction(
  topupId: number,
  options?: { adminId?: number | null; adminNote?: string | null }
) {
  const topup = await prisma.topupTransaction.findUnique({
    where: { id: topupId },
  })

  if (!topup) {
    throw new Error("Topup not found")
  }

  if (topup.status !== "PENDING") {
    throw new Error("Topup already processed")
  }

  await prisma.$transaction([
    prisma.topupTransaction.update({
      where: { id: topupId },
      data: {
        status: "APPROVED",
        adminNote: options?.adminNote ?? topup.adminNote,
        approvedBy: options?.adminId ?? null,
        approvedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: topup.userId },
      data: { balance: { increment: topup.amount } },
    }),
  ])

  return topup
}

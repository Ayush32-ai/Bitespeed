import express, { Request, Response, Router } from "express";
import cors from "cors";
import "dotenv/config";
import { prisma } from "./prisma";

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Identify endpoint
app.post("/identify", async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: "Either email or phoneNumber must be provided",
      });
    }

    // Find contacts with matching email or phone
    const matchingContacts = await prisma.contact.findMany({
      where: {
        OR: [
          email ? { email } : null,
          phoneNumber ? { phoneNumber } : null,
        ].filter(Boolean) as any,
        deletedAt: null,
      },
    });

    let primaryContact = null;
    const allLinkedIds = new Set<number>();

    // Find primary contact among matches
    for (const contact of matchingContacts) {
      if (contact.linkPrecedence === "primary") {
        if (!primaryContact || contact.createdAt < primaryContact.createdAt) {
          primaryContact = contact;
        }
      } else if (contact.linkedId) {
        // Find the primary this secondary is linked to
        const linkedPrimary = await prisma.contact.findUnique({
          where: { id: contact.linkedId },
        });
        if (linkedPrimary && linkedPrimary.linkPrecedence === "primary") {
          primaryContact = linkedPrimary;
        }
      }
    }

    // Create primary contact if none exists
    if (!primaryContact) {
      primaryContact = await prisma.contact.create({
        data: {
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkPrecedence: "primary",
        },
      });
      allLinkedIds.add(primaryContact.id);
    } else {
      allLinkedIds.add(primaryContact.id);

      // Get all secondaries linked to this primary
      const secondaries = await prisma.contact.findMany({
        where: {
          linkedId: primaryContact.id,
          deletedAt: null,
        },
      });

      secondaries.forEach((s) => allLinkedIds.add(s.id));

      // Check if we need to create a new secondary contact
      const hasNewEmail = email && !matchingContacts.some((c) => c.email === email);
      const hasNewPhone = phoneNumber && !matchingContacts.some((c) => c.phoneNumber === phoneNumber);

      if (hasNewEmail || hasNewPhone) {
        await prisma.contact.create({
          data: {
            email: email || null,
            phoneNumber: phoneNumber || null,
            linkedId: primaryContact.id,
            linkPrecedence: "secondary",
          },
        });
      }
    }

    // Handle multiple primary contacts
    const allPrimaries = await prisma.contact.findMany({
      where: {
        id: { in: Array.from(allLinkedIds) },
        linkPrecedence: "primary",
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
    });

    if (allPrimaries.length > 1) {
      const oldest = allPrimaries[0];
      for (const newer of allPrimaries.slice(1)) {
        await prisma.contact.update({
          where: { id: newer.id },
          data: {
            linkedId: oldest.id,
            linkPrecedence: "secondary",
          },
        });
      }
      primaryContact = oldest;
    }

    // Fetch all related contacts
    const allRelated = await prisma.contact.findMany({
      where: {
        OR: [
          { id: primaryContact.id },
          { linkedId: primaryContact.id },
        ],
        deletedAt: null,
      },
    });

    // Build response
    const emails: string[] = [];
    const phoneNumbers: string[] = [];
    const secondaryContactIds: number[] = [];

    // Add primary info
    if (primaryContact.email) emails.push(primaryContact.email);
    if (primaryContact.phoneNumber) phoneNumbers.push(primaryContact.phoneNumber);

    // Add secondary info
    for (const contact of allRelated) {
      if (contact.linkPrecedence === "secondary") {
        secondaryContactIds.push(contact.id);
        if (contact.email && !emails.includes(contact.email)) {
          emails.push(contact.email);
        }
        if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
          phoneNumbers.push(contact.phoneNumber);
        }
      }
    }

    return res.status(200).json({
      contact: {
        primaryContatctId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
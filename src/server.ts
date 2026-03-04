import express, { Request, Response, Router } from "express";
import cors from "cors";
import "dotenv/config";
import { prisma } from "./prisma";

const app = express();

app.use(cors());
app.use(express.json());

// Serve static HTML UI for root path
app.get("/", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bitespeed Identity Reconciliation API</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 900px;
          width: 100%;
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          font-weight: 700;
        }
        
        .header p {
          font-size: 1.1em;
          opacity: 0.9;
        }
        
        .content {
          padding: 40px;
        }
        
        .section {
          margin-bottom: 40px;
        }
        
        .section h2 {
          color: #333;
          margin-bottom: 20px;
          font-size: 1.5em;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }
        
        .info-box {
          background: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 4px;
          font-size: 0.95em;
          line-height: 1.6;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
          font-size: 0.95em;
        }
        
        input {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 1em;
          transition: border-color 0.3s;
        }
        
        input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        
        .button-group {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        button {
          flex: 1;
          padding: 14px;
          border: none;
          border-radius: 6px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .btn-submit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .btn-clear {
          background: #e9ecef;
          color: #333;
        }
        
        .btn-clear:hover {
          background: #dee2e6;
        }
        
        .response-box {
          background: #f8f9fa;
          border: 2px solid #ddd;
          border-radius: 6px;
          padding: 20px;
          margin-top: 20px;
          display: none;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .response-box.show {
          display: block;
        }
        
        .response-box h3 {
          color: #667eea;
          margin-bottom: 10px;
          font-size: 1.1em;
        }
        
        pre {
          background: white;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
          color: #333;
          line-height: 1.5;
        }
        
        .status-success {
          color: #28a745;
          font-weight: 600;
        }
        
        .status-error {
          color: #dc3545;
          font-weight: 600;
        }
        
        .docs-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        
        .docs-table th,
        .docs-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        .docs-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #667eea;
        }
        
        .docs-table tr:hover {
          background: #f8f9fa;
        }
        
        .code {
          background: #f8f9fa;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #667eea;
        }
        
        .endpoint {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin: 10px 0;
          font-family: 'Courier New', monospace;
          border-left: 4px solid #667eea;
        }
        
        .method {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.85em;
          margin-right: 10px;
        }
        
        .method-post {
          background: #28a745;
          color: white;
        }
        
        .method-get {
          background: #007bff;
          color: white;
        }
        
        .loading {
          display: none;
          text-align: center;
          margin-top: 10px;
        }
        
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔗 Bitespeed Identity</h1>
          <p>Reconcile Customer Identities Across Orders</p>
        </div>
        
        <div class="content">
          <!-- API Testing Section -->
          <div class="section">
            <h2>💬 Test API</h2>
            <div class="info-box">
              Send a request with email and/or phone number to identify a customer and link their contacts.
            </div>
            
            <form id="testForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="email">Email Address</label>
                  <input type="email" id="email" placeholder="customer@example.com" />
                </div>
                <div class="form-group">
                  <label for="phone">Phone Number</label>
                  <input type="tel" id="phone" placeholder="9876543210" />
                </div>
              </div>
              
              <div class="button-group">
                <button type="submit" class="btn-submit">🚀 Identify Contact</button>
                <button type="reset" class="btn-clear">🔄 Clear</button>
              </div>
            </form>
            
            <div class="loading" id="loading">
              <div class="spinner"></div>
              <p style="margin-top: 10px;">Processing...</p>
            </div>
            
            <div class="response-box" id="response">
              <h3 id="responseStatus"></h3>
              <pre id="responseContent"></pre>
            </div>
          </div>
          
          <!-- Documentation Section -->
          <div class="section">
            <h2>📚 API Documentation</h2>
            
            <h3 style="margin-bottom: 15px; color: #333;">Endpoints</h3>
            
            <div class="endpoint">
              <span class="method method-get">GET</span> <strong>/</strong>
            </div>
            <div class="info-box">Returns this documentation page.</div>
            
            <div class="endpoint">
              <span class="method method-get">GET</span> <strong>/health</strong>
            </div>
            <div class="info-box">Health check endpoint. Returns <span class="code">{"status":"ok"}</span></div>
            
            <div class="endpoint">
              <span class="method method-post">POST</span> <strong>/identify</strong>
            </div>
            <div class="info-box">Identifies or creates a contact and returns consolidated identity information.</div>
            
            <h3 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Request Body</h3>
            <pre style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea;">
{
  "email": "customer@example.com",  // Optional
  "phoneNumber": "9876543210"       // Optional (at least one required)
}</pre>
            
            <h3 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Response Format</h3>
            <pre style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea;">
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["customer@example.com"],
    "phoneNumbers": ["9876543210"],
    "secondaryContactIds": []
  }
}</pre>
            
            <h3 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Field Descriptions</h3>
            <table class="docs-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="code">primaryContatctId</span></td>
                  <td>ID of the primary contact (oldest contact for this customer)</td>
                </tr>
                <tr>
                  <td><span class="code">emails</span></td>
                  <td>Array of all emails linked to this customer. Primary email is first.</td>
                </tr>
                <tr>
                  <td><span class="code">phoneNumbers</span></td>
                  <td>Array of all phone numbers linked to this customer. Primary phone is first.</td>
                </tr>
                <tr>
                  <td><span class="code">secondaryContactIds</span></td>
                  <td>Array of contact IDs that are secondary (linked to primary)</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Examples Section -->
          <div class="section">
            <h2>📖 Examples</h2>
            
            <h3 style="margin-bottom: 15px; color: #333;">New Customer</h3>
            <div class="info-box">
              <strong>Request:</strong><br />
              <span class="code">POST /identify</span><br />
              Body: <span class="code">{"email":"john@example.com","phoneNumber":"1234567890"}</span><br /><br />
              <strong>Response:</strong><br />
              Creates a new contact as primary and returns it.
            </div>
            
            <h3 style="margin-bottom: 15px; color: #333;">Linking Contacts</h3>
            <div class="info-box">
              <strong>Scenario:</strong> Customer placed order with <span class="code">email: john@example.com, phone: 1234567890</span><br />
              Later places another order with <span class="code">email: john.doe@example.com, phone: 1234567890</span><br /><br />
              <strong>Result:</strong> Both emails are consolidated under the same primary contact with the same phone number.
            </div>
          </div>
        </div>
      </div>
      
      <script>
        document.getElementById('testForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const email = document.getElementById('email').value || null;
          const phone = document.getElementById('phone').value || null;
          
          if (!email && !phone) {
            alert('Please enter at least an email or phone number');
            return;
          }
          
          const loading = document.getElementById('loading');
          const responseBox = document.getElementById('response');
          const responseStatus = document.getElementById('responseStatus');
          const responseContent = document.getElementById('responseContent');
          
          loading.style.display = 'block';
          responseBox.classList.remove('show');
          
          try {
            const response = await fetch('/identify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email,
                phoneNumber: phone
              })
            });
            
            const data = await response.json();
            
            loading.style.display = 'none';
            
            if (response.ok) {
              responseStatus.innerHTML = '<span class="status-success">✓ Success (200)</span>';
              responseContent.textContent = JSON.stringify(data, null, 2);
            } else {
              responseStatus.innerHTML = '<span class="status-error">✗ Error (' + response.status + ')</span>';
              responseContent.textContent = JSON.stringify(data, null, 2);
            }
            
            responseBox.classList.add('show');
          } catch (error) {
            loading.style.display = 'none';
            responseStatus.innerHTML = '<span class="status-error">✗ Error</span>';
            responseContent.textContent = 'Error: ' + error.message + '\\n\\nMake sure the server is running.';
            responseBox.classList.add('show');
          }
        });
      </script>
    </body>
    </html>
  `);
});

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
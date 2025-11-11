import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function NotificationsTable() {
  const notifications = [
    {
      email: "john.smith@techblog.com",
      subject: "Re: Guest Post Opportunity - AI in Healthcare",
      debit: "$250",
      balance: "$2,750",
      description: "Link approved and published"
    },
    {
      email: "sarah.williams@marketingnews.io",
      subject: "Guest Post Submission Received",
      debit: "$180",
      balance: "$2,570",
      description: "Content under review"
    },
    {
      email: "mike.johnson@devtech.com",
      subject: "Re: Backlink Request - Tech Stack 2024",
      debit: "$320",
      balance: "$2,250",
      description: "Payment confirmed, publishing scheduled"
    },
    {
      email: "emma.davis@startupguide.net",
      subject: "Guest Post Inquiry - SaaS Growth Tips",
      debit: "$150",
      balance: "$2,100",
      description: "Initial outreach sent"
    },
    {
      email: "alex.brown@digitalpr.com",
      subject: "Re: Link Placement Confirmation",
      debit: "$400",
      balance: "$1,700",
      description: "Live link verified"
    },
    {
      email: "lisa.garcia@contentmarket.io",
      subject: "Guest Post Campaign - Q4 2024",
      debit: "$275",
      balance: "$1,425",
      description: "Draft submitted for approval"
    },
  ];

  return (
    <Card className="border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#5E17EB] to-[#7E57C2] text-white p-6">
        <CardTitle className="text-white">Live Notifications</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#EEF2F7] hover:bg-[#EEF2F7]">
              <TableHead className="text-[#2E2E2E]">Email</TableHead>
              <TableHead className="text-[#2E2E2E]">Subject</TableHead>
              <TableHead className="text-[#2E2E2E]">Debit</TableHead>
              <TableHead className="text-[#2E2E2E]">Balance</TableHead>
              <TableHead className="text-[#2E2E2E]">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((notification, index) => (
              <TableRow 
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <TableCell className="text-sm text-[#2E2E2E]">{notification.email}</TableCell>
                <TableCell className="text-sm text-[#2E2E2E]">{notification.subject}</TableCell>
                <TableCell className="text-sm text-red-600">{notification.debit}</TableCell>
                <TableCell className="text-sm text-[#00B894]">{notification.balance}</TableCell>
                <TableCell className="text-sm text-gray-600">{notification.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Calendar, Mail, FileText, Clock } from "lucide-react";

export function TimelineSection() {
  const timelineEvents = [
    {
      subject: "Follow-up: Guest Post Opportunity - AI in Healthcare",
      date: "Nov 10, 2024",
      time: "10:30 AM",
      preview: "Hi John, I wanted to follow up on our previous conversation about the guest post opportunity...",
      type: "email"
    },
    {
      subject: "Deal Created: Tech Blog Partnership Q4",
      date: "Nov 9, 2024",
      time: "2:15 PM",
      preview: "New partnership deal created with TechBlog.com for Q4 2024 guest posting campaign.",
      type: "deal"
    },
    {
      subject: "Scheduled Reply: Sarah Williams - Content Review",
      date: "Nov 9, 2024",
      time: "9:00 AM",
      preview: "Thank you for submitting your content. Our editorial team will review it within 48 hours...",
      type: "email"
    },
    {
      subject: "Note: Payment Received - DevTech Guest Post",
      date: "Nov 8, 2024",
      time: "4:45 PM",
      preview: "Payment of $320 received successfully. Article scheduled for publication on Nov 12.",
      type: "note"
    },
  ];

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button className="bg-[#00B894] hover:bg-[#00a082] text-white rounded-full px-6">
          Send Reply
        </Button>
        <Button className="bg-[#5E17EB] hover:bg-[#4d12c4] text-white rounded-full px-6">
          AI Reply
        </Button>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6">
          Create Deal
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
          Create Order
        </Button>
        <Button variant="outline" className="border-gray-300 rounded-full px-6">
          More Actions
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {timelineEvents.map((event, index) => (
          <div key={index} className="flex gap-4">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                event.type === 'email' ? 'bg-blue-100' :
                event.type === 'deal' ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                {event.type === 'email' && <Mail className="w-6 h-6 text-blue-600" />}
                {event.type === 'deal' && <FileText className="w-6 h-6 text-purple-600" />}
                {event.type === 'note' && <FileText className="w-6 h-6 text-gray-600" />}
              </div>
              {index < timelineEvents.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 my-2"></div>
              )}
            </div>

            {/* Event Card */}
            <Card className="flex-1 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-[#2E2E2E] flex-1">{event.subject}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{event.time}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{event.preview}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

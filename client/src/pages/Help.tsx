import { 
  Search, 
  HelpCircle, 
  FileText, 
  MessageSquare, 
  Video, 
  Book, 
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  PlayCircle
} from "lucide-react";
import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";

export default function Help() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { resetTutorial, startTutorial } = useOnboarding();
  
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  
  const handleRestartTutorial = () => {
    resetTutorial();
    setTimeout(() => {
      startTutorial();
      // Redirect to dashboard where the tutorial will start
      window.location.href = '/';
    }, 100);
  };
  
  const faqs = [
    {
      question: "How do I add a new activity to the schedule?",
      answer: "To add a new activity, go to the Programs page and click the 'Add Activity' button. Fill out the activity form with all required details including name, time, location, and assigned staff. Once saved, the activity will appear on the schedule for the selected date."
    },
    {
      question: "How can I message multiple parents at once?",
      answer: "You can send group messages from the Messages page. Click 'New Message', then select 'Multiple Recipients'. You can filter parents by program (Before/After School), by student grade, or select from your saved groups. Type your message and click Send."
    },
    {
      question: "How do I generate attendance reports?",
      answer: "Navigate to the Reports section from the dashboard. Select 'Attendance' from the report types, choose your date range and program period. You can filter by specific activities if needed. Click 'Generate Report' and you can download it as PDF or Excel."
    },
    {
      question: "How can staff request time off?",
      answer: "Staff members can request time off through the Staff Portal. They should navigate to 'My Schedule' and click 'Request Time Off'. After filling the request form with dates and reason, it will be sent to administrators for approval."
    },
    {
      question: "How do I add a new parent account?",
      answer: "Go to the Parents page and click 'Add Parent'. Fill out the form with parent contact information and student details. Choose whether to send an email invitation for them to complete registration, or complete it yourself manually."
    }
  ];
  
  return (
    <div className="flex-1 lg:ml-64 ml-0 pt-6 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-nunito font-bold text-2xl md:text-3xl text-textColor mb-2">Help Center</h1>
          <p className="text-darkGray">Find answers and resources to help you use Elevo Manager</p>
        </div>
        
        {/* Search */}
        <div className="bg-white rounded-custom shadow-sm p-6 mb-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-nunito font-bold text-xl text-textColor text-center mb-2">How can we help you?</h2>
            <p className="text-darkGray text-center mb-4">Search for answers or browse the topics below</p>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="h-5 w-5 text-darkGray" />
              </div>
              <input 
                type="text" 
                className="bg-white h-12 pl-12 pr-4 rounded-custom w-full border border-lightGray focus:outline-none focus:border-primary text-textColor"
                placeholder="Search for help articles, tutorials, or FAQs..."
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-custom font-nunito text-sm font-semibold hover:bg-blue-600 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
        
        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-custom shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-nunito font-bold text-lg text-textColor">Getting Started</h3>
            </div>
            <p className="text-sm text-darkGray mb-3">Guides and tutorials for new users</p>
            <a href="#" className="text-primary hover:text-blue-700 text-sm font-nunito font-semibold flex items-center">
              Browse guides
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          <div className="bg-white p-5 rounded-custom shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <Video className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="font-nunito font-bold text-lg text-textColor">Video Tutorials</h3>
            </div>
            <p className="text-sm text-darkGray mb-3">Step-by-step video instructions</p>
            <a href="#" className="text-primary hover:text-blue-700 text-sm font-nunito font-semibold flex items-center">
              Watch videos
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          <div className="bg-white p-5 rounded-custom shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <Book className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-nunito font-bold text-lg text-textColor">User Manual</h3>
            </div>
            <p className="text-sm text-darkGray mb-3">Comprehensive documentation</p>
            <a href="#" className="text-primary hover:text-blue-700 text-sm font-nunito font-semibold flex items-center">
              Read manual
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          <div className="bg-white p-5 rounded-custom shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-nunito font-bold text-lg text-textColor">Support Chat</h3>
            </div>
            <p className="text-sm text-darkGray mb-3">Get help from our support team</p>
            <a href="#" className="text-primary hover:text-blue-700 text-sm font-nunito font-semibold flex items-center">
              Start chat
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
        
        {/* Frequent Questions */}
        <div className="bg-white rounded-custom shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-lightGray">
            <h3 className="font-nunito font-bold text-lg text-textColor">Frequently Asked Questions</h3>
            <p className="text-sm text-darkGray">Common questions from Elevo Manager users</p>
          </div>
          
          <div className="p-5">
            <div className="divide-y divide-lightGray">
              {faqs.map((faq, index) => (
                <div key={index} className="py-3">
                  <button 
                    className="w-full text-left flex items-center justify-between font-nunito font-semibold text-textColor"
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`h-5 w-5 text-primary transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="mt-2 pl-0 text-sm text-darkGray">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <a href="#" className="text-primary hover:text-blue-700 font-nunito text-sm font-semibold">
                View all FAQs
              </a>
            </div>
          </div>
        </div>
        
        {/* Interactive Tutorials */}
        <div className="bg-white rounded-custom shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-lightGray">
            <h3 className="font-nunito font-bold text-lg text-textColor">Interactive Tutorials</h3>
            <p className="text-sm text-darkGray">Learn how to use Elevo Central with guided tutorials</p>
          </div>
          
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <PlayCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-nunito font-semibold text-textColor mb-1">Application Tour</h4>
                <p className="text-sm text-darkGray mb-2">
                  Take a guided tour of Elevo Central to learn about its key features and how to use them effectively.
                </p>
                <button 
                  onClick={handleRestartTutorial}
                  className="bg-primary text-white rounded-custom py-2 px-4 text-sm font-nunito font-semibold hover:bg-blue-600 transition-colors"
                >
                  Start Tutorial
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Support */}
        <div className="bg-white rounded-custom shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-lightGray">
            <h3 className="font-nunito font-bold text-lg text-textColor">Need More Help?</h3>
            <p className="text-sm text-darkGray">Our support team is here to assist you</p>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-lightGray rounded-custom p-4">
                <div className="flex items-center mb-3">
                  <Mail className="h-5 w-5 text-primary mr-2" />
                  <h4 className="font-nunito font-semibold text-textColor">Email Support</h4>
                </div>
                <p className="text-sm text-darkGray mb-3">Send us a message and we'll respond within 24 hours</p>
                <a 
                  href="mailto:support@elevo.org" 
                  className="text-primary hover:text-blue-700 text-sm font-nunito font-semibold"
                >
                  support@elevo.org
                </a>
              </div>
              
              <div className="border border-lightGray rounded-custom p-4">
                <div className="flex items-center mb-3">
                  <Phone className="h-5 w-5 text-secondary mr-2" />
                  <h4 className="font-nunito font-semibold text-textColor">Phone Support</h4>
                </div>
                <p className="text-sm text-darkGray mb-3">Available Monday-Friday, 8am-6pm ET</p>
                <a 
                  href="tel:+18005551234" 
                  className="text-primary hover:text-blue-700 text-sm font-nunito font-semibold"
                >
                  1-800-555-1234
                </a>
              </div>
            </div>
            
            <div className="mt-5 p-4 bg-blue-50 rounded-custom">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <div>
                  <h4 className="font-nunito font-semibold text-textColor mb-1">Schedule a Training Session</h4>
                  <p className="text-sm text-darkGray mb-2">
                    New to Elevo Manager? Schedule a personalized training session with our team to get the most out of your account.
                  </p>
                  <button className="bg-primary text-white rounded-custom py-2 px-4 text-sm font-nunito font-semibold hover:bg-blue-600 transition-colors">
                    Schedule Training
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

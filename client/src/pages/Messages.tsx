import { Plus, Edit, Search, Filter, Inbox, Send, Archive, Trash, UserCircle } from "lucide-react";

// Placeholder page for the Messages section
export default function Messages() {
  return (
    <div className="flex-1 lg:ml-64 ml-0 pt-6 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-nunito font-bold text-2xl md:text-3xl text-textColor mb-2">Messages</h1>
            <p className="text-darkGray">Communication with staff and parents</p>
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center justify-center h-9 px-4 bg-primary text-white rounded-custom font-nunito font-semibold text-sm hover:bg-blue-600 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </button>
            <button className="flex items-center justify-center h-9 px-4 bg-white border border-lightGray text-textColor rounded-custom font-nunito font-semibold text-sm hover:bg-gray-50 transition-colors">
              <Edit className="h-4 w-4 mr-2" />
              Draft
            </button>
          </div>
        </div>
        
        {/* Messages Interface */}
        <div className="bg-white rounded-custom shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4">
            {/* Sidebar */}
            <div className="bg-gray-50 border-r border-lightGray p-4">
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-darkGray" />
                  </div>
                  <input 
                    type="text" 
                    className="bg-white h-9 pl-10 pr-4 rounded-custom w-full border border-lightGray focus:outline-none focus:border-primary text-textColor text-sm"
                    placeholder="Search messages..."
                  />
                </div>
              </div>
              
              <div className="space-y-1 mb-4">
                <button className="flex items-center w-full px-3 py-2 rounded-custom text-primary bg-blue-50 text-sm font-nunito font-semibold">
                  <Inbox className="h-4 w-4 mr-2" />
                  Inbox
                  <span className="ml-auto bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">5</span>
                </button>
                <button className="flex items-center w-full px-3 py-2 rounded-custom text-darkGray hover:bg-gray-100 text-sm font-nunito">
                  <Send className="h-4 w-4 mr-2" />
                  Sent
                </button>
                <button className="flex items-center w-full px-3 py-2 rounded-custom text-darkGray hover:bg-gray-100 text-sm font-nunito">
                  <Archive className="h-4 w-4 mr-2" />
                  Archived
                </button>
                <button className="flex items-center w-full px-3 py-2 rounded-custom text-darkGray hover:bg-gray-100 text-sm font-nunito">
                  <Trash className="h-4 w-4 mr-2" />
                  Trash
                </button>
              </div>
              
              <div className="mb-3">
                <h3 className="text-xs uppercase text-darkGray font-semibold tracking-wider">Categories</h3>
              </div>
              
              <div className="space-y-1">
                <button className="flex items-center w-full px-3 py-2 rounded-custom text-darkGray hover:bg-gray-100 text-sm font-nunito">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  Staff
                </button>
                <button className="flex items-center w-full px-3 py-2 rounded-custom text-darkGray hover:bg-gray-100 text-sm font-nunito">
                  <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
                  Parents
                </button>
                <button className="flex items-center w-full px-3 py-2 rounded-custom text-darkGray hover:bg-gray-100 text-sm font-nunito">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Vendors
                </button>
                <button className="flex items-center w-full px-3 py-2 rounded-custom text-darkGray hover:bg-gray-100 text-sm font-nunito">
                  <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                  Administration
                </button>
              </div>
            </div>
            
            {/* Message List */}
            <div className="md:col-span-3 divide-y divide-lightGray">
              <div className="px-4 py-2 border-b border-lightGray flex items-center justify-between">
                <h2 className="font-nunito font-semibold">Inbox (5)</h2>
                <div className="flex items-center">
                  <button className="text-darkGray hover:text-textColor p-1">
                    <Filter className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-darkGray ml-2">Sort: Newest</span>
                </div>
              </div>
              
              {/* Message Items */}
              <div className="p-3 hover:bg-gray-50 cursor-pointer border-l-4 border-primary">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <UserCircle className="h-6 w-6 text-primary mr-2" />
                    <span className="font-nunito font-semibold text-textColor">Sarah Johnson</span>
                  </div>
                  <span className="text-xs text-darkGray">9:15 AM</span>
                </div>
                <h3 className="font-nunito font-semibold text-sm mb-1">Staff Meeting Reminder - Tomorrow</h3>
                <p className="text-xs text-darkGray line-clamp-1">Just a reminder that we have our monthly staff meeting tomorrow at 6:15 PM. Please prepare your activity reports...</p>
              </div>
              
              <div className="p-3 hover:bg-gray-50 cursor-pointer border-l-4 border-secondary">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <UserCircle className="h-6 w-6 text-secondary mr-2" />
                    <span className="font-nunito font-semibold text-textColor">David Williams</span>
                  </div>
                  <span className="text-xs text-darkGray">Yesterday</span>
                </div>
                <h3 className="font-nunito font-semibold text-sm mb-1">Question about Friday's schedule</h3>
                <p className="text-xs text-darkGray line-clamp-1">Hi, I'm wondering if my daughter Emma can switch from art class to science club this Friday? She's been talking about...</p>
              </div>
              
              <div className="p-3 hover:bg-gray-50 cursor-pointer border-l-4 border-accent">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <UserCircle className="h-6 w-6 text-accent mr-2" />
                    <span className="font-nunito font-semibold text-textColor">Principal Stevens</span>
                  </div>
                  <span className="text-xs text-darkGray">Oct 14</span>
                </div>
                <h3 className="font-nunito font-semibold text-sm mb-1">Fall Festival Coordination</h3>
                <p className="text-xs text-darkGray line-clamp-1">Thanks for taking the lead on organizing our afterschool program's participation in the Fall Festival. The school administration...</p>
              </div>
              
              <div className="p-3 hover:bg-gray-50 cursor-pointer">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <UserCircle className="h-6 w-6 text-purple-500 mr-2" />
                    <span className="font-nunito font-semibold text-textColor">LabRats Science</span>
                  </div>
                  <span className="text-xs text-darkGray">Oct 12</span>
                </div>
                <h3 className="font-nunito font-semibold text-sm mb-1">Next Week's Science Materials</h3>
                <p className="text-xs text-darkGray line-clamp-1">Hello, I wanted to share the materials list for next week's volcano experiment. We'll need baking soda, vinegar...</p>
              </div>
              
              <div className="p-3 hover:bg-gray-50 cursor-pointer">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <UserCircle className="h-6 w-6 text-secondary mr-2" />
                    <span className="font-nunito font-semibold text-textColor">Maria Rodriguez</span>
                  </div>
                  <span className="text-xs text-darkGray">Oct 10</span>
                </div>
                <h3 className="font-nunito font-semibold text-sm mb-1">Allergy Information Update</h3>
                <p className="text-xs text-darkGray line-clamp-1">I need to update my son's allergy information. He has recently been diagnosed with a mild peanut allergy...</p>
              </div>
              
              <div className="p-4 text-center text-sm text-darkGray">
                <p>Showing 5 of 24 messages</p>
                <button className="mt-2 text-primary hover:text-blue-700 font-nunito text-sm font-semibold">
                  Load More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

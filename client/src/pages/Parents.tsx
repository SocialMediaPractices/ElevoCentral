import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Filter, 
  SortDesc, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  MessageSquare,
  Users,
  BadgeCheck,
  Clock,
  AlertCircle
} from "lucide-react";

export default function Parents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  
  // This would be a real API call in a production app
  // Since we don't have a parent-specific API yet, we'll show a sample UI
  
  return (
    <div className="flex-1 lg:ml-64 ml-0 pt-6 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-nunito font-bold text-2xl md:text-3xl text-textColor mb-2">Parent Portal</h1>
            <p className="text-darkGray">Manage parent communications and information</p>
          </div>
          
          <button className="flex items-center justify-center h-9 px-4 bg-primary text-white rounded-custom font-nunito font-semibold text-sm hover:bg-blue-600 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Parent
          </button>
        </div>
        
        {/* Parent Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-custom shadow-sm">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="font-nunito font-semibold text-darkGray">Total Families</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold font-nunito text-textColor mr-2">36</span>
              <span className="text-xs text-secondary">Active</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-custom shadow-sm">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <BadgeCheck className="h-5 w-5 text-secondary" />
              </div>
              <span className="font-nunito font-semibold text-darkGray">Verified Accounts</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold font-nunito text-textColor mr-2">34</span>
              <span className="text-xs text-secondary">94%</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-custom shadow-sm">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="font-nunito font-semibold text-darkGray">Pending Forms</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold font-nunito text-textColor mr-2">6</span>
              <span className="text-xs text-yellow-600">Awaiting</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-custom shadow-sm">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-nunito font-semibold text-darkGray">Permission Slips</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold font-nunito text-textColor mr-2">12</span>
              <span className="text-xs text-purple-600">Need review</span>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[220px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-darkGray" />
            </div>
            <input 
              type="text" 
              className="bg-white h-10 pl-10 pr-4 rounded-custom w-full border border-lightGray focus:outline-none focus:border-primary text-textColor"
              placeholder="Search by parent or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <select 
              className="h-10 pl-3 pr-10 bg-white border border-lightGray rounded-custom font-nunito text-sm text-textColor appearance-none focus:outline-none focus:border-primary"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Parents</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="before-school">Before School Only</option>
              <option value="after-school">After School Only</option>
              <option value="both">Both Programs</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-darkGray">
              <Filter className="h-4 w-4" />
            </div>
          </div>
          
          <button className="h-10 px-3 bg-white border border-lightGray rounded-custom text-textColor font-nunito text-sm hover:bg-gray-50 transition-colors flex items-center">
            <SortDesc className="h-4 w-4 mr-2" />
            Sort By: Name
          </button>
        </div>
        
        {/* Parent Directory */}
        <div className="bg-white rounded-custom shadow-sm overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-lightGray">
            <h3 className="font-nunito font-bold text-lg text-textColor">Parent Directory</h3>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sample Parent Cards */}
              <div className="border border-lightGray rounded-custom overflow-hidden">
                <div className="p-4 border-b border-lightGray">
                  <div className="flex items-start">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                      alt="Parent" 
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h4 className="font-nunito font-semibold text-textColor">David Williams</h4>
                      <p className="text-xs text-darkGray">Parent of Emma (Grade 3)</p>
                      <div className="mt-1 flex">
                        <span className="text-xs bg-blue-100 text-primary py-1 px-2 rounded-full mr-1">Before & After</span>
                        <span className="text-xs bg-green-100 text-secondary py-1 px-2 rounded-full">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-darkGray">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>(555) 234-5678</span>
                    </div>
                    <div className="flex items-center text-darkGray">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>dwilliams@example.com</span>
                    </div>
                    <div className="flex items-center text-darkGray">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Joined: Aug 2023</span>
                    </div>
                  </div>
                  <div className="mt-4 flex">
                    <button className="bg-primary text-white rounded-custom py-1 px-3 text-xs font-nunito font-semibold hover:bg-blue-600 transition-colors flex-1 mr-1 flex items-center justify-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Message
                    </button>
                    <button className="bg-gray-100 text-darkGray rounded-custom py-1 px-3 text-xs font-nunito font-semibold hover:bg-gray-200 transition-colors flex-1 ml-1 flex items-center justify-center">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-lightGray rounded-custom overflow-hidden">
                <div className="p-4 border-b border-lightGray">
                  <div className="flex items-start">
                    <img 
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                      alt="Parent" 
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h4 className="font-nunito font-semibold text-textColor">Maria Rodriguez</h4>
                      <p className="text-xs text-darkGray">Parent of Carlos (Grade 2) & Sophia (Grade 4)</p>
                      <div className="mt-1 flex">
                        <span className="text-xs bg-green-100 text-secondary py-1 px-2 rounded-full mr-1">After School</span>
                        <span className="text-xs bg-green-100 text-secondary py-1 px-2 rounded-full">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-darkGray">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>(555) 876-5432</span>
                    </div>
                    <div className="flex items-center text-darkGray">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>mrodriguez@example.com</span>
                    </div>
                    <div className="flex items-center text-darkGray">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Joined: Sep 2022</span>
                    </div>
                  </div>
                  <div className="mt-4 flex">
                    <button className="bg-primary text-white rounded-custom py-1 px-3 text-xs font-nunito font-semibold hover:bg-blue-600 transition-colors flex-1 mr-1 flex items-center justify-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Message
                    </button>
                    <button className="bg-gray-100 text-darkGray rounded-custom py-1 px-3 text-xs font-nunito font-semibold hover:bg-gray-200 transition-colors flex-1 ml-1 flex items-center justify-center">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-lightGray rounded-custom overflow-hidden">
                <div className="p-4 border-b border-lightGray">
                  <div className="flex items-start">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                      alt="Parent" 
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h4 className="font-nunito font-semibold text-textColor">Jennifer Parker</h4>
                      <p className="text-xs text-darkGray">Parent of Ethan (Grade 1)</p>
                      <div className="mt-1 flex">
                        <span className="text-xs bg-blue-100 text-primary py-1 px-2 rounded-full mr-1">Before School</span>
                        <span className="text-xs bg-yellow-100 text-yellow-600 py-1 px-2 rounded-full">Pending Verification</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-darkGray">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>(555) 123-9876</span>
                    </div>
                    <div className="flex items-center text-darkGray">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>jparker@example.com</span>
                    </div>
                    <div className="flex items-center text-darkGray">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Joined: Oct 2023</span>
                    </div>
                  </div>
                  <div className="mt-4 flex">
                    <button className="bg-primary text-white rounded-custom py-1 px-3 text-xs font-nunito font-semibold hover:bg-blue-600 transition-colors flex-1 mr-1 flex items-center justify-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Message
                    </button>
                    <button className="bg-gray-100 text-darkGray rounded-custom py-1 px-3 text-xs font-nunito font-semibold hover:bg-gray-200 transition-colors flex-1 ml-1 flex items-center justify-center">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <button className="text-primary hover:text-blue-700 font-nunito text-sm font-semibold">
                View All Parents
              </button>
            </div>
          </div>
        </div>
        
        {/* Required Forms Section */}
        <div className="bg-white rounded-custom shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-lightGray flex justify-between items-center">
            <h3 className="font-nunito font-bold text-lg text-textColor">Required Forms</h3>
            <button className="text-primary hover:text-blue-700 text-sm transition-colors">
              <Plus className="h-4 w-4 inline mr-1" />
              Add Form
            </button>
          </div>
          
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-lightGray">
                    <th className="text-left py-3 px-4 text-sm font-nunito text-darkGray">Form Name</th>
                    <th className="text-left py-3 px-4 text-sm font-nunito text-darkGray">Required By</th>
                    <th className="text-left py-3 px-4 text-sm font-nunito text-darkGray">Sent To</th>
                    <th className="text-left py-3 px-4 text-sm font-nunito text-darkGray">Completed</th>
                    <th className="text-left py-3 px-4 text-sm font-nunito text-darkGray">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-lightGray">
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-primary mr-2" />
                        <span className="font-nunito font-semibold">Annual Health Form</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">Oct 31, 2023</td>
                    <td className="py-3 px-4 text-sm">All Parents (36)</td>
                    <td className="py-3 px-4 text-sm">30/36</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="bg-yellow-100 text-yellow-600 text-xs py-1 px-2 rounded-full">In Progress</span>
                    </td>
                  </tr>
                  <tr className="border-b border-lightGray">
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-primary mr-2" />
                        <span className="font-nunito font-semibold">Field Trip Permission (Fall Festival)</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">Oct 25, 2023</td>
                    <td className="py-3 px-4 text-sm">After School Parents (28)</td>
                    <td className="py-3 px-4 text-sm">22/28</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="bg-yellow-100 text-yellow-600 text-xs py-1 px-2 rounded-full">In Progress</span>
                    </td>
                  </tr>
                  <tr className="border-b border-lightGray">
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-primary mr-2" />
                        <span className="font-nunito font-semibold">Emergency Contact Update</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">Sept 15, 2023</td>
                    <td className="py-3 px-4 text-sm">All Parents (36)</td>
                    <td className="py-3 px-4 text-sm">36/36</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="bg-green-100 text-secondary text-xs py-1 px-2 rounded-full">Completed</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-primary mr-2" />
                        <span className="font-nunito font-semibold">Photo Release Form</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">Sept 30, 2023</td>
                    <td className="py-3 px-4 text-sm">New Parents (8)</td>
                    <td className="py-3 px-4 text-sm">6/8</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="bg-red-100 text-accent text-xs py-1 px-2 rounded-full">Overdue</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

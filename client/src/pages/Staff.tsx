import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  CalendarClock,
  Building
} from "lucide-react";
import { Staff } from "@shared/schema";

export default function StaffPage() {
  const [filter, setFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get staff data
  const { data: staff, isLoading } = useQuery({
    queryKey: [`/api/staff?active=${filter === "active" ? "true" : "false"}`],
  });
  
  // Filter staff by search term
  const filteredStaff = staff?.filter((staffMember: Staff) => {
    if (!searchTerm) return true;
    
    // This is a simplified search that would normally search against user data
    // but since we're not joining with user data in the API, this is a placeholder
    return staffMember.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           staffMember.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
  });
  
  return (
    <div className="flex-1 lg:ml-64 ml-0 pt-6 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-nunito font-bold text-2xl md:text-3xl text-textColor mb-2">Staff Management</h1>
            <p className="text-darkGray">Total: {staff?.length || 0} staff members</p>
          </div>
          
          <button className="flex items-center justify-center h-9 px-4 bg-primary text-white rounded-custom font-nunito font-semibold text-sm hover:bg-blue-600 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </button>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[220px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-darkGray" />
            </div>
            <input 
              type="text" 
              className="bg-white h-10 pl-10 pr-4 rounded-custom w-full border border-lightGray focus:outline-none focus:border-primary text-textColor"
              placeholder="Search staff members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex">
            <button 
              className={`px-4 py-2 rounded-l-custom font-nunito text-sm border ${
                filter === "active" 
                  ? "bg-primary text-white border-primary" 
                  : "bg-white text-darkGray border-lightGray hover:bg-gray-50"
              }`}
              onClick={() => setFilter("active")}
            >
              <UserCheck className="h-4 w-4 inline mr-1" />
              Active
            </button>
            <button 
              className={`px-4 py-2 rounded-r-custom font-nunito text-sm border ${
                filter === "inactive" 
                  ? "bg-red-500 text-white border-red-500" 
                  : "bg-white text-darkGray border-lightGray hover:bg-gray-50"
              }`}
              onClick={() => setFilter("inactive")}
            >
              <UserX className="h-4 w-4 inline mr-1" />
              Inactive
            </button>
          </div>
        </div>
        
        {/* Staff List */}
        {isLoading ? (
          <div className="bg-white p-8 rounded-custom shadow-sm text-center">
            <p className="text-darkGray">Loading staff data...</p>
          </div>
        ) : filteredStaff?.length === 0 ? (
          <div className="bg-white p-8 rounded-custom shadow-sm text-center">
            <p className="text-darkGray">No staff members found with the current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff?.map((staffMember: Staff) => (
              <div key={staffMember.id} className="bg-white rounded-custom shadow-sm overflow-hidden">
                <div className="bg-primary text-white p-4">
                  <div className="flex items-center">
                    <img 
                      src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                      alt="Staff member" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-white mr-4"
                    />
                    <div>
                      <h3 className="font-nunito font-bold text-lg">
                        {staffMember.title} Staff Member
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {staffMember.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <h4 className="font-nunito font-semibold text-sm text-darkGray mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-1">
                      {staffMember.specialties.map((specialty, idx) => (
                        <span 
                          key={idx} 
                          className="bg-blue-50 text-primary text-xs py-1 px-2 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center text-darkGray">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>staff@example.com</span>
                    </div>
                    <div className="flex items-center text-darkGray">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>(555) 123-4567</span>
                    </div>
                    <div className="flex items-center text-darkGray">
                      <CalendarClock className="h-4 w-4 mr-2" />
                      <span>Hired: Jan 2023</span>
                    </div>
                    <div className="flex items-center text-darkGray">
                      <Building className="h-4 w-4 mr-2" />
                      <span>Main Campus</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-lightGray flex justify-between">
                    <button className="text-primary hover:text-blue-700 font-nunito font-semibold text-sm">
                      View Details
                    </button>
                    <button className="text-darkGray hover:text-textColor font-nunito text-sm">
                      Assign to Activity
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

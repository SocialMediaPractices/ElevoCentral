import { Users, Plus, Trophy, Calendar, UserCheck, Clock, PenSquare, ArrowRight } from "lucide-react";

// Placeholder page for the Clubs section
export default function Clubs() {
  return (
    <div className="flex-1 lg:ml-64 ml-0 pt-6 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-nunito font-bold text-2xl md:text-3xl text-textColor mb-2">Clubs</h1>
            <p className="text-darkGray">Manage specialty clubs and activities</p>
          </div>
          
          <button className="flex items-center justify-center h-9 px-4 bg-primary text-white rounded-custom font-nunito font-semibold text-sm hover:bg-blue-600 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Create Club
          </button>
        </div>
        
        {/* Clubs List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Club Stats Cards */}
          <div className="bg-white p-5 rounded-custom shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-nunito font-bold text-lg text-textColor">Active Clubs</h3>
            </div>
            <p className="text-3xl font-bold text-primary">6</p>
            <p className="text-sm text-darkGray mt-1">Across all program areas</p>
          </div>
          
          <div className="bg-white p-5 rounded-custom shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <UserCheck className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="font-nunito font-bold text-lg text-textColor">Student Participation</h3>
            </div>
            <p className="text-3xl font-bold text-secondary">42</p>
            <p className="text-sm text-darkGray mt-1">Students enrolled in clubs</p>
          </div>
          
          <div className="bg-white p-5 rounded-custom shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-nunito font-bold text-lg text-textColor">Upcoming Events</h3>
            </div>
            <p className="text-3xl font-bold text-accent">3</p>
            <p className="text-sm text-darkGray mt-1">Club showcases this month</p>
          </div>
        </div>
        
        {/* Clubs Grid */}
        <div className="mb-8">
          <h2 className="font-nunito font-bold text-xl text-textColor mb-4">Club Directory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Music Club */}
            <div className="flex bg-white rounded-custom shadow-sm overflow-hidden">
              <div className="bg-blue-100 flex items-center justify-center w-24">
                <div className="text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                  </svg>
                </div>
              </div>
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-nunito font-bold text-lg text-textColor">Music Club</h3>
                  <span className="text-xs bg-blue-100 text-primary py-1 px-2 rounded-full">Monday & Wednesday</span>
                </div>
                <p className="text-sm text-darkGray mt-1 mb-2">
                  Exploring music through instruments, voice, and composition
                </p>
                <div className="flex text-xs text-darkGray">
                  <div className="flex items-center mr-4">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>4:15 - 5:00 PM</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>14 students</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Drama Club */}
            <div className="flex bg-white rounded-custom shadow-sm overflow-hidden">
              <div className="bg-pink-100 flex items-center justify-center w-24">
                <div className="text-pink-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M9 15v-1h6v1"></path>
                    <path d="M9 18v-1h6v1"></path>
                    <path d="M11 11h1"></path>
                    <path d="M12 11h1"></path>
                  </svg>
                </div>
              </div>
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-nunito font-bold text-lg text-textColor">Drama Club</h3>
                  <span className="text-xs bg-pink-100 text-pink-600 py-1 px-2 rounded-full">Friday</span>
                </div>
                <p className="text-sm text-darkGray mt-1 mb-2">
                  Developing theatrical skills and preparing performances
                </p>
                <div className="flex text-xs text-darkGray">
                  <div className="flex items-center mr-4">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>4:15 - 5:30 PM</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>12 students</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Science Club */}
            <div className="flex bg-white rounded-custom shadow-sm overflow-hidden">
              <div className="bg-orange-100 flex items-center justify-center w-24">
                <div className="text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                  </svg>
                </div>
              </div>
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-nunito font-bold text-lg text-textColor">Science Club</h3>
                  <span className="text-xs bg-orange-100 text-orange-600 py-1 px-2 rounded-full">Tuesday & Thursday</span>
                </div>
                <p className="text-sm text-darkGray mt-1 mb-2">
                  Hands-on experiments and STEM-focused activities
                </p>
                <div className="flex text-xs text-darkGray">
                  <div className="flex items-center mr-4">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>4:15 - 5:15 PM</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>16 students</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Art Club */}
            <div className="flex bg-white rounded-custom shadow-sm overflow-hidden">
              <div className="bg-purple-100 flex items-center justify-center w-24">
                <div className="text-purple-600">
                  <PenSquare size={36} />
                </div>
              </div>
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-nunito font-bold text-lg text-textColor">Art Club</h3>
                  <span className="text-xs bg-purple-100 text-purple-600 py-1 px-2 rounded-full">Wednesday</span>
                </div>
                <p className="text-sm text-darkGray mt-1 mb-2">
                  Creative expression through various art media
                </p>
                <div className="flex text-xs text-darkGray">
                  <div className="flex items-center mr-4">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>3:30 - 4:30 PM</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>18 students</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button className="inline-flex items-center text-primary hover:text-blue-700 font-nunito text-sm font-semibold">
              View All Clubs
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
        
        {/* Upcoming Club Showcases */}
        <div className="bg-white rounded-custom shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-nunito font-bold text-lg text-textColor">Upcoming Club Showcases</h3>
            <button className="text-primary hover:text-blue-700 text-sm font-nunito transition-colors">
              <Trophy className="h-4 w-4 inline mr-1" />
              Add Showcase
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-lightGray">
                  <th className="text-left py-3 px-4 text-sm font-nunito text-darkGray">Club</th>
                  <th className="text-left py-3 px-4 text-sm font-nunito text-darkGray">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-nunito text-darkGray">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-nunito text-darkGray">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-nunito text-darkGray">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-lightGray">
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mr-2">
                        <div className="text-pink-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                        </div>
                      </div>
                      <span>Trinity Theater Showcase</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">Oct 20, 2023</td>
                  <td className="py-3 px-4 text-sm">5:30 PM</td>
                  <td className="py-3 px-4 text-sm">School Auditorium</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="bg-green-100 text-green-600 text-xs py-1 px-2 rounded-full">Confirmed</span>
                  </td>
                </tr>
                <tr className="border-b border-lightGray">
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <div className="text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18V5l12-2v13"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <circle cx="18" cy="16" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                      <span>Music Presentation</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">Nov 10, 2023</td>
                  <td className="py-3 px-4 text-sm">6:00 PM</td>
                  <td className="py-3 px-4 text-sm">Multi-Purpose Room</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="bg-yellow-100 text-yellow-600 text-xs py-1 px-2 rounded-full">Planning</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                        <div className="text-orange-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                          </svg>
                        </div>
                      </div>
                      <span>Science Fair</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">Nov 15, 2023</td>
                  <td className="py-3 px-4 text-sm">4:30 PM</td>
                  <td className="py-3 px-4 text-sm">Science Lab & Main Hall</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="bg-blue-100 text-primary text-xs py-1 px-2 rounded-full">In Preparation</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

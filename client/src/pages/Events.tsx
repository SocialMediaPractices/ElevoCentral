import { CalendarRange, Plus, Calendar, MapPin, Clock, Users, ArrowRight } from "lucide-react";

// Placeholder page for the Events section
export default function Events() {
  return (
    <div className="flex-1 lg:ml-64 ml-0 pt-6 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-nunito font-bold text-2xl md:text-3xl text-textColor mb-2">Special Events</h1>
            <p className="text-darkGray">Manage all upcoming special events</p>
          </div>
          
          <button className="flex items-center justify-center h-9 px-4 bg-primary text-white rounded-custom font-nunito font-semibold text-sm hover:bg-blue-600 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </button>
        </div>
        
        {/* Upcoming Events */}
        <div className="mb-8">
          <h2 className="font-nunito font-bold text-xl text-textColor mb-4">Upcoming Events</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Fall Festival */}
            <div className="card bg-white special-event p-4">
              <div className="flex justify-between mb-3">
                <span className="font-nunito font-semibold text-accent">Oct 28, 2023</span>
                <span className="bg-red-100 text-accent text-xs py-1 px-2 rounded-full font-nunito">Festival</span>
              </div>
              <h4 className="font-nunito font-bold text-textColor text-lg mb-1">Annual Fall Festival</h4>
              <div className="flex items-center text-sm text-darkGray mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>School Campus</span>
              </div>
              <div className="flex items-center text-sm text-darkGray mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>4:00 PM - 7:00 PM</span>
              </div>
              <div className="flex items-center text-sm text-darkGray mb-3">
                <Users className="h-4 w-4 mr-1" />
                <span>All Students and Families</span>
              </div>
              <button className="w-full text-white bg-accent hover:bg-red-500 transition-colors rounded-custom p-2 text-sm font-nunito font-semibold mt-2">
                View Details
              </button>
            </div>
            
            {/* Theater Showcase */}
            <div className="card bg-white special-event p-4">
              <div className="flex justify-between mb-3">
                <span className="font-nunito font-semibold text-accent">Oct 20, 2023</span>
                <span className="bg-pink-100 text-pink-600 text-xs py-1 px-2 rounded-full font-nunito">Performance</span>
              </div>
              <h4 className="font-nunito font-bold text-textColor text-lg mb-1">Trinity Theater Showcase</h4>
              <div className="flex items-center text-sm text-darkGray mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>School Auditorium</span>
              </div>
              <div className="flex items-center text-sm text-darkGray mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>5:30 PM - 6:15 PM</span>
              </div>
              <div className="flex items-center text-sm text-darkGray mb-3">
                <Users className="h-4 w-4 mr-1" />
                <span>Theater Club & Parents</span>
              </div>
              <button className="w-full text-white bg-accent hover:bg-red-500 transition-colors rounded-custom p-2 text-sm font-nunito font-semibold mt-2">
                View Details
              </button>
            </div>
            
            {/* Science Fair */}
            <div className="card bg-white special-event p-4">
              <div className="flex justify-between mb-3">
                <span className="font-nunito font-semibold text-accent">Nov 15, 2023</span>
                <span className="bg-orange-100 text-orange-600 text-xs py-1 px-2 rounded-full font-nunito">STEM</span>
              </div>
              <h4 className="font-nunito font-bold text-textColor text-lg mb-1">LabRats Science Fair</h4>
              <div className="flex items-center text-sm text-darkGray mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Science Lab & Main Hall</span>
              </div>
              <div className="flex items-center text-sm text-darkGray mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>4:30 PM - 6:00 PM</span>
              </div>
              <div className="flex items-center text-sm text-darkGray mb-3">
                <Users className="h-4 w-4 mr-1" />
                <span>STEM Club & Parents</span>
              </div>
              <button className="w-full text-white bg-accent hover:bg-red-500 transition-colors rounded-custom p-2 text-sm font-nunito font-semibold mt-2">
                View Details
              </button>
            </div>
          </div>
        </div>
        
        {/* Calendar View */}
        <div className="bg-white rounded-custom shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-nunito font-bold text-lg text-textColor">Event Calendar</h3>
            <div className="flex">
              <button className="flex items-center text-primary hover:text-blue-700 text-sm font-nunito transition-colors">
                <Calendar className="h-4 w-4 mr-1" />
                Month View
              </button>
              <button className="flex items-center text-darkGray hover:text-textColor text-sm font-nunito transition-colors ml-4">
                <CalendarRange className="h-4 w-4 mr-1" />
                List View
              </button>
            </div>
          </div>
          
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <CalendarRange className="h-12 w-12 text-primary mx-auto mb-2" />
              <h4 className="font-nunito font-semibold text-textColor">Calendar View Coming Soon</h4>
              <p className="text-sm text-darkGray mt-1">
                The full calendar interface is under development
              </p>
              <button className="mt-4 flex items-center justify-center mx-auto h-9 px-4 bg-primary text-white rounded-custom font-nunito font-semibold text-sm hover:bg-blue-600 transition-colors">
                View All Events
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { 
  Save, 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Globe, 
  CreditCard, 
  FileText, 
  Users,
  PaintBucket,
  Eye,
  EyeOff,
  Check
} from "lucide-react";

export default function Settings() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };
  
  return (
    <div className="flex-1 lg:ml-64 ml-0 pt-6 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-nunito font-bold text-2xl md:text-3xl text-textColor mb-2">Settings</h1>
          <p className="text-darkGray">Manage your account and application preferences</p>
        </div>
        
        {/* Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="bg-white rounded-custom shadow-sm p-4 lg:p-5 h-fit">
            <h2 className="font-nunito font-bold text-lg text-textColor mb-4">Settings</h2>
            
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 bg-blue-50 text-primary rounded-custom font-nunito font-semibold text-sm flex items-center">
                <User className="h-4 w-4 mr-2" />
                Account
              </button>
              <button className="w-full text-left px-3 py-2 text-textColor hover:bg-gray-50 rounded-custom font-nunito text-sm flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </button>
              <button className="w-full text-left px-3 py-2 text-textColor hover:bg-gray-50 rounded-custom font-nunito text-sm flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Preferences
              </button>
              <button className="w-full text-left px-3 py-2 text-textColor hover:bg-gray-50 rounded-custom font-nunito text-sm flex items-center">
                <PaintBucket className="h-4 w-4 mr-2" />
                Appearance
              </button>
              <button className="w-full text-left px-3 py-2 text-textColor hover:bg-gray-50 rounded-custom font-nunito text-sm flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Team Access
              </button>
              <button className="w-full text-left px-3 py-2 text-textColor hover:bg-gray-50 rounded-custom font-nunito text-sm flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </button>
              <button className="w-full text-left px-3 py-2 text-textColor hover:bg-gray-50 rounded-custom font-nunito text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Legal
              </button>
            </div>
          </div>
          
          {/* Main Settings Content */}
          <div className="lg:col-span-3">
            {/* Account Settings */}
            <div className="bg-white rounded-custom shadow-sm overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-lightGray">
                <h3 className="font-nunito font-bold text-lg text-textColor">Account Settings</h3>
                <p className="text-sm text-darkGray">Update your profile and account information</p>
              </div>
              
              <div className="p-5">
                {/* Profile Section */}
                <div className="mb-6">
                  <h4 className="font-nunito font-semibold text-md text-textColor mb-4">Profile Information</h4>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center mb-5">
                    <div className="mb-3 md:mb-0 md:mr-5">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                      />
                    </div>
                    <div>
                      <h5 className="font-nunito font-semibold text-textColor mb-1">Sara Mitchell</h5>
                      <p className="text-sm text-darkGray mb-2">Program Director</p>
                      <button className="text-primary hover:text-blue-700 text-sm font-nunito">Change photo</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-nunito font-semibold text-textColor mb-1">Full Name</label>
                      <input 
                        type="text" 
                        className="w-full h-10 px-3 bg-white border border-lightGray rounded-custom focus:outline-none focus:border-primary text-textColor"
                        defaultValue="Sara Mitchell"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-nunito font-semibold text-textColor mb-1">Job Title</label>
                      <input 
                        type="text" 
                        className="w-full h-10 px-3 bg-white border border-lightGray rounded-custom focus:outline-none focus:border-primary text-textColor"
                        defaultValue="Program Director"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-nunito font-semibold text-textColor mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        className="w-full h-10 px-3 bg-white border border-lightGray rounded-custom focus:outline-none focus:border-primary text-textColor"
                        defaultValue="(555) 987-6543"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-nunito font-semibold text-textColor mb-1">Location</label>
                      <input 
                        type="text" 
                        className="w-full h-10 px-3 bg-white border border-lightGray rounded-custom focus:outline-none focus:border-primary text-textColor"
                        defaultValue="Main Campus"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="mb-6">
                  <h4 className="font-nunito font-semibold text-md text-textColor mb-4">Contact Information</h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-nunito font-semibold text-textColor mb-1">Email Address</label>
                    <div className="flex">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail className="h-4 w-4 text-darkGray" />
                        </div>
                        <input 
                          type="email" 
                          className="w-full h-10 pl-10 pr-4 bg-white border border-lightGray rounded-custom focus:outline-none focus:border-primary text-textColor"
                          defaultValue="sara.mitchell@elevo.org"
                        />
                      </div>
                      <button className="ml-2 px-4 bg-gray-100 text-darkGray rounded-custom font-nunito text-sm hover:bg-gray-200 transition-colors">
                        Verify
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-green-600 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Email verified
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-nunito font-semibold text-textColor mb-1">Alternative Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail className="h-4 w-4 text-darkGray" />
                      </div>
                      <input 
                        type="email" 
                        className="w-full h-10 pl-10 pr-4 bg-white border border-lightGray rounded-custom focus:outline-none focus:border-primary text-textColor"
                        placeholder="Enter alternative email (optional)"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Security */}
                <div>
                  <h4 className="font-nunito font-semibold text-md text-textColor mb-4">Security</h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-nunito font-semibold text-textColor mb-1">Current Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="h-4 w-4 text-darkGray" />
                      </div>
                      <input 
                        type={passwordVisible ? "text" : "password"} 
                        className="w-full h-10 pl-10 pr-10 bg-white border border-lightGray rounded-custom focus:outline-none focus:border-primary text-textColor"
                        defaultValue="currentpassword"
                      />
                      <button 
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-darkGray"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-nunito font-semibold text-textColor mb-1">New Password</label>
                      <input 
                        type="password" 
                        className="w-full h-10 px-3 bg-white border border-lightGray rounded-custom focus:outline-none focus:border-primary text-textColor"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-nunito font-semibold text-textColor mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="w-full h-10 px-3 bg-white border border-lightGray rounded-custom focus:outline-none focus:border-primary text-textColor"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-darkGray">
                    Password must be at least 8 characters and include a number and a special character
                  </p>
                </div>
              </div>
              
              <div className="px-5 py-4 bg-gray-50 border-t border-lightGray flex justify-between items-center">
                {saveSuccess && (
                  <span className="text-sm text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Settings saved successfully
                  </span>
                )}
                <div className={`flex ${saveSuccess ? 'ml-auto' : ''}`}>
                  <button className="px-4 py-2 bg-white border border-lightGray text-darkGray rounded-custom font-nunito text-sm font-semibold hover:bg-gray-50 transition-colors mr-2">
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-primary text-white rounded-custom font-nunito text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
            
            {/* Connected Accounts */}
            <div className="bg-white rounded-custom shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-lightGray">
                <h3 className="font-nunito font-bold text-lg text-textColor">Connected Accounts</h3>
                <p className="text-sm text-darkGray">Manage external account connections</p>
              </div>
              
              <div className="p-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-lightGray rounded-custom">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 48 48" 
                          width="24px" 
                          height="24px" 
                          fill="#4285F4"
                        >
                          <path d="M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z"/>
                          <path fill="#fff" d="M34,19h-2v-1h-3v6h3v-1h2c0.6,0,1-0.4,1-1v-2C35,19.4,34.6,19,34,19z M33,22h-1v-2h1V22z"/>
                          <path fill="#fff" d="M39,19v6h-3v-6H39z"/>
                          <path fill="#fff" d="M19.5,25c-1.4,0-2.5-1.1-2.5-2.5v-1c0-1.4,1.1-2.5,2.5-2.5s2.5,1.1,2.5,2.5v1C22,23.9,20.9,25,19.5,25z M19.5,20c-0.8,0-1.5,0.7-1.5,1.5v1c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5v-1C21,20.7,20.3,20,19.5,20z"/>
                          <path fill="#fff" d="M15,19v2h1v4h1v-4h1v-2H15z"/>
                          <path fill="#fff" d="M28.5,19h-2.7c-0.4,0-0.8,0.4-0.8,0.8v5.4h1V23h2.4v2.1h1v-5.4C29.5,19.4,29.1,19,28.5,19z M27.9,22H26v-2h1.9V22z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-nunito font-semibold text-textColor">Google</h4>
                        <p className="text-xs text-darkGray">Connected for easy sign-in and calendar integration</p>
                      </div>
                    </div>
                    <button className="text-red-500 hover:text-red-600 text-sm font-nunito">Disconnect</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-lightGray rounded-custom">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3 text-white">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 3H4C3.447 3 3 3.448 3 4V20C3 20.552 3.447 21 4 21H12V14H10V11H12V8.5C12 6.57 13.57 5 15.5 5H18V8H16C15.45 8 15 8.45 15 9V11H18V14H15V21H20C20.553 21 21 20.552 21 20V4C21 3.448 20.553 3 20 3Z" fill="white"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-nunito font-semibold text-textColor">Microsoft 365</h4>
                        <p className="text-xs text-darkGray">Not connected</p>
                      </div>
                    </div>
                    <button className="text-primary hover:text-blue-700 text-sm font-nunito">Connect</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-lightGray rounded-custom">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mr-3 text-white">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.5 2C15.2239 2 16.5 3.27606 16.5 5V7H10C8.34315 7 7 8.34315 7 10V22H5C3.34315 22 2 20.6569 2 19V5C2 3.34315 3.34315 2 5 2H13.5Z" fill="white"/>
                          <path d="M10 9H19C20.6569 9 22 10.3431 22 12V19C22 20.6569 20.6569 22 19 22H10C8.34315 22 7 20.6569 7 19V12C7 10.3431 8.34315 9 10 9Z" fill="white"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-nunito font-semibold text-textColor">QuickBooks</h4>
                        <p className="text-xs text-darkGray">Connected for billing integration</p>
                      </div>
                    </div>
                    <button className="text-red-500 hover:text-red-600 text-sm font-nunito">Disconnect</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Utensils, Instagram, Facebook, Youtube, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useWelcomeAudio } from "../hooks/useWelcomeAudio";
import { MediaPreloader } from "../components/media-preloader";
import { useState, useEffect, useCallback } from "react";
import backgroundImage from "/background.png";
import type { Customer } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { hasPlayedAudio, audioError, isReady } = useWelcomeAudio();
  const [mediaReady, setMediaReady] = useState(false);
  const [screenDimensions, setScreenDimensions] = useState({ width: 0, height: 0 });
  const [scaleFactor, setScaleFactor] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Detect screen size and calculate scale factor
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenDimensions({ width, height });

      // Calculate scale factor based on screen size for better screen utilization
      // Base dimensions: 384px width, optimized for mobile screens

      // Scale up for better screen utilization while maintaining proportions
      if (height < 600) {
        setScaleFactor(0.85);
      } else if (height < 700) {
        setScaleFactor(1.0);
      } else if (height < 800) {
        setScaleFactor(1.1);
      } else if (height < 900) {
        setScaleFactor(1.2);
      } else {
        setScaleFactor(1.3);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Check sessionStorage for existing customer data
  useEffect(() => {
    const storedCustomer = sessionStorage.getItem('customer');
    if (storedCustomer) {
      const customer = JSON.parse(storedCustomer);
      setExistingCustomer(customer);
      setCustomerName(customer.name);
      setPhoneNumber(customer.phoneNumber);
      
      // Set appropriate welcome message based on visit count
      // Note: New customers have visits = 0, which becomes 1 after first menu page load
      if (customer.visits === 0 || customer.visits === 1) {
        setWelcomeMessage(`Welcome ${customer.name}, for your first visit`);
      } else {
        setWelcomeMessage(`Welcome back ${customer.name}`);
      }
      
      setShowDialog(false);
    } else {
      setShowDialog(true);
    }
  }, []);

  // Check if customer exists when phone number is entered
  const checkExistingCustomer = useCallback(async (phone: string) => {
    if (phone.length >= 10) {
      try {
        const response = await fetch(`/api/customers/phone/${phone}`);
        if (response.ok) {
          const customer = await response.json();
          setExistingCustomer(customer);
          setCustomerName(customer.name);
          sessionStorage.setItem('customer', JSON.stringify(customer));
        } else {
          setExistingCustomer(null);
        }
      } catch (error) {
        console.error("Error checking customer:", error);
      }
    }
  }, []);

  // Handle name change with validation
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCustomerName(name);
    
    if (name && !/^[a-zA-Z\s]+$/.test(name)) {
      setNameError("Name should contain only alphabets and spaces");
    } else {
      setNameError("");
    }
  }, []);

  // Handle phone number change with validation
  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(phone);
    
    if (phone && phone.length < 10) {
      setPhoneError("Phone number must be 10 digits");
    } else {
      setPhoneError("");
    }
    
    if (phone.length === 10) {
      checkExistingCustomer(phone);
    } else {
      setExistingCustomer(null);
    }
  }, [checkExistingCustomer]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;
    
    if (!customerName.trim()) {
      setNameError("Name is required");
      hasError = true;
    } else if (!/^[a-zA-Z\s]+$/.test(customerName)) {
      setNameError("Name should contain only alphabets and spaces");
      hasError = true;
    }
    
    if (!phoneNumber) {
      setPhoneError("Phone number is required");
      hasError = true;
    } else if (phoneNumber.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      hasError = true;
    }
    
    if (hasError) {
      return;
    }

    setIsSubmitting(true);
    try {
      let customer;
      if (existingCustomer) {
        customer = existingCustomer;
      } else {
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: customerName, phoneNumber }),
        });
        customer = await response.json();
      }
      sessionStorage.setItem('customer', JSON.stringify(customer));
      
      // Set appropriate welcome message based on visit count
      // Note: New customers have visits = 0, which becomes 1 after first menu page load
      if (customer.visits === 0 || customer.visits === 1) {
        setWelcomeMessage(`Welcome ${customer.name}, for your first visit`);
      } else {
        setWelcomeMessage(`Welcome back ${customer.name}`);
      }
      
      setShowDialog(false);
      setLocation("/menu");
    } catch (error) {
      console.error("Error submitting customer data:", error);
      alert("Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [customerName, phoneNumber, existingCustomer, setLocation]);

  // Social media click handlers
  const handleSocialClick = useCallback((url: string) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) {
      (document.activeElement as HTMLElement)?.blur();
    }
  }, []);

  // Calculate responsive container height - use more screen space
  const containerHeight = Math.min(screenDimensions.height * 0.98, screenDimensions.height - 20);

  return (
    <div className="h-screen w-screen overflow-hidden relative flex items-center justify-center" style={{ backgroundColor: '#FFF5F2' }}>
      {/* Media preloader */}
      <MediaPreloader onComplete={() => setMediaReady(true)} />

      {/* Responsive background container */}
      <div
        className="relative bg-cover bg-center bg-no-repeat md:w-full md:mx-auto w-screen h-screen"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          ...(screenDimensions.width > 768 ? {
            maxWidth: `${Math.min(420 * scaleFactor, screenDimensions.width * 0.95)}px`,
            height: `${containerHeight}px`,
            aspectRatio: '9/16',
          } : {
            width: '100vw',
            height: '100vh',
          })
        }}
      >
        {/* Content directly on background - dynamically scaled */}
        <div
          className="flex flex-col items-center justify-center h-full px-4"
          style={{
            padding: `${32 * scaleFactor}px ${16 * scaleFactor}px`,
            gap: `${24 * scaleFactor}px`,
          }}
        >

          {/* Ming's Logo */}
          <div className="flex flex-col items-center w-full">
            <img
              src="/images/logo.png"
              alt="Ming's Chinese Cuisine"
              style={{ width: `${240 * scaleFactor}px`, height: 'auto' }}
            />
          </div>

          {/* Social Media Icons */}
          <div className="flex" style={{ gap: `${16 * scaleFactor}px` }}>
            <button
              onClick={() => handleSocialClick("https://www.instagram.com/mingschinesecuisine.in?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==")}
              className="border-2 border-orange-500 rounded-lg flex items-center justify-center bg-white hover:bg-orange-50 transition-colors"
              style={{
                width: `${48 * scaleFactor}px`,
                height: `${48 * scaleFactor}px`,
              }}
            >
              <Instagram style={{ width: `${20 * scaleFactor}px`, height: `${20 * scaleFactor}px` }} className="text-orange-500" />
            </button>
            <button
              onClick={() => handleSocialClick("https://facebook.com")}
              className="border-2 border-orange-500 rounded-lg flex items-center justify-center bg-white hover:bg-orange-50 transition-colors"
              style={{
                width: `${48 * scaleFactor}px`,
                height: `${48 * scaleFactor}px`,
              }}
            >
              <Facebook style={{ width: `${20 * scaleFactor}px`, height: `${20 * scaleFactor}px` }} className="text-orange-500" />
            </button>
            <button
              onClick={() => handleSocialClick("https://youtube.com")}
              className="border-2 border-orange-500 rounded-lg flex items-center justify-center bg-white hover:bg-orange-50 transition-colors"
              style={{
                width: `${48 * scaleFactor}px`,
                height: `${48 * scaleFactor}px`,
              }}
            >
              <Youtube style={{ width: `${20 * scaleFactor}px`, height: `${20 * scaleFactor}px` }} className="text-orange-500" />
            </button>
          </div>

          {/* Explore Menu Button */}
          <button
            onClick={() => {
              const storedCustomer = sessionStorage.getItem('customer');
              if (storedCustomer) {
                setLocation("/menu");
              } else {
                setShowDialog(true);
              }
            }}
            className="bg-white text-orange-500 font-semibold border-2 border-orange-500 rounded-full hover:bg-orange-50 transition-colors flex items-center"
            style={{
              padding: `${12 * scaleFactor}px ${32 * scaleFactor}px`,
              gap: `${8 * scaleFactor}px`,
              fontSize: `${14 * scaleFactor}px`,
            }}
            data-testid="button-explore-menu"
          >
            <Utensils style={{ width: `${20 * scaleFactor}px`, height: `${20 * scaleFactor}px` }} />
            <span>EXPLORE OUR MENU</span>
          </button>

          {/* Rating Section */}
          <div className="text-center">
            <p
              className="text-orange-500 font-medium mb-2"
              style={{ fontSize: `${14 * scaleFactor}px`, marginBottom: `${8 * scaleFactor}px` }}
            >
              Click to Rate us on Google
            </p>
            <div
              className="flex justify-center cursor-pointer"
              style={{ gap: `${4 * scaleFactor}px` }}
              onClick={() => window.open("https://g.page/r/CePLzPaLyBLNEAI/review")}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="text-orange-500 fill-orange-500"
                  style={{ width: `${24 * scaleFactor}px`, height: `${24 * scaleFactor}px` }}
                />
              ))}
            </div>
          </div>

          {/* Address Section */}
          <div className="text-center">
            <div
              className="border-2 border-gray-600 rounded-full inline-block"
              style={{
                padding: `${4 * scaleFactor}px ${16 * scaleFactor}px`,
                marginBottom: `${12 * scaleFactor}px`,
              }}
            >
              <span
                className="text-orange-500 font-semibold"
                style={{ fontSize: `${12 * scaleFactor}px` }}
              >
                ADDRESS
              </span>
            </div>
            <div
              className="text-gray-700 leading-tight"
              style={{ fontSize: `${11 * scaleFactor}px` }}
            >
              <p>SHOP NO 2&3, GANGA GODAVARI</p>
              <p>APARTMENT, KATEMANIVALI NAKA,</p>
              <p>PRABHURAM NAGAR, KALYAN EAST,</p>
              <p>KALYAN EAST, THANE, KALYAN,</p>
              <p>MAHARASHTRA, 421306</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <div
              className="border-2 border-gray-600 rounded-full inline-block"
              style={{
                padding: `${4 * scaleFactor}px ${16 * scaleFactor}px`,
                marginBottom: `${12 * scaleFactor}px`,
              }}
            >
              <span
                className="text-orange-500 font-semibold"
                style={{ fontSize: `${12 * scaleFactor}px` }}
              >
                CONTACT
              </span>
            </div>
            <div
              className="text-gray-700"
              style={{ fontSize: `${11 * scaleFactor}px`, gap: `${4 * scaleFactor}px` }}
            >
              <p>info@mingschinesecuisine.in</p>
              <p>+91 75069 69333</p>
              <p
                className="text-orange-500 cursor-pointer no-underline"
                onClick={() => window.open("http://www.mingschinesecuisine.in", "_blank")}
                style={{ textDecoration: 'none' }}
              >
                www.mingschinesecuisine.in
              </p>
            </div>
          </div>

          {/* Footer - Developer Credit and Welcome Message */}
          <div className="w-full flex justify-between items-center" style={{ fontSize: `${10 * scaleFactor}px`, gap: `${16 * scaleFactor}px` }}>
            {/* Welcome Message (Left) */}
            <div className="text-left flex-1">
              {welcomeMessage && (
                <p className="text-orange-500 font-medium" data-testid="text-welcome-message">
                  {welcomeMessage}
                </p>
              )}
            </div>
            
            {/* Developer Credit (Right) */}
            <div className="text-right text-gray-600 flex-1">
              <p>Developed By</p>
              <p
                className="text-orange-500 font-medium cursor-pointer no-underline"
                onClick={() => window.open("http://www.airavatatechnologies.com", "_blank")}
                style={{ textDecoration: 'none' }}
              >
                AIRAVATA TECHNOLOGIES
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Customer Registration Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent 
          className="bg-gradient-to-br from-white via-orange-50/30 to-white border-2 border-orange-200 shadow-2xl" 
          style={{ maxWidth: `${380 * scaleFactor}px` }}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-3 pb-2">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-full shadow-lg">
                <Utensils className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Welcome to Ming's
            </DialogTitle>
            <p className="text-center text-sm text-gray-600">
              Please share your details to get started
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-5 pt-2">
            <div className="w-full space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Enter Your Name"
                  value={customerName}
                  onChange={handleNameChange}
                  disabled={!!existingCustomer}
                  className={`w-full bg-white text-gray-800 border-2 ${nameError ? 'border-red-500' : 'border-orange-300'} rounded-xl pl-12 pr-4 py-3.5 text-center focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 disabled:bg-gradient-to-r disabled:from-gray-50 disabled:to-gray-100 disabled:border-gray-300 shadow-sm transition-all placeholder:text-gray-400 font-medium`}
                  data-testid="input-name"
                  required
                />
                {nameError && (
                  <p className="text-red-500 text-xs mt-1 text-center" data-testid="error-name">{nameError}</p>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  placeholder="Enter 10 Digit Phone Number"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className={`w-full bg-white text-gray-800 border-2 ${phoneError ? 'border-red-500' : 'border-orange-300'} rounded-xl pl-12 pr-4 py-3.5 text-center focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 shadow-sm transition-all placeholder:text-gray-400 font-medium`}
                  data-testid="input-phone"
                  required
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1 text-center" data-testid="error-phone">{phoneError}</p>
                )}
              </div>
            </div>
            {existingCustomer && (
              <div className="w-full relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 shadow-lg" data-testid="text-returning-customer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">Welcome back, {existingCustomer.name}!</p>
                    <p className="text-white/90 text-xs mt-0.5">We're happy to see you again</p>
                  </div>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !customerName.trim() || phoneNumber.length < 10}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 gap-2.5 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              data-testid="button-submit-customer"
            >
              <Utensils className="w-5 h-5" />
              <span className="text-base">{isSubmitting ? 'PLEASE WAIT...' : 'CONTINUE TO MENU'}</span>
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

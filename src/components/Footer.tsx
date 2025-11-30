import { Lock, Shield, FileCheck } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#002B5C] via-[#003366] to-[#1B3A5F] border-t-4 border-[#0066CC] py-8 px-8 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center gap-12 mb-6">
          <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            <Lock className="w-5 h-5 text-[#00BCD4]" />
            <span className="text-white text-sm font-semibold font-['Roboto']">End-to-End Encrypted</span>
          </div>
          <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            <Shield className="w-5 h-5 text-[#00BCD4]" />
            <span className="text-white text-sm font-semibold font-['Roboto']">Data Privacy Compliant</span>
          </div>
          <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            <FileCheck className="w-5 h-5 text-[#00BCD4]" />
            <span className="text-white text-sm font-semibold font-['Roboto']">Chat Logs Protected</span>
          </div>
        </div>
        <p className='text-3xl text-red-600'>TESTING</p>

        <div className="text-center">
          <p className="text-[#7D9CB7] text-sm mb-3 font-['Lato']">
            Your conversations are secure and confidential. We ensure complete data privacy and protection.
          </p>
          <p className="text-[#5B8DB8] text-xs font-['Roboto']">
            &copy; 2025 Defence Cyber Security Division. All rights reserved. |{' '}
            <a href="#" className="text-[#00BCD4] hover:text-[#17A2B8] transition-colors duration-200 underline">Privacy Policy</a>
            {' '}|{' '}
            <a href="#" className="text-[#00BCD4] hover:text-[#17A2B8] transition-colors duration-200 underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

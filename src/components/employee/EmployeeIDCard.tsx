import { Button } from '@/components/ui/button';
import { Download, User, Mail, Phone, IdCard, MapPin, Calendar, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import { useState } from 'react';

interface EmployeeIDCardProps {
  employee: {
    id: string;
    name: string;
    email: string;
    phone: string;
    employee_id: string;
    role: string;
    department: string;
    photo_url?: string;
    join_date: string;
    valid_till?: string;
  };
}

export function EmployeeIDCard({ employee }: EmployeeIDCardProps) {
  const [showBack, setShowBack] = useState(false);

  // Calculate valid till date (3 years from join date if not provided)
  const validTillDate = employee.valid_till || 
    new Date(new Date(employee.join_date).setFullYear(new Date(employee.join_date).getFullYear() + 3))
      .toISOString().split('T')[0];

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  // Generate QR code data (employee profile URL or ID)
  const qrCodeData = `https://vedtechservices.in/employee/${employee.employee_id}`;

  // Download ID card as image
  const downloadIDCard = async (side: 'front' | 'back') => {
    const cardElement = document.getElementById(`id-card-${side}`);
    if (!cardElement) return;

    try {
      // Use html2canvas library to convert HTML to canvas
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${employee.name.replace(/\s+/g, '_')}_ID_Card_${side}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error downloading ID card:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={!showBack ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowBack(false)}
          >
            Front Side
          </Button>
          <Button
            variant={showBack ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowBack(true)}
          >
            Back Side
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadIDCard('front')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Front
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadIDCard('back')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Back
          </Button>
        </div>
      </div>

      {/* ID Card Display */}
      <div className="flex justify-center">
        {!showBack ? (
          <IDCardFront employee={employee} qrCodeData={qrCodeData} formatDate={formatDate} />
        ) : (
          <IDCardBack employee={employee} qrCodeData={qrCodeData} formatDate={formatDate} validTillDate={validTillDate} />
        )}
      </div>
    </div>
  );
}

// Front Side Component
function IDCardFront({ employee, qrCodeData, formatDate }: any) {
  return (
    <div
      id="id-card-front"
      className="relative w-[350px] h-[550px] rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #0a1f44 0%, #1e3a8a 50%, #3b82f6 100%)',
      }}
    >
      {/* Header */}
      <div className="relative p-6 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center mb-2">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
            <span className="text-2xl font-bold text-white">VS</span>
          </div>
        </div>
        
        {/* Company Name */}
        <h1 className="text-2xl font-bold text-white mb-1">VED TECH SERVICES</h1>
        <p className="text-xs text-blue-200">Digital Solutions | Endless Possibilities</p>

        {/* Decorative Circuit Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,20 L20,20 L20,40 M80,20 L100,20 M20,60 L40,60 M60,60 L80,60 L80,80" stroke="white" strokeWidth="0.5" fill="none" />
            <circle cx="20" cy="20" r="2" fill="white" />
            <circle cx="20" cy="40" r="2" fill="white" />
            <circle cx="80" cy="20" r="2" fill="white" />
            <circle cx="40" cy="60" r="2" fill="white" />
            <circle cx="80" cy="80" r="2" fill="white" />
          </svg>
        </div>
      </div>

      {/* Employee Photo */}
      <div className="flex justify-center -mt-2 mb-4">
        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
          {employee.photo_url ? (
            <img
              src={employee.photo_url}
              alt={employee.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
              <User className="h-16 w-16 text-blue-600" />
            </div>
          )}
        </div>
      </div>

      {/* Employee Details */}
      <div className="px-6 space-y-3">
        {/* Name */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-1">{employee.name}</h2>
          <p className="text-sm text-blue-200 font-medium">{employee.role}</p>
        </div>

        {/* Info Cards */}
        <div className="space-y-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 border border-white/20">
            <User className="h-4 w-4 text-blue-200 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-blue-200">DEPARTMENT</p>
              <p className="text-sm font-medium text-white truncate">{employee.department}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 border border-white/20">
            <Mail className="h-4 w-4 text-blue-200 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-blue-200">EMAIL</p>
              <p className="text-xs font-medium text-white truncate">{employee.email}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 border border-white/20">
            <Phone className="h-4 w-4 text-blue-200 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-blue-200">PHONE</p>
              <p className="text-sm font-medium text-white">{employee.phone}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 border border-white/20">
              <IdCard className="h-4 w-4 text-blue-200 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-blue-200">EMPLOYEE ID</p>
                <p className="text-sm font-bold text-white">{employee.employee_id}</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="w-20 h-20 bg-white rounded-lg p-1 flex items-center justify-center">
              <QRCodeDataUrl text={qrCodeData} width={72} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent p-4 text-center">
        <p className="text-xs text-white font-medium">www.vedtechservices.in</p>
      </div>
    </div>
  );
}

// Back Side Component
function IDCardBack({ employee, qrCodeData, formatDate, validTillDate }: any) {
  return (
    <div
      id="id-card-back"
      className="relative w-[350px] h-[550px] rounded-2xl overflow-hidden shadow-2xl bg-white"
    >
      {/* Header */}
      <div
        className="p-6 text-center relative"
        style={{
          background: 'linear-gradient(135deg, #0a1f44 0%, #1e3a8a 50%, #3b82f6 100%)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
            <span className="text-xl font-bold text-white">VS</span>
          </div>
        </div>
        
        {/* Company Name */}
        <h1 className="text-xl font-bold text-white mb-1">VED TECH SERVICES</h1>
        
        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8">
            <path d="M0,0 C150,80 350,0 600,50 C850,100 1050,20 1200,80 L1200,120 L0,120 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold">✓</span>
            </div>
            TERMS & CONDITIONS
          </h2>
          
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">✓</span>
              </div>
              <p>This ID card is the property of Ved Tech Services.</p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">✓</span>
              </div>
              <p>This card is non-transferable and must be surrendered upon request.</p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">✓</span>
              </div>
              <p>If found, please return to the address below.</p>
            </div>
          </div>
        </div>

        {/* Validity Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-900">JOIN DATE</p>
            </div>
            <p className="text-sm font-bold text-blue-900">{formatDate(employee.join_date)}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-900">VALID TILL</p>
            </div>
            <p className="text-sm font-bold text-blue-900">{formatDate(validTillDate)}</p>
          </div>
        </div>

        {/* Signature */}
        <div className="border-t border-gray-200 pt-3">
          <div className="text-center">
            <div className="h-12 flex items-end justify-center mb-1">
              <p className="text-lg font-signature italic text-gray-600">{employee.name}</p>
            </div>
            <div className="border-t border-gray-400 w-48 mx-auto mb-1"></div>
            <p className="text-xs font-medium text-gray-600">AUTHORIZED SIGNATURE</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white border-2 border-blue-200 rounded-lg p-2">
            <QRCodeDataUrl text={qrCodeData} width={80} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-blue-900 to-black text-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-blue-300" />
          <div className="flex-1">
            <p className="text-xs font-medium text-blue-100">Ved Tech Services</p>
            <p className="text-xs text-blue-200">Samastipur, Bihar, India</p>
            <p className="text-xs text-blue-200">Remote Available</p>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Facebook className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Instagram className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Linkedin className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Youtube className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center border-t border-white/20 pt-2">
          <p className="text-xs font-medium text-blue-100">TECHNOLOGY | TRADITION | TRANSFORMATION</p>
          <p className="text-xs text-blue-200 mt-0.5">वसुधैव कुटुम्बकम्</p>
        </div>
      </div>
    </div>
  );
}

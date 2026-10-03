import React from 'react';
import { Building2, GraduationCap, ShoppingBag, Rocket, Hospital, Factory } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/lib/next-router';

const industries = [
  {
    icon: <GraduationCap className="h-12 w-12 text-primary" />,
    title: "Educational Institutions",
    description: "Complete IT infrastructure for schools, colleges, and coaching centers. Computer labs, smart classrooms, student management systems, and campus-wide networking solutions.",
    services: ["Computer Lab Setup", "Smart Classroom Solutions", "Campus Wi-Fi", "Student Management Software"],
    link: "/industries/educational-institutions"
  },
  {
    icon: <Building2 className="h-12 w-12 text-primary" />,
    title: "Corporate Offices",
    description: "Enterprise-grade IT solutions for businesses of all sizes. From startups to established companies, we provide scalable infrastructure and ongoing support.",
    services: ["Office IT Setup", "Server Management", "Network Security", "Cloud Solutions"],
    link: "/industries/corporate-offices"
  },
  {
    icon: <ShoppingBag className="h-12 w-12 text-primary" />,
    title: "Retail & Shops",
    description: "Point-of-sale systems, inventory management, billing software, and CCTV surveillance for retail businesses and shops.",
    services: ["POS Systems", "Billing Software", "CCTV Installation", "Inventory Management"],
    link: "/industries/retail-shops"
  },
  {
    icon: <Rocket className="h-12 w-12 text-primary" />,
    title: "Startups & SMEs",
    description: "Cost-effective IT solutions tailored for growing businesses. We help startups establish their technology foundation without breaking the bank.",
    services: ["Website Development", "Cloud Setup", "IT Consulting", "Affordable AMC Plans"],
    link: "/industries/startups-smes"
  },
  {
    icon: <Hospital className="h-12 w-12 text-primary" />,
    title: "Healthcare & Clinics",
    description: "HIPAA-compliant IT systems for hospitals, clinics, and diagnostic centers. Patient management systems and secure data handling.",
    services: ["Patient Management Systems", "Data Security", "Medical Equipment Integration", "Backup Solutions"],
    link: "/industries/healthcare"
  },
  {
    icon: <Factory className="h-12 w-12 text-primary" />,
    title: "Manufacturing & Warehouses",
    description: "Industrial IT solutions including automation systems, inventory tracking, and warehouse management software.",
    services: ["Automation Systems", "Warehouse Management", "Industrial Networking", "ERP Solutions"],
    link: "/industries/manufacturing"
  }
];

const Industries: React.FC = () => {
  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-32 md:py-32">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Industries We Serve</h1>
          <p className="text-slate-300 max-w-3xl mx-auto text-lg leading-relaxed">
            VedTech Services provides specialized IT solutions across diverse industries. 
            Our expertise spans multiple sectors, delivering tailored technology solutions that drive business growth.
          </p>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Explore IT solutions by industry</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, idx) => (
              <Link key={idx} to={industry.link} className="block">
                <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl cursor-pointer h-full">
                  <CardContent className="p-6 md:p-8">
                    <div className="mb-6">{industry.icon}</div>
                    <h3 className="text-2xl font-bold mb-4">{industry.title}</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">{industry.description}</p>
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-primary mb-3">Key Services:</div>
                      <div className="grid grid-cols-1 gap-2">
                        {industry.services.map((service, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">Don't See Your Industry?</h2>
            <p className="text-slate-600 text-lg">
              We work with businesses across all sectors. Our flexible approach allows us to customize 
              IT solutions for any industry requirement.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/contact" className="inline-flex items-center justify-center h-11 px-8 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
                Discuss Your Requirements
              </Link>
              <Link to="/support" className="inline-flex items-center justify-center h-11 px-8 rounded-md border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors">
                Request a Quote
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              <Link to="/locations" className="font-semibold text-primary hover:underline">Explore city-specific business software and website needs</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Industries;

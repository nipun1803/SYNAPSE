import React from "react"
import { Link } from "react-router-dom"
import { assets } from "../assets/assets"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Clock } from "lucide-react"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: "/", hoverColor: 'hover:bg-blue-100 hover:text-blue-600' },
    { name: 'Twitter', icon: Twitter, href: "/", hoverColor: 'hover:bg-blue-100 hover:text-blue-400' },
    { name: 'Instagram', icon: Instagram, href: "/", hoverColor: 'hover:bg-pink-100 hover:text-pink-600' },
    { name: 'LinkedIn', icon: Linkedin, href: "/", hoverColor: 'hover:bg-blue-100 hover:text-blue-700' }
  ]

  const quickLinks = [
    { to: "/", label: "Home" },
    { to: "/doctors", label: "Find Doctors" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact" },
    { to: "/my-appointments", label: "My Appointments" }
  ]

  const legalLinks = [
    { to: "/privacy-policy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Service" },
    { to: "/cookie-policy", label: "Cookie Policy" }
  ]

  const contactInfo = [
    {
      icon: MapPin,
      label: "Address",
      content: (
        <>
          123 Healthcare Street<br/>
          Medical District, City 12345
        </>
      )
    },
    {
      icon: Phone,
      label: "Phone",
      content: (
        <a href="tel:+919848111289" className="text-blue-600 hover:text-blue-700 transition-colors">
          +91 98481 11289
        </a>
      )
    },
    {
      icon: Mail,
      label: "Email",
      content: (
        <a href="mailto:support@synapse.com" className="text-blue-600 hover:text-blue-700 transition-colors">
          support@synapse.com
        </a>
      )
    },
    {
      icon: Clock,
      label: "Hours",
      content: "24/7 Support Available"
    }
  ]

  return (
    <footer className="bg-white border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          
          <div className="md:col-span-2">
            <img className="mb-5 w-40" src={assets.logo} alt="Synapse" />
            <p className="text-gray-600 leading-relaxed mb-6 max-w-md">
              Your trusted healthcare partner. Book appointments with top doctors, 
              manage your health records, and get quality medical care - all in one place.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const IconComponent = social.icon
                return (
                  <Button
                    key={social.name}
                    variant="outline"
                    size="icon"
                    className={`rounded-full ${social.hoverColor} transition-all`}
                    asChild
                  >
                    <a 
                      href={social.href}
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label={social.name}
                    >
                      <IconComponent className="h-4 w-4" />
                    </a>
                  </Button>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold text-base mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm inline-flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold text-base mb-4">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              {contactInfo.map((item) => {
                const IconComponent = item.icon
                return (
                  <li key={item.label} className="flex gap-3">
                    <IconComponent className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-medium text-gray-700 mb-1">{item.label}</span>
                      <div className="text-gray-600">{item.content}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            Copyright © {currentYear} Synapse. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            {legalLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
import React from "react"
import { assets } from "../assets/assets"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ArrowRight, Star, Clock, Shield } from "lucide-react"

const Header = () => {
  const stats = [
    { icon: Star, label: "Top Rated", value: "4.9/5" },
    { icon: Clock, label: "Quick Booking", value: "< 2 min" },
    { icon: Shield, label: "Secure", value: "100%" }
  ]

  return (
    <Card className="relative bg-blue-600 rounded-2xl overflow-hidden shadow-xl border-0">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 opacity-90" />

      <div className="relative z-10 px-8 py-12 lg:p-16 flex flex-col lg:flex-row items-center gap-10">
        
        <div className="lg:w-1/2 flex flex-col items-start gap-5">
          <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-500 text-white border-0">
            Healthcare Made Simple
          </Badge>

          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
            Book Appointments <br />
            <span className="text-blue-200">With the Right Doctors</span>
          </h1>

          <div className="flex items-center gap-4">
            <img
              src={assets.group_profiles}
              alt="Patients"
              className="w-24 sm:w-28"
            />
            <p className="text-blue-100 text-base sm:text-lg max-w-sm">
              Find doctors that match your needs and schedule a visit in just a
              few clicks — no long queues or phone calls.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 py-2">
            {stats.map((stat) => {
              const IconComponent = stat.icon
              return (
                <div 
                  key={stat.label}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg"
                >
                  <IconComponent className="h-4 w-4 text-blue-200" />
                  <div className="flex flex-col">
                    <span className="text-xs text-blue-200">{stat.label}</span>
                    <span className="text-sm font-semibold text-white">{stat.value}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <Button
            asChild
            size="lg"
            className="mt-2 bg-white text-blue-600 hover:bg-blue-50 hover:shadow-lg group"
          >
            <a href="#speciality">
              Book Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </div>

        <div className="lg:w-1/2 w-full">
          <img
            src={assets.header_img}
            alt="Doctors Team"
            className="w-full h-auto object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>
    </Card>
  )
}

export default Header

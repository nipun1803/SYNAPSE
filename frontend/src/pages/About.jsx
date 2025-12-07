import React from "react";
import { assets } from "../assets/assets";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, Sparkles } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Clock,
      title: "Efficiency",
      description: "Streamlined appointment scheduling that fits into your busy lifestyle."
    },
    {
      icon: MapPin,
      title: "Convenience",
      description: "Access to a network of trusted healthcare professionals in your area."
    },
    {
      icon: Sparkles,
      title: "Personalization",
      description: "Book your next checkup in just a few clicks. No more waiting on hold—Synapse works like your own digital assistant."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">


      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          About <span className="text-blue-600">Us</span>
        </h1>
      </div>

      <div className="my-16 flex flex-col md:flex-row gap-12 items-center">
        <img
          className="w-full md:max-w-[360px] rounded-2xl shadow-lg"
          src={assets.about_image}
          alt="About Synapse healthcare platform"
        />

        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600 dark:text-gray-400">
          <p className="text-base leading-relaxed">
            Founded in 2024, <strong>Synapse Medical Group</strong> started with a simple idea: healthcare should be as connected and intelligent as the human nervous system. We recognized that the gap between patients and quality specialist care was often widened by inefficient scheduling and lack of communication.
          </p>

          <p className="text-base leading-relaxed">
            Today, Synapse has evolved into a premier digital health platform connecting over 10,000 patients with top-tier specialists across Cardiology, Neurology, and General Medicine. Our technology doesn't just book appointments; it builds relationships. By integrating real-time availability, secure communication, and smart health tracking, we ensure that every interaction adds value to your health journey.
          </p>

          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Our Vision
            </h2>
            <p className="text-base leading-relaxed">
              We envision a future where healthcare is proactive, personalized, and universally accessible. Synapse aims to be the digital backbone of modern medicine, empowering patients to take control of their health with confidence and providing doctors with the tools to focus on what they do best: healing.
            </p>
          </div>
        </div>
      </div>


      <div className="mt-20">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Why <span className="text-blue-600">Choose Us</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;

            return (
              <Card
                key={index}
                className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-gray-200 dark:border-gray-700 hover:border-blue-300"
              >
                <CardContent className="p-8 flex flex-col gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                    <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

    </section>
  );
};

export default About;
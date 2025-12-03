import React, { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ArrowRight, Star, Clock, Shield, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"



const textVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" }
  })
}


const backgroundParallax = (offsetY) => ({
  transform: `translateY(${offsetY}px)`
})

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 1.06
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1.06,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  },
  exit: (direction) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 1.06
  })
}



const Carousel = ({ images = [], interval = 5000 }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [direction, setDirection] = useState(1) // 1 → next, -1 → previous
  const intervalRef = useRef(null)


  const paginate = useCallback(
    (newDirection) => {
      setDirection(newDirection)
      setActiveIndex((prev) => (prev + newDirection + images.length) % images.length)
    },
    [images.length]
  )

  const nextSlide = useCallback(() => paginate(1), [paginate])
  const prevSlide = useCallback(() => paginate(-1), [paginate])


  const setIndex = useCallback(
    (newIndex) => {
      setDirection(newIndex > activeIndex ? 1 : -1)
      setActiveIndex(newIndex)
    },
    [activeIndex]
  )


  useEffect(() => {
    if (!images.length || isHovered) return
    intervalRef.current = setInterval(nextSlide, interval)
    return () => clearInterval(intervalRef.current)
  }, [images.length, interval, isHovered, nextSlide])


  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key === "ArrowRight") nextSlide()
      if (e.key === "ArrowLeft") prevSlide()
    }
    window.addEventListener("keydown", handleKeys)
    return () => window.removeEventListener("keydown", handleKeys)
  }, [nextSlide, prevSlide])

  return (
    <div
      className="relative w-full h-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      <div className="overflow-hidden rounded-xl shadow-lg relative aspect-[4/3]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={activeIndex}
            src={images[activeIndex]}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>


      <motion.button
        onClick={prevSlide}
        className="absolute top-1/2 left-3 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors duration-300 z-20"
        animate={{ opacity: isHovered ? 1 : 0 }}
      >
        <ChevronLeft className="h-5 w-5" />
      </motion.button>

      <motion.button
        onClick={nextSlide}
        className="absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors duration-300 z-20"
        animate={{ opacity: isHovered ? 1 : 0 }}
      >
        <ChevronRight className="h-5 w-5" />
      </motion.button>


      <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2 z-20">
        {images.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === activeIndex ? "bg-white" : "bg-white/50 hover:bg-white/80"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  )
}



const Header = () => {
  const [offsetY, setOffsetY] = useState(0)


  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY * 0.25)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])


  const images = [
    "https://res.cloudinary.com/dvowfjsb4/image/upload/v1764693970/image_ifyuwr.png",
    "https://res.cloudinary.com/dvowfjsb4/image/upload/v1764682357/young-male-psysician-with-patient-measuring-blood-pressure_bx6yoz.jpg",
    "https://res.cloudinary.com/dvowfjsb4/image/upload/v1764682601/happy-doctor-holding-clipboard-with-patients_pzg4xa.jpg",
    "https://res.cloudinary.com/dvowfjsb4/image/upload/v1764693183/Gemini_Generated_Image_c2r6f3c2r6f3c2r6_tf1hty.png"
  ]


  const stats = [
    { icon: Star, label: "Top Rated", value: "4.9/5" },
    { icon: Clock, label: "Quick Booking", value: "< 2 min" },
    { icon: Shield, label: "Secure", value: "100%" }
  ]

  return (
    <Card className="relative rounded-2xl overflow-hidden shadow-xl border-0">

      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 opacity-95"
        animate={backgroundParallax(offsetY)}
        transition={{ type: "tween", ease: "linear", duration: 0.1 }}
      />

      <div className="relative z-10 px-6 py-12 lg:py-16 lg:px-14 flex flex-col lg:flex-row items-center gap-10">
        
        {/* LEFT SECTION: Text Content */}
        <div className="lg:w-[40%] flex flex-col gap-6 text-center lg:text-left">
          <motion.div custom={0} variants={textVariants} initial="initial" animate="animate">
            <Badge className="bg-blue-500 text-white px-3 py-1 rounded-full">
              Healthcare Made Simple
            </Badge>
          </motion.div>

          <motion.h1
            custom={1}
            variants={textVariants}
            initial="initial"
            animate="animate"
            className="text-4xl lg:text-5xl font-extrabold text-white leading-tight"
          >
            Book Appointments
            <br />
            <span className="text-blue-300 font-bold">With the Right Doctors</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={textVariants}
            initial="initial"
            animate="animate"
            className="text-blue-100 max-w-sm mx-auto lg:mx-0 font-light"
          >
            Find doctors that match your needs — no more waiting in queues or long phone calls.
          </motion.p>


          <motion.div
            custom={3}
            variants={textVariants}
            initial="initial"
            animate="animate"
            className="flex flex-wrap gap-4 bg-white/10 backdrop-blur p-4 rounded-xl border border-white/20 mx-auto lg:mx-0"
          >
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-blue-200" />
                <div>
                  <p className="text-xs text-blue-200 uppercase">{label}</p>
                  <p className="text-white text-sm font-semibold">{value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            custom={4}
            variants={textVariants}
            initial="initial"
            animate="animate"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-700 rounded-full px-6 py-6 font-medium hover:bg-blue-50 hover:shadow-xl transition-all"
            >
              <a href="#speciality" className="flex items-center">
                Find Your Doctor Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </motion.div>
        </div>


        <motion.div
          custom={3}
          variants={textVariants}
          initial="initial"
          animate="animate"
          className="lg:w-[60%] w-full"
        >
          <Carousel images={images} interval={6000} />
        </motion.div>
      </div>
    </Card>
  )
}

export default Header
import doctorModel from '../models/doctormodel.js'
import appointmentModel from '../models/appointmentmodel.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

// const shouldUseSecureCookies = (() => {
//   const isProd = process.env.NODE_ENV === 'production';
//   const isLocalHost = [process.env.FRONTEND_URL, process.env.ADMIN_URL]
//     .filter(Boolean)
//     .some((url) => url.includes('localhost') || url.includes('127.0.0.1'));
//   if (process.env.COOKIE_SECURE?.toLowerCase() === 'true') return true;
//   if (process.env.COOKIE_SECURE?.toLowerCase() === 'false') return false;
//   return isProd && !isLocalHost;
// })();

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
};

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body
    const doctor = await doctorModel.findOne({ email })
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' })
    }

    const passwordMatch = await bcrypt.compare(password, doctor.password)
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: doctor._id, role: 'doctor', email: doctor.email, type: 'doctor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.cookie('dToken', token, getCookieOptions());
    
    res.status(200).json({ success: true, userType: 'doctor' })
  } catch (error) {
    console.error(error)

    res.status(500).json({ success: false, message: error.message })
  }
}

const logoutDoctor = async (req, res) => {
  try {
    res.clearCookie('dToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });
    
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.doctor.id
    const appointments = await appointmentModel.find({ docId }).sort({ createdAt: -1 })
    
    res.status(200).json({ success: true, appointments })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

const appointmentCancel = async (req, res) => {
  try {
    const docId = req.doctor.id
    const { appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (appointmentData && appointmentData.docId.toString() === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
      return res.status(200).json({ success: true, message: 'Appointment Cancelled' })
    }

    res.status(403).json({ success: false, message: 'Unable to cancel appointment' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

const appointmentComplete = async (req, res) => {
  try {
    const docId = req.doctor.id
    const { appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (appointmentData && appointmentData.docId.toString() === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
      
      return res.status(200).json({ success: true, message: 'Appointment Completed' })
    }
    res.status(403).json({ success: false, message: 'Unable to complete appointment' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select('-password -email')

    res.status(200).json({ success: true, doctors })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

const changeAvailability = async (req, res) => {
  try {
    const docId = req.params.id || req.body?.docId;
    
    if (!docId) {
      return res.status(400).json({ 
        success: false, 
        message: "Doctor ID is required" 
      });
    }

    const doctor = await doctorModel.findById(docId);
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: "Doctor not found" 
      });
    }

    doctor.available = !doctor.available;
    await doctor.save();

    const emit = req.app?.locals?.emitToAdmins;
    if (emit) {
      emit("doctor:updated", { 
        type: "doctor:updated", 
        doctor: doctor.toObject() 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `Doctor is now ${doctor.available ? 'available' : 'unavailable'}`,
      doctor: {
        _id: doctor._id,
        available: doctor.available
      }
    });
  } catch (error) {
    console.error('Change availability error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to change availability" 
    });
  }
}

const doctorDashboard = async (req, res) => {
  try {
    const docId = req.doctor.id
    const appointments = await appointmentModel.find({ docId })

    let earnings = 0
    appointments.forEach((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount
      }
    })

    let patients = []
    appointments.forEach((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId)
      }
    })

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5)
    }

    res.status(200).json({ success: true, dashData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

const doctorProfile = async (req, res) => {
  try {
    const docId = req.doctor.id
    const profileData = await doctorModel.findById(docId).select('-password')
    res.status(200).json({ success: true, profileData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.doctor.id
    const { fees, address, available, about } = req.body

    await doctorModel.findByIdAndUpdate(docId, { fees, address, available, about })
    
    res.status(200).json({ success: true, message: 'Profile Updated' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export {
  loginDoctor,
  logoutDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorList,
  changeAvailability,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile
}
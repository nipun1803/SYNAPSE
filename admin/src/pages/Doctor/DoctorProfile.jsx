import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DoctorContext } from "../../context/DoctorContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Save,
  X,
  Edit,
  Loader2,
  Info,
  Briefcase,
  GraduationCap,
  Calendar,
} from "lucide-react";

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } =
    useContext(DoctorContext);
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!profileData?.about?.trim()) {
      toast.error("About section is required");
      return false;
    }
    if (!profileData?.fees || profileData.fees <= 0) {
      toast.error("Please enter a valid consultation fee");
      return false;
    }
    if (!profileData?.address?.line1?.trim()) {
      toast.error("Address Line 1 is required");
      return false;
    }
    return true;
  };

  const updateProfile = async () => {
    if (!profileData) return;
    if (!validateForm()) return;

    try {
      setLoading(true);
      const updateData = {
        address: {
          line1: profileData.address.line1.trim(),
          line2: profileData.address.line2?.trim() || "",
        },
        fees: Number(profileData.fees),
        about: profileData.about.trim(),
        available: profileData.available,
      };

      if (profileData.name?.trim()) {
        updateData.name = profileData.name.trim();
      }
      if (profileData.phone?.trim()) {
        updateData.phone = profileData.phone.trim();
      }

      const { data } = await axios.put(
        `${backendUrl}/api/doctors/me/profile`,
        updateData,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Profile updated successfully");
        setIsEdit(false);
        await getProfileData();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEdit(false);
    getProfileData();
  };

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-green-500 to-teal-600"></div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-12">
              {/* Profile Picture */}
              <div className="mb-4 sm:mb-0">
                <img
                  src={profileData.image}
                  alt="Doctor Profile"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                />
              </div>

              {/* Edit Button */}
              {!isEdit && (
                <button
                  onClick={() => setIsEdit(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {profileData.name}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <GraduationCap className="h-4 w-4" />
                <span className="font-medium">{profileData.degree}</span>
                <span>•</span>
                <Briefcase className="h-4 w-4" />
                <span>{profileData.speciality}</span>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {profileData.experience}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <Mail className="h-4 w-4" />
                <p>{profileData.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Professional Information
          </h2>

          <div className="space-y-6">
            {/* About */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                About {isEdit && <span className="text-red-500">*</span>}
              </Label>
              {isEdit ? (
                <textarea
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      about: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={6}
                  value={profileData.about}
                  placeholder="Write about your experience, expertise, and qualifications..."
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">
                  {profileData.about}
                </p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4" />
                Name
              </Label>
              {isEdit ? (
                <Input
                  type="text"
                  className="w-full"
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  value={profileData.name || ""}
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-gray-900">{profileData.name}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              {isEdit ? (
                <Input
                  type="tel"
                  className="w-full"
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  value={profileData.phone || ""}
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-gray-900">
                  {profileData.phone || "Not provided"}
                </p>
              )}
            </div>

            {/* Consultation Fee */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4" />
                Consultation Fee{" "}
                {isEdit && <span className="text-red-500">*</span>}
              </Label>
              {isEdit ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {currency}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    className="w-full pl-8"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        fees: Number(e.target.value),
                      }))
                    }
                    value={profileData.fees}
                    placeholder="Enter consultation fee"
                  />
                </div>
              ) : (
                <p className="text-gray-900 text-lg font-semibold">
                  {currency} {profileData.fees}
                </p>
              )}
            </div>

            {/* Clinic Address */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4" />
                Clinic Address{" "}
                {isEdit && <span className="text-red-500">*</span>}
              </Label>
              {isEdit ? (
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Street address, building name"
                    className="w-full"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line1: e.target.value },
                      }))
                    }
                    value={profileData.address.line1}
                  />
                  <Input
                    type="text"
                    placeholder="City, State, Zip Code (optional)"
                    className="w-full"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line2: e.target.value },
                      }))
                    }
                    value={profileData.address.line2}
                  />
                </div>
              ) : (
                <div className="text-gray-900">
                  <p>{profileData.address.line1}</p>
                  {profileData.address.line2 && (
                    <p>{profileData.address.line2}</p>
                  )}
                </div>
              )}
            </div>

            {/* Availability Toggle */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="block text-sm font-medium text-gray-700">
                    Availability Status
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    {profileData.available
                      ? "You are currently accepting appointments"
                      : "You are not accepting new appointments"}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isEdit}
                    onChange={() =>
                      isEdit &&
                      setProfileData((prev) => ({
                        ...prev,
                        available: !prev.available,
                      }))
                    }
                    checked={profileData.available}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      profileData.available ? "peer-checked:bg-green-600" : ""
                    } ${!isEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                  ></div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEdit && (
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button
                onClick={updateProfile}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </span>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={loading}
                variant="outline"
                className="px-6 py-2"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Info Banner */}
        {!isEdit && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-900 font-medium">
                  Keep your profile updated
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Your profile information helps patients make informed
                  decisions when booking appointments. Make sure your
                  availability status reflects your current schedule.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;

import axios from "axios";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Upload, Trash2, Loader2 } from 'lucide-react';

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [loading, setLoading] = useState(false);

  const { backendUrl, aToken, getAllDoctors } = useContext(AdminContext);
  const currency = import.meta.env.VITE_CURRENCY || "₹";

  const UPLOAD_PLACEHOLDER = useMemo(
    () =>
      assets?.upload_area ||
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
    []
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetForm = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setDocImg(null);
    setPreviewUrl("");
    setName("");
    setEmail("");
    setPassword("");
    setExperience("1 Year");
    setFees("");
    setAbout("");
    setSpeciality("General physician");
    setDegree("");
    setAddress1("");
    setAddress2("");
  };

  const onImageChange = (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setDocImg(null);
        setPreviewUrl("");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      const MAX = 5 * 1024 * 1024;
      if (file.size > MAX) {
        toast.error("Image size must be 5MB or less");
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const url = URL.createObjectURL(file);
      setDocImg(file);
      setPreviewUrl(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load the selected image");
    }
  };

  const removeSelectedImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setDocImg(null);
    setPreviewUrl("");
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (!docImg) {
        return toast.error("Please upload a doctor photo");
      }

      if (
        !name.trim() ||
        !email.trim() ||
        !password ||
        !degree.trim() ||
        !address1.trim()
      ) {
        return toast.error("Please fill all required fields");
      }

      if (password.length < 6) {
        return toast.error("Password must be at least 6 characters");
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("image", docImg);
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about.trim());
      formData.append("speciality", speciality);
      formData.append("degree", degree.trim());
      formData.append(
        "address",
        JSON.stringify({ line1: address1.trim(), line2: address2.trim() })
      );

      const { data } = await axios.post(
        `${backendUrl}/api/admin/doctors`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (data?.success) {
        toast.success(data.message || "Doctor added successfully");
        resetForm();
        getAllDoctors();
      } else {
        toast.error(data?.message || "Failed to add doctor");
      }
    } catch (error) {
      console.error("Add doctor error:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add doctor"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-blue-600" />
          Add New Doctor
        </h1>
        <p className="text-gray-600 mt-1">Fill in the details to register a new doctor</p>
      </div>

      <form onSubmit={onSubmitHandler} className="space-y-6">
        {/* Photo Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Doctor Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <label htmlFor="doc-img" className="cursor-pointer block">
                  <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors">
                    <img
                      className="w-full h-full object-cover"
                      src={previewUrl || UPLOAD_PLACEHOLDER}
                      alt="Upload"
                    />
                  </div>
                </label>
                <input
                  onChange={onImageChange}
                  type="file"
                  id="doc-img"
                  hidden
                  accept="image/*"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Upload Requirements
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Professional headshot photo</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• Formats: JPG, PNG, WEBP</li>
                </ul>

                {previewUrl && (
                  <Button
                    type="button"
                    onClick={removeSelectedImage}
                    variant="ghost"
                    size="sm"
                    className="mt-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove Photo
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="Dr. John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="email"
                  placeholder="doctor@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="password"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education / Degree <span className="text-red-600">*</span>
                </label>
                <input
                  onChange={(e) => setDegree(e.target.value)}
                  value={degree}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="MBBS, MD"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speciality
                </label>
                <select
                  onChange={(e) => setSpeciality(e.target.value)}
                  value={speciality}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="General physician">General Physician</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatricians">Pediatrician</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Gastroenterologist">Gastroenterologist</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <select
                  onChange={(e) => setExperience(e.target.value)}
                  value={experience}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((year) => (
                    <option
                      key={year}
                      value={`${year} Year${year > 1 ? "s" : ""}`}
                    >
                      {year} Year{year > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee ({currency})
                </label>
                <input
                  onChange={(e) => setFees(e.target.value)}
                  value={fees}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  placeholder="500"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinic Address */}
        <Card>
          <CardHeader>
            <CardTitle>Clinic Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 <span className="text-red-600">*</span>
                </label>
                <input
                  onChange={(e) => setAddress1(e.target.value)}
                  value={address1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="Street address, building name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  onChange={(e) => setAddress2(e.target.value)}
                  value={address2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="City, State, Zip Code"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Doctor */}
        <Card>
          <CardHeader>
            <CardTitle>About Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              onChange={(e) => setAbout(e.target.value)}
              value={about}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Write about the doctor's experience, expertise, and qualifications..."
              rows={6}
              required
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Doctor...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Doctor
              </>
            )}
          </Button>

          <Button
            type="button"
            onClick={resetForm}
            variant="outline"
            size="lg"
          >
            Reset Form
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddDoctor;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import AddressAutocomplete from "../../components/commons/AddressAutocomplete";
import { uploadToCloudinary, uploadMultipleToCloudinary } from "../../utils/cloudinaryUpload";
import "./HallForm.css";

const AddHall = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: {
      address: "",
      city: "",
      state: "",
      pincode: "",
      coordinates: {
        lat: null,
        lng: null,
      },
      googleMapsUrl: "",
    },
    capacity: "",
    pricePerHour: "",
    amenities: [],
    images: {
      mainHall: null,
      stage: null,
      seating: null,
      dining: null,
      parking: null,
      outsideView: null,
      washroom: [],
    },
  });
  const [amenityInput, setAmenityInput] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      location: {
        address: location.address,
        city: location.city,
        state: location.state,
        pincode: location.pincode,
        coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
        googleMapsUrl: `https://www.google.com/maps?q=${location.lat},${location.lng}`,
      },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()],
      });
      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    });
  };

  const handleImageUpload = (category, file) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setFormData({
        ...formData,
        images: { ...formData.images, [category]: file },
      });
    }
  };

  const handleWashroomImageUpload = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select valid image files only");
        return false;
      }
      return true;
    });
    if (validFiles.length > 0) {
      setFormData({
        ...formData,
        images: { ...formData.images, washroom: [...formData.images.washroom, ...validFiles] },
      });
    }
  };

  const removeWashroomImage = (index) => {
    setFormData({
      ...formData,
      images: {
        ...formData.images,
        washroom: formData.images.washroom.filter((_, i) => i !== index),
      },
    });
  };

  const removeImage = (category) => {
    setFormData({
      ...formData,
      images: {
        ...formData.images,
        [category]: null,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      // 1. Collect all image files
      const imageCategories = ["mainHall", "stage", "seating", "dining", "parking", "outsideView"];
      const filesToUpload = [];

      imageCategories.forEach((cat) => {
        if (formData.images[cat]) filesToUpload.push(formData.images[cat]);
      });
      formData.images.washroom.forEach((f) => filesToUpload.push(f));

      // 2. Upload all images directly to Cloudinary
      let imageUrls = [];
      if (filesToUpload.length > 0) {
        toast.info("Uploading images...");
        imageUrls = await uploadMultipleToCloudinary(
          filesToUpload,
          "hall-booking/halls",
          (p) => setUploadProgress(p)
        );
      }

      // 3. Send only URLs + form data to backend (tiny payload)
      const payload = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        capacity: formData.capacity,
        pricePerHour: formData.pricePerHour,
        amenities: formData.amenities,
        images: imageUrls,
      };

      await axios.post("/api/halls", payload, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Hall added successfully! Waiting for admin approval.");
      navigate("/hall-owner/halls");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add hall");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="hall-form-page">
      <div className="dashboard-layout">
        <div className="dashboard-content">
          <h1>Add New Hall</h1>
          <form onSubmit={handleSubmit} className="hall-form">
            <div className="form-group">
              <label>
                Hall Name <span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter hall name (e.g., Grand Ballroom)"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Description <span className="required-asterisk">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your hall including features, facilities, and special amenities..."
                rows="5"
                required
              />
            </div>

            {/* Address Autocomplete with Map Preview */}
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">📍</span>
                Location Details
              </h3>
              <AddressAutocomplete
                onLocationSelect={handleLocationSelect}
                initialValue={formData.location.address}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  City <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="City will be auto-filled"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  State <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  placeholder="State will be auto-filled"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Pincode <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  name="location.pincode"
                  value={formData.location.pincode}
                  onChange={handleChange}
                  placeholder="Pincode will be auto-filled"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Capacity <span className="required-asterisk">*</span>
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Enter maximum capacity (e.g., 200)"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Price per Hours (₹){" "}
                  <span className="required-asterisk">*</span>
                </label>
                <input
                  type="number"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  placeholder="Enter hourly rate (e.g., 5000)"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Amenities</label>
              <div className="amenities-input">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddAmenity())
                  }
                  placeholder="Add amenity and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="btn btn-primary"
                >
                  Add
                </button>
              </div>
              {formData.amenities.length > 0 && (
                <div className="amenities-list">
                  {formData.amenities.map((amenity, index) => (
                    <span key={index} className="amenity-tag">
                      {amenity}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(index)}
                        className="remove-amenity"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Image Upload Section */}
            <div className="image-upload-section">
              <h3>Hall Photos</h3>

              {/* Main Hall Photo (Cover Image) */}
              <div className="form-group image-upload-group">
                <label>
                  Main Hall Photo (Cover Image){" "}
                  <span className="required-asterisk">*</span>
                </label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload("mainHall", e.target.files[0])
                    }
                    className="image-input"
                    id="mainHall"
                  />
                  <label htmlFor="mainHall" className="image-upload-label">
                    <div className="upload-icon">📷</div>
                    <span>Click to upload main hall photo</span>
                  </label>
                  {formData.images.mainHall && (
                    <div className="image-preview">
                      <img
                        src={URL.createObjectURL(formData.images.mainHall)}
                        alt="Main Hall"
                        className="preview-image"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("mainHall")}
                        className="remove-image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stage Photo */}
              <div className="form-group image-upload-group">
                <label>Stage Photo</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload("stage", e.target.files[0])
                    }
                    className="image-input"
                    id="stage"
                  />
                  <label htmlFor="stage" className="image-upload-label">
                    <div className="upload-icon">🎭</div>
                    <span>Click to upload stage photo</span>
                  </label>
                  {formData.images.stage && (
                    <div className="image-preview">
                      <img
                        src={URL.createObjectURL(formData.images.stage)}
                        alt="Stage"
                        className="preview-image"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("stage")}
                        className="remove-image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Seating Arrangement */}
              <div className="form-group image-upload-group">
                <label>Seating Arrangement</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload("seating", e.target.files[0])
                    }
                    className="image-input"
                    id="seating"
                  />
                  <label htmlFor="seating" className="image-upload-label">
                    <div className="upload-icon">💺</div>
                    <span>Click to upload seating arrangement</span>
                  </label>
                  {formData.images.seating && (
                    <div className="image-preview">
                      <img
                        src={URL.createObjectURL(formData.images.seating)}
                        alt="Seating Arrangement"
                        className="preview-image"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("seating")}
                        className="remove-image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dining Area */}
              <div className="form-group image-upload-group">
                <label>Dining Area</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload("dining", e.target.files[0])
                    }
                    className="image-input"
                    id="dining"
                  />
                  <label htmlFor="dining" className="image-upload-label">
                    <div className="upload-icon">🍽️</div>
                    <span>Click to upload dining area photo</span>
                  </label>
                  {formData.images.dining && (
                    <div className="image-preview">
                      <img
                        src={URL.createObjectURL(formData.images.dining)}
                        alt="Dining Area"
                        className="preview-image"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("dining")}
                        className="remove-image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Parking Area */}
              <div className="form-group image-upload-group">
                <label>Parking Area</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload("parking", e.target.files[0])
                    }
                    className="image-input"
                    id="parking"
                  />
                  <label htmlFor="parking" className="image-upload-label">
                    <div className="upload-icon">🚗</div>
                    <span>Click to upload parking area photo</span>
                  </label>
                  {formData.images.parking && (
                    <div className="image-preview">
                      <img
                        src={URL.createObjectURL(formData.images.parking)}
                        alt="Parking Area"
                        className="preview-image"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("parking")}
                        className="remove-image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Outside View */}
              <div className="form-group image-upload-group">
                <label>Outside View</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload("outsideView", e.target.files[0])
                    }
                    className="image-input"
                    id="outsideView"
                  />
                  <label htmlFor="outsideView" className="image-upload-label">
                    <div className="upload-icon">🏢</div>
                    <span>Click to upload outside view</span>
                  </label>
                  {formData.images.outsideView && (
                    <div className="image-preview">
                      <img
                        src={URL.createObjectURL(formData.images.outsideView)}
                        alt="Outside View"
                        className="preview-image"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("outsideView")}
                        className="remove-image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Washroom Photos */}
              <div className="form-group image-upload-group">
                <label>Washroom Photos</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleWashroomImageUpload(e.target.files)}
                    className="image-input"
                    id="washroom"
                  />
                  <label htmlFor="washroom" className="image-upload-label">
                    <div className="upload-icon">🚻</div>
                    <span>
                      Click to upload washroom photos (multiple allowed)
                    </span>
                  </label>
                  {formData.images.washroom.length > 0 && (
                    <div className="image-gallery">
                      {formData.images.washroom.map((image, index) => (
                        <div key={index} className="image-preview">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Washroom ${index + 1}`}
                            className="preview-image"
                          />
                          <button
                            type="button"
                            onClick={() => removeWashroomImage(index)}
                            className="remove-image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading
                  ? uploadProgress > 0
                    ? `Uploading... ${uploadProgress}%`
                    : "Adding..."
                  : "Add Hall"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/hall-owner/halls")}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddHall;

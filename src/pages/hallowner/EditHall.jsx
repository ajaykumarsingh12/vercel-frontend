import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../components/commons/Loader";
import AddressAutocomplete from "../../components/commons/AddressAutocomplete";
import { uploadMultipleToCloudinary } from "../../utils/cloudinaryUpload";
import "./HallForm.css";

const EditHall = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [initialApprovalStatus, setInitialApprovalStatus] = useState(null);
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
    isAvailable: true,
    images: [],
  });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [imageFiles, setImageFiles] = useState({
    mainHall: null,
    stage: null,
    seating: null,
    dining: null,
    parking: null,
    outsideView: null,
    washroom: [],
  });
  const [amenityInput, setAmenityInput] = useState("");

  useEffect(() => {
    fetchHall();
    fetchBookedSlots();
  }, [id]);

  const fetchBookedSlots = async () => {
    try {
      const response = await axios.get(`/api/bookings/availability/${id}`);
      setBookedSlots(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchHall = async () => {
    try {
      const response = await axios.get(`/api/halls/${id}`);
      const hall = response.data;

      // Store initial approval status
      setInitialApprovalStatus(hall.isApproved);

      // Categorize existing images based on their position/order
      const existingImages = hall.images || [];
      const categorizedImages = {
        mainHall: existingImages[0] || null, // First image as main hall photo
        stage: existingImages[1] || null, // Second image as stage
        seating: existingImages[2] || null, // Third image as seating
        dining: existingImages[3] || null, // Fourth image as dining
        parking: existingImages[4] || null, // Fifth image as parking
        outsideView: existingImages[5] || null, // Sixth image as outside view
        washroom: existingImages.slice(6) || [], // Rest as washroom photos
      };

      setFormData({
        name: hall.name,
        description: hall.description,
        location: hall.location,
        capacity: hall.capacity,
        pricePerHour: hall.pricePerHour,
        amenities: hall.amenities || [],
        isAvailable: hall.isAvailable,
        images: hall.images || [],
      });

      // Set existing images in the categorized state
      setImageFiles(categorizedImages);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load hall");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      location: {
        address: location.address,
        city: location.city || formData.location.city,
        state: location.state || formData.location.state,
        pincode: location.pincode || formData.location.pincode,
        coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
        googleMapsUrl: location.source === 'google' 
          ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
          : `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=15/${location.lat}/${location.lng}`,
      },
    });
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
      setImageFiles({ ...imageFiles, [category]: file });
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
      setImageFiles({ ...imageFiles, washroom: [...imageFiles.washroom, ...validFiles] });
    }
  };

  const removeImageFile = (category) => {
    setImageFiles({
      ...imageFiles,
      [category]: null,
    });
  };

  const removeWashroomImageFile = (index) => {
    setImageFiles({
      ...imageFiles,
      washroom: imageFiles.washroom.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUploadProgress(0);

    try {
      // 1. Collect existing image URLs to keep
      const categories = ["mainHall", "stage", "seating", "dining", "parking", "outsideView"];
      const existingImages = [];
      const newFiles = [];

      categories.forEach((cat) => {
        if (typeof imageFiles[cat] === "string") existingImages.push(imageFiles[cat]);
        else if (imageFiles[cat]) newFiles.push(imageFiles[cat]);
      });

      imageFiles.washroom.forEach((img) => {
        if (typeof img === "string") existingImages.push(img);
        else newFiles.push(img);
      });

      // 2. Upload new files directly to Cloudinary
      let newUrls = [];
      if (newFiles.length > 0) {
        toast.info("Uploading images...");
        newUrls = await uploadMultipleToCloudinary(
          newFiles,
          "hall-booking/halls",
          (p) => setUploadProgress(p)
        );
      }

      // 3. Send JSON to backend — existing URLs + new Cloudinary URLs
      const payload = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        capacity: formData.capacity,
        pricePerHour: formData.pricePerHour,
        isAvailable: formData.isAvailable,
        amenities: formData.amenities,
        existingImages,
        newImages: newUrls,
      };

      await axios.put(`/api/halls/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (initialApprovalStatus === "rejected" || initialApprovalStatus === false) {
        toast.success("Hall updated and resubmitted for admin review!");
      } else {
        toast.success("Hall updated successfully!");
      }

      navigate("/hall-owner/halls");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update hall");
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="hall-form-page">
      <div className="dashboard-layout">
        <div className="dashboard-content">
          <h1>Edit Hall</h1>
          <form onSubmit={handleSubmit} className="hall-form">
            <div className="form-group">
              <label>Hall Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>

            {/* Address Autocomplete with Map Preview */}
            <div className="form-group">
              <label>Hall Location *</label>
              <AddressAutocomplete
                onLocationSelect={handleLocationSelect}
                initialValue={formData.location.address}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="location.pincode"
                  value={formData.location.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Capacity *</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price per Hour (₹) *</label>
                <input
                  type="number"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                />
                Available for booking
              </label>
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
                <label>Main Hall Photo (Cover Image)</label>
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
                  {!imageFiles.mainHall && (
                    <label htmlFor="mainHall" className="image-upload-label">
                      <div className="upload-icon">📷</div>
                      <span>Click to upload main hall photo</span>
                    </label>
                  )}
                  {imageFiles.mainHall && (
                    <div className="image-preview">
                      <img
                        src={typeof imageFiles.mainHall === "string" ? imageFiles.mainHall : URL.createObjectURL(imageFiles.mainHall)}
                        alt="Main Hall" className="preview-image"
                      />
                      <button type="button" onClick={() => removeImageFile("mainHall")} className="remove-image">×</button>
                      <div className="image-status">Current Photo</div>
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
                  {!imageFiles.stage && (
                    <label htmlFor="stage" className="image-upload-label">
                      <div className="upload-icon">🎭</div>
                      <span>Click to upload stage photo</span>
                    </label>
                  )}
                  {imageFiles.stage && (
                    <div className="image-preview">
                      <img
                        src={typeof imageFiles.stage === "string" ? imageFiles.stage : URL.createObjectURL(imageFiles.stage)}
                        alt="Stage" className="preview-image"
                      />
                      <button type="button" onClick={() => removeImageFile("stage")} className="remove-image">×</button>
                      <div className="image-status">Current Photo</div>
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
                  {!imageFiles.seating && (
                    <label htmlFor="seating" className="image-upload-label">
                      <div className="upload-icon">💺</div>
                      <span>Click to upload seating arrangement</span>
                    </label>
                  )}
                  {imageFiles.seating && (
                    <div className="image-preview">
                      <img
                        src={typeof imageFiles.seating === "string" ? imageFiles.seating : URL.createObjectURL(imageFiles.seating)}
                        alt="Seating Arrangement" className="preview-image"
                      />
                      <button type="button" onClick={() => removeImageFile("seating")} className="remove-image">×</button>
                      <div className="image-status">Current Photo</div>
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
                  {!imageFiles.dining && (
                    <label htmlFor="dining" className="image-upload-label">
                      <div className="upload-icon">🍽️</div>
                      <span>Click to upload dining area photo</span>
                    </label>
                  )}
                  {imageFiles.dining && (
                    <div className="image-preview">
                      <img
                        src={typeof imageFiles.dining === "string" ? imageFiles.dining : URL.createObjectURL(imageFiles.dining)}
                        alt="Dining Area" className="preview-image"
                      />
                      <button type="button" onClick={() => removeImageFile("dining")} className="remove-image">×</button>
                      <div className="image-status">Current Photo</div>
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
                  {!imageFiles.parking && (
                    <label htmlFor="parking" className="image-upload-label">
                      <div className="upload-icon">🚗</div>
                      <span>Click to upload parking area photo</span>
                    </label>
                  )}
                  {imageFiles.parking && (
                    <div className="image-preview">
                      <img
                        src={typeof imageFiles.parking === "string" ? imageFiles.parking : URL.createObjectURL(imageFiles.parking)}
                        alt="Parking Area" className="preview-image"
                      />
                      <button type="button" onClick={() => removeImageFile("parking")} className="remove-image">×</button>
                      <div className="image-status">Current Photo</div>
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
                  {!imageFiles.outsideView && (
                    <label htmlFor="outsideView" className="image-upload-label">
                      <div className="upload-icon">🏢</div>
                      <span>Click to upload outside view</span>
                    </label>
                  )}
                  {imageFiles.outsideView && (
                    <div className="image-preview">
                      <img
                        src={typeof imageFiles.outsideView === "string" ? imageFiles.outsideView : URL.createObjectURL(imageFiles.outsideView)}
                        alt="Outside View" className="preview-image"
                      />
                      <button type="button" onClick={() => removeImageFile("outsideView")} className="remove-image">×</button>
                      <div className="image-status">Current Photo</div>
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
                  {imageFiles.washroom.length > 0 && (
                    <div className="image-gallery">
                      {imageFiles.washroom.map((image, index) => (
                        <div key={index} className="image-preview">
                          <img
                            src={typeof image === "string" ? image : URL.createObjectURL(image)}
                            alt={`Washroom ${index + 1}`}
                            className="preview-image"
                          />
                          <button
                            type="button"
                            onClick={() => removeWashroomImageFile(index)}
                            className="remove-image"
                          >
                            ×
                          </button>
                          <div className="image-status">Current Photo</div>
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
                disabled={saving}
              >
                {saving
                  ? uploadProgress > 0
                    ? `Uploading... ${uploadProgress}%`
                    : "Saving..."
                  : "Update Hall"}
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

export default EditHall;

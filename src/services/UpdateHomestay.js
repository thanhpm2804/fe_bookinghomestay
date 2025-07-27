// API base URL
const API_BASE = 'https://localhost:7220';

// Load homestays with full expand
export async function fetchHomestays() {
  try {
    const response = await fetch(`${API_BASE}/odata/Homestays/MyHomestays()?$expand=ward(expand=district),HomestayAmenities(expand=Amenity),HomestayPolicies(expand=policy),HomestayNeighbourhoods(expand=Neighbourhood),HomestayImages`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch homestays');
    }
    
    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('fetchHomestays error:', error);
    throw error;
  }
}

// Load policies
export async function fetchPolicies() {
  try {
    const response = await fetch(`${API_BASE}/odata/Policy`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch policies');
    }
    
    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('fetchPolicies error:', error);
    throw error;
  }
}

// Load amenities
export async function fetchAmenities() {
  try {
    const response = await fetch(`${API_BASE}/odata/Amenity`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch amenities');
    }
    
    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('fetchAmenities error:', error);
    throw error;
  }
}

// Load neighbourhoods
export async function fetchNeighbourhoods() {
  try {
    const response = await fetch(`${API_BASE}/odata/Neighbourhood`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch neighbourhoods');
    }
    
    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('fetchNeighbourhoods error:', error);
    throw error;
  }
}

// Load wards
export async function fetchWards() {
  try {
    const response = await fetch(`${API_BASE}/api/wards`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch wards');
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('fetchWards error:', error);
    throw error;
  }
}

// Upload multiple images
export async function uploadMultipleImages(files) {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE}/api/ImageUpload/upload-multiple`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const result = await response.json();
    console.log('Upload multiple images result:', result);
    return result.imageUrls || [];
  } catch (error) {
    console.error('uploadMultipleImages error:', error);
    throw error;
  }
}

// Update homestay
export async function updateHomestay(homestayId, homestayData) {
  try {
    console.log('Updating homestay with data:', homestayData);
    
    const response = await fetch(`${API_BASE}/odata/Homestays(${homestayId})`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(homestayData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update homestay response error:', response.status, errorText);
      throw new Error(`Update failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Update homestay success:', result);
    return result;
  } catch (error) {
    console.error('updateHomestay error:', error);
    throw error;
  }
}

// Prepare homestay data for update
export function prepareHomestayData(formData, homestay, newImageUrls = []) {
  // Get existing homestay data as base
  const baseData = {
    Name: homestay.Name,
    HomestayTypeId: homestay.HomestayTypeId || 1,
    Description: homestay.Description || '',
    StreetAddress: homestay.StreetAddress || '',
    WardId: homestay.WardId || 1,
    Rules: homestay.Rules || '',
    OwnerId: homestay.OwnerId,
    Status: homestay.Status !== undefined ? homestay.Status : true
  };

  // Update with form data
  const updatedData = {
    ...baseData,
    Name: formData.name || baseData.Name,
    Description: formData.description || baseData.Description,
    StreetAddress: formData.streetAddress || baseData.StreetAddress,
    WardId: formData.selectedWardId || baseData.WardId,
    Rules: formData.rules || baseData.Rules
  };

  // Prepare Amenities
  const amenities = formData.selectedAmenities.map(amenityId => ({
    AmenityId: amenityId
  }));

  // Prepare Policies
  const policies = formData.selectedPolicies.map(policyId => ({
    PolicyId: policyId,
    IsAllowed: true
  }));

  // Prepare Neighbourhoods
  const neighbourhoods = formData.selectedNeighbourhoods.map(neighbourhoodId => ({
    NeighbourhoodId: neighbourhoodId
  }));

  // Prepare Images
  const existingImages = formData.imagePreview
    .filter(img => img.id && typeof img.id === 'number' && !img.isNew)
    .map(img => ({
      ImageUrl: img.url,
      SortOrder: img.sortOrder || 1
    }));

  const newImages = newImageUrls.map((url, index) => ({
    ImageUrl: url,
    SortOrder: existingImages.length + index + 1
  }));

  const images = [...existingImages, ...newImages];

  console.log('Image preparation debug:');
  console.log('- formData.imagePreview:', formData.imagePreview);
  console.log('- existingImages:', existingImages);
  console.log('- newImageUrls:', newImageUrls);
  console.log('- newImages:', newImages);
  console.log('- final images:', images);

  const finalData = {
    ...updatedData,
    Amenities: amenities,
    Policies: policies,
    Neighbourhoods: neighbourhoods,
    Images: images
  };

  console.log('Prepared homestay data:', finalData);
  return finalData;
}

// Load all initial data
export async function loadInitialData() {
  try {
    const [homestays, policies, amenities, neighbourhoods, wards] = await Promise.all([
      fetchHomestays(),
      fetchPolicies(),
      fetchAmenities(),
      fetchNeighbourhoods(),
      fetchWards()
    ]);

    return {
      homestays,
      policies,
      amenities,
      neighbourhoods,
      wards
    };
  } catch (error) {
    console.error('loadInitialData error:', error);
    throw error;
  }
} 
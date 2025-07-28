import { BASE_URL } from './auth';

export async function fetchMyHomestays() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${BASE_URL.replace('/api', '')}/odata/Homestays/MyHomestays()`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    if (!res.ok) throw new Error('Failed to fetch my homestays');
    return await res.json();
  } catch (error) {
    console.error('fetchMyHomestays error:', error);
    return { value: [] };
  }
}

export async function fetchAmenities() {
  try {
    const res = await fetch(`${BASE_URL.replace('/api', '')}/odata/Amenity`);
    if (!res.ok) throw new Error('Failed to fetch amenities');
    return res.json();
  } catch (error) {
    console.error('fetchAmenities error:', error);
    return { value: [] };
  }
}

export async function fetchBedTypes() {
  try {
    const res = await fetch(`${BASE_URL.replace('/api', '')}/odata/BedType`);
    if (!res.ok) throw new Error('Failed to fetch bed types');
    return res.json();
  } catch (error) {
    console.error('fetchBedTypes error:', error);
    return { value: [] };
  }
}

export async function fetchPriceTypes() {
  try {
    const res = await fetch(`${BASE_URL.replace('/api', '')}/odata/PriceType`);
    if (!res.ok) throw new Error('Failed to fetch price types');
    return res.json();
  } catch (error) {
    console.error('fetchPriceTypes error:', error);
    return { value: [] };
  }
}

export async function addRoom(data) {
  try {
    console.log('Sending add room data:', data);
    const res = await fetch(`${BASE_URL.replace('/api', '')}/odata/Rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Add room response error:', res.status, errorText);
      throw new Error(`Failed to add room: ${res.status} - ${errorText}`);
    }
    
    const result = await res.json();
    console.log('Add room success:', result);
    return result;
  } catch (error) {
    console.error('addRoom error:', error);
    throw error;
  }
}

export async function updateRoom(key, data) {
  try {
    console.log('Sending update room data:', { key, data });
    const res = await fetch(`${BASE_URL.replace('/api', '')}/odata/Rooms/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Update room response error:', res.status, errorText);
      throw new Error(`Failed to update room: ${res.status} - ${errorText}`);
    }
    
    const result = await res.json();
    console.log('Update room success:', result);
    return result;
  } catch (error) {
    console.error('updateRoom error:', error);
    throw error;
  }
}

export async function fetchRooms(homestayId, skip = 0, top = 10, searchName = '') {
  try {
    let url = `${BASE_URL.replace('/api', '')}/odata/Rooms?$expand=RoomBeds,RoomPrices,RoomAmenities,RoomSchedules`;
    
    // Build filter conditions
    let filterConditions = [];
    
    if (homestayId) {
      filterConditions.push(`HomestayId eq ${typeof homestayId === 'string' ? `'${homestayId}'` : homestayId}`);
    }
    
    if (searchName && searchName.trim()) {
      filterConditions.push(`contains(tolower(Name), tolower('${searchName.trim()}'))`);
    }
    
    // Combine filters
    if (filterConditions.length > 0) {
      url += `&$filter=${filterConditions.join(' and ')}`;
    }
    
    if (typeof skip === 'number' && skip > 0) {
      url += `&$skip=${skip}`;
    }
    if (typeof top === 'number' && top > 0) {
      url += `&$top=${top}`;
    }
    url += `&$count=true`;
    
    console.log('Fetch rooms URL:', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return res.json();
  } catch (error) {
    console.error('fetchRooms error:', error);
    return { value: [], '@odata.count': 0 };
  }
}

// Upload image function
export async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('https://localhost:7220/api/ImageUpload/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await res.json();
    console.log('Upload image response:', data);
    return data; // API trả về object có imageUrl
  } catch (error) {
    console.error('uploadImage error:', error);
    throw error;
  }
}

export async function deleteRoom(roomId) {
  try {
    console.log('Deleting room with ID:', roomId);
    const res = await fetch(`${BASE_URL.replace('/api', '')}/odata/Rooms/${roomId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Delete room response error:', res.status, errorText);
      throw new Error(`Failed to delete room: ${res.status} - ${errorText}`);
    }
    
    console.log('Delete room success');
    return true;
  } catch (error) {
    console.error('deleteRoom error:', error);
    throw error;
  }
}

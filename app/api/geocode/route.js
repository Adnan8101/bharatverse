import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { latitude, longitude } = await request.json();
        
        if (!latitude || !longitude) {
            return NextResponse.json(
                { success: false, error: 'Latitude and longitude are required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'Google Maps API key not configured' },
                { status: 500 }
            );
        }

        // Call Google Maps Geocoding API
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
        console.log('Geocoding request URL:', geocodeUrl.replace(apiKey, 'API_KEY_HIDDEN'));
        
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        console.log('Geocoding API response status:', data.status);
        console.log('Geocoding API response:', JSON.stringify(data, null, 2));

        if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];
            const addressComponents = result.address_components;
            
            // Parse address components
            let street = '';
            let city = '';
            let state = '';
            let pincode = '';
            
            addressComponents.forEach(component => {
                const types = component.types;
                
                if (types.includes('street_number')) {
                    street = component.long_name + ' ' + street;
                } else if (types.includes('route')) {
                    street = street + component.long_name;
                } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
                    street = street + (street ? ', ' : '') + component.long_name;
                } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                    city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                } else if (types.includes('postal_code')) {
                    pincode = component.long_name;
                }
            });

            const parsedAddress = {
                street: street.trim(),
                city: city,
                state: state,
                pincode: pincode,
                formatted_address: result.formatted_address
            };

            return NextResponse.json({
                success: true,
                address: parsedAddress
            });
        } else {
            // Fallback with mock data based on coordinates
            console.log('Google Maps API failed, using fallback data');
            
            // Generate mock address based on coordinates
            const mockAddress = {
                street: `Street near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                city: 'Current Location',
                state: 'Detected State',
                pincode: '123456',
                formatted_address: `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            };

            return NextResponse.json({
                success: true,
                address: mockAddress,
                fallback: true
            });
        }
    } catch (error) {
        console.error('Geocoding API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process geocoding request' },
            { status: 500 }
        );
    }
}

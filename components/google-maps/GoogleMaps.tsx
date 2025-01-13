import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import mapStyleSheet from './Style';
import MapView, { AnimatedRegion, Marker, MarkerAnimated, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { supabase } from "@/utils/supabase";
import MapViewDirections from "react-native-maps-directions"

const INITIAL_REGION = {
  latitude: 14.598820,
  longitude: 121.007996,
  latitudeDelta: 0.00822,
  longitudeDelta: 0.00821,
};

interface MarkerCoordinate {
  latitude: number;
  longitude: number;
  title?: string;
  type?: string
}

interface GoogleMapsInterface {
  markerCoordinates: MarkerCoordinate[];
  movingMarkerCoords: MarkerCoordinate,
  showRoute?: boolean
}

const GoogleMaps = ({ markerCoordinates, movingMarkerCoords, showRoute}: GoogleMapsInterface) => {
  const mapRef = useRef<MapView>(null);
  const markerRef = useRef(null)

  const [userCoords, setUserCoords] = useState({ ...movingMarkerCoords })
  const [destination, setDestination] = useState(null)

  // This susbcribes to changes happen on the user location
  useEffect(() => {

    const channels = supabase.channel('custom-update-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users_details' },
        (payload) => {
          const { lng: longitude, lat: latitude, first_name } = payload.new

          const newUserCoords = { longitude, latitude, title: first_name }
          const newCoordinates = [
            ...markerCoordinates.map(bin => {
              const {longitude, latitude} = bin
              return {
                latitude,
                longitude
              }
            }),
            newUserCoords
          ];
      

          setUserCoords(newUserCoords)
          mapRef.current?.fitToCoordinates(newCoordinates, {
            edgePadding: { top: 5, right: 5, bottom: 5, left: 5 },
            animated: true,
          })
        }
      )
      .subscribe()

  }, [])


  return (
    <MapView
      ref={mapRef}
      style={mapStyleSheet.map}
      initialRegion={INITIAL_REGION}
      provider={PROVIDER_GOOGLE}
      onMapReady={() => {
        if (markerCoordinates.length > 0 && mapRef.current) {
          const coordinates = markerCoordinates.map((coord) => ({
            latitude: coord.latitude,
            longitude: coord.longitude,
          }));

          mapRef.current.fitToCoordinates([...coordinates, userCoords], {
            edgePadding: { top: 20, right: 20, bottom: 20, left: 20 },
            animated: true,
          });
        }
      }}
    >

      {/* {showRoute && <Polyline coordinates={[userCoords, ...markerCoordinates]} strokeWidth={5} strokeColor="red"/>} */}

      {showRoute && destination && <MapViewDirections origin={userCoords} destination={destination} apikey={process.env.EXPO_PUBLIC_API_KEY} mode="WALKING" strokeColor="red" strokeWidth={5} precision="high"/>}

      {markerCoordinates.map((coord, index) => {
        const { type, title, ...position } = coord;
        return <Marker coordinate={position} key={index} title={title} titleVisibility="visible" />
      })}

      <Marker coordinate={userCoords} ref={markerRef} title={userCoords.title}>
        <View style={{ alignItems: 'center'}}>
          <Image
            source={require("@/assets/images/employee-icon.png")}
            style={{ width: 40, height: 40, borderRadius: 20, borderColor: "#0E46A3", borderWidth: 2}}
          />
          {/* <Text className="text-sm text-blue-500 font-semibold">{userCoords.title + " (You)"} </Text> */}
        </View>
      </Marker>
    </MapView>
  );
};

export default GoogleMaps;
